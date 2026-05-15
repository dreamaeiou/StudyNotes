"""
Human Physiological Monitoring System
Receives MQTT data from wearable/ESP8266 devices, stores in CSV, and serves a web UI.
CSV-only edition: heart rate, SpO2, body temperature, multi-device, online/offline aware.
"""

import os
import csv
import json
import time
import queue
import threading
from datetime import datetime
from flask import Flask, render_template, jsonify, request, Response
import paho.mqtt.client as mqtt

# ==================== Config ====================
MQTT_BROKER = os.getenv("MQTT_BROKER", "127.0.0.1")
MQTT_PORT = int(os.getenv("MQTT_PORT", 5001))
MQTT_TOPIC_UP = os.getenv("MQTT_TOPIC_UP", "device/data")
MQTT_TOPIC_DOWN = os.getenv("MQTT_TOPIC_DOWN", "device/cmd")
DEVICE_ID = os.getenv("DEVICE_ID", "patient_001")
ONLINE_TIMEOUT_SECONDS = int(os.getenv("ONLINE_TIMEOUT_SECONDS", 20))

BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data")
CSV_PATH = os.path.join(DATA_DIR, "sensor.csv")
FIELDS = ["timestamp", "device_id", "heart_rate", "spo2", "body_temperature", "status"]

# ==================== Flask App ====================
app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False

# ==================== Runtime State ====================
latest_data = {
    "timestamp": "",
    "device_id": DEVICE_ID,
    "heart_rate": None,
    "spo2": None,
    "body_temperature": None,
    "status": "offline",
}
latest_by_device = {}
subscribers = []

# ==================== CSV Helpers ====================
def _normalize_csv_row(row: dict):
    """兼容旧版错误表头：timestamp,device_id,temperature,humidity,status
    实际行内容是 timestamp,device_id,heart_rate,spo2,body_temperature,status
    DictReader 会把最后一列挂到 None 上，需要这里归一化。
    """
    if not isinstance(row, dict):
        return row

    # 已是新格式
    if all(k in row for k in ["heart_rate", "spo2", "body_temperature"]):
        normalized = {k: row.get(k, "") for k in FIELDS}
        if normalized.get("status") in (None, ""):
            normalized["status"] = "offline"
        return normalized

    # 兼容旧表头 + 多出一列的历史数据
    if "temperature" in row and "humidity" in row:
        extra = row.get(None) or []
        normalized = {
            "timestamp": row.get("timestamp", ""),
            "device_id": row.get("device_id", DEVICE_ID),
            "heart_rate": row.get("temperature", ""),
            "spo2": row.get("humidity", ""),
            "body_temperature": row.get("status", ""),
            "status": extra[0] if extra else "offline",
        }
        return normalized

    # 兜底：只保留目标字段，避免 jsonify/sort_keys 因 None 键报错
    normalized = {k: row.get(k, "") for k in FIELDS}
    if normalized.get("device_id") in (None, ""):
        normalized["device_id"] = DEVICE_ID
    if normalized.get("status") in (None, ""):
        normalized["status"] = "offline"
    return normalized


