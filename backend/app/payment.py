"""
PesaPal Payment Integration Module
Handles PesaPal API calls for order payment processing
"""

import requests
import os
from datetime import datetime
import hmac
import hashlib
import json

class PesaPalPayment:
    """PesaPal Payment Gateway Integration"""
    
    # PesaPal API endpoints
    PESAPAL_API_URL = "https://pesapal.com/api/api"
    PESAPAL_IFRAME_URL = "https://pesapal.com/api/PostPesapalDirectOrder"
    
    def __init__(self):
        """Initialize PesaPal with credentials from environment"""
        self.consumer_key = os.getenv("PESAPAL_CONSUMER_KEY", "vGoEp880+4Oix0t56wVLkyWg1T8n8F/q")
        self.consumer_secret = os.getenv("PESAPAL_CONSUMER_SECRET", "3quLzptUCXShb7VBEnC2FVsiQa8=")
        self.merchant_reference_id = os.getenv("PESAPAL_MERCHANT_ID", "your_merchant_id")
        self.pesapal_public_key = os.getenv("PESAPAL_PUBLIC_KEY", "your_public_key")
    
    def generate_request_token(self):
        """
        Generate a request token for PesaPal API calls
        Returns the OAuth token needed for authentication
        """
        try:
            url = f"{self.PESAPAL_API_URL}/get-token"
            
            params = {
                "consumer_key": self.consumer_key,
                "consumer_secret": self.consumer_secret,
                "timestamp": self._get_timestamp()
            }
            
            # Create signature
            signature = self._create_signature(params)
            params["signature"] = signature
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            # Parse response - PesaPal returns JSON with token
            data = response.json()
            if "token" in data:
                return data["token"]
            return None
            
        except Exception as e:
            print(f"Error generating PesaPal request token: {str(e)}")
            return None
    
    def create_payment_iframe(self, order_id, amount, email, phone, first_name, last_name):
        """
        Generate PesaPal payment iframe URL for checkout
        
        Args:
            order_id: Unique order ID
            amount: Total payment amount in KES
            email: Buyer email
            phone: Buyer phone number
            first_name: Buyer first name
            last_name: Buyer last name
        
        Returns:
            dict with iframe_url and payment_reference
        """
        try:
            # Generate unique reference
            reference = f"ORD_{order_id}_{datetime.utcnow().timestamp()}"
            
            # Build payment parameters
            params = {
                "pesapal_request_data": self._build_payment_request(
                    reference, amount, email, phone, first_name, last_name
                ),
                "pesapal_response_type": "JSON"
            }
            
            # Create signature
            signature = self._create_signature(params)
            params["pesapal_signature"] = signature
            
            # Return iframe URL with parameters
            iframe_url = self._build_iframe_url(params)
            
            return {
                "success": True,
                "iframe_url": iframe_url,
                "reference": reference
            }
            
        except Exception as e:
            print(f"Error creating PesaPal payment iframe: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def verify_payment(self, reference_id, checksum):
        """
        Verify payment status from PesaPal
        
        Args:
            reference_id: PesaPal payment reference ID
            checksum: Security checksum from PesaPal callback
        
        Returns:
            dict with payment verification details
        """
        try:
            token = self.generate_request_token()
            if not token:
                return {"success": False, "error": "Could not generate token"}
            
            url = f"{self.PESAPAL_API_URL}/query-payment-details"
            
            params = {
                "reference": reference_id,
                "pesapal_merchant_reference": reference_id,
                "pesapal_transaction_tracking_id": reference_id,
                "token": token,
                "timestamp": self._get_timestamp()
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            payment_data = response.json()
            
            return {
                "success": True,
                "status": payment_data.get("status"),
                "reference": payment_data.get("reference"),
                "amount": payment_data.get("amount"),
                "currency": payment_data.get("currency", "KES")
            }
            
        except Exception as e:
            print(f"Error verifying PesaPal payment: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _build_payment_request(self, reference, amount, email, phone, first_name, last_name):
        """Build XML payment request for PesaPal"""
        xml_request = f"""
        <PesapalPayload>
            <TransactionType>PAYMENT</TransactionType>
            <Reference>{reference}</Reference>
            <Amount>{amount}</Amount>
            <Currency>KES</Currency>
            <Description>Flower Delivery Order {reference}</Description>
            <CustomerEmail>{email}</CustomerEmail>
            <CustomerPhone>{phone}</CustomerPhone>
            <CustomerFirstName>{first_name}</CustomerFirstName>
            <CustomerLastName>{last_name}</CustomerLastName>
            <CallbackUrl>{self._get_callback_url()}</CallbackUrl>
        </PesapalPayload>
        """
        return xml_request
    
    def _create_signature(self, params):
        """
        Create HMAC-SHA1 signature for PesaPal requests
        
        Args:
            params: Dictionary of parameters to sign
        
        Returns:
            Base64 encoded signature
        """
        try:
            # Sort parameters and create query string
            sorted_params = sorted(params.items())
            query_string = "&".join([f"{k}={v}" for k, v in sorted_params])
            
            # Create HMAC-SHA1 signature
            signature = hmac.new(
                self.consumer_secret.encode(),
                query_string.encode(),
                hashlib.sha1
            ).digest()
            
            # Convert to base64
            import base64
            return base64.b64encode(signature).decode()
            
        except Exception as e:
            print(f"Error creating signature: {str(e)}")
            return ""
    
    def _get_timestamp(self):
        """Get current timestamp in Unix format"""
        return str(int(datetime.utcnow().timestamp()))
    
    def _get_callback_url(self):
        """Get the callback URL for PesaPal to return to after payment"""
        callback_url = os.getenv("PESAPAL_CALLBACK_URL", "https://flora-x.pages.dev")
        return callback_url

    def _build_iframe_url(self, params):
        """Build the complete iframe URL with encoded parameters"""
        import base64
        
        # Encode payment request
        payment_request_encoded = base64.b64encode(
            params["pesapal_request_data"].encode()
        ).decode()
        
        # Build URL with parameters
        iframe_url = f"{self.PESAPAL_IFRAME_URL}?pesapal_request_data={payment_request_encoded}"
        iframe_url += f"&pesapal_response_type={params['pesapal_response_type']}"
        iframe_url += f"&pesapal_merchant_reference={self.merchant_reference_id}"
        iframe_url += f"&pesapal_signature={params['pesapal_signature']}"
        
        return iframe_url


# Singleton instance
pesapal = PesaPalPayment()
