#!/usr/bin/env python

import os

from peewee import *


tshirt_db = PostgresqlDatabase(
    database='tshirt',
    user=os.environ.get('tshirt_psql_user', None),
    password=os.environ.get('tshirt_psql_pass', None),
    host=os.environ.get('tshirt_psql_host', None),
    port="5432"
)

class Order(Model):
    x_trans_id = TextField()
    x_login = TextField()
    x_MD5_Hash = TextField()
    x_fp_sequence = TextField()
    x_fp_timestamp = TextField()
    x_email = TextField()
    x_address = TextField()
    x_city = TextField()
    x_first_name = TextField()
    x_last_name = TextField()
    x_state = TextField()
    x_zip = TextField()
    x_ship_to_address = TextField()
    x_ship_to_city = TextField()
    x_ship_to_first_name = TextField()
    x_ship_to_last_name = TextField()
    x_ship_to_state = TextField()
    x_ship_to_zip = TextField()
    x_description = TextField()
    x_invoice_num = TextField()
    x_po_num = TextField()
    exact_ctr = TextField()
    x_response_code = TextField()
    x_response_reason_code = TextField()
    x_response_reason_text = TextField()
    x_response_subcode = TextField()

    Card_Number = TextField(blank=True, null=True)
    alternate_tax = TextField(blank=True, null=True)
    discount_amount = TextField(blank=True, null=True)
    enable_level3_processing = TextField(blank=True, null=True)
    exact_wsp_version = TextField(blank=True, null=True)
    tax_rate = TextField(blank=True, null=True)
    x_amount = TextField(blank=True, null=True)
    x_auth_code = TextField(blank=True, null=True)
    x_avs_code = TextField(blank=True, null=True)
    x_cavv_response = TextField(blank=True, null=True)
    x_company = TextField(blank=True, null=True)
    x_country = TextField(blank=True, null=True)
    x_cust_id = TextField(blank=True, null=True)
    x_cvv2_resp_code = TextField(blank=True, null=True)
    x_duty = TextField(blank=True, null=True)
    x_ecommerce_flag = TextField(blank=True, null=True)
    x_fax = TextField(blank=True, null=True)
    x_freight = TextField(blank=True, null=True)
    x_method = TextField(blank=True, null=True)
    x_phone = TextField(blank=True, null=True)
    x_reference_3 = TextField(blank=True, null=True)
    x_ship_to_company = TextField(blank=True, null=True)
    x_ship_to_country = TextField(blank=True, null=True)
    x_show_form = TextField(blank=True, null=True)
    x_tax = TextField(blank=True, null=True)
    x_tax_exempt = TextField(blank=True, null=True)
    x_test_request = TextField(blank=True, null=True)
    x_type = TextField(blank=True, null=True)

    def __unicode__(self):
        return self.x_trans_id

    class Meta:
        database = tshirt_db
