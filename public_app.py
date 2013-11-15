#!/usr/bin/env python

import logging
import hashlib
import hmac
import json
from mimetypes import guess_type
import os
import random
import time
import urllib

import envoy
from flask import Flask, render_template, Markup, abort, jsonify

import app_config
import copytext
import models
from render_utils import flatten_app_config, make_context

app = Flask(app_config.PROJECT_NAME)
app.config['PROPAGATE_EXCEPTIONS'] = True

file_handler = logging.FileHandler(app_config.APP_LOG_PATH)
file_handler.setLevel(logging.INFO)
app.logger.addHandler(file_handler)
app.logger.setLevel(logging.INFO)


@app.route('/%s/stations/<int:zip_code>/' % app_config.PROJECT_SLUG, methods=['GET'])
def stations_json(zip_code):
    with open('www/data/zips/%s.json' % zip_code, 'rb') as readfile:
        return jsonify(json.loads(readfile.read()))


@app.route('/%s/form/buy/' % app_config.PROJECT_SLUG, methods=['GET'])
def form_buy():
    """
    Set up the form to buy a shirt.
    There are shenanigans here.
    https://firstdata.zendesk.com/entries/407522-First-Data-Global-Gateway-e4-Hosted-Payment-Pages-Integration-Manual
    """
    context = make_context()
    context['test_js'] = ''

    # Decide on the form URL to use.
    context['form_url'] = "https://demo.globalgatewaye4.firstdata.com/payment"
    if app_config.DEPLOYMENT_TARGET in ['production', 'staging']:
        context['form_url'] = "https://checkout.globalgatewaye4.firstdata.com/payment"

    # Get our login token.
    context['x_login'] = os.environ.get('gge4_x_login', None)

    # Set the shirt amount.
    context['x_amount'] = "35.00"

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
    from flask import request

    if request.args.get('test', None):
        context['test_js'] = """
            <script src="//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min.js"></script>
            <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
            <script src="../../js/templates.js"></script>
        """
        return render_template('_form.html', **context)

    return render_template('form_buy.html', **context)


@app.route('/%s/form/thanks/' % app_config.PROJECT_SLUG, methods=['POST', 'GET'])
def form_thanks():
    """
    The return reciept page from GGe4.
    Requires some bits from the POST or GET request.
    """

    # Get our basic context.
    context = make_context()

    # Get the request.
    from flask import request

    # Get the data from the request URL params.
    if request.method == "GET":
        data = dict(request.args)

        # Clean up the data elements.
        for key, value in data.items():
            data[key] = value[0]

    # Get the data from the POST form.
    if request.method == "POST":
        data = dict(request.form)

    # Put the data into the template context.
    context['data'] = data

    # Now, do the stuff that makes sure this is a legitimate transaction.
    # 1.) Make sure we don't get spoofed transactions.

    # The request should have the transaction_id and the amount. We need these things.
    if data.get('x_trans_id', None) and data.get('x_amount', None):

        # Get the response key from our environment.
        relay_response_key = os.environ.get('gge4_response_key', None)

        # Get the login key from our environment.
        login = os.environ.get('gge4_x_login', None)

        # Get the transaction ID and the amount from the data.
        transaction_id = data.get('x_trans_id', None)
        amount = data.get('x_amount', None)

        # Create a hash string from this known stuff.
        hash_string = "%s%s%s%s" % (
            relay_response_key,
            login,
            transaction_id,
            amount
        )

        # Make an MD5 hash from this hash string. This is our verified (known good) hash.
        verified_hash = hashlib.md5(hash_string).hexdigest()

        # Get the unverified hash from the URL.
        unverified_hash = data.get('x_MD5_Hash', None)

        # The verified hash and the unverified hash should match.
        if verified_hash == unverified_hash:

            # 2. Now that we have a known hash, let's check to see if the transaction ID has already been used.
            models.tshirt_db.connect()

            # Select orders with this transaction id.
            order = models.Order.select().where(models.Order.x_trans_id == transaction_id)

            # If this thing doesn't exist, let's create it.
            if order.count() == 0:

                try:
                    # Try and create this order.
                    models.Order(**data).save()

                except:
                    # If it fails, return a bad request.
                    return ("<h1>Bad Request</h1><br/>The URL is missing necessary parameters.", 400)

                # If this is the test environment, do some things.
                if request.args.get('test', None):
                    context['test_js'] = """
                        <script src="//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min.js"></script>
                        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
                        <script src="../../js/templates.js"></script>
                    """
                    return render_template('_thanks.html', **context)

                return render_template('form_thanks.html', **context)

            else:
                # This else means that the order must already exist.
                # Return an HTTP 412.
                return ("<h1>Precondition Failed</h1><br/>This transaction has already been recorded.", 412)

        else:
            # This means that the URL hash doesn't match the hash we've created.
            # These are the spoofers and they must be chastened.
            # Return an HTTP 401.
            return ("<h1>Unauthorized</h1><br/>The URL hash does not match the expected result.", 401)

    # This means that the URL is missing one of the things we need to calculate the hash.
    # Return a 400.
    return ("<h1>Bad Request</h1><br/>The URL is missing necessary parameters.", 400)


# Render LESS files on-demand
@app.route('/%s/less/<string:filename>' % app_config.PROJECT_SLUG)
def _less(filename):
    try:
        with open('less/%s' % filename) as f:
            less = f.read()
    except IOError:
        abort(404)

    r = envoy.run('node_modules/bin/lessc -', data=less)

    return r.std_out, 200, { 'Content-Type': 'text/css' }

# Render JST templates on-demand
@app.route('/%s/js/templates.js' % app_config.PROJECT_SLUG)
def _templates_js():
    r = envoy.run('node_modules/bin/jst --template underscore jst')

    return r.std_out, 200, { 'Content-Type': 'application/javascript' }

# Render application configuration
@app.route('/%s/js/app_config.js' % app_config.PROJECT_SLUG)
def _app_config_js():
    config = flatten_app_config()
    js = 'window.APP_CONFIG = ' + json.dumps(config)

    return js, 200, { 'Content-Type': 'application/javascript' }

# Render copytext
@app.route('/%s/js/copy.js' % app_config.PROJECT_SLUG)
def _copy_js():
    copy = 'window.COPY = ' + copytext.Copy().json()

    return copy, 200, { 'Content-Type': 'application/javascript' }

# Server arbitrary static files on-demand
@app.route('/%s/<path:path>' % app_config.PROJECT_SLUG)
def _static(path):
    try:
        with open('www/%s' % path) as f:
            return f.read(), 200, { 'Content-Type': guess_type(path)[0] }
    except IOError:
        abort(404)

@app.template_filter('urlencode')
def urlencode_filter(s):
    """
    Filter to urlencode strings.
    """
    if type(s) == 'Markup':
        s = s.unescape()

    s = s.encode('utf8')
    s = urllib.quote_plus(s)

    return Markup(s)

if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument('-p', '--port')
    args = parser.parse_args()
    server_port = 8001

    if args.port:
        server_port = int(args.port)

    app.run(host='0.0.0.0', port=server_port, debug=app_config.DEBUG)
