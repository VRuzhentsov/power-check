#include "Arduino.h"
#ifdef ESP32
    #include <WiFi.h>
#else
    #include <ESP8266WiFi.h>
#endif
#include <WiFiClientSecure.h>
#include <UniversalTelegramBot.h>
#include <ArduinoJson.h>

#define ST(x) #x
#define STR(x) ST(x)

#ifndef WIFI_SSID
    #define WIFI_SSID STR(WIFI_SSID)
    #define WIFI_PASS  STR(WIFI_PASS)
#endif

const char* ssid = WIFI_SSID;
const char* password = WIFI_PASS;

#define BOTtoken STR(TELEGRAM_TOKEN)  // your Bot Token (Get from Botfather)
#define CHAT_ID STR(TELEGRAM_CHAT_ID)

#ifdef ESP8266
    X509List cert(TELEGRAM_CERTIFICATE_ROOT);
#endif

WiFiClientSecure client;
UniversalTelegramBot bot(BOTtoken, client);

// Checks for new messages every 1 second.
int botRequestDelay = 1000;
unsigned long lastTimeBotRan;

const int ledPin = 2;
bool ledState = LOW;

void blinkOnce()
{
    // nodemcu - led pin is inverted
    digitalWrite(ledPin, LOW);
    delay(1000);
    digitalWrite(ledPin, HIGH);
    delay(1000);
}

void setup()
{
    Serial.begin(9600);
    // initialize LED digital pin as an output.
    pinMode(ledPin, OUTPUT);
    digitalWrite(ledPin, HIGH);

    #ifdef ESP8266
        configTime(0, 0, "pool.ntp.org");      // get UTC time via NTP
        client.setTrustAnchors(&cert); // Add root certificate for api.telegram.org
    #endif

    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }

    Serial.println(WiFi.localIP());
    blinkOnce();
}

void loop()
{
//    Serial.println("[main] loop");
//    blinkOnce();
}
