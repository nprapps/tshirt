#!/usr/bin/env python

import logging
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
    context = make_context()

    from flask import request

    if request.method == "POST":
        data = dict(request.form)

    elif request.method == "GET":
        data = dict(request.args)

    context['data'] = data

    with open('data/orders.json', 'wb') as writefile:
        writefile.write(json.dumps(data))

    if request.args.get('test', None):
        context['test_js'] = """
            <script src="//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min.js"></script>
            <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
            <script src="../../js/templates.js"></script>
        """
        return render_template('_thanks.html', **context)

    return render_template('form_thanks.html', **context)


@app.route('/%s/form/json/' % app_config.PROJECT_SLUG, methods=['GET'])
def form_json():
    with open('data/orders.json', 'rb') as readfile:
        return jsonify(json.loads(readfile.read()))

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
