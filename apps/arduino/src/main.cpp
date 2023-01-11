#include "Arduino.h"
#define _TASK_SLEEP_ON_IDLE_RUN
#define _TASK_LTS_POINTER
#define _TASK_STD_FUNCTION
#define _TASK_WDT_IDS


#include <TaskScheduler.h>
#include <PowerService.hcpp>
#include <iostream>
#include <functional>
#include <utility>
#ifdef ESP32
    #include <WiFi.h>
#else
    #include <ESP8266WiFi.h>
#endif
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

Scheduler ts;

#ifdef ESP8266
    X509List cert(TELEGRAM_CERTIFICATE_ROOT);
#endif

WiFiClientSecure client;
UniversalTelegramBot bot(BOTtoken, client);

// Checks for new messages every 1 second.
int botRequestDelay = 1000;
unsigned long lastTimeBotRan;

void MainLoop(); // Need GC? https://github.com/arkhipenko/TaskScheduler/blob/master/examples/Scheduler_example19_Dynamic_Tasks/Scheduler_example19_Dynamic_Tasks.ino

Task tMain(100 * TASK_MILLISECOND, 100, &MainLoop, &ts, true);

const int LED_PIN = 2;
bool ledState = LOW;

typedef void (*FuncPtr)();
// Define the function object class
class FuncObject
{
public:
    // Constructor that stores the lambda function
    FuncObject(std::function<void()> f) : f_(std::move(f)) {}

    // Overload the function call operator
    void operator()()
    {
        // Call the stored lambda function
        f_();
    }

private:
    std::function<void()> f_;
};
//
//template <typename F>
//FuncPtr toFuncPtr(F&& f)
//{
//    return f;
//}

//struct FuncObject
//{
//    template <typename F>
//    FuncObject(F&& f) : func(f) {}
//
//    void operator()() const
//    {
//        func();
//    }
//
//    std::function<void()> func;
//};


void MainLoop() {
    Serial.print(millis()); Serial.print("\t");
    Serial.print("MainLoop run: ");
    int i = tMain.getRunCounter();
    Serial.print(i); Serial.print(F(".\t"));

    PowerService powerService(STR(TELEGRAM_CHAT_ID), bot);
    auto power_service_check_wrapper = [&]() -> void { powerService.check(); };

//    FuncObject func(power_service_check_wrapper);

    std::function<void()> func(power_service_check_wrapper);
//    const FuncPtr& func = toFuncPtr(power_service_check_wrapper);
//    FuncPtr func = &power_service_check_wrapper;
//    FuncPtr func = power_service_check_wrapper;
//    FuncPtr func = toFuncPtr(power_service_check_wrapper);
//    const FuncPtr& func = toFuncPtr(power_service_check_wrapper);
//    FuncObject func(power_service_check_wrapper);
//    FuncType func = power_service_check_wrapper;
//    FuncObject func(power_service_check_wrapper);


    Task *t = new Task(1000 * 60, TASK_FOREVER, func, &ts, true);

    Serial.print(F("Generated a new task:\t")); Serial.print(t->getId()); Serial.print(F("\tInt, Iter = \t"));

    t->enable();
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
        client.setTrustAnchors(&cert); // Add root certificate for api.telegram.org
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
//    Serial.println("[main] loop");
//    blinkOnce();
}
