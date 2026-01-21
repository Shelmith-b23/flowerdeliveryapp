# 🌸 Flower Delivery App - Order System & Checkout Flow

## Overview

The application now features a complete order management system that connects buyers with florists. This includes:

- **Buyer Checkout Flow**: Collect delivery information, create orders, and confirm payment
- **Order Management**: Track orders from creation to delivery
- **Florist Dashboard**: View incoming orders with full buyer information
- **Buyer Dashboard**: Track order history and status

## System Architecture

### Database Schema

#### Order Model
- `id`: Unique order identifier
- `buyer_id`: Reference to the buyer (User)
- `buyer_name`: Customer full name
- `buyer_email`: Customer email
- `buyer_phone`: Delivery phone number
- `delivery_address`: Full delivery address
- `total_price`: Total order amount
- `status`: Order status (pending → processing → delivered)
- `paid`: Payment confirmation flag (boolean)
- `created_at`: Order creation timestamp
- `items`: List of OrderItem entries

#### OrderItem Model
- `id`: Unique item identifier
- `order_id`: Reference to parent Order
- `flower_id`: Reference to the Flower
- `florist_id`: Reference to the florist (User)
- `flower_name`: Flower name snapshot
- `florist_name`: Florist shop name snapshot
- `quantity`: Number of flowers ordered
- `unit_price`: Price per flower

## API Endpoints

### Create Order
**POST** `/api/orders/create`
- **Auth**: Required (JWT token)
- **Body**:
```json
{
  "buyer_name": "Alice Johnson",
  "buyer_phone": "+254712345678",
  "delivery_address": "123 Main St, Nairobi",
  "items": [
    {"flower_id": 1, "quantity": 2},
    {"flower_id": 2, "quantity": 1}
  ]
}
```
- **Response** (201):
```json
{
  "message": "Order created successfully",
  "order_id": 1,
  "total_price": 2400.0
}
```

### Mark Order as Paid
**POST** `/api/orders/{order_id}/pay`
- **Auth**: Required (JWT token, buyer only)
- **Response** (200):
```json
{
  "message": "Payment confirmed",
  "order_id": 1
}
```

### Get Buyer Orders
**GET** `/api/orders/buyer`
- **Auth**: Required (JWT token, buyers only)
- **Response** (200):
```json
[
  {
    "id": 1,
    "buyer_name": "Alice Johnson",
    "delivery_address": "123 Main St",
    "total_price": 2400.0,
    "status": "processing",
    "paid": true,
    "created_at": "2024-01-15T10:30:00",
    "items": [
      {
        "flower_name": "Red Roses",
        "florist_name": "Bob's Flowers",
        "quantity": 2,
        "unit_price": 800.0
      }
    ]
  }
]
```

### Get Florist Orders
**GET** `/api/orders/florist`
- **Auth**: Required (JWT token, florists only)
- **Response** (200): List of orders containing the florist's flowers with full buyer information

### Update Order Status
**PUT** `/api/orders/{order_id}/status`
- **Auth**: Required (JWT token, florist only)
- **Body**:
```json
{
  "status": "processing"
}
```
- **Valid statuses**: pending, paid, processing, delivered
- **Response** (200):
```json
{
  "message": "Order status updated",
  "status": "processing"
}
```

## Frontend Components

### Checkout Page (`frontend/src/pages/Checkout.js`)
Complete buyer checkout experience:
- Displays cart items with images and prices
- Collects delivery information (name, phone, address)
- Order summary with totals
- Creates order via `/api/orders/create`
- Payment confirmation flow
- Order confirmation screen with order details

**Flow**:
1. Display cart items
2. Buyer enters delivery information
3. Click "Proceed to Payment"
4. Order is created in backend
5. Payment confirmation screen appears
6. Buyer confirms payment
7. Order marked as paid
8. Redirects to dashboard

### BuyerDashboard (`frontend/src/components/BuyerDashboard.js`)
Buyer's order management interface:
- Header with welcome message
- Navigation to browse and checkout
- Order list with status and payment info
- Individual order cards showing:
  - Order ID and date
  - Order status (pending, processing, delivered)
  - Payment status (paid/pending)
  - Delivery address
  - List of items with quantities and prices
  - Total amount
