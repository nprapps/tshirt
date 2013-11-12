#!/usr/bin/env python

import datetime
import logging
import hmac
import os
import random
import requests
import time

from flask import Flask, render_template

import app_config
from render_utils import make_context

app = Flask(app_config.PROJECT_NAME)
app.config['PROPAGATE_EXCEPTIONS'] = True

file_handler = logging.FileHandler(app_config.APP_LOG_PATH)
file_handler.setLevel(logging.INFO)
app.logger.addHandler(file_handler)
app.logger.setLevel(logging.INFO)


@app.route('/%s/stations/<int:zip_code>/' % app_config.PROJECT_SLUG, methods=['GET'])
def stations_json(zip_code):
    r = requests.get("http://api.npr.org/stations?zip=%s&apiKey=%s&format=json" % (
        zip_code, os.environ.get('NPR_API_KEY', None)))
    return r.content


@app.route('/%s/form/buy/' % app_config.PROJECT_SLUG, methods=['GET'])
def form_buy():
    """
    Set up the form to buy a shirt.
    There are shenanigans here.
    https://firstdata.zendesk.com/entries/407522-First-Data-Global-Gateway-e4-Hosted-Payment-Pages-Integration-Manual
    """
    context = make_context()

    # Decide on the form URL to use.
    context['form_url'] = "https://demo.globalgatewaye4.firstdata.com/payment"
    if app_config.DEPLOYMENT_TARGET in ['production', 'staging']:
        context['form_url'] = "https://checkout.globalgatewaye4.firstdata.com/payment"

    # Get our login token.
    context['x_login'] = os.environ.get('gge4_x_login', None)

    # Set the shirt amount.
    context['x_amount'] = "0.01"

    # A random sequence number. Think of this like a salt.
    context['x_fp_sequence'] = random.randrange(10000, 100000, 1)

    # Make a UTC timestamp.
    context['x_fp_timestamp'] = str(time.time()).split('.')[0]

    # Hash these things in a certain order.
    hash_string = "%s^%s^%s^%s^" % (
        context['x_login'],
        context['x_fp_sequence'],
        context['x_fp_timestamp'],
        context['x_amount']
    )

    # Make the md5 hash with our gge4 key.
    context['x_fp_hash'] = hmac.new(os.environ.get('gge4_transaction_key', None), hash_string).hexdigest()

    # Return the form.
    return render_template('form_buy.html', **context)


@app.route('/%s/form/thanks/' % app_config.PROJECT_SLUG, methods=['POST', 'GET'])
def form_thanks():
    """
    The return reciept page from GGe4.
    Requires some bits from the POST or GET request.
    """
    context = make_context()

    from flask import request

    if request.method == "POST":
        data = dict(request.form)

    elif request.method == "GET":
        data = dict(request.args)

    context['data'] = data

    return render_template('form_thanks.html', **context)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8001, debug=app_config.DEBUG)
