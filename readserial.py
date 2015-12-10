import serial
import numpy
import datetime
import dataset
# import easygui
import struct

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
FSR0_buffer=[0,0,0,0,0,0,0,0,0,0] 
FSR1_buffer=[0,0,0,0,0,0,0,0,0,0] 
FSR2_buffer=[0,0,0,0,0,0,0,0,0,0] 
# FSR3_buffer=[0,0,0,0,0,0,0,0,0,0] 
old_force_key = ""
old_IMU_key = ""
elbowCount = 0
wristCount = 0
force0Total = 0
force1Total = 0
force2Total = 0
forceCount = 0
notWritten = True;

if __name__ == "__main__": 
    import serial.tools.list_ports


    ports = list(serial.tools.list_ports.comports())
    for p in ports:
        print p   
    try:
        ser = serial.Serial('/COM5',9600)
        connected = True
        db = dataset.connect('sqlite:///nbedmbed.db')       
        motion_table = db['motion']
        
        motion_table.delete()
        force_table = db['force']
        force_table.delete()
        print "connected"
    except serial.SerialException:
        print "No device connected"
        connected=False
        
    while (connected):
        
        #ser.write("1".encode());
        #ser.write("255".encode());
        #print "wrote"
        #print "connected"
        #print ser.readline();
        #print "read"
    
        try:
            accel = ser.readline().split()
            # print accel
        except serial.SerialException:
            print "disconnected"
            break
        if (checkInput(accel, "Accel:")):
            accel = [float(accel[1]), float(accel[2])] #just take into accout x,y
            accel = numpy.sqrt(numpy.sum(numpy.power(accel,2)))
            
            try:
                gyro = ser.readline().split()
                # print gyro
                force = ser.readline().split()
                # print force
            except serial.SerialException:
                print "disconnected"
                break
            
            gyro = [float(gyro[1]), float(gyro[2]), float(gyro[3])]
            gyro = numpy.sqrt(numpy.sum(numpy.power(gyro,2)))
            
            #g#yro_buffer[count%10] = gyro
            #accel_buffer[count%10] = accel  
            #FSR0_buffer[count%10]  = float(force[1])
            #FSR1_buffer[count%10] =float(force[2])
            #FSR2_buffer[count%10] =float(force[3])
            # FSR3_buffer[count%10] =float(force[4])
            
            #gyro = numpy.sum(gyro_buffer)/10.0
            #accel = numpy.sum(accel_buffer)/10.0
            #force = [numpy.sum(FSR0_buffer)/10.0, numpy.sum(FSR1_buffer)/10.0, numpy.sum(FSR2_buffer)/10.0]
            #print force
            #print "accel: " +str(accel)
            #print "gyro: " + str(gyro)
            key = str(datetime.date.today()) + " " + str(datetime.datetime.now().hour)
            #print datetime.datetime.now().minute
            if (accel > ACCEL_THRESH):
                #print key
                if (gyro > GYRO_THRESH):
                    if (key == old_IMU_key):
                        wristCount = wristCount+1
                        if (count ==10):
                            motion_table.update(dict(date=key,elbow=elbowCount,wrist=wristCount),['date'])
                        # print "update database: current hour, wrist_count"
#                        if notWritten:
#                            ser.write("1".encode());
#                            ser.write("255".encode());
#                            notWritten = False; 
                        #easygui.msgbox("This is a message!", title="simple gui")
                    else:
                        elbowCount = 0
                        wristCount = 1
                        motion_table.insert(dict(date=key, elbow = elbowCount, wrist = wristCount))
                        # print "insert database: current hour, wrist_count"
                        #ctypes.windll.user32.MessageBoxA(0, "Your text", "Your title", 1)  
                        
                
                else:
                    if (key == old_IMU_key):
                        elbowCount = elbowCount+1
                        if (count ==10):
                            motion_table.update(dict(date=key,elbow=elbowCount,wrist=wristCount),['date'])
                        # print "update database: current hour, elbow_count"      
#                        ser.write("0".encode());
#                        ser.write("0".encode());
                    else:
                        elbowCount = 1
                        #wristCount = 0
                        motion_table.insert(dict(date=key, elbow = elbowCount, wrist = wristCount))
                        # print "insert database: current hour, elbow_count" 
                old_IMU_key = key
                
             #print "FSR database" 
            if (key == old_force_key):
                if (count ==10):
                    force_table.update(dict(date=key, FSR0 = force[0], FSR1 = force[1], FSR2= force[2], FSR0Total=force0Total+force[0],FSR1Total=force1Total+force[1],FSR2Total=force2Total+force[2], Count=forceCount+1),['date'])
                force0Total += force[0]
                force1Total += force[1]
                force2Total += force[2]
                forceCount += 1
            else:
                force0Total = 0
                force1Total = 0
                force2Total = 0
                forceCount = 0
                force_table.insert(dict(date=key, FSR0 = force[0], FSR1 = force[1], FSR2= force[2], FSR0Total=0, FSR1Total=0, FSR2Total=0, Count=0))
            old_force_key = key

            
            count = count+1
            if (count ==10):
                count = 0
    
    print "DCed"
#    print "elbow",  elbowCount
#    print "wrist", wristCount
#    for m in db['motion']:
#        print m['elbow']
#        print m['wrist']
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
