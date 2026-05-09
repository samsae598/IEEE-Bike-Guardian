#include <SPI.h>
#include <MFRC522.h>
#include <Servo.h>

#define RST_PIN 9      // RFID reset pin
#define SS_PIN 10      // RFID SS pin
#define BUZZER_PIN 8   // Buzzer pin
#define SERVO_PIN 7    // Servo motor pin

MFRC522 rfid(SS_PIN, RST_PIN); 
Servo myServo;                

String authorizedUIDs[] = {
    "04 2D 4C 9A 45 79 80",
};
int numberOfAuthorizedUids = sizeof(authorizedUIDs) / sizeof(authorizedUIDs[0]);

void setup() {
    Serial.begin(9600);     
    SPI.begin();             
    rfid.PCD_Init();        
    delay(50);               

    myServo.attach(SERVO_PIN); 
    myServo.write(0);          
    pinMode(BUZZER_PIN, OUTPUT); 

    Serial.println("Scan your card...");
}

void loop() {
    // Look for new RFID cards
    if (!rfid.PICC_IsNewCardPresent()) {
        return; // No new card present
    }

    // Select one of the RFID cards
    if (!rfid.PICC_ReadCardSerial()) {
        return; // Couldn't read card
    }

    // Create a UID string
    String scannedUID = "";
    for (byte i = 0; i < rfid.uid.size; i++) {
        scannedUID += String(rfid.uid.uidByte[i] < 0x10 ? "0" : "") + String(rfid.uid.uidByte[i], HEX);
        if (i < rfid.uid.size - 1) scannedUID += " "; 
    }

    // Print the scanned UID
    Serial.print("Scanned UID: ");
    Serial.println(scannedUID);

    bool isAuthorized = false;
    for (int i = 0; i < numberOfAuthorizedUids; i++) {
        if (scannedUID.equalsIgnoreCase(authorizedUIDs[i])) {
            isAuthorized = true;
            break;
        }
    }

 
    if (isAuthorized) {
        tone(BUZZER_PIN, 1000, 200); 
        myServo.write(90);           
        Serial.println("Access Granted"); 
        delay(5000);                 
        myServo.write(0);            
    } else {
        tone(BUZZER_PIN, 500, 200); 
        myServo.write(0);           
        Serial.println("Access Denied");  
    }

    delay(2000);
    rfid.PICC_HaltA(); 
} 