def _maybe_migrate_csv_header():
    if not os.path.exists(CSV_PATH):
        return

    with open(CSV_PATH, "r", encoding="utf-8", newline="") as f:
        first_line = f.readline().strip()

    legacy_header = "timestamp,device_id,temperature,humidity,status"
    if first_line != legacy_header:
        return

    migrated_rows = []
    with open(CSV_PATH, "r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            migrated_rows.append(_normalize_csv_row(row))

    with open(CSV_PATH, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(migrated_rows)

    print(f"[CSV] Migrated legacy header/data format: {CSV_PATH}")


def ensure_csv():
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(CSV_PATH):
        with open(CSV_PATH, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=FIELDS)
            writer.writeheader()
    else:
        _maybe_migrate_csv_header()


def append_csv(row: dict):
    ensure_csv()
    safe_row = _normalize_csv_row(row)
    with open(CSV_PATH, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS)
        writer.writerow(safe_row)


def read_csv(limit=200, device_id=None):
    ensure_csv()
    rows = []
    with open(CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            normalized = _normalize_csv_row(row)
            if device_id and normalized.get("device_id") != device_id:
                continue
            rows.append(normalized)
    return rows[-limit:] if limit else rows


def parse_ts(ts: str):
    try:
        return datetime.strptime(ts, "%Y-%m-%d %H:%M:%S")
    except Exception:
        return None


def compute_status_from_timestamp(ts: str):
    dt = parse_ts(ts)
    if not dt:
        return "offline"
    age = (datetime.now() - dt).total_seconds()
    return "online" if age <= ONLINE_TIMEOUT_SECONDS else "offline"


def bootstrap_latest_from_csv():
    global latest_data, latest_by_device
    rows = read_csv(limit=1000)
    latest_map = {}
    for row in rows:
        dev = row.get("device_id") or DEVICE_ID
        latest_map[dev] = row
    for dev, row in latest_map.items():
        item = dict(row)
        item["status"] = compute_status_from_timestamp(item.get("timestamp", ""))
        latest_map[dev] = item
    latest_by_device = latest_map
    if latest_map:
        newest = sorted(latest_map.values(), key=lambda x: x.get("timestamp", ""), reverse=True)[0]
        latest_data = newest


def summarize_devices():
    devices = []
    for _, row in sorted(latest_by_device.items()):
        item = dict(row)
        item["status"] = compute_status_from_timestamp(item.get("timestamp", ""))
        devices.append(item)
    return devices

# ==================== MQTT ====================
def on_connect(client, userdata, flags, rc, properties=None):
    if rc == 0:
        print(f"[MQTT] Connected to {MQTT_BROKER}:{MQTT_PORT}")
        client.subscribe(MQTT_TOPIC_UP)
        print(f"[MQTT] Subscribed to {MQTT_TOPIC_UP}")
    else:
        print(f"[MQTT] Connection failed, code={rc}")


def on_message(client, userdata, msg):
    global latest_data, latest_by_device
    try:
        payload = json.loads(msg.payload.decode("utf-8"))
        print(f"[MQTT] RX {msg.topic}: {payload}")

        device_id = payload.get("id", DEVICE_ID)
        row = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "device_id": device_id,
            "heart_rate": payload.get("heart_rate", payload.get("hr", "")),
            "spo2": payload.get("spo2", ""),
            "body_temperature": payload.get("body_temperature", payload.get("temp", "")),
            "status": "online",
        }
        append_csv(row)
        latest_data = row
        latest_by_device[device_id] = row

        event_data = json.dumps(row, ensure_ascii=False)
        for q in subscribers[:]:
            try:
                q.put(event_data)
            except Exception:
                pass
    except Exception as e:
        print(f"[MQTT] Parse error: {e}")


def mqtt_loop():
    client = mqtt.Client(
        callback_api_version=mqtt.CallbackAPIVersion.VERSION2,
        client_id="py_server_" + str(int(time.time())),
    )
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_forever()

# ==================== SSE Queue Helper ====================
class MessageQueue:
    def __init__(self):
        self.q = queue.Queue()

    def put(self, msg):
        self.q.put(msg)

    def get(self):
        return self.q.get()

# ==================== Routes ====================
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/health")
def health():
    return jsonify({
        "ok": True,
        "mqtt_broker": MQTT_BROKER,
        "mqtt_port": MQTT_PORT,
        "devices": len(latest_by_device),
        "csv_path": CSV_PATH,
        "metrics": ["heart_rate", "spo2", "body_temperature"],
    })


@app.route("/api")
def api_index():
    example_ingest = {
        "id": "patient_001",
        "heart_rate": 78,
        "spo2": 98,
        "body_temperature": 36.7,
        "ts": 1710000000,
    }
    example_control = {
        "cmd": "alarm",
        "value": 1,
        "device_id": "patient_001"
    }
    return jsonify({
        "name": "human-physiological-monitoring-api",
        "version": "1.1",
        "base_url_hint": "/api",
        "description": "Public API description for the human physiological monitoring system. Devices report data through MQTT. HTTP is used for query, control, and debugging.",
        "scenario": "heart rate, SpO2, and body temperature monitoring",
        "mqtt": {
            "broker_host": MQTT_BROKER,
            "broker_port": MQTT_PORT,
            "publish_topic_from_device": MQTT_TOPIC_UP,
            "subscribe_topic_for_device": MQTT_TOPIC_DOWN,
            "device_payload_format": {
                "type": "json",
                "required_fields": {
                    "id": "string, unique device id, for example patient_001",
                    "heart_rate": "number, bpm",
                    "spo2": "number, percent",
                    "body_temperature": "number, Celsius"
                },
                "optional_fields": {
                    "hr": "number, alias of heart_rate",
                    "temp": "number, alias of body_temperature",
                    "ts": "number|string, optional device timestamp"
                },
                "example": example_ingest
            },
            "server_control_payload_format": {
                "type": "json",
                "required_fields": {
                    "cmd": "string, command such as alarm or ping",
                    "value": "number|string, command value",
                    "device_id": "string, target device id"
                },
                "example": example_control
            }
        },
        "http_endpoints": [
            {"path": "/health", "method": "GET", "description": "Service health check"},
            {"path": "/api/devices", "method": "GET", "description": "List latest snapshot of all devices"},
            {"path": "/api/latest?device_id=<device_id>", "method": "GET", "description": "Get latest data of one device"},
            {"path": "/api/data?limit=60&device_id=<device_id>", "method": "GET", "description": "Get historical data list"},
            {"path": "/api/control", "method": "POST", "description": "Send control command to one device through MQTT"},
            {"path": "/stream", "method": "GET", "description": "SSE stream for realtime updates"}
        ],
        "data_example": {
            "timestamp": "2026-04-22 09:30:00",
            "device_id": "patient_001",
            "heart_rate": "78",
            "spo2": "98",
            "body_temperature": "36.7",
            "status": "online"
        }
    })


@app.route("/api/data")
def api_data():
    limit = request.args.get("limit", 200, type=int)
    device_id = request.args.get("device_id", default=None, type=str)
    rows = read_csv(limit=limit, device_id=device_id)
    for row in rows:
        row["status"] = compute_status_from_timestamp(row.get("timestamp", ""))
    return jsonify(rows)


@app.route("/api/latest")
def api_latest():
    device_id = request.args.get("device_id", default=None, type=str)
    if device_id and device_id in latest_by_device:
        row = dict(latest_by_device[device_id])
        row["status"] = compute_status_from_timestamp(row.get("timestamp", ""))
        return jsonify(row)

    row = dict(latest_data)
    row["status"] = compute_status_from_timestamp(row.get("timestamp", ""))
    return jsonify(row)


@app.route("/api/devices")
def api_devices():
    return jsonify(summarize_devices())


@app.route("/api/control", methods=["POST"])
def api_control():
    body = request.get_json(force=True)
    target_device = body.get("device_id", DEVICE_ID)
    cmd = {
        "cmd": body.get("cmd", "ping"),
        "value": body.get("value", 0),
        "device_id": target_device,
        "time": datetime.now().isoformat(),
    }
    pub = mqtt.Client(
        callback_api_version=mqtt.CallbackAPIVersion.VERSION2,
        client_id="py_pub_" + str(int(time.time())),
    )
    try:
        pub.connect(MQTT_BROKER, MQTT_PORT, 5)
        pub.publish(MQTT_TOPIC_DOWN, json.dumps(cmd, ensure_ascii=False))
        pub.disconnect()
        return jsonify({"success": True, "sent": cmd})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/stream")
def stream():
    def event_stream():
        mq = MessageQueue()
        subscribers.append(mq)
        try:
            while True:
                msg = mq.get()
                yield f"data: {msg}\n\n"
        except GeneratorExit:
            if mq in subscribers:
                subscribers.remove(mq)

    return Response(event_stream(), mimetype="text/event-stream")

# ==================== Main ====================
if __name__ == "__main__":
    ensure_csv()
    bootstrap_latest_from_csv()
    t = threading.Thread(target=mqtt_loop, daemon=True)
    t.start()
    print("[Web] Starting Flask on http://0.0.0.0:5000")
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)
