import serial
import struct

ser = serial.Serial('/COM7',9600)
while (True):
    print ser.readline()
    #b = ser.read(4)
    #print struct.unpack('f', b)
