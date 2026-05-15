# Embedded Integration Guide

## Project Overview

This project is a **Human Physiological Monitoring System**.

Embedded devices send physiological data to the server through **MQTT**.
The current monitored metrics are:

- Heart Rate
- SpO2
- Body Temperature

The web dashboard and HTTP API are used for visualization, query, and basic device control.

---

## Network Endpoints

### MQTT Broker

Embedded devices must connect to the MQTT broker:

- **Host**: `<SERVER_IP_OR_DOMAIN>`
- **Port**: `5001`

### Web Dashboard

For browser access:

- **URL**: `http://<SERVER_IP_OR_DOMAIN>:5000/`

### API Documentation

For API reference:

- **URL**: `http://<SERVER_IP_OR_DOMAIN>:5000/api`

---

## MQTT Topics

### Device Publish Topic

Devices must publish physiological data to:

```text
device/data
```

### Device Subscribe Topic

Devices should subscribe to control commands from:

```text
device/cmd
```

---

## Required Data Format

Payload format must be JSON.

### Recommended Payload

```json
{
  "id": "patient_001",
  "heart_rate": 78,
  "spo2": 98,
  "body_temperature": 36.7,
  "ts": 1710000000
}
```

### Field Description

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | yes | Unique device identifier |
| `heart_rate` | number | yes | Heart rate in bpm |
| `spo2` | number | yes | Blood oxygen saturation in percent |
| `body_temperature` | number | yes | Body temperature in Celsius |
| `ts` | number/string | no | Device-side timestamp |

---

## Compatible Alternate Fields

The server also accepts these aliases for compatibility:

- `hr` -> `heart_rate`
- `temp` -> `body_temperature`

Example:

```json
{
  "id": "patient_001",
  "hr": 78,
  "spo2": 98,
  "temp": 36.7
}
```

---

## Example MQTT Publish Flow

### Example Message

Topic:

```text
device/data
```

Payload:

```json
{
  "id": "patient_001",
  "heart_rate": 81,
  "spo2": 97,
  "body_temperature": 36.8
}
```

### Recommended Upload Interval

Recommended reporting interval:

- **1 to 5 seconds** for demo / realtime display
- **5 to 10 seconds** for stable routine monitoring

---

## Control Command Format

The server may publish control messages to:

```text
device/cmd
```

Example:

```json
{
  "cmd": "alarm",
  "value": 1,
  "device_id": "patient_001",
  "time": "2026-04-22T09:30:00"
}
```

### Command Field Description

| Field | Type | Description |
|------|------|-------------|
| `cmd` | string | Control command, such as `alarm` or `ping` |
| `value` | number/string | Command value |
| `device_id` | string | Target device ID |
| `time` | string | Server-side command timestamp |

### Important Note

If multiple devices subscribe to the same topic `device/cmd`, the embedded side should verify:

```text
device_id == local_device_id
```

Only execute the command when the IDs match.

---

## Suggested Embedded Logic

1. Connect to Wi-Fi or network
2. Connect to MQTT broker on port `5001`
3. Subscribe to `device/cmd`
4. Read sensor values
5. Build JSON payload
6. Publish to `device/data`
7. Parse incoming control messages
8. Execute only commands that match local `device_id`

---

## Example Pseudocode

```c
connect_wifi();
connect_mqtt("<SERVER_IP>", 5001);
subscribe("device/cmd");

while (1) {
    float heart_rate = read_heart_rate();
    float spo2 = read_spo2();
    float body_temperature = read_body_temperature();

    publish_json("device/data", {
        "id": "patient_001",
        "heart_rate": heart_rate,
        "spo2": spo2,
        "body_temperature": body_temperature
    });

    delay_ms(3000);
}
```

---

## Data Display Behavior

After successful upload:

- Data is stored in CSV on the server
- Latest device snapshot is updated
- Dashboard updates in realtime
- Data becomes queryable from HTTP API

---

## HTTP API Reference

### Health Check

```http
GET /health
```

### List All Devices

```http
GET /api/devices
```

### Get Latest Data of One Device

```http
GET /api/latest?device_id=patient_001
```

### Get Historical Data

```http
GET /api/data?limit=60&device_id=patient_001
```

### Send Control Command

```http
POST /api/control
Content-Type: application/json

{
  "cmd": "alarm",
  "value": 1,
  "device_id": "patient_001"
}
```

---

## Device ID Rules

Each embedded device must use a unique ID.

Recommended format:

```text
patient_001
patient_002
wearable_a01
wearable_b07
```

Do not let multiple devices use the same ID unless they intentionally represent the same terminal.

---

## Troubleshooting

### 1. MQTT connection failed

Check:

- Server IP is correct
- Port `5001` is reachable
- MQTT broker is running
- Firewall allows inbound TCP `5001`

### 2. Dashboard shows no data

Check:

- Device is publishing to `device/data`
- Payload is valid JSON
- Required fields are present
- Device ID is not empty

### 3. Control command not working

Check:

- Device subscribed to `device/cmd`
- Embedded code parses JSON correctly
- Embedded side verifies `device_id`
- Command name is supported by device firmware

---

## Recommended Final Config for Embedded Team

- MQTT Host: `<SERVER_IP_OR_DOMAIN>`
- MQTT Port: `5001`
- Publish Topic: `device/data`
- Subscribe Topic: `device/cmd`
- Payload Format: JSON
- Required Fields: `id`, `heart_rate`, `spo2`, `body_temperature`

---

## Quick Copy Block

```text
MQTT Host: <SERVER_IP_OR_DOMAIN>
MQTT Port: 5001
Publish Topic: device/data
Subscribe Topic: device/cmd

JSON Payload Example:
{
  "id": "patient_001",
  "heart_rate": 78,
  "spo2": 98,
  "body_temperature": 36.7,
  "ts": 1710000000
}
```
