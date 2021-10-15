#!/usr/bin/env python

"""
Utilities used by multiple commands.
"""

import boto

from fabric.api import prompt
from boto.s3.connection import OrdinaryCallingFormat

def confirm(message):
    """
    Verify a users intentions.
    """
    answer = prompt(message, default="Not at all")

    if answer.lower() not in ('y', 'yes', 'buzz off', 'screw you'):
        exit()


def get_bucket(bucket_name):
    """
    Established a connection and gets s3 bucket
    """

    if '.' in bucket_name:
        s3 = boto.connect_s3(calling_format=OrdinaryCallingFormat())
    else:
        s3 = boto.connect_s3()

    return s3.get_bucket(bucket_name)
