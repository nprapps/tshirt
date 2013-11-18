#!/usr/bin/env python

import unittest

from playhouse.test_utils import test_database
from peewee import *

import models
import public_app


test_db = SqliteDatabase(':memory:')


class FormTestCase(unittest.TestCase):
    """
    Test the index page.
    """
    def setUp(self):
        public_app.app.config['TESTING'] = True
        self.client = public_app.app.test_client()

    def test_form_construction(self):
        response = self.client.get('/tshirt/form/buy/')

        assert response.status_code == 200

class ReceiptTestCase(unittest.TestCase):
    """
    Testing dynamic conversion of Python app_config into Javascript.
    """
    def setUp(self):
        public_app.app.config['TESTING'] = True
        self.client = public_app.app.test_client()

    def test_naked_thanks(self):
        response = self.client.get('/tshirt/form/thanks/')

        assert response.status_code == 400

    def test_existing_transaction(self):
        data = {'alternate_tax': u'', 'x_response_reason_text': u'Transaction has been approved', 'x_fax': u'', 'x_auth_code': u'ET146932', 'x_ship_to_zip': u'', 'x_phone': u'', 'x_ship_to_last_name': u'', 'x_cavv_response': u'1', 'x_ship_to_state': u'', 'x_cust_id': u'', 'enable_level3_processing': u'', 'x_fp_timestamp': u'1384376685', 'x_amount': u'0.01', 'x_ship_to_company': u'', 'x_method': u'', 'exact_wsp_version': u'1.7', 'x_fp_sequence': u'61639', 'x_email': u'', 'discount_amount': u'', 'x_zip': u'', 'x_test_request': u'TRUE', 'exact_ctr': u'=========== TRANSACTION RECORD ==========\r\nNPR DEMO0787\r\n1111 North Capitol Street NE\r\nWashington, DC 20001\r\nUnited States\r\n\r\n\r\nTYPE: Purchase\r\n\r\nACCT: Visa  $ 0.01 USD\r\n\r\nCARDHOLDER NAME : Jeremy Bowers\r\nCARD NUMBER     : ############5424\r\nDATE/TIME       : 13 Nov 13 16:07:50\r\nREFERENCE #     :  000001 M\r\nAUTHOR. #       : ET146932\r\nTRANS. REF.     : \r\n\r\n    Approved - Thank You 100\r\n\r\n\r\nPlease retain this copy for your records.\r\n\r\nCardholder will pay above amount to card\r\nissuer pursuant to cardholder agreement.\r\n=========================================', 'x_ship_to_first_name': u'', 'x_login': u'HCO-NPR-D-858', 'x_last_name': u'', 'utf8': u'\u2713', 'x_show_form': u'PAYMENT_FORM', 'x_tax': u'', 'x_company': u'', 'x_tax_exempt': u'', 'x_reference_3': u'', 'tax_rate': u'', 'x_avs_code': u'', 'x_ship_to_city': u'', 'x_address': u'', 'x_po_num': u'', 'x_freight': u'', 'x_description': u'{"address":"sdf","city":"sdf","state":"3","zip":"sdf","shirt":"Men\'s Medium","country":"","name":"sdf","station":"WAMU"}', 'x_ship_to_address': u'', 'x_response_subcode': u'S', 'x_MD5_Hash': u'05638970286be42a21880ca62a016f49', 'x_ship_to_country': u'', 'x_type': u'AUTH_CAPTURE', 'x_cvv2_resp_code': u'', 'x_ecommerce_flag': u'', 'Card_Number': u'############5424', 'x_city': u'', 'x_response_code': u'1', 'x_country': u'', 'x_invoice_num': u'', 'x_trans_id': u'11177318', 'x_response_reason_code': u'1', 'x_first_name': u'', 'x_duty': u'', 'x_state': u''}
        response = self.client.get('/tshirt/form/thanks/', query_string=data)

        assert response.status_code == 412

    def test_working_transaction(self):
        with test_database(test_db, (models.Order,), create_tables=True, drop_tables=True):

            data = {'alternate_tax': u'', 'x_response_reason_text': u'Transaction has been approved', 'x_fax': u'', 'x_auth_code': u'ET146932', 'x_ship_to_zip': u'', 'x_phone': u'', 'x_ship_to_last_name': u'', 'x_cavv_response': u'1', 'x_ship_to_state': u'', 'x_cust_id': u'', 'enable_level3_processing': u'', 'x_fp_timestamp': u'1384376685', 'x_amount': u'0.01', 'x_ship_to_company': u'', 'x_method': u'', 'exact_wsp_version': u'1.7', 'x_fp_sequence': u'61639', 'x_email': u'', 'discount_amount': u'', 'x_zip': u'', 'x_test_request': u'TRUE', 'exact_ctr': u'=========== TRANSACTION RECORD ==========\r\nNPR DEMO0787\r\n1111 North Capitol Street NE\r\nWashington, DC 20001\r\nUnited States\r\n\r\n\r\nTYPE: Purchase\r\n\r\nACCT: Visa  $ 0.01 USD\r\n\r\nCARDHOLDER NAME : Jeremy Bowers\r\nCARD NUMBER     : ############5424\r\nDATE/TIME       : 13 Nov 13 16:07:50\r\nREFERENCE #     :  000001 M\r\nAUTHOR. #       : ET146932\r\nTRANS. REF.     : \r\n\r\n    Approved - Thank You 100\r\n\r\n\r\nPlease retain this copy for your records.\r\n\r\nCardholder will pay above amount to card\r\nissuer pursuant to cardholder agreement.\r\n=========================================', 'x_ship_to_first_name': u'', 'x_login': u'HCO-NPR-D-858', 'x_last_name': u'', 'utf8': u'\u2713', 'x_show_form': u'PAYMENT_FORM', 'x_tax': u'', 'x_company': u'', 'x_tax_exempt': u'', 'x_reference_3': u'', 'tax_rate': u'', 'x_avs_code': u'', 'x_ship_to_city': u'', 'x_address': u'', 'x_po_num': u'', 'x_freight': u'', 'x_description': u'{"address":"sdf","city":"sdf","state":"3","zip":"sdf","shirt":"Men\'s Medium","country":"","name":"sdf","station":"WAMU"}', 'x_ship_to_address': u'', 'x_response_subcode': u'S', 'x_MD5_Hash': u'05638970286be42a21880ca62a016f49', 'x_ship_to_country': u'', 'x_type': u'AUTH_CAPTURE', 'x_cvv2_resp_code': u'', 'x_ecommerce_flag': u'', 'Card_Number': u'############5424', 'x_city': u'', 'x_response_code': u'1', 'x_country': u'', 'x_invoice_num': u'', 'x_trans_id': u'11177318', 'x_response_reason_code': u'1', 'x_first_name': u'', 'x_duty': u'', 'x_state': u''}
            response = self.client.get('/tshirt/form/thanks/', query_string=data)

            print response

            assert response.status_code == 200

if __name__ == '__main__':
    unittest.main()
