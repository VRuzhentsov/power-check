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
IPAddress serverIP = IPAddress(192, 168, 0, 182);
unsigned int serverPort = 41234;
unsigned long timestamp = millis();

// Checks for new messages every 1 second.
int botRequestDelay = 1000;
unsigned long lastTimeBotRan;

void reportOnline(); // Need GC? https://github.com/arkhipenko/TaskScheduler/blob/master/examples/Scheduler_example19_Dynamic_Tasks/Scheduler_example19_Dynamic_Tasks.ino

Task tMain(1000 * TASK_MILLISECOND, TASK_FOREVER, &reportOnline, &ts, true);

const int LED_PIN = 2;
bool ledState = LOW;

void reportOnline() {
    time_t now = time(nullptr);
    DynamicJsonDocument message(1024);
    message["status"] = "online";
    message["deviceId"] = STR(DEVICE_ID);
    message["timestamp"] = String(now);
    Udp.beginPacket(serverIP, serverPort);
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

    ts.startNow();  // set point-in-time for scheduling start
}

void loop()
{
    ts.execute();
}
