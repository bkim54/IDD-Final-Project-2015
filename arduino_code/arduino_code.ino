#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_LSM303_U.h>
#include <Adafruit_L3GD20_U.h>
#include <Adafruit_9DOF.h>

/* Assign a unique ID to the sensors */
Adafruit_LSM303_Accel_Unified accel = Adafruit_LSM303_Accel_Unified(30301);
Adafruit_LSM303_Mag_Unified   mag   = Adafruit_LSM303_Mag_Unified(30302);
Adafruit_L3GD20_Unified       gyro  = Adafruit_L3GD20_Unified(20);

/* FSR Setup */
int FSR0 = A0;
int FSR1 = A1;
int FSR2 = A2;
int FSR3 = A3;
int FSR0_value = 0;
int FSR1_value = 0;
int FSR2_value = 0;
int FSR3_value = 0;

void setup(void)
{
  Serial.begin(9600);
  //Serial.println(F("Adafruit 9DOF Tester")); Serial.println("");
  
  /* Initialise the sensors */
  if(!accel.begin())
  {
    /* There was a problem detecting the ADXL345 ... check your connections */
    Serial.println(F("Ooops, no LSM303 detected ... Check your wiring!"));
    while(1);
  }
  if(!mag.begin())
  {
    /* There was a problem detecting the LSM303 ... check your connections */
    Serial.println("Ooops, no LSM303 detected ... Check your wiring!");
    while(1);
  }
  if(!gyro.begin())
  {
    /* There was a problem detecting the L3GD20 ... check your connections */
    Serial.print("Ooops, no L3GD20 detected ... Check your wiring or I2C ADDR!");
    while(1);
  }
}

void loop(void)
{
  /* Get a new sensor event */
  sensors_event_t event;
   
  /* Display the results (acceleration is measured in m/s^2) */
  accel.getEvent(&event);
  Serial.print(F("Accel: "));
  Serial.print(event.acceleration.x); Serial.print("  ");
  Serial.print(event.acceleration.y); Serial.print("  ");
  Serial.println(event.acceleration.z); 

//  /* Display the results (magnetic vector values are in micro-Tesla (uT)) */
//  mag.getEvent(&event);
//  Serial.print(F("MAG   "));
//  Serial.print("X: "); Serial.print(event.magnetic.x); Serial.print("  ");
//  Serial.print("Y: "); Serial.print(event.magnetic.y); Serial.print("  ");
//  Serial.print("Z: "); Serial.print(event.magnetic.z); Serial.print("  ");Serial.println("uT");

  /* Display the results (gyrocope values in rad/s) */
  gyro.getEvent(&event);
  Serial.print(F("Gyro: "));
  Serial.print(event.gyro.x); Serial.print("  ");
  Serial.print(event.gyro.y); Serial.print("  ");
  Serial.println(event.gyro.z); 

  FSR0_value = analogRead(FSR0);
  FSR1_value = analogRead(FSR1);
  FSR2_value = analogRead(FSR2);
  FSR3_value = analogRead(FSR3);
  Serial.print(F("FSR: "));
  Serial.print(FSR0_value); Serial.print("  ");
  Serial.print(FSR1_value); Serial.print("  ");
  Serial.print(FSR2_value); Serial.print("  ");
  Serial.println(FSR3_value); 
  delay(50);
}
