/*
  ESP8266 MQTT Client for IoT-Server
  Hardware: ESP8266 (NodeMCU / Wemos D1 mini)
  Sensors: DHT11/DHT22 or simulated data
  
  Upload this to your ESP8266 via Arduino IDE.
  Required libraries:
    - PubSubClient by Nick O'Leary
    - DHT sensor library by Adafruit (if using real sensor)
*/

#include <ESP8266WiFi.h>
#include <PubSubClient.h>

// ==================== CONFIG ====================
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASS     = "YOUR_WIFI_PASSWORD";

// Change to your server's IP or domain
const char* MQTT_SERVER   = "192.168.1.100";
const int   MQTT_PORT     = 5001;
const char* MQTT_CLIENT_ID = "esp8266_dev_001";

const char* TOPIC_UP      = "device/data";   // publish sensor data
const char* TOPIC_DOWN    = "device/cmd";    // subscribe to commands

// If you don't have a DHT sensor, set USE_DHT to false for simulated data
#define USE_DHT false

#if USE_DHT
  #include <DHT.h>
  #define DHT_PIN  D4
  #define DHT_TYPE DHT11
  DHT dht(DHT_PIN, DHT_TYPE);
#endif

// ==================== GLOBALS ====================
WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);

unsigned long lastSend = 0;
const unsigned long INTERVAL = 5000; // send every 5s

// ==================== SETUP ====================
void setup() {
  Serial.begin(115200);
  delay(100);
  Serial.println("\n[ESP8266] Booting...");

  #if USE_DHT
    dht.begin();
  #endif

  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH); // LED off (active low)

  setupWiFi();
  mqtt.setServer(MQTT_SERVER, MQTT_PORT);
  mqtt.setCallback(onMqttMessage);
}

// ==================== LOOP ====================
void loop() {
  if (!mqtt.connected()) reconnectMQTT();
  mqtt.loop();

  unsigned long now = millis();
  if (now - lastSend >= INTERVAL) {
    lastSend = now;
    sendSensorData();
  }
}

// ==================== WIFI ====================
void setupWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("[WiFi] Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("[WiFi] Connected, IP: ");
  Serial.println(WiFi.localIP());
}

// ==================== MQTT ====================
void reconnectMQTT() {
  while (!mqtt.connected()) {
    Serial.print("[MQTT] Connecting...");
    if (mqtt.connect(MQTT_CLIENT_ID)) {
      Serial.println(" OK");
      mqtt.subscribe(TOPIC_DOWN);
      Serial.printf("[MQTT] Subscribed to %s\n", TOPIC_DOWN);
    } else {
      Serial.printf(" failed, rc=%d, retry in 5s\n", mqtt.state());
      delay(5000);
    }
  }
}

void onMqttMessage(char* topic, byte* payload, unsigned int length) {
  String msg;
  for (unsigned int i = 0; i < length; i++) msg += (char)payload[i];
  Serial.printf("[MQTT] RX [%s]: %s\n", topic, msg.c_str());

  // Simple command parser
  if (msg.indexOf("\"cmd\":\"led\"") != -1) {
    if (msg.indexOf("\"value\":1") != -1) {
      digitalWrite(LED_BUILTIN, LOW);  // LED on
      Serial.println("[CMD] LED ON");
    } else {
      digitalWrite(LED_BUILTIN, HIGH); // LED off
      Serial.println("[CMD] LED OFF");
    }
  }
  if (msg.indexOf("\"cmd\":\"buzzer\"") != -1) {
    if (msg.indexOf("\"value\":1") != -1) {
      Serial.println("[CMD] BUZZER ON");
      // Add your buzzer code here
    } else {
      Serial.println("[CMD] BUZZER OFF");
    }
  }
}

// ==================== DATA ====================
void sendSensorData() {
  float temp, humi;

  #if USE_DHT
    temp = dht.readTemperature();
    humi = dht.readHumidity();
    if (isnan(temp) || isnan(humi)) {
      Serial.println("[DHT] Read failed, using simulated data");
      temp = 25.0 + random(-5, 6);
      humi = 60.0 + random(-10, 11);
    }
  #else
    // Simulated data for testing without sensor
    temp = 25.0 + random(-50, 51) / 10.0;
    humi = 60.0 + random(-100, 101) / 10.0;
  #endif

  char payload[256];
  snprintf(payload, sizeof(payload),
    "{\"id\":\"%s\",\"temp\":%.1f,\"humi\":%.1f,\"ts\":%lu}",
    MQTT_CLIENT_ID, temp, humi, millis()
  );

  mqtt.publish(TOPIC_UP, payload);
  Serial.printf("[MQTT] TX: %s\n", payload);
}
