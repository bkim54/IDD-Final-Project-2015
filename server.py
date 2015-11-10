# -*- coding: utf-8 -*-
"""
Created on Mon Nov 09 14:47:38 2015

@author: Bill
"""


import web
import dataset
import json
import random
db = dataset.connect('sqlite:///nbedmbed.db')  

urls = (
        '/motion_pie', 'update_motion_pie', 
        '/motion_bar', 'update_motion_pie')

app = web.application(urls, globals())

class update_motion_pie:        
    def GET(self):
        return json.dumps({'wrist': random.randint(0,20), 'elbow': random.randint(0,20)})


if __name__ == "__main__":
    app.run()