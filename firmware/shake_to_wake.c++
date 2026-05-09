/*
 * Shake to Wake — Arduino Mega + MPU-6050
 *
 * Wiring:
 *   MPU-6050 VCC -> 3.3V
 *   MPU-6050 GND -> GND
 *   MPU-6050 SDA -> Pin 20
 *   MPU-6050 SCL -> Pin 21
 *   MPU-6050 INT -> Pin 2
 */

#include <Wire.h>

const int MPU_ADDR       = 0x68;
const float THRESHOLD    = 0.4;  // g — raise to reduce sensitivity
const int   SUSTAINED_MS     = 20000; // new — how long movement must last (ms)
const int SAMPLE_RATE_MS = 50;

float baselineX, baselineY, baselineZ;
unsigned long lastSample = 0;
bool awake = false;

void setup() {
  Serial.begin(115200);

  Wire.begin();

  // Wake MPU from sleep
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B);
  Wire.write(0x00);
  Wire.endTransmission(true);

  calibrate();
  Serial.println("Sleeping. Shake to wake.");
}

bool moving = false;
unsigned long movementStart  = 0;
unsigned long lastMoveTime   = 0;
const int     GRACE_MS       = 2000; // movement must stop for 2s before timer resets

void loop() {
  if (millis() - lastSample < SAMPLE_RATE_MS) return;
  lastSample = millis();

  float ax, ay, az;
  readAccel(&ax, &ay, &az);

  float dx = ax - baselineX;
  float dy = ay - baselineY;
  float dz = az - baselineZ;
  float delta = sqrt(dx*dx + dy*dy + dz*dz);

  if (delta > THRESHOLD) {
    lastMoveTime = millis(); // keep refreshing "last seen moving"

    if (!moving) {
      moving = true;
      movementStart = millis();
      Serial.println("Movement started...");
    } else if (!awake && millis() - movementStart >= SUSTAINED_MS) {
      awake = true;
      Serial.println("ALARM — sustained movement detected!");
    }

  } else {
    // Only reset if movement has been absent for the full grace period
    if (moving && millis() - lastMoveTime >= GRACE_MS) {
      moving = false;
      awake  = false;
      movementStart = 0;
      Serial.println("Movement stopped, timer reset.");
    }
  }
}

void calibrate() {
  Serial.println("Calibrating — hold still...");
  float sx = 0, sy = 0, sz = 0;
  float ax, ay, az;
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

void readAccel(float* ax, float* ay, float* az) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, 6, true);

  int16_t rx = (Wire.read() << 8) | Wire.read();
  int16_t ry = (Wire.read() << 8) | Wire.read();
  int16_t rz = (Wire.read() << 8) | Wire.read();

  *ax = rx / 16384.0;
  *ay = ry / 16384.0;
  *az = rz / 16384.0;
}