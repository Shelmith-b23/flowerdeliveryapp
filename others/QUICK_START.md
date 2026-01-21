# 🚀 Quick Start Guide

## System Status: ✅ READY TO USE

Both servers are currently running:
- **Backend**: http://127.0.0.1:5000 (Flask)
- **Frontend**: http://localhost:3000 (React)

## 🎯 Try It Out Right Now!

### Step 1: Open the Application
Visit: **http://localhost:3000**

### Step 2: Login as Buyer
- **Email**: `alice@example.com`
- **Password**: `password123`
- **Role**: Buyer

### Step 3: Browse & Shop
1. Click "Browse Flowers" or navigate to the flowers page
2. Add flowers to your cart
3. Click the cart icon or "Checkout" button

### Step 4: Complete Checkout
1. **Enter Delivery Info**:
   - Full Name: (pre-filled: Alice)
   - Phone: +254712345678 (or your number)
   - Address: Your delivery address

2. **Review Order**:
   - See items, quantities, and prices
   - Review total amount

3. **Proceed to Payment**:
   - Click "Proceed to Payment"

4. **Confirm Payment**:
   - Review order details
   - Click "✅ Confirm Payment"
   - See confirmation message

5. **View Dashboard**:
   - Order appears in your dashboard
   - Status: `processing` or `paid`
   - Payment status: `✅ Paid`

### Step 5: Login as Florist (Optional)
Logout and login with florist account to see incoming orders:
- **Email**: `bob@example.com`
- **Password**: `password123`
- **Role**: Florist

**From Florist Dashboard**:
1. Go to "Florist Dashboard"
2. See all incoming orders with:
   - Customer name: Alice Johnson
   - Phone: +254712345678
   - Delivery address
   - Payment status: ✅ Paid
   - Items ordered
3. Click "Update Status" to change to:
   - `processing` (preparing flowers)
   - `delivered` (order delivered)

---

## 📱 Key Features

### For Buyers ✅
- ✅ Browse all available flowers
- ✅ Add items to cart
- ✅ Checkout with delivery information
- ✅ Confirm payment
- ✅ View order history
- ✅ Track order status
- ✅ See payment status

### For Florists ✅
- ✅ Add flowers to catalog
- ✅ See all incoming orders
- ✅ View complete buyer information (name, phone, address)
- ✅ See payment confirmation
- ✅ Update order status
- ✅ Manage order fulfillment

### Mobile Responsive ✅
- ✅ Works on desktop (1920px)
- ✅ Works on tablet (768px)
- ✅ Works on phone (480px)
- ✅ Responsive grid layouts
- ✅ Touch-friendly buttons

---

## 🛠️ Server Commands

### If servers crash, restart them:

**Terminal 1 - Backend:**
```bash
cd /home/wambui/flowerdeliveryapp/backend
/home/wambui/flowerdeliveryapp/.venv/bin/flask run --host=127.0.0.1 --port=5000
```

**Terminal 2 - Frontend:**
```bash
cd /home/wambui/flowerdeliveryapp/frontend
npm start
```

### Check if servers are running:
```bash
ps aux | grep -E "(flask run|npm start)" | grep -v grep
```

---

## 🧪 Run Comprehensive Test

Test the entire order flow automatically:
```bash
cd /home/wambui/flowerdeliveryapp
/home/wambui/flowerdeliveryapp/.venv/bin/python test_full_flow.py
```

**Output** shows:
- ✅ Login credentials work
- ✅ Flower creation works
- ✅ Order creation works
- ✅ Payment confirmation works
- ✅ Florist sees orders
- ✅ Status updates work
- ✅ Everything integrated

---

## 📚 Documentation Files

1. **ORDER_SYSTEM.md** - Complete API documentation
2. **IMPLEMENTATION_SUMMARY.md** - What was built and tested
3. **CHECKOUT_FLOW_GUIDE.md** - Visual flow diagrams
4. **QUICK_REFERENCE.md** - CSS quick reference (frontend styling)

---

## 🐛 Troubleshooting

