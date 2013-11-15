import csv
import json
import os
import requests

with open('data/zipcodes.csv', 'rb') as readfile:
    zips = list(csv.DictReader(readfile))

for z in zips:
    r = requests.get("http://api.npr.org/stations?zip='%s'&apiKey=%s&format=json" % (
        str(z['zip']).zfill(5),
        os.environ.get('NPR_API_KEY', None)))
    results = json.loads(r.content)
    stations = results['station']

    if stations[0].get('orgDisplayName', None):
        print z['zip'], len(stations)

        with open('www/data/zips/%s.json' % z['zip'], 'wb') as writefile:
            writefile.write(json.dumps(results))
