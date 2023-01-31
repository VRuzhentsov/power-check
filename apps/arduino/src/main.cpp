#include "Arduino.h"
#define _TASK_SLEEP_ON_IDLE_RUN
#define _TASK_LTS_POINTER
#define _TASK_STD_FUNCTION
#define _TASK_WDT_IDS
#include "time.h"

#include <TaskScheduler.h>
#ifdef ESP32
    #include <WiFi.h>
#else
    #include <ESP8266WiFi.h>
#endif
#include <WiFiUdp.h>
#include <ArduinoJson.h>

#define ST(x) #x
#define STR(x) ST(x)

#ifndef WIFI_SSID
    #define WIFI_SSID STR(WIFI_SSID)
    #define WIFI_PASS  STR(WIFI_PASS)
#endif

const char* ssid = WIFI_SSID;
const char* password = WIFI_PASS;

Scheduler ts;
WiFiUDP Udp;
WiFiClientSecure client;

#ifndef SERVER_IP
    #define SERVER_IP STR(SERVER_IP)
#endif
IPAddress serverIP = IPAddress().fromString(SERVER_IP);

unsigned int serverPort = 41234;
char packetBuffer[UDP_TX_PACKET_MAX_SIZE]; //buffer to hold incoming packet,
unsigned long timestamp = millis();

// Checks for new messages every 1 second.
int botRequestDelay = 1000;
unsigned long lastTimeBotRan;

void reportOnline(); // Need GC? https://github.com/arkhipenko/TaskScheduler/blob/master/examples/Scheduler_example19_Dynamic_Tasks/Scheduler_example19_Dynamic_Tasks.ino
void scanLocalNetworkForServerPort();

Task tMain(TASK_SECOND, TASK_FOREVER, &reportOnline, &ts, true);
Task tScan(5 * TASK_SECOND, TASK_FOREVER, &scanLocalNetworkForServerPort, &ts, true);

const int LED_PIN = 2;
bool ledState = LOW;

void scanLocalNetworkForServerPort() {
    if(serverIP.isSet()) return;
    IPAddress broadcastAddress = INADDR_NONE;
    const char *message = "ping-power";

    Udp.beginPacket(broadcastAddress, serverPort);
    Udp.write(message, strlen(message));
    Udp.endPacket();

    int packetSize = Udp.parsePacket();

    if (packetSize) {
        // Read the response into the packet buffer
        Udp.read(packetBuffer, packetSize);
        // Check if the response is "pong"
        if (memcmp(packetBuffer, "pong-power:", 10) == 0) {
            serverIP = Udp.remoteIP();
            Serial.println("Server responded with 'pong-power' from: " + serverIP.toString());
        } else {
            Serial.println("Unexpected response from server");
        }
    } else {
        Serial.println("Scanning local network for server...");
    }
}

void reportOnline() {
    if(!serverIP.isSet()) return;
    Serial.println("Reporting online to: " + serverIP.toString());
    // TODO: scal local network for UDP port 41234
    time_t now = time(nullptr);
    DynamicJsonDocument message(1024);
    message["status"] = "online";
    message["deviceId"] = STR(DEVICE_ID);
    message["deviceType"] = STR(DEVICE_TYPE);
    message["timestamp"] = String(now);

    Udp.beginPacket(serverIP, serverPort);
    serializeJson(message, Serial); Serial.println();
    serializeJson(message, Udp);
    Udp.endPacket();
}

void blinkOnce()
{
    // nodemcu - led pin is inverted
    digitalWrite(LED_PIN, LOW);
    delay(1000);
    digitalWrite(LED_PIN, HIGH);
    delay(1000);
}

void startUdpServer () {
    Udp.begin(serverPort);
    Serial.println("Start UDP server on: " + String(Udp.localPort()));
}

void wifiConnect()
{
    #ifdef ESP8266
        configTime(0, 0, "pool.ntp.org");      // get UTC time via NTP
    #endif

    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }

    Serial.println(WiFi.localIP());
}

void setup()
{
    Serial.begin(9600);
    // initialize LED digital pin as an output.
    pinMode(LED_PIN, OUTPUT);
    digitalWrite(LED_PIN, HIGH);

    wifiConnect();
    blinkOnce();
    startUdpServer();

    bool result = serverIP.fromString(SERVER_IP);
    if (result) {
        Serial.println("Server IP: " + serverIP.toString());
    } else {
        Serial.println("Could not parse string into IP address");
        scanLocalNetworkForServerPort();
    }

    ts.startNow();  // set point-in-time for scheduling start
}

void loop()
{
    ts.execute();
}
