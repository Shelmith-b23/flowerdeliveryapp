# PesaPal Payment Integration Guide

This document explains how to set up and use PesaPal payment integration in the Flower Delivery App.

## Features Implemented

✅ **PesaPal Payment Integration**
- Initialize payment via PesaPal iframe
- Secure payment processing (M-Pesa, Airtel Money, Visa, Mastercard)
- Payment verification and callback handling
- Payment status polling on client side
- Order tracking with payment method

✅ **Updated Buyer Dashboard**
- Featured flowers section showing latest florist offerings
- Search and filter functionality
- Florist information display (shop name, location, contact)
- Organized by florist shop

✅ **Enhanced Browse Flowers Page**
- Grouped by florist with shop details
- Search functionality
- Better UI/UX with pricing and add to cart
- Direct florist information visibility

## Setting Up PesaPal

### 1. Create PesaPal Account

1. Go to [PesaPal.com](https://www.pesapal.com)
2. Register for a business account
3. Get your credentials:
   - Consumer Key
   - Consumer Secret
   - Merchant ID
   - Public Key

### 2. Configure Backend Environment

Create a `.env` file in the backend directory:

```bash
cd backend
```

Add the following environment variables:

```env
# PesaPal Configuration
PESAPAL_CONSUMER_KEY=your_actual_consumer_key
PESAPAL_CONSUMER_SECRET=your_actual_consumer_secret
PESAPAL_MERCHANT_ID=your_merchant_id
PESAPAL_PUBLIC_KEY=your_pesapal_public_key
PESAPAL_CALLBACK_URL=http://localhost:3000/payment-callback
```

### 3. Update Backend Config

Edit `backend/app/config.py`:

```python
import os

class Config:
    # ... existing config ...
    
    # PesaPal Configuration
    PESAPAL_CONSUMER_KEY = os.getenv("PESAPAL_CONSUMER_KEY")
    PESAPAL_CONSUMER_SECRET = os.getenv("PESAPAL_CONSUMER_SECRET")
    PESAPAL_MERCHANT_ID = os.getenv("PESAPAL_MERCHANT_ID")
    PESAPAL_PUBLIC_KEY = os.getenv("PESAPAL_PUBLIC_KEY")
    PESAPAL_CALLBACK_URL = os.getenv("PESAPAL_CALLBACK_URL", "http://localhost:3000/payment-callback")
```

### 4. Database Migration

Update your database to include the new payment fields:

```bash
cd backend

# Generate migration
flask db migrate -m "Add payment method fields to Order model"

# Apply migration
flask db upgrade
```

Or manually run the migration if auto-generation doesn't work:

```sql
ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) DEFAULT 'pesapal';
ALTER TABLE orders ADD COLUMN pesapal_reference VARCHAR(100);
```

## API Endpoints

### Payment Endpoints

#### 1. Initialize Payment
```
POST /api/payment/pesapal/initialize
Content-Type: application/json
Authorization: Bearer {token}

{
  "order_id": 123
}

Response:
{
  "iframe_url": "https://pesapal.com/api/PostPesapalDirectOrder?...",
  "reference": "ORD_123_1642340000.123456",
  "order_id": 123
}
```

#### 2. Verify Payment
```
POST /api/payment/pesapal/verify
Content-Type: application/json
Authorization: Bearer {token}

{
  "order_id": 123,
  "reference_id": "ORD_123_1642340000.123456"
}

Response:
{
  "success": true,
  "status": "completed",
  "order_id": 123
}
```

#### 3. Check Payment Status
```
GET /api/payment/pesapal/check-status/{order_id}
Authorization: Bearer {token}

Response:
{
  "order_id": 123,
  "paid": true,
  "status": "paid",
  "payment_method": "pesapal",
  "pesapal_reference": "ORD_123_1642340000.123456",
  "total_price": 5000
}
```

#### 4. PesaPal Callback
```
POST /api/payment/pesapal/callback
Content-Type: application/x-www-form-urlencoded

pesapal_transaction_tracking_id={id}
pesapal_merchant_reference={reference}
pesapal_status=completed

Response:
{
  "success": true,
  "message": "Payment processed",
  "order_id": 123,
  "status": "completed"
}
```

## Frontend Usage

### 1. Checkout Flow

The checkout page now includes:
- Order creation
- Payment method selection (PesaPal)
- PesaPal payment initialization
- Payment status polling

### 2. Payment Callback Page

After payment, users are redirected to:
- `/payment-callback` - Handles the post-payment flow
- Verifies payment status
- Redirects to orders page on success

### 3. Order Tracking

Users can view their orders and payment status from:
- `/buyer-dashboard` - Shows orders with payment status
- `/orders` - Detailed order tracking

## Testing

### Test Credentials (Sandbox)

For testing purposes, use PesaPal's sandbox environment:

1. Get sandbox credentials from PesaPal
2. Update environment variables
3. Use test payment methods

### Test Payments

- Test M-Pesa: Use 254712345678 format
- Test Card: Use provided test card numbers from PesaPal
- Test Amount: Use small amounts for testing

### Local Testing

1. Run backend:
```bash
cd backend
python run.py
```

2. Run frontend:
```bash
cd frontend
npm start
```

3. Create test account and place order
4. Proceed to checkout
5. Select PesaPal payment
6. Complete payment in sandbox environment

## File Structure

```
backend/
├── app/
│   ├── payment.py                 # PesaPal integration logic
│   ├── routes/
│   │   └── payment.py             # Payment endpoints
│   ├── models.py                  # Updated Order model
│   └── __init__.py               # Registered payment blueprint

frontend/
├── src/
│   ├── pages/
│   │   ├── Checkout.js           # Updated with PesaPal
│   │   ├── BrowseFlowers.js       # Enhanced florist display
│   │   └── PaymentCallback.js     # New payment callback page
│   ├── components/
│   │   └── BuyerDashboard.js      # Added featured flowers section
│   └── App.js                     # Added payment callback route
```

## Security Best Practices

1. **Never hardcode credentials** - Use environment variables
2. **Validate on backend** - Always verify payment on server side
3. **Use HTTPS in production** - Required by PesaPal
4. **Store references securely** - Keep pesapal_reference for auditing
5. **Implement timeouts** - Don't let payment polling run indefinitely
6. **Log transactions** - For debugging and auditing

## Troubleshooting

### Payment iframe not loading
- Check PESAPAL_CONSUMER_KEY and PESAPAL_CONSUMER_SECRET
- Verify callback URL matches configuration
- Check browser console for errors

### Payment verification fails
- Verify order exists and belongs to user
- Check payment reference is correct
- Ensure backend can reach PesaPal API

### Status polling timeout
- Check network connectivity
- Verify payment was actually completed in PesaPal
- Manually check payment status via /check-status endpoint

## Support

For PesaPal API documentation, visit: https://developer.pesapal.com/

For app support, check the main README.md in the project root.
