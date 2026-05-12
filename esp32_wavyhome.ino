// WAVY HOME - ESP32 MQTT Controller (HiveMQ Cloud)
// ------------------------------------------------
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>

// 1. Wi-Fi Config
const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

// 2. HiveMQ Cloud Config
const char* mqtt_server = "dc66a1f6367f4b3fb45e76ba00f09381.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_user = "wavys";
const char* mqtt_pass = "x9cDu5xpXx@Kv3h";

WiFiClientSecure espClient;
PubSubClient client(espClient);

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
}

void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  Serial.println(message);

  // Command handling
  if (message == "ON") {
    digitalWrite(2, HIGH);
    client.publish("wavyhome/devices/SW-01/status", "ON");
  } 
  else if (message == "OFF") {
    digitalWrite(2, LOW);
    client.publish("wavyhome/devices/SW-01/status", "OFF");
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP32_WavyHome_";
    clientId += String(random(0xffff), HEX);
    
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
      Serial.println("connected");
      client.subscribe("wavyhome/devices/SW-01/command");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void setup() {
  pinMode(2, OUTPUT);
  digitalWrite(2, LOW); // Default OFF
  
  Serial.begin(115200);
  setup_wifi();
  
  // Required for HiveMQ Cloud (SSL)
  espClient.setInsecure(); 
  
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
}
