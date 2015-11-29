#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_LSM303_U.h>
#include <Adafruit_L3GD20_U.h>
#include <Adafruit_9DOF.h>
#include <Adafruit_NeoPixel.h>
#ifdef __AVR__
  #include <avr/power.h>
#endif

#define ACCEL_THRESH 1.0
#define GYRO_THRESH 0.5
#define MAG_THRESH 8.0
#define FSR_THRESH 100.0

/*Define LEDSTRIP */
#define PIN 5
// Parameter 1 = number of pixels in strip
// Parameter 2 = Arduino pin number (most are valid)
// Parameter 3 = pixel type flags, add together as needed:
//   NEO_KHZ800  800 KHz bitstream (most NeoPixel products w/WS2812 LEDs)
//   NEO_KHZ400  400 KHz (classic 'v1' (not v2) FLORA pixels, WS2811 drivers)
//   NEO_GRB     Pixels are wired for GRB bitstream (most NeoPixel products)
//   NEO_RGB     Pixels are wired for RGB bitstream (v1 FLORA pixels, not v2)
Adafruit_NeoPixel strip = Adafruit_NeoPixel(6, PIN, NEO_GRB + NEO_KHZ800);

/*Vibration Motor*/
int motorPin = 4;

/* Assign a unique ID to the sensors */
Adafruit_9DOF                 dof   = Adafruit_9DOF();
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


float gyro_buffer[10];
float accel_buffer[10];
float gyro_mag = 0;
float accel_mag = 0;
float gyro_avg = 0;
float accel_avg = 0;
int count = 0;
float header = 0;
float prev_header = 0;

float notMoving = 0;

void setup(void)
{
  pinMode(motorPin, OUTPUT);
  strip.begin();
  strip.show(); // Initialize all pixels to 'off'
  
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
    Serial.println("Ooops, no L3GD20 detected ... Check your wiring or I2C ADDR!");
    while(1);
  }
}

void loop(void)
{
//   if (Serial.available()) {
//     int i = Serial.parseInt();
//     Serial.println(i);
//     Serial.println(Serial.parseInt());
//   } 
   
//   if (Serial.available()) {
//    //Serial.println(i);
//    int i = Serial.parseInt();
//    int speed = Serial.parseInt();
//    if (i == 1) 
//      theaterChase(strip.Color(127, 0, 0), 50);
//    else {
//      for (int i=0; i < strip.numPixels(); i=i+1) {
//          strip.setPixelColor(i, 0);        //turn every third pixel off
//        }
//      strip.show();
//    }
//    if (speed >= 0 && speed <= 255)
//    {
//      analogWrite(motorPin, speed);
//    }
//    delay(2000);
//  }
  
  
//  else {
//    for (int i=0; i < strip.numPixels(); i=i+1) {
//        strip.setPixelColor(i, 0);        //turn every third pixel off
//      }
//      strip.show();
//      analogWrite(motorPin, 0);
//  }

  /* Get a new sensor event */
  sensors_event_t accel_event;
  sensors_event_t mag_event;
  sensors_event_t gyro_event;
  sensors_vec_t   orientation; 
  
  /* Display the results (acceleration is measured in m/s^2) */
  accel.getEvent(&accel_event);
  mag.getEvent(&mag_event);
  //if (dof.fusionGetOrientation(&accel_event, &mag_event, &orientation))
  if (dof.magGetOrientation(SENSOR_AXIS_Z, &mag_event, &orientation))
  {
    /* 'orientation' should have valid .roll and .pitch fields */
    //Serial.println(orientation.heading);
    //Serial.println(F(""));
    header = orientation.heading;
  }
  Serial.print(F("Accel: "));
  Serial.print(accel_event.acceleration.x); Serial.print("  ");
  Serial.print(accel_event.acceleration.y); Serial.print("  ");
  Serial.println(accel_event.acceleration.z); 

  accel_mag = sqrt(pow(accel_event.acceleration.x,2)+pow(accel_event.acceleration.y,2));

  /* Display the results (gyrocope values in rad/s) */
  gyro.getEvent(&gyro_event);
  Serial.print(F("Gyro: "));
  Serial.print(gyro_event.gyro.x); Serial.print("  ");
  Serial.print(gyro_event.gyro.y); Serial.print("  ");
  Serial.println(gyro_event.gyro.z); 
  
  gyro_mag = sqrt(pow(gyro_event.gyro.x,2)+pow(gyro_event.gyro.y,2)+pow(gyro_event.gyro.z,2));

  FSR0_value = analogRead(FSR0);
  FSR1_value = analogRead(FSR1);
  FSR2_value = analogRead(FSR2);
  FSR3_value = analogRead(FSR3);
  //Serial.println(FSR0_value);
  Serial.print(F("FSR: "));
  Serial.print(FSR0_value); Serial.print("  ");
  Serial.print(FSR1_value); Serial.print("  ");
  Serial.print(FSR2_value); Serial.print("  ");
  Serial.println(FSR3_value); 
  //Serial.println("----");
  //Serial.println(accel_mag);
  //Serial.println(gyro_mag);
  //Serial.p rintln("----");
  accel_buffer[count%10] = accel_mag;
  gyro_buffer[count%10] = gyro_mag;
  count++;
  if(count==10)
    count=0;
  accel_avg=0;
  gyro_avg=0;
  
  for(int i =0; i < 10; i++) {
    accel_avg=accel_avg+accel_buffer[i];
  }
  for(int i =0; i < 10; i++) {
    gyro_avg=gyro_avg+gyro_buffer[i];
  }
  
  accel_avg = accel_avg/10.0;
  gyro_avg = gyro_avg/10.0;
  //Serial.println(accel_mag);
  //Serial.println(gyro_mag);
  if(accel_mag > ACCEL_THRESH) {
    if (abs(header-prev_header) > MAG_THRESH) {
      //if(gyro_avg > GYRO_THRESH && gyro_mag > gyro_avg) 
       if(gyro_mag > GYRO_THRESH) { 
         //Serial.println(gyro_mag);
        theaterChase(strip.Color(127, 0, 0), 25);
        //analogWrite(motorPin, 255);
      } 
    } 
    else {
      /*For Debug*/
      //if(gyro_mag > GYRO_THRESH)
         //Serial.println(abs(header-prev_header));
         //Serial.println(gyro_mag);
      theaterChase(strip.Color(0, 0, 0), 10);
      //analogWrite(motorPin, 0);
    }
  } else { //not moving so reset the resting state
    //Serial.println(accel_mag);
    prev_header = header;
    theaterChase(strip.Color(0, 0, 0), 10);
    //analogWrite(motorPin, 0);
  }
  
  if (FSR0_value < FSR_THRESH) {
    analogWrite(motorPin, 255);
  } else {
    analogWrite(motorPin, 0);
  }
  //delay(50);
}

//Theatre-style crawling lights.
void theaterChase(uint32_t c, uint8_t wait) {
  for (int j=0; j<1; j++) {  //do 10 cycles of chasing
    for (int q=0; q < 3; q++) {
      for (int i=0; i < strip.numPixels(); i=i+3) {
        strip.setPixelColor(i+q, c);    //turn every third pixel on
      }
      strip.show();

      delay(wait);

      for (int i=0; i < strip.numPixels(); i=i+3) {
        strip.setPixelColor(i+q, 0);        //turn every third pixel off
      }
    }
  }
}
