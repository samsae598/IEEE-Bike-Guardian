# IEEE-Bike-Guardian
A smart bike security system designed to combat campus vehicle theft featuring real-time tamper monitoring and mobile alerts.

---

## The Vision
Inspired by the high rate of bike and scooter thefts on campus, this project aims to create a "Smart Lock" that provides:
* **Accessibility:** Unlocks via Key Card (RFID).
* **Intelligent Alerts:** Sustained movement detection to differentiate between a bump and a theft attempt.
* **Wireless Control:** Reset alarms and check system health over a dedicated WiFi Access Point.
* **Real-time Monitoring:** Detects tampering using an MPU-6050 Accelerometer. View motion status and alarm history from a smartphone.

---

## Hardware Stack
* **Microcontroller:** ESP32
* **Connectivity:** Integrated WiFi (Access Point Mode)
* **Inertial Measurement:** MPU-6050 (Accelerometer/Gyroscope)
* **Access Control:** PN532 NFC RFID (Card Reader)
* **Physical Lock:** 9g Micro Servo Motor
* **Alarm Sound:** Buzzer module

---

## Features Implemented
### 1. Smart Tamper Detection Logic
This system uses high-frequency polling (50ms) to calculate movement "delta" with dynamic comparison.
* **Sensitivity Threshold:** Currently tuned to `0.1g` to detect significant disruption. Tuned for sharp impacts (sawing/prying) versus environmental noise.
* **Sustained Movement:** To prevent false positives from wind or heavy traffic, the alarm only triggers if movement is sustained for `8000ms`.
* **Movement Calculation:** Because the MPU-6050 is also a gyroscope, our calibrated baseline would often cause false alarms as rotation (but not movement) would still exceed the threshold. Our current version instead uses dynamic comparison to compare each new positional *and* rotational reading to the last to determine sustained movement.
### 2. Web-Based Security Dashboard
The system hosts a local web server. Users can connect via smartphone to view:
* **Motion Status:** Visual badges for motion indicating "NONE" or "DETECTED".
* **Alarm State:** A high-visibility alert when the alarm is active.