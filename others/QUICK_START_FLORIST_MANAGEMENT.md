# Quick Start - Florist Management & Flower Details

## Setup Instructions

### Step 1: Apply Database Migration

Run the database migration to add the `stock_status` column to flowers:

```bash
cd /home/wambui/flowerdeliveryapp/backend
python run.py db upgrade
```

If successful, you should see output like:
```
INFO  [alembic.runtime.migration] Context impl SQLiteImpl.
INFO  [alembic.runtime.migration] Will assume non-transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade edef582d8750 -> add_stock_status, Add stock_status to flowers
```

### Step 2: Start Backend Server

```bash
cd /home/wambui/flowerdeliveryapp/backend
python run.py
```

Backend should be running on `http://localhost:5000`

### Step 3: Start Frontend Server

```bash
cd /home/wambui/flowerdeliveryapp/frontend
npm start
```

Frontend should be running on `http://localhost:3000`

---

## Features Overview

### 🌸 Florist Features

**Manage Flowers Page** (`/florist/manage-flowers`)
- Access from: Florist Dashboard → "🌸 Manage Flowers" button
- **Add Flower**: Click "➕ Add New Flower", fill form, select stock status
- **Edit Flower**: Click "✏️ Edit" on any flower card
- **Delete Flower**: Click "🗑️ Delete" with confirmation
- **Toggle Stock**: Click "📦 In Stock" / "📭 Out of Stock" to toggle

### 🛍️ Buyer Features

**Flower Details Page** (`/flower-details/:flowerId`)
- Access from: Browse Flowers page → Click on flower name
- View complete flower information
- See florist contact details
- Check stock status before ordering
- Select quantity
- Add to cart if in stock

---

## API Endpoints Reference

### Flower Management

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/flowers` | Add new flower | Yes (Florist) |
| GET | `/api/flowers` | Get all flowers | No |
| GET | `/api/flowers/<id>` | Get flower details | No |
| GET | `/api/flowers/florist/my-flowers` | Get florist's flowers | Yes (Florist) |
| PUT | `/api/flowers/<id>` | Update flower | Yes (Own flower) |
| DELETE | `/api/flowers/<id>` | Delete flower | Yes (Own flower) |

### Example: Add Flower

```bash
curl -X POST http://localhost:5000/api/flowers \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Red Roses",
    "price": 500,
    "description": "Beautiful red roses bouquet",
    "image_url": "https://...",
    "stock_status": "in_stock"
  }'
```

### Example: Update Flower Stock

```bash
curl -X PUT http://localhost:5000/api/flowers/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "stock_status": "out_of_stock"
  }'
```

---

## Component Hierarchy

```
App.js
├── Landing
├── BrowseFlowers
│   └── (Click flower → FlowerDetails)
├── Login
├── Register
├── Checkout
├── BuyerDashboard
├── FloristDashboard
│   └── (Manage Flowers button → FloristFlowerManagement)
└── FloristFlowerManagement
    ├── Flower Form (Add/Edit)
    └── Flowers Grid
        ├── Stock Status Badge
        ├── Edit Button
        └── Delete Button
```

---

## Troubleshooting

### Migration fails
- Ensure backend database is initialized
- Check that `run.py` is configured correctly
- Try: `python run.py db stamp edef582d8750` then `python run.py db upgrade`

### Florist can't see "Manage Flowers" button
- Ensure you're logged in as a florist (role = "florist")
- Clear browser cache and refresh
- Check browser console for errors

### Flower details page shows 404
- Ensure backend is running on port 5000
- Check that flower ID exists in database
- Verify API endpoint returns flower data

### Images not loading on flower details
- Check image URL is valid and accessible
- Add CORS headers if hosting on different domain
- Placeholder image will show if URL is invalid

---

## File Locations

- **Florist Management Page**: `frontend/src/pages/FloristFlowerManagement.js`
- **Flower Details Page**: `frontend/src/pages/FlowerDetails.js`
- **Flower Management CSS**: `frontend/src/styles/FloristFlowerManagement.css`
- **Flower Details CSS**: `frontend/src/styles/FlowerDetails.css`
- **Backend Routes**: `backend/app/routes/flowers.py`
- **Backend Model**: `backend/app/models.py`
- **Database Migration**: `backend/migrations/versions/add_stock_status_to_flowers.py`

---

## Next Steps

1. ✅ Run the database migration
2. ✅ Start backend and frontend servers
3. ✅ Log in as a florist
4. ✅ Navigate to manage flowers page
5. ✅ Add your first flower
6. ✅ Log in as a buyer
7. ✅ Browse flowers and view details
8. ✅ Test adding to cart with stock status

---

Need help? Check the detailed documentation in `FLORIST_MANAGEMENT_IMPLEMENTATION.md`
