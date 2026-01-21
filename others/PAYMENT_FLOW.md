# Payment Flow Diagram

## 1. Order to Payment Flow

```
┌─────────────┐
│   Buyer     │
│  Dashboard  │
└──────┬──────┘
       │
       ├──> Browse Flowers
       │    • See florist grouping
       │    • See florist details
       │    • Search/filter
       │
       ├──> Add to Cart
       │
       └──> Checkout
            │
            ├─→ Delivery Info
            │   • Name, Phone, Address
            │
            ├─→ Order Summary
            │   • Items, Prices, Total
            │
            └─→ Payment Method
                └─→ Select PesaPal
                    │
                    ├─→ POST /api/orders/create
                    │   ↓
                    │   [Order Created]
                    │   ↓
                    │   POST /api/payment/pesapal/initialize
                    │   ↓
                    │   [PesaPal iframe URL]
                    │
                    └─→ Open PesaPal Window
                        │
                        ├─→ User completes payment
                        │   (M-Pesa, Airtel, Card)
                        │
                        ├─→ PesaPal redirects back
                        │   POST /api/payment/pesapal/callback
                        │   ↓
                        │   [Order updated with payment]
                        │
                        └─→ Frontend polls status
                            GET /api/payment/pesapal/check-status/{id}
                            ↓
                            [Payment confirmed]
                            ↓
                            Redirect to /orders
                            ↓
                            Order shows as PAID
```

## 2. Payment Status States

```
Order Created
    ↓
    [PENDING] → User hasn't started payment
    ↓
PesaPal Initiated
    ↓
    [PROCESSING] → User on PesaPal page
    ↓
Payment Completed
    ↓
    [PAID] → Order confirmed & processing
    ↓
    [PROCESSING] → Being prepared for delivery
    ↓
    [DELIVERED] → Order completed
```

## 3. Backend Architecture

```
┌─────────────────────────────────────────┐
│           Frontend (React)              │
│                                         │
│  • Checkout.js (payment UI)            │
│  • PaymentCallback.js (status page)    │
│  • BuyerDashboard.js (orders view)     │
│  • BrowseFlowers.js (florist display)  │
└────────────────┬────────────────────────┘
                 │
                 │ HTTP/JWT
                 ↓
┌─────────────────────────────────────────┐
│        Backend (Flask)                   │
│                                          │
│  Routes:                                │
│  ├─ /api/payment/pesapal/initialize     │
│  ├─ /api/payment/pesapal/verify         │
│  ├─ /api/payment/pesapal/check-status   │
│  ├─ /api/payment/pesapal/callback       │
│  ├─ /api/orders/create                  │
│  ├─ /api/orders/{id}/pay                │
│  └─ /api/flowers                        │
│                                          │
│  Services:                              │
│  ├─ payment.py (PesaPal)               │
│  ├─ models.py (Order, OrderItem)       │
│  ├─ routes/orders.py (Order ops)       │
│  └─ routes/flowers.py (Flower ops)     │
└────────────────┬────────────────────────┘
                 │
                 │ API Calls
                 ↓
┌─────────────────────────────────────────┐
│        PesaPal API                       │
│                                          │
│  • Initialize payment                  │
│  • Verify transaction                  │
│  • Get payment status                  │
└─────────────────────────────────────────┘
```

## 4. Data Flow - Create Order & Pay

```
Frontend (Checkout.js)
         │
         ├─ 1. User fills form
         │    name, phone, address
         │
         ├─ 2. POST /api/orders/create
         │    {items: [...], delivery_info: {...}}
         │
         ↓
Backend (orders.py)
         │
         ├─ 1. Validate buyer & items
         ├─ 2. Create Order record
         ├─ 3. Create OrderItem records
         ├─ 4. Calculate total
         ├─ 5. Return order_id, total_price
         │
         ↓
Frontend (Checkout.js)
         │
         ├─ Order created successfully
         ├─ Show confirmation details
         ├─ Wait for user to click "Pay with PesaPal"
         │
         ├─ 3. POST /api/payment/pesapal/initialize
         │    {order_id: 123}
         │
         ↓
Backend (payment.py)
         │
         ├─ 1. Get order details
         ├─ 2. Generate payment reference
         ├─ 3. Create PesaPal iframe URL
         ├─ 4. Sign request with HMAC-SHA1
         ├─ 5. Update order with reference
         ├─ 6. Return iframe_url
         │
         ↓
Frontend (Checkout.js)
         │
         ├─ 4. Receive iframe_url
         ├─ 5. Store reference in localStorage
         ├─ 6. Open PesaPal window
         ├─ 7. Start polling status every 5s
         │
         ↓
User (PesaPal Window)
         │
         ├─ Select payment method
         ├─ Enter credentials
         ├─ Authorize payment
         ├─ PesaPal confirms
         │
         ↓
Backend (payment.py callback)
         │
         ├─ 1. Receive callback from PesaPal
         ├─ 2. Extract order_id & status
         ├─ 3. Update Order.paid = True
         ├─ 4. Update Order.status = "paid"
         │
         ↓
Frontend (polling)
         │
         ├─ GET /api/payment/pesapal/check-status/123
         │ (every 5 seconds)
         │
         ├─ Receives: {paid: true, status: "paid"}
         ├─ Payment verified!
         ├─ Stop polling
         ├─ Show success message
         ├─ Redirect to /orders
         │
         ↓
Frontend (orders page)
         │
         ├─ Order shows with:
         │  - Status: PAID
         │  - Payment Method: PesaPal
         │  - PesaPal Reference: ORD_123_...
         │
         └─ ✅ Payment Complete!
```

