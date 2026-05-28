#include <Wire.h>
#include <WiFi.h>
#include <WebServer.h>

const char* ssid     = "THEFT ALERT";
const char* password = "pineapple";

WebServer server(80);

const int buzzerPin = 18; 
const int freq = 1000;  
const int resolution = 8; 

const int   MPU_ADDR     = 0x68;
const float THRESHOLD    = 0.45;
const int   SUSTAINED_MS = 7000;
const int   SAMPLE_RATE_MS = 50;
const int   GRACE_MS     = 3000;
const int   WARMUP_MS    = 5000;
const int   CALIB_SAMPLES = 200;
const float CALIB_MAX_VAR = 0.01;

float baselineX, baselineY, baselineZ;

const int SMOOTH_N = 5;
float     smoothX[SMOOTH_N] = {}, smoothY[SMOOTH_N] = {}, smoothZ[SMOOTH_N] = {};
int       smoothIdx = 0;

unsigned long lastSample    = 0;
unsigned long movementStart = 0;
unsigned long lastMoveTime  = 0;
bool moving      = false;
bool alarmActive = false;

String eventLog[5];
int eventCount = 0;

void addEvent(String msg) {
    for (int i = 4; i > 0; i--) eventLog[i] = eventLog[i-1];
    eventLog[0] = msg;
    if (eventCount < 5) eventCount++;
    Serial.println(msg);
}

