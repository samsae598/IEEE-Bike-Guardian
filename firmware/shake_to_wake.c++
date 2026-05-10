#include <Wire.h>
#include <WiFi.h>
#include <WebServer.h>

// --- WiFi Access Point ---
const char* ssid     = "SmartBikeLock";
const char* password = "bikelock123";

WebServer server(80);

// --- MPU-6050 ---
const int   MPU_ADDR     = 0x68;
const float THRESHOLD    = 0.4;
const int   SUSTAINED_MS = 20000;
const int   SAMPLE_RATE_MS = 50;
const int   GRACE_MS     = 2000;

float baselineX, baselineY, baselineZ;
unsigned long lastSample    = 0;
unsigned long movementStart = 0;
unsigned long lastMoveTime  = 0;
bool moving      = false;
bool alarmActive = false;

// --- Event Log ---
String eventLog[5];
int eventCount = 0;

void addEvent(String msg) {
    for (int i = 4; i > 0; i--) eventLog[i] = eventLog[i-1];
    eventLog[0] = msg;
    if (eventCount < 5) eventCount++;
    Serial.println(msg);
}

// --- Web Handlers ---
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
  </style>
</head>
<body>
  <h1>🔒 Smart Bike Lock</h1>
  <div class='card'>
    <div class='status-row'>
      <span>Motion</span>
      <span id='moveBadge' class='badge moving-no'>NONE</span>
    </div>
    <div class='status-row'>
      <span>Alarm</span>
      <span id='alarmBadge' class='badge alarm-off'>OFF</span>
    </div>
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

          const ev = document.getElementById('events');
          ev.innerHTML = d.events.map(e => "<div class='event'>" + e + "</div>").join('');
        }
      });
  }
  setInterval(poll, 1000);
  poll();
</script>
</body>
</html>
)rawliteral";
    server.send(200, "text/html", html);
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

// --- MPU ---
void readAccel(float* ax, float* ay, float* az) {
    Wire.beginTransmission(MPU_ADDR);
    Wire.write(0x3B);
    Wire.endTransmission(false);
    Wire.requestFrom(MPU_ADDR, 6, true);
    *ax = ((Wire.read() << 8) | Wire.read()) / 16384.0;
    *ay = ((Wire.read() << 8) | Wire.read()) / 16384.0;
    *az = ((Wire.read() << 8) | Wire.read()) / 16384.0;
}

void calibrate() {
    Serial.println("Calibrating — hold still...");
    float sx = 0, sy = 0, sz = 0, ax, ay, az;
    for (int i = 0; i < 100; i++) {
        readAccel(&ax, &ay, &az);
        sx += ax; sy += ay; sz += az;
        delay(10);
    }
    baselineX = sx / 100;
    baselineY = sy / 100;
    baselineZ = sz / 100;
    Serial.println("Ready.");
}

// -----------------------------------------------

void setup() {
    Serial.begin(115200);
    delay(1000);

    // WiFi AP
    WiFi.softAP(ssid, password);
    Serial.print("AP IP: ");
    Serial.println(WiFi.softAPIP());

    server.on("/", handleRoot);
    server.on("/status", handleStatus);
    server.begin();
    Serial.println("Web server started");

    // MPU
    Wire.begin(21, 22); // change if your SDA/SCL pins differ
    Wire.beginTransmission(MPU_ADDR);
    Wire.write(0x6B);
    Wire.write(0x00);
    Wire.endTransmission(true);

    calibrate();
    addEvent("System started");
}

void loop() {
    server.handleClient();

    if (millis() - lastSample < SAMPLE_RATE_MS) return;
    lastSample = millis();

    float ax, ay, az;
    readAccel(&ax, &ay, &az);

    float delta = sqrt(
        pow(ax - baselineX, 2) +
        pow(ay - baselineY, 2) +
        pow(az - baselineZ, 2)
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
            if (alarmActive) addEvent("Alarm cleared");
            alarmActive = false;
            movementStart = 0;
            addEvent("Movement stopped");
        }
    }
}