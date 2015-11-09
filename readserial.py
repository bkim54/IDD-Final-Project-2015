import serial
import numpy
import datetime
import dataset

def checkInput(read, s):
    if (numpy.size(read) != 0):
        if (read[0]==s):
            return True
    return False

ACCEL_THRESH = 1.2 #1.2 for robustness, could just do 1
GYRO_THRESH = 0.5
connected=False

    
count = 0;
gyro_buffer=[0,0,0,0,0,0,0,0,0,0] 
accel_buffer = [0,0,0,0,0,0,0,0,0,0]
oldKey = ""
elbowCount = 0
wristCount = 0


        

if __name__ == "__main__":    
    try:
        ser = serial.Serial('/COM7',9600)
        connected = True
        db = dataset.connect('sqlite:///nbedmbed.db')       
        motion_table = db['motion']
        
        motion_table.delete()
        force_table = db['force']
        force_table.delete()
    except serial.SerialException:
        print "No device connected"
        connected=False
        
    while (connected):
        try:
            accel = ser.readline().split()
        except serial.SerialException:
            print "disconnected"
            break
        key = str(datetime.date.today()) + " " + str(datetime.datetime.now().hour)
        if (checkInput(accel, "Accel:")):
            accel = [float(accel[1]), float(accel[2])] #just take into accout x,y
            accel = numpy.sqrt(numpy.sum(numpy.power(accel,2)))
            
            try:
                gyro = ser.readline().split()
            except serial.SerialException:
                print "disconnected"
                break
            
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
            if (accel > ACCEL_THRESH):
                if (gyro > GYRO_THRESH):
                    if (key == oldKey):
                        wristCount = wristCount+1
                        motion_table.update(dict(date=key,elbow=elbowCount,wrist=wristCount),['date'])
                    else:
                        elbowCount = 0
                        wristCount = 1
                        motion_table.insert(dict(date=key, elbow = elbowCount, wrist = wristCount))
                    print "update database: current hour, wrist_count"
                else:
                    if (key == oldKey):
                        elbowCount = elbowCount+1
                        motion_table.update(dict(date=key,elbow=elbowCount,wrist=wristCount),['date'])
                    else:
                        elbowCount = 1
                        wristCount = 0
                        motion_table.insert(dict(date=key, elbow = elbowCount, wrist = wristCount))
                    print "update database: current hour, elbow_count"                
            
    #        try:
    #            force = ser.readline().split()
    #        except serial.SerialException:
    #            print "disconnected"
    #            break
    #        if (checkInput(force, "FSR: ")):
    #            force = [float(force[1]),float(force[2]),float(force[3])]
    #            force_table.insert(dict(date=key, FSR0 = force[0], FSR1 = force[1]), FSR2= force[2])
        
        oldKey = key
    
    print "DCed"
#key = str(datetime.date.today()) + " " + str(datetime.datetime.now().hour)
#db = dataset.connect('sqlite:///nbedmbed.db')        
#table = db['motion']
#table.delete()
#table.insert(dict(date=key, elbow = 0, wrist = 0))
#
#for m in db['motion']:
#    print m['elbow']
#    print m['wrist']
#table.update(dict(date=key,elbow=1,wrist=1),['date'])
#for m in db['motion']:
#    print m['elbow']
#    print m['wrist']
