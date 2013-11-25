#!/usr/bin/env python

import csv
import json

import requests

FIELDNAMES = ['date', 'name', 'caption', 'url', 'img', 'moderated']

class Photo(object):

    def __init__(self, **kwargs):
        for field in FIELDNAMES:
            if kwargs[field]:
                setattr(self, field, kwargs[field])

def get_photo_csv():
    r = requests.get('https://docs.google.com/spreadsheet/pub?key=0Aga89cI2jWk5dFdqZmp0YXQ5RDBNWlNaTV90cXFYQWc&output=csv')
    with open('data/photos.csv', 'wb') as writefile:
        writefile.write(r.content)

def parse_photo_csv():
    with open('data/photos.csv', 'rb') as readfile:
        photos = list(csv.DictReader(readfile, fieldnames=FIELDNAMES))

    payload = []

    for photo in photos:
        if photo['moderated'] != '':
            p = Photo(**photo)
            payload.append(p.__dict__)

    with open('www/data/photos.json', 'wb') as writefile:
        writefile.write(json.dumps(payload))

if __name__ == "__main__":
    get_photo_csv()
    parse_photo_csv()
