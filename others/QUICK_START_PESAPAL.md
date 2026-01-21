# Quick Start - PesaPal Payment Integration

## 1️⃣ Backend Setup (5 minutes)

### Step 1: Update Environment Variables
```bash
cd backend
cat > .env << EOF
PESAPAL_CONSUMER_KEY=your_pesapal_consumer_key
PESAPAL_CONSUMER_SECRET=your_pesapal_consumer_secret
PESAPAL_MERCHANT_ID=your_merchant_id
PESAPAL_PUBLIC_KEY=your_public_key
PESAPAL_CALLBACK_URL=http://localhost:3000/payment-callback
EOF
```

**Get these from**: https://developer.pesapal.com/

### Step 2: Run Database Migration
```bash
cd backend

# Generate migration
flask db migrate -m "Add payment fields to orders"

# Apply migration
flask db upgrade
```

### Step 3: Restart Backend
```bash
python run.py
```

## 2️⃣ Frontend Setup (2 minutes)

No additional setup needed! The frontend is already updated.

### Just restart if running:
```bash
cd frontend
npm start
```

## 3️⃣ Test It! (10 minutes)

### Create Test Account:
```
1. Go to http://localhost:3000
2. Click "Register"
3. Sign up as a BUYER
4. Log in
```

### Browse Flowers:
```
1. Click "Browse Flowers"
2. See flowers organized by florist ✅
3. Notice featured florist information
4. Search for flowers by name or shop
```

### View Dashboard:
```
1. Click "Buyer Dashboard"
2. See "Featured Flowers" section at top
3. Shows latest flowers from florists
4. Shows your orders below
```

### Make a Test Purchase:
```
1. Browse and add flowers to cart
2. Go to Checkout
3. Fill in delivery info
4. Select "PesaPal" as payment method
5. Click "Pay with PesaPal"
```

### Complete Payment:
```
1. PesaPal window opens
2. Use PesaPal sandbox credentials
3. Complete payment
4. Browser auto-redirects and confirms
5. Order appears in your dashboard ✅
```

## 📱 Features to Try

### 1. Featured Flowers Section
- **Where**: Buyer Dashboard top section
- **What**: Shows latest flowers from all florists
- **Action**: Click any flower to browse more from that shop

### 2. Enhanced Browse Page
- **Where**: /browse-flowers
- **Features**:
  - 🔍 Search bar (search by name or shop)
  - 👨‍🌾 Florist grouping (organized sections)
  - 📍 Shop details (address, contact)
  - 💎 Better UI/UX

### 3. PesaPal Payment
- **Where**: Checkout page
- **Methods**: M-Pesa, Airtel Money, Visa, Mastercard
- **Status**: Auto-confirms with polling
- **Secure**: HMAC-SHA1 signatures

### 4. Payment Tracking
- **Where**: Buyer Dashboard → View Details
- **Shows**: Payment status, method, reference
- **Status**: Pending → Paid

## 🔧 Configuration Files

### Backend Payment Config
File: `backend/app/payment.py`
- PesaPal API integration
- Signature generation
- Payment initialization

### Backend Endpoints
File: `backend/app/routes/payment.py`
- Initialize payment
- Verify payment
- Check status
- Handle callbacks

### Frontend Payment UI
File: `frontend/src/pages/Checkout.js`
- Payment method selection
- PesaPal button
- Status polling

### Payment Callback
File: `frontend/src/pages/PaymentCallback.js`
- Handles post-payment redirect
- Shows status
- Auto-redirects to orders

## 🐛 Troubleshooting

### PesaPal credentials not working?
```
1. Check PESAPAL_CONSUMER_KEY in .env
2. Check PESAPAL_CONSUMER_SECRET in .env
3. Verify credentials on PesaPal developer portal
4. Make sure using correct environment (sandbox vs live)
```

### Payment iframe not loading?
```
1. Check browser console for errors
2. Verify PESAPAL_CALLBACK_URL is correct
3. Make sure backend is running
4. Check network tab for API calls
```

### Database migration fails?
```
# Manual SQL approach:
cd backend
flask shell

# Inside shell:
from app import db
db.session.execute("ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) DEFAULT 'pesapal'")
db.session.execute("ALTER TABLE orders ADD COLUMN pesapal_reference VARCHAR(100)")
db.session.commit()
exit()
```

### Status polling times out?
```
1. Check if payment was actually completed in PesaPal
2. Check order status at: http://localhost:5000/api/payment/pesapal/check-status/{order_id}
3. Verify order_id is correct
4. Check if backend API is responding
```

## 📊 API Quick Reference

### Initialize Payment
```bash
curl -X POST http://localhost:5000/api/payment/pesapal/initialize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"order_id": 1}'
```

### Check Payment Status
```bash
curl -X GET http://localhost:5000/api/payment/pesapal/check-status/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Verify Payment
```bash
curl -X POST http://localhost:5000/api/payment/pesapal/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"order_id": 1, "reference_id": "ORD_1_..."}'
```

## ✅ Checklist

- [ ] Updated .env with PesaPal credentials
- [ ] Ran database migration
- [ ] Restarted backend
- [ ] Frontend running
- [ ] Registered test buyer account
- [ ] Browsed flowers - see florist grouping
- [ ] Added flowers to cart
- [ ] Went through checkout
- [ ] Saw payment method selection
- [ ] Clicked PesaPal button
- [ ] Completed payment
- [ ] Saw confirmation
- [ ] Order appears in dashboard
- [ ] Payment status shows correctly

## 📞 Support

For detailed documentation, see:
- `PESAPAL_INTEGRATION.md` - Complete setup guide
- `UPDATES_SUMMARY.md` - What's new in detail

For PesaPal API docs: https://developer.pesapal.com/

Happy testing! 🎉