### Frontend won't load (ERR_FAILED)?
1. Check backend is running: `ps aux | grep flask`
2. Restart Flask: `pkill -f "flask run"` then start again
3. Check Flask logs: `tail -50 /tmp/flask.log`

### Can't login?
1. Use: `alice@example.com` / `password123`
2. Check you're on the Login page, not Register
3. Backend must be running

### Order not created?
1. Check you're logged in as a buyer
2. Have at least one item in cart
3. Fill all delivery information fields
4. Check browser console for errors (F12)

### Can't see orders as florist?
1. Must be logged in as florist (`bob@example.com`)
2. Only see orders with YOUR flowers
3. Go to Florist Dashboard (not Buyer Dashboard)

---

## 🎨 Design System

**Colors**:
- Primary Pink: `#ff6b9d`
- Purple: `#c44569`
- Gold: `#d4a574`
- Green: `#6db584`
- Cream: `#fef9f3`

**Layouts**:
- Responsive grid with auto-fill
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3+ columns

**Animations**:
- Smooth transitions
- Button hovers
- Card shadows
- Fade-in effects

---

## 💾 Database

**Tables**:
- `users` - Buyers and florists
- `flowers` - Available flowers
- `orders` - Order records ⭐ NEW
- `order_items` - Order line items ⭐ NEW

**Seed Data**:
- Alice (buyer): alice@example.com
- Bob (florist): bob@example.com
- Jane (buyer): jane@example.com
- oraimo (florist): oraimo@gmail.com
- 1 flower: Lilies (500 KSh)

**Create more test data**:
```bash
# Add florist flowers
curl -X POST http://127.0.0.1:5000/api/flowers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Sunflowers",
    "price": 1200,
    "description": "Beautiful yellow sunflowers",
    "image_url": "https://via.placeholder.com/200?text=Sunflowers"
  }'
```

---

## ✨ What Makes This Awesome

✅ **Complete Order Management**
- From cart → checkout → payment → delivery

✅ **Buyer Information Tracking**
- Florists see name, phone, and address
- Perfect for delivery coordination

✅ **Status Tracking**
- Orders progress: pending → processing → delivered
- Both buyers and florists see updates

✅ **Payment Confirmation**
- Orders marked as paid
- Payment status visible to florists

✅ **Responsive Design**
- Works on any device
- Mobile-first approach
- Touch-friendly UI

✅ **Thoroughly Tested**
- 8-step automated test passes
- Real data flows through system
- Database properly synced

---

## 🎓 Learning Resources

### Understand the Code Flow:

**Creating an Order**:
1. User fills `Checkout.js` form
2. Calls `POST /api/orders/create`
3. Backend validates and creates Order + OrderItems
4. Frontend shows confirmation
5. User confirms payment via `POST /api/orders/{id}/pay`

**Viewing Orders**:
1. Buyer: `GET /api/orders/buyer` → BuyerDashboard.js
2. Florist: `GET /api/orders/florist` → FloristDashboard.js
3. Both filter and display their relevant orders

**Updating Status**:
1. Florist clicks status button
2. Sends `PUT /api/orders/{id}/status`
3. Backend updates order
4. Dashboard refreshes to show new status

---

## 📞 Support

If something isn't working:

1. **Check the logs**:
   ```bash
   tail -50 /tmp/flask.log    # Backend logs
   tail -50 /tmp/npm.log      # Frontend logs
   ```

2. **Check if servers are running**:
   ```bash
   ps aux | grep -E "(flask|npm)"
   ```

3. **Verify database**:
   ```bash
   /home/wambui/flowerdeliveryapp/.venv/bin/python check_db.py
   ```

4. **Run tests**:
   ```bash
   /home/wambui/flowerdeliveryapp/.venv/bin/python test_full_flow.py
   ```

---

## 🎉 You're All Set!

Everything is working perfectly! 🌸

Start at: **http://localhost:3000**

Have fun building, testing, and using the order system! 🚀

---

**Last Updated**: January 2024
**Status**: ✅ Ready to Use
**Servers**: ✅ Running
**Database**: ✅ Synced
**Tests**: ✅ Passing