- Detailed order modal
- Responsive grid layout

### FloristDashboard (`frontend/src/components/FloristDashboard.js`)
Florist's order fulfillment interface:
- Lists all incoming orders containing the florist's flowers
- Displays buyer information:
  - Full name
  - Phone number
  - Delivery address
- Shows payment status (✅ Paid / ⏳ Pending Payment)
- Lists flower items with quantities and prices
- Order status tracking (pending → processing → delivered)
- Status update buttons
- Detailed order modal for viewing full information

## Styling

All components use the unified CSS system from `frontend/src/styles/global.css`:

- **Color Scheme**: Pink (#ff6b9d), Purple (#c44569), Cream, Gold, Green
- **Responsive Design**: Mobile-first approach with breakpoints at 480px and 768px
- **CSS Classes**:
  - `.bd-container`: BuyerDashboard container
  - `.bd-order-card`: Individual order card
  - `.fd-container`: FloristDashboard container
  - `.fd-order`: Florist order display
  - `.checkout-container`: Checkout page wrapper
  - `.order-summary`: Order summary sidebar

## Usage Flow

### Buyer's Complete Journey

1. **Login**: Navigate to `/login` and authenticate
2. **Browse Flowers**: Go to `/browse-flowers` to see available flowers
3. **Add to Cart**: Click on flowers to add them to the cart
4. **Checkout**: Click the checkout button or navigate to `/checkout`
5. **Enter Delivery Info**: Fill in name, phone, and address
6. **Proceed to Payment**: Click "Proceed to Payment" button
7. **Confirm Payment**: Review order details and click "Confirm Payment"
8. **View Orders**: Navigate to `/buyer-dashboard` to track order status

### Florist's Workflow

1. **Login**: Authenticate as a florist
2. **View Dashboard**: Navigate to `/florist-dashboard`
3. **See Incoming Orders**: View all orders containing their flowers
4. **Update Status**: Change order status from pending → processing → delivered
5. **View Buyer Info**: See customer name, phone, and delivery address
6. **Fulfill Order**: Pack and prepare flowers for delivery

## Testing the System

A comprehensive test script is included: `test_full_flow.py`

**Run it with**:
```bash
python test_full_flow.py
```

**The test verifies**:
- ✅ Florist login and flower creation
- ✅ Buyer login and order creation
- ✅ Payment confirmation
- ✅ Florist views incoming orders
- ✅ Order status updates
- ✅ Buyer views their order history

## Starting the Application

### Terminal 1 - Backend (Flask)
```bash
cd /home/wambui/flowerdeliveryapp/backend
.venv/bin/flask run --host=127.0.0.1 --port=5000
```

### Terminal 2 - Frontend (React)
```bash
cd /home/wambui/flowerdeliveryapp/frontend
npm start
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://127.0.0.1:5000/api

## Features Implemented

✅ Order creation from cart items
✅ Buyer delivery information collection
✅ Payment confirmation tracking
✅ Florist order visibility with buyer details
✅ Order status management (pending → processing → delivered)
✅ Payment status indication
✅ Order history for buyers
✅ Responsive UI for all screen sizes
✅ Complete CSS styling system
✅ JWT authentication for all order endpoints
✅ Database migrations for new tables

## Error Handling

- Missing required fields return 400 with error message
- Unauthorized access returns 403
- Non-existent resources return 404
- Server errors return 500 with error details
- Frontend shows user-friendly alerts

## Future Enhancements

- Email notifications for order updates
- Real payment integration (M-Pesa)
- Delivery tracking with GPS
- Review and rating system
- Inventory management
- Order history filtering and search
- Real-time notifications using WebSockets

## Database Notes

The application uses SQLite by default. To interact with the database:

```bash
# Access Flask shell
flask shell

# Query orders
from app.models import Order
Order.query.all()

# Query specific order with items
order = Order.query.get(1)
for item in order.items:
    print(f"{item.flower_name} x{item.quantity}")
```

---

**Last Updated**: January 2024
**Status**: ✅ Fully Functional
