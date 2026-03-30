import requests
import os
import base64
from datetime import datetime
import json

class DarajaPayment:
    """M-Pesa Daraja API Integration for Flora X"""
    
    def __init__(self):
        # Safaricom Credentials
        self.consumer_key = os.getenv("HqhGVAJr87JrttPES21GO8ZC15FJgh7WwXZ46sH29W4pGYcx") or os.getenv("DARAJA_KEY")
        self.consumer_secret = os.getenv("B6tjDwAO5RUMrU4Cd3CPqg0GJ3d10nL7RRdLuERhFjLvAnsgFNZbZPev5YAArIqV") or os.getenv("DARAJA_SECRET")
        self.shortcode = os.getenv("DARAJA_BUSINESS_SHORTCODE") or os.getenv("DARAJA_SHORTCODE")
        self.passkey = os.getenv("DARAJA_PASSKEY") or os.getenv("DARAJA_KEY_PASS")
        self.callback_url = os.getenv("DARAJA_CALLBACK_URL", "https://flowerdeliveryapp-aid0.onrender.com/payment/callback")
        
        # Determine Environment
        self.is_sandbox = os.getenv("DARAJA_MODE", "sandbox").lower() == "sandbox"
        self.base_url = "https://sandbox.safaricom.co.ke" if self.is_sandbox else "https://api.safaricom.co.ke"

        # Check for Mock Mode if keys are missing
        self.mock_mode = not all([self.consumer_key, self.consumer_secret, self.passkey])
        if self.mock_mode:
            print("⚠️ DARAJA KEYS MISSING: Flora X is running in MOCK PAYMENT MODE.")

    def _sanitize_phone(self, phone):
        """Convert phone to 2547XXXXXXXX format"""
        phone = str(phone).strip().replace("+", "")
        if phone.startswith("0"):
            return "254" + phone[1:]
        elif phone.startswith("7") or phone.startswith("1"):
            return "254" + phone
        return phone

    def get_access_token(self):
        """Get OAuth2 token from Safaricom"""
        if self.mock_mode: return "mock_access_token"
        
        url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
        try:
            response = requests.get(url, auth=(self.consumer_key, self.consumer_secret), timeout=10)
            response.raise_for_status()
            return response.json().get("access_token")
        except Exception as e:
            print(f"Daraja Token Error: {e}")
            return None

    def trigger_stk_push(self, phone, amount, order_id):
        """
        Initiates the STK Push (M-Pesa PIN prompt)
        """
        if self.mock_mode:
            return {"success": True, "CheckoutRequestID": "MOCK_LNM_123", "CustomerMessage": "Mock Push Sent"}

        token = self.get_access_token()
        if not token:
            return {"success": False, "error": "Authentication failed"}

        formatted_phone = self._sanitize_phone(phone)
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        
        # Password = Base64(ShortCode + Passkey + Timestamp)
        password_str = f"{self.shortcode}{self.passkey}{timestamp}"
        password = base64.b64encode(password_str.encode()).decode()

        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        
        payload = {
            "BusinessShortCode": self.shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline", # Use CustomerBuyGoodsOnline for Till
            "Amount": int(amount),
            "PartyA": formatted_phone,
            "PartyB": self.shortcode,
            "PhoneNumber": formatted_phone,
            "CallBackURL": self.callback_url,
            "AccountReference": f"FLORA-{order_id}",
            "TransactionDesc": f"Payment for Flora X Order {order_id}"
        }

        try:
            url = f"{self.base_url}/mpesa/stkpush/v1/processrequest"
            response = requests.post(url, json=payload, headers=headers, timeout=15)
            response.raise_for_status()
            res_data = response.json()
            
            # ResponseCode "0" means the prompt was successfully sent to the phone
            return {
                "success": res_data.get("ResponseCode") == "0",
                "CheckoutRequestID": res_data.get("CheckoutRequestID"),
                "CustomerMessage": res_data.get("CustomerMessage"),
                "raw_response": res_data
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

# Singleton instance
daraja = DarajaPayment()