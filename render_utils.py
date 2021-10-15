#!/usr/bin/env python
# _*_ coding:utf-8 _*_
import codecs
from datetime import datetime
import json
import logging
import time
import urllib
import subprocess

from flask import Markup, g, render_template, request
from slimit import minify
from smartypants import smartypants

import app_config
import copytext

logging.basicConfig(format=app_config.LOG_FORMAT)
logger = logging.getLogger(__name__)
logger.setLevel(app_config.LOG_LEVEL)

class BetterJSONEncoder(json.JSONEncoder):
    """
    A JSON encoder that intelligently handles datetimes.
    """
    def default(self, obj):
        if isinstance(obj, datetime):
            encoded_object = obj.isoformat()
        else:
            encoded_object = json.JSONEncoder.default(self, obj)

        return encoded_object

class Includer(object):
    """
    Base class for Javascript and CSS psuedo-template-tags.

    See `make_context` for an explanation of `asset_depth`.
    """
    def __init__(self, asset_depth=0):
        self.includes = []
        self.tag_string = None
        self.asset_depth = asset_depth

    def push(self, path):
        self.includes.append(path)

        return ''

    def _compress(self):
        raise NotImplementedError()

    def _relativize_path(self, path):
        relative_path = path
        if relative_path.startswith('www/'):
            relative_path = relative_path[4:]

        depth = len(request.path.split('/')) - (2 + self.asset_depth)

        while depth > 0:
            relative_path = '../%s' % relative_path
            depth -= 1

        return relative_path

    def render(self, path):
        if getattr(g, 'compile_includes', False):
            if path in g.compiled_includes:
                timestamp_path = g.compiled_includes[path]
            else:
                # Add a querystring to the rendered filename to prevent caching
                timestamp_path = '%s?%i' % (path, int(time.time()))

                out_path = 'www/%s' % path

                if path not in g.compiled_includes:
                    logger.info('Rendering %s' % out_path)

                    with codecs.open(out_path, 'w', encoding='utf-8') as f:
                        f.write(self._compress())

                # See "fab render"
                g.compiled_includes[path] = timestamp_path

            markup = Markup(self.tag_string % self._relativize_path(timestamp_path))
        else:
            response = ','.join(self.includes)

            response = '\n'.join([
                self.tag_string % self._relativize_path(src) for src in self.includes
            ])

            markup = Markup(response)

        del self.includes[:]

        return markup

class JavascriptIncluder(Includer):
    """
    Psuedo-template tag that handles collecting Javascript and serving appropriate clean or compressed versions.
    """
    def __init__(self, *args, **kwargs):
        Includer.__init__(self, *args, **kwargs)

        self.tag_string = '<script type="text/javascript" src="%s"></script>'

    def _compress(self):
        output = []
        src_paths = []

        for src in self.includes:
            src_paths.append('www/%s' % src)

            with codecs.open('www/%s' % src, encoding='utf-8') as f:
                if not src.endswith('.min.js'):
                    logger.info('- compressing %s' % src)
                    output.append(minify(f.read()))
                else:
                    logger.info('- appending already compressed %s' % src)
                    output.append(f.read())

        context = make_context()
        context['paths'] = src_paths

        header = render_template('_js_header.js', **context)
        output.insert(0, header)

        return '\n'.join(output)

class CSSIncluder(Includer):
    """
    Psuedo-template tag that handles collecting CSS and serving appropriate clean or compressed versions.
    """
    def __init__(self, *args, **kwargs):
        Includer.__init__(self, *args, **kwargs)

        self.tag_string = '<link rel="stylesheet" type="text/css" href="%s" />'

    def _compress(self):
        output = []

        src_paths = []

        for src in self.includes:

            src_paths.append('%s' % src)

            try:
                compressed_src = subprocess.check_output(["node_modules/less/bin/lessc", "-x", src])
                output.append(compressed_src)
            except:
                logger.error('It looks like "lessc" isn\'t installed. Try running: "npm install"')
                raise

        context = make_context()
        context['paths'] = src_paths

        header = render_template('_css_header.css', **context)
        output.insert(0, header)


        return '\n'.join(output)

def flatten_app_config():
    """
    Returns a copy of app_config containing only
    configuration variables.
    """
    config = {}

    # Only all-caps [constant] vars get included
    for k, v in app_config.__dict__.items():
        if k.upper() == k:
            config[k] = v

    return config

def make_context(asset_depth=0):
    """
    Create a base-context for rendering views.
    Includes app_config and JS/CSS includers.

    `asset_depth` indicates how far into the url hierarchy
    the assets are hosted. If 0, then they are at the root.
    If 1 then at /foo/, etc.
    """
    context = flatten_app_config()

    try:
        context['COPY'] = copytext.Copy(app_config.COPY_PATH)
    except copytext.CopyException:
        pass

    context['JS'] = JavascriptIncluder(asset_depth=asset_depth)
    context['CSS'] = CSSIncluder(asset_depth=asset_depth)

    return context

def urlencode_filter(s):
    """
    Filter to urlencode strings.
    """
    if type(s) == 'Markup':
        s = s.unescape()

    # Evaulate COPY elements
    if type(s) is not unicode:
        s = unicode(s)

    s = s.encode('utf8')
    s = urllib.quote_plus(s)

    return Markup(s)

def smarty_filter(s):
    """
    Filter to smartypants strings.
    """
    if type(s) == 'Markup':
        s = s.unescape()

    # Evaulate COPY elements
    if type(s) is not unicode:
        s = unicode(s)


    s = s.encode('utf-8')
    s = smartypants(s)

    try:
        return Markup(s)
    except:
        logger.error('This string failed to encode: %s' % s)
        return Markup(s)
