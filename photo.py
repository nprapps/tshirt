#!/usr/bin/env python

from bs4 import BeautifulSoup
import csv
import json

import requests

FIELDNAMES = ['date', 'name', 'caption', 'url', 'preview', 'remote_img_url', 'moderated']

class Photo(object):

    def __init__(self, **kwargs):
        for field in FIELDNAMES:
            if kwargs[field]:
                setattr(self, field, kwargs[field])
        setattr(self, 'local_img_url', self.remote_img_url.split(u's3.amazonaws.com/')[1].replace('_8.jpg', '.jpg'))

def get_photo_csv():
    r = requests.get('https://docs.google.com/spreadsheet/pub?key=0Aga89cI2jWk5dFdqZmp0YXQ5RDBNWlNaTV90cXFYQWc&output=csv')
    with open('data/photos.csv', 'wb') as writefile:
        writefile.write(r.content)

def parse_photo_csv():
    with open('data/photos.csv', 'rb') as readfile:
        photos = list(csv.DictReader(readfile, fieldnames=FIELDNAMES))

    print "Processing %s entries from Google Docs." % len(photos)

    payload = []

    for photo in photos:
        if photo['moderated'] != '':
            r = requests.get(photo['remote_img_url'])
            if r.status_code == 200:
                p = Photo(**photo)
                payload.append(p.__dict__)
                with open('www/img/s2s-instagram-%s' % p.local_img_url, 'wb') as writefile:
                    writefile.write(r.content)
            else:
                print "! Error: Photo %s does not have an image file." % (photo['url'])
        else:
            print "* Unmoderated: Photo %s has been unmoderated." % (photo['url'])

    print "Writing %s photos to JSON." % len(payload)
    with open('www/data/photos.json', 'wb') as writefile:
        writefile.write(json.dumps(payload))


if __name__ == "__main__":
    get_photo_csv()
    parse_photo_csv()
