import serial
import numpy
import datetime
import dataset

def checkInput(read, s):
    if (read[0]==s):
        return True
    return False

accel_thresh = 1.2 #1.2 for robustness, could just do 1
gyro_thresh = 0.5
connected=False
try:
    ser = serial.Serial('/COM7',9600)
    connected = True
    db = dataset.connect('sqlite:///nbedmbed.db')
except serial.SerialException:
    print "No device connected"
    connected=False
count = 0;
gyro_buffer=[0,0,0,0,0,0,0,0,0,0] 
accel_buffer = [0,0,0,0,0,0,0,0,0,0]
while (connected):
    accel = ser.readline().split()
    key = str(datetime.date.today()) + " " + str(datetime.datetime.now().hour)
    if (checkInput(accel, "Accel:")):
        accel = [float(accel[1]), float(accel[2])] #just take into accout x,y
        accel = numpy.sqrt(numpy.sum(numpy.power(accel,2)))
        
        gyro = ser.readline().split()
        gyro = [float(gyro[1]), float(gyro[2]), float(gyro[3])]
        gyro = numpy.sqrt(numpy.sum(numpy.power(gyro,2)))
        
        gyro_buffer[count%10] = gyro
        accel_buffer[count%10] = accel        
        count = count+1
        if (count ==10):
            count = 0
        gyro = numpy.sum(gyro_buffer)/10.0
        accel = numpy.sum(accel_buffer)/10.0
        #print "accel: " +str(accel)
        #print "gyro: " + str(gyro)
        if (accel > accel_thresh):
            if (gyro > gyro_thresh):
                print "update database: current hour, wrist_count"
            else:
                 #print "gyro: " + str(gyro)
                 print "update database: current hour, elbow_count"                
        
    force = ser.readline().split()
    if (checkInput(force, "FSR: ")):
        force = [float(force[1]),float(force[2]),float(force[3])]
 
 
key = str(datetime.date.today()) + " " + str(datetime.datetime.now().hour)
db = dataset.connect('sqlite:///nbedmbed.db')        
table = db['motion']
table.delete()
table.insert(dict(date=key, elbow = 0, wrist = 0))

for m in db['motion']:
    print m['elbow']
    print m['wrist']
table.update(dict(date=key,elbow=1,wrist=1),['date'])
for m in db['motion']:
    print m['elbow']
    print m['wrist']
    
s = "accel: -3 -43.3 239"
print s.split()