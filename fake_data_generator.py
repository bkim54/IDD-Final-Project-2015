from random import randint
from random import random
import dataset
import datetime
import time

db = dataset.connect('sqlite:///nbedmbed.db')
motion_table = db['motion']
motion_table.delete()
force_table = db['force']
force_table.delete()
for i in range(7,18):
	key = str(datetime.date.today()) + " " + str(i)
	motion_table.insert(dict(date=key, elbow = randint(20,100), wrist = randint(20,100)))
	force_table.insert(dict(date=key, FSR0 = random(), FSR1 = random(), FSR2= random(), FSR3= random()))

for i in range(1,2000):
	key = str(datetime.date.today()) + " " + str(i)
	f0 = random()
	f1 = random()
	f2 = random()
	force_table.update(dict(date=key, FSR0 = random(), FSR1 = random(), FSR2= random(), FSR3= random()),['date'])
	motion_table.update(dict(date=key,elbow = randint(20,100), wrist = randint(20,100)),['date'])
	time.sleep(200)