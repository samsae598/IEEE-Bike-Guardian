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
* **Access Control:** RFID RC522 (Card Reader)

---

## Features Implemented
### 1. Smart Tamper Detection Logic
This system uses high-frequency polling (50ms) to calculate movement "delta" from a calibrated baseline.
* **Sensitivity Threshold:** Currently tuned to `0.4g` to detect significant disruption. Tuned for sharp impacts (sawing/prying) versus environmental noise.
* **Sustained Movement:** To prevent false positives from wind or heavy traffic, the alarm only triggers if movement is sustained for `8000ms`.
* **Auto-Calibration:** On startup, the system samples the accelerometer 100 times to set a stable baseline for its current orientation.
### 2. Web-Based Security Dashboard
The system hosts a local web server. Users can connect via smartphone to view:
* **Motion Status:** Visual badges for motion indicating "NONE" or "DETECTED".
* **Alarm State:** A high-visibility alert when the alarm is active.