void handleRoot() {
    String html = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
  <meta name='viewport' content='width=device-width, initial-scale=1'>
  <title>Smart Bike Lock</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 400px; margin: 40px auto; padding: 0 20px; background: #f4f4f4; }
    h1 { text-align: center; color: #333; }
    .card { background: white; border-radius: 12px; padding: 20px; margin: 16px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .status-row { display: flex; justify-content: space-between; align-items: center; margin: 10px 0; font-size: 1.1em; }
    .badge { padding: 6px 14px; border-radius: 20px; font-weight: bold; color: white; }
    .alarm-on  { background: #f44336; }
    .alarm-off { background: #9E9E9E; }
    .moving-yes { background: #FF9800; }
    .moving-no  { background: #4CAF50; }
    .event { padding: 6px 0; border-bottom: 1px solid #eee; font-size: 0.9em; color: #555; }
    .event:last-child { border-bottom: none; }
    button { width: 100%; padding: 12px; margin-top: 12px; background: #f44336; color: white; border: none; border-radius: 8px; font-size: 1em; font-weight: bold; cursor: pointer; }
    button:hover { background: #d32f2f; }
  </style>
</head>
<body>
  <h1> Smart Bike Lock</h1>
  <div class='card'>
    <div class='status-row'>
      <span>Motion</span>
      <span id='moveBadge' class='badge moving-no'>NONE</span>
    </div>
    <div class='status-row'>
      <span>Alarm</span>
      <span id='alarmBadge' class='badge alarm-off'>OFF</span>
    </div>
    <button id='resetBtn' onclick='resetAlarm()' style='display:none;'>Reset Alarm</button>
  </div>
  <div class='card'>
    <b>Recent Events</b>
    <div id='events'></div>
  </div>
<script>
  let lastData = "";
  function poll() {
    fetch('/status')
      .then(r => r.text())
      .then(data => {
        if (data !== lastData) {
          lastData = data;
          const d = JSON.parse(data);

          const mb = document.getElementById('moveBadge');
          mb.textContent = d.moving ? 'DETECTED' : 'NONE';
          mb.className = 'badge ' + (d.moving ? 'moving-yes' : 'moving-no');

          const ab = document.getElementById('alarmBadge');
          ab.textContent = d.alarm ? 'ALARM!' : 'OFF';
          ab.className = 'badge ' + (d.alarm ? 'alarm-on' : 'alarm-off');

          document.getElementById('resetBtn').style.display = d.alarm ? 'block' : 'none';

          const ev = document.getElementById('events');
          ev.innerHTML = d.events.map(e => "<div class='event'>" + e + "</div>").join('');
        }
      });
  }
  function resetAlarm() {
    fetch('/reset').then(() => { lastData = ""; poll(); });
  }
  setInterval(poll, 1000);
  poll();
</script>
</body>
</html>
)rawliteral";
    server.send(200, "text/html", html);
}

void handleReset() {
    alarmActive = false;
    moving = false;
    movementStart = 0;
    addEvent("Alarm reset from dashboard");
    server.send(200, "text/plain", "OK");
}

void handleStatus() {
    String json = "{";
    json += "\"moving\":" + String(moving ? "true" : "false") + ",";
    json += "\"alarm\":"  + String(alarmActive ? "true" : "false") + ",";
    json += "\"events\":[";
    for (int i = 0; i < eventCount; i++) {
        json += "\"" + eventLog[i] + "\"";
        if (i < eventCount - 1) json += ",";
    }
    json += "]}";
    server.send(200, "application/json", json);
}

void readAccel(float* ax, float* ay, float* az) {
    Wire.beginTransmission(MPU_ADDR);
    Wire.write(0x3B);
    Wire.endTransmission(false);
    Wire.requestFrom(MPU_ADDR, 6, true);
    *ax = ((Wire.read() << 8) | Wire.read()) / 16384.0;
    *ay = ((Wire.read() << 8) | Wire.read()) / 16384.0;
    *az = ((Wire.read() << 8) | Wire.read()) / 16384.0;
}

bool calibrate() {
    Serial.println("Calibrating — hold still...");
    float sx = 0, sy = 0, sz = 0;
    float sx2 = 0, sy2 = 0, sz2 = 0;
    float ax, ay, az;
    for (int i = 0; i < CALIB_SAMPLES; i++) {
        readAccel(&ax, &ay, &az);
        sx  += ax;  sy  += ay;  sz  += az;
        sx2 += ax*ax; sy2 += ay*ay; sz2 += az*az;
        delay(10);
    }
    float meanX = sx / CALIB_SAMPLES;
    float meanY = sy / CALIB_SAMPLES;
    float meanZ = sz / CALIB_SAMPLES;
    float varX = (sx2 / CALIB_SAMPLES) - (meanX * meanX);
    float varY = (sy2 / CALIB_SAMPLES) - (meanY * meanY);
    float varZ = (sz2 / CALIB_SAMPLES) - (meanZ * meanZ);
    if (varX > CALIB_MAX_VAR || varY > CALIB_MAX_VAR || varZ > CALIB_MAX_VAR) {
        Serial.println("Sensor unstable — retrying calibration...");
        return false;
    }
    baselineX = meanX;
    baselineY = meanY;
    baselineZ = meanZ;
    for (int i = 0; i < SMOOTH_N; i++) {
        smoothX[i] = baselineX;
        smoothY[i] = baselineY;
        smoothZ[i] = baselineZ;
    }
    Serial.println("Ready.");
    return true;
}

void setup() {
    Serial.begin(115200);
    delay(1000);

    ledcAttach(buzzerPin, freq, resolution);
    ledcWriteTone(buzzerPin, 0);

    Wire.begin(8, 9);
    Wire.beginTransmission(MPU_ADDR);
    Wire.write(0x6B);
    Wire.write(0x00);
    Wire.endTransmission(true);

    delay(WARMUP_MS);
    while (!calibrate()) { delay(1000); }

    WiFi.softAP(ssid, password);
    Serial.print("AP IP: ");
    Serial.println(WiFi.softAPIP());

    server.on("/", handleRoot);
    server.on("/status", handleStatus);
    server.on("/reset", handleReset);
    server.begin();
    Serial.println("Web server started");

    addEvent("System started");
}

void loop() {
    server.handleClient();

    if (alarmActive) {
        ledcWriteTone(buzzerPin, 4500);
        delay(400);
        ledcWriteTone(buzzerPin, 4000);
        delay(400);
    } else {
        ledcWriteTone(buzzerPin, 0); 
    }

    if (millis() - lastSample < SAMPLE_RATE_MS) return;
    lastSample = millis();

    float ax, ay, az;
    readAccel(&ax, &ay, &az);

    smoothX[smoothIdx] = ax;
    smoothY[smoothIdx] = ay;
    smoothZ[smoothIdx] = az;
    smoothIdx = (smoothIdx + 1) % SMOOTH_N;

    float avgX = 0, avgY = 0, avgZ = 0;
    for (int i = 0; i < SMOOTH_N; i++) {
        avgX += smoothX[i];
        avgY += smoothY[i];
        avgZ += smoothZ[i];
    }
    avgX /= SMOOTH_N;
    avgY /= SMOOTH_N;
    avgZ /= SMOOTH_N;

    float delta = sqrt(
        pow(avgX - baselineX, 2) +
        pow(avgY - baselineY, 2) +
        pow(avgZ - baselineZ, 2)
    );

    if (delta > THRESHOLD) {
        lastMoveTime = millis();
        if (!moving) {
            moving = true;
            movementStart = millis();
            addEvent("Movement detected");
        } else if (!alarmActive && millis() - movementStart >= SUSTAINED_MS) {
            alarmActive = true;
            addEvent("ALARM triggered!");
        }
    } else {
        if (moving && millis() - lastMoveTime >= GRACE_MS) {
            moving = false;
            if (!alarmActive) {
                movementStart = 0;
                addEvent("Movement stopped");
            }
        }
    }
}
