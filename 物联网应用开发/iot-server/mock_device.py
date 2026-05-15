import paho.mqtt.client as mqtt
import json
import time
import random

MQTT_BROKER = "127.0.0.1"
MQTT_PORT = 5001
MQTT_TOPIC_UP = "device/data"

def simulate_device():
    client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        print("MOCK_START")
        for i in range(10): # 模拟发送10次数据
            payload = {
                "id": "TianTian_Mock",
                "heart_rate": random.randint(72, 85),
                "spo2": random.randint(97, 99),
                "body_temperature": round(random.uniform(36.5, 37.0), 1)
            }
            client.publish(MQTT_TOPIC_UP, json.dumps(payload))
            print(f"SENT: {payload}")
            time.sleep(2)
        client.disconnect()
        print("MOCK_END")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    simulate_device()
