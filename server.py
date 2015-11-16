# -*- coding: utf-8 -*-
"""
Created on Mon Nov 09 14:47:38 2015

@author: Bill
"""

import datetime
import web
import dataset
import json
import random

urls = ('/motion_pie', 'update_motion_pie', 
        '/motion_bar', 'update_motion_bar',
        '/pressure_map', 'update_pressure_map')

app = web.application(urls, globals())

db = dataset.connect('sqlite:///nbedmbed.db')
motion_table = db['motion']
force_table = db['force']

class update_motion_pie:
    def GET(self):
        wrist_count = 0
        elbow_count = 0
        for m in db['motion']:
            wrist_count = wrist_count + m['wrist']
            elbow_count = elbow_count + m['elbow']
            
        print wrist_count
        print elbow_count
        return json.dumps({'wrist': wrist_count, 'elbow': elbow_count})

class update_motion_bar:
    def GET(self):
        data = dict()
        for i in range(24):
        	data[i] = {'wrist': 0, 'elbow': 0}
        for m in db['motion']:
            if m['date'].startswith(str(datetime.date.today())):
                data[int(m['date'].split()[1])] = {'wrist': m['wrist'], 'elbow': m['elbow']}
            print m['elbow'], m['wrist']
        #return json.dumps({'wrist': random.randint(0,20), 'elbow': random.randint(0,20)})
        return json.dumps(data)

class update_pressure_map:
    def GET(self):
        key = str(datetime.date.today()) + " " + str(datetime.datetime.now().hour)
        data = dict({'FSR0':force_table.find_one(date=key)['FSR0'],
                     'FSR1':force_table.find_one(date=key)['FSR1'],
                     'FSR2':force_table.find_one(date=key)['FSR2'],
                     'FSR3':force_table.find_one(date=key)['FSR3']})
        return json.dumps(data)
#        
if __name__ == "__main__":
    app.run()
