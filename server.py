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
        '/pressure_map_history', 'update_pressure_map_history',
        '/summary', 'update_summary',
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
        data = dict({'FSR0':float(force_table.find_one(date=key)['FSR0']),
                     'FSR1':float(force_table.find_one(date=key)['FSR1']),
                     'FSR2':float(force_table.find_one(date=key)['FSR2'])})
        return json.dumps(data)

class update_summary:
    def GET(self):
        key = 'elems'
        wristSum = 0
        elbowSum = 0
        FSRSum = [0,0,0]
        FSRcount = 0
        output = {key, []}
        for m in db['motion']:
            if m['date'].startswith(str(datetime.date.today())):
                wristSum += m['wrist']
                elbowSum += m['elbow']
        for m in db['force']:
            if m['date'].startswith(str(datetime.date.today())):
                FSRSum[0] += 0 if m['FSR0Total']/m['Count'] < 150 else 1
                FSRSum[1] += 0 if m['FSR1Total']/m['Count'] < 600 else 1
                FSRSum[2] += 0 if m['FSR2Total']/m['Count'] < 600 else 1
                FSRcount += 1
        output[key].append('Your summary for today:')
        wristMove = round(100*wristSum/(wristSum+elbowSum + 0.0))
        fingerRelax = round(100*FSRSum[1]/(FSRSum[1]+elbowSum + 0.0))/2 + round(100*FSRSum[1]/(FSRSum[1]+elbowSum + 0.0))/2
        wristRelax = round(100*FSRSum[0]/(FSRSum[1]+elbowSum + 0.0))
        output[key].append('You moved your wrist ' + str(wristMove) + "% of the time.")
        output[key].append('Your fingers were relaxed ' + str(fingerRelax) + "% of the time.")
        output[key].append('Your wrist was relaxed ' + str(wristRelax) + "% of the time.")
        if wristMove > 30:
            output[key].append('Try to move from your elbow a bit more!');
        else:
            output[key].append('You are moving from your elbow correctly!')
        if fingerRelax > 30:
            output[key].append('Try to relax your fingers a bit more!');
        else:
            output[key].append('Your fingers are usually relaxed!')
        if wristRelax > 30:
            output[key].append('Try to relax your wrist a bit more!');
        else:
            output[key].append('Your wrist is nice and relaxed!')
        
        return json.dumps(output)

#        
if __name__ == "__main__":
    app.run()
