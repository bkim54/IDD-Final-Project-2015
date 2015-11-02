# -*- coding: utf-8 -*-
"""
Created on Sun Nov 01 12:58:42 2015

@author: Bill
"""

import serial
import struct

ser = serial.Serial('/COM4',9600)
while (True):
    print ser.readline()
    #b = ser.read(4)
    #print struct.unpack('f', b)