## 5. API Request/Response Flow

### Initialize Payment
```
REQUEST:
POST /api/payment/pesapal/initialize
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "order_id": 123
}

RESPONSE:
{
  "iframe_url": "https://pesapal.com/api/PostPesapalDirectOrder?...",
  "reference": "ORD_123_1704067200.5678",
  "order_id": 123
}
```

### Check Status (Polling)
```
REQUEST (every 5s):
GET /api/payment/pesapal/check-status/123
Authorization: Bearer TOKEN

RESPONSE:
{
  "order_id": 123,
  "paid": false,
  "status": "pending",
  "payment_method": "pesapal",
  "pesapal_reference": "ORD_123_1704067200.5678",
  "total_price": 5000
}

--- After payment ---

RESPONSE:
{
  "order_id": 123,
  "paid": true,
  "status": "paid",
  "payment_method": "pesapal",
  "pesapal_reference": "ORD_123_1704067200.5678",
  "total_price": 5000
}
```

### PesaPal Callback
```
REQUEST:
POST /api/payment/pesapal/callback
Content-Type: application/x-www-form-urlencoded

pesapal_transaction_tracking_id=12345
pesapal_merchant_reference=ORD_123_1704067200.5678
pesapal_status=completed

RESPONSE:
{
  "success": true,
  "message": "Payment processed",
  "order_id": 123,
  "status": "completed"
}
```

## 6. Database Schema

```
ORDERS TABLE
├── id (Primary Key)
├── buyer_id (FK Users)
├── buyer_name
├── buyer_email
├── buyer_phone
├── delivery_address
├── total_price
├── status (pending, paid, processing, delivered)
├── paid (Boolean)
├── payment_method ✨ NEW (pesapal, cash, card, etc.)
├── pesapal_reference ✨ NEW (PesaPal transaction ID)
├── created_at
└── updated_at

ORDER_ITEMS TABLE
├── id
├── order_id (FK Orders)
├── flower_id (FK Flowers)
├── florist_id (FK Users)
├── flower_name
├── florist_name
├── quantity
├── unit_price
└── created_at

FLOWERS TABLE
├── id
├── florist_id (FK Users)
├── name
├── price
├── image_url
├── description
├── created_at
└── updated_at

USERS TABLE
├── id
├── name
├── email
├── password_hash
├── role (buyer, florist)
├── shop_name (for florist)
├── shop_address (for florist)
├── shop_contact (for florist)
└── created_at
```

## 7. Error Handling Flow

```
ERROR: Payment Failed
    ├─ Frontend receives error from PesaPal
    ├─ Polling stops
    ├─ PaymentCallback page shows error
    ├─ User can:
    │  ├─ Try again (restart checkout)
    │  └─ Check status manually
    │
    └─ Backend logs error with:
       ├─ Order ID
       ├─ PesaPal reference
       ├─ Error message
       └─ Timestamp

ERROR: Order Not Found
    ├─ Backend returns 404
    ├─ Frontend shows error message
    └─ User redirected to orders page

ERROR: Unauthorized Payment
    ├─ Backend verifies buyer owns order
    ├─ If not owner: return 403 Forbidden
    ├─ Frontend shows error
    └─ User cannot proceed
```

## 8. Security Checks

```
Payment Verification Checklist:

1. Order Exists?
   ✓ Check Order by order_id in database

2. User Authorized?
   ✓ Verify JWT token
   ✓ Check order belongs to buyer_id from token

3. Amount Match?
   ✓ Verify total_price matches
   ✓ Prevent double-payment

4. Reference Valid?
   ✓ Verify pesapal_reference format
   ✓ Check against stored reference

5. PesaPal Verified?
   ✓ Verify signature with HMAC-SHA1
   ✓ Call PesaPal API to confirm
   ✓ Check transaction status

6. Idempotent?
   ✓ Check if payment already processed
   ✓ Don't update twice
```

This architecture ensures secure, reliable payment processing with clear status tracking at each step.
