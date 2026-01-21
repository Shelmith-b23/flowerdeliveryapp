# System Architecture Diagram - Florist Management & Flower Details

## User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FLOWER DELIVERY APP                       │
└─────────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │  Landing     │
                    └──────────────┘
                          │
                ┌─────────┴─────────┐
                │                   │
         ┌──────▼──────┐    ┌──────▼──────┐
         │   Buyer     │    │   Florist   │
         └──────┬──────┘    └──────┬──────┘
                │                  │
    ┌───────────┴──────────┐       │
    │                      │       │
    │                      │       │
    │  BUYER FLOW          │       │  FLORIST FLOW
    │                      │       │
    ▼                      │       ▼
┌─────────────────────┐    │   ┌──────────────────────┐
│ Browse Flowers      │    │   │ Florist Dashboard    │
│ /browse             │    │   │ /florist-dashboard   │
└──────────┬──────────┘    │   └──────────┬───────────┘
           │               │              │
    Click on Flower        │    Click Manage Flowers
           │               │              │
           ▼               │              ▼
┌─────────────────────┐    │   ┌──────────────────────────┐
│ Flower Details      │    │   │ Manage Flowers ✨ NEW    │
│ /flower-details/:id │    │   │ /florist/manage-flowers  │
│ ✨ NEW              │    │   │ ✨ NEW                   │
│                     │    │   │                          │
│ - Large Image       │    │   │ - Add Flower Form        │
│ - Florist Info      │    │   │ - Flowers Grid           │
│ - Price & Details   │    │   │ - Edit/Delete Buttons    │
│ - Stock Status      │    │   │ - Stock Status Toggle    │
│ - Quantity Selector │    │   │                          │
│ - Add to Cart       │    │   │                          │
└──────────┬──────────┘    │   └──────────────────────────┘
           │               │
    Add to Cart            │
           │               │
           ▼               │
        ┌────────────────────────┐
        │      CART PAGE         │
        │ /checkout              │
        └────────────────────────┘
                │
                │
                ▼
        ┌────────────────────────┐
        │    ORDER PLACEMENT     │
        │ /payment-callback      │
        └────────────────────────┘
```

---

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                          APP.js                              │
│  (Routes Configuration & User State Management)              │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
   ┌──────────┐          ┌──────────┐         ┌──────────┐
   │  Landing │          │  Browse  │         │  Login / │
   │          │          │ Flowers  │         │ Register │
   └──────────┘          └────┬─────┘         └──────────┘
                              │
                    Click Flower (NEW)
                              │
                              ▼
                    ┌──────────────────┐
                    │ FlowerDetails ✨  │
                    │ (NEW COMPONENT)   │
                    │                   │
                    │ - Fetch flower    │
                    │   details API     │
                    │ - Display info    │
                    │ - Add to cart     │
                    └──────────────────┘

        ┌─────────────────────┬──────────────────┐
        │                     │                  │
        ▼                     ▼                  ▼
   ┌──────────┐          ┌──────────┐      ┌──────────┐
   │  Buyer   │          │ FloristDB │      │ Checkout │
   │ Dashboard│          │           │      │          │
   └──────────┘          └────┬──────┘      └──────────┘
                              │
                    Click "Manage Flowers"
                              │
                              ▼
                    ┌──────────────────────┐
                    │FloristFlowerMgmt  ✨  │
                    │ (NEW COMPONENT)       │
                    │                       │
                    │ - Add Flower Form     │
                    │ - Flowers Grid        │
                    │ - Edit/Delete         │
                    │ - Stock Toggle        │
                    └──────────────────────┘
```

---

## API Endpoint Hierarchy

```
/api/flowers
│
├─ GET    /          → List all flowers (with stock_status)
├─ POST   /          → Add new flower (Auth: Florist)
│
├─ GET    /:id       → Get flower details (NEW)
│
├─ PUT    /:id       → Update flower (NEW) (Auth: Own flower)
├─ DELETE /:id       → Delete flower (NEW) (Auth: Own flower)
│
└─ GET    /florist/my-flowers  → Get florist's flowers (NEW) (Auth: Florist)
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     BUYER VIEWING FLOWERS                        │
└─────────────────────────────────────────────────────────────────┘

Frontend: BrowseFlowers                Backend: /api/flowers
     │
     │─────────── GET /api/flowers ───────────────────────→
     │
     │                                    Query Flowers table
     │                                    Include stock_status
     │
     │←───────── JSON response ─────────────────────────────
     │   [
     │     {
     │       "id": 1,
     │       "name": "Red Roses",
     │       "price": 500,
     │       "stock_status": "in_stock",  ← NEW FIELD
     │       "florist": {...}
     │     }
     │   ]
     │
     │ Click on flower
     │
Frontend: FlowerDetails (NEW)        Backend: /api/flowers/:id
     │
     │─────── GET /api/flowers/1 ────────────────────────→
     │
     │                                    Query Flower by ID
     │                                    Include stock_status
     │
     │←──── Detailed flower data ────────────────────────
     │   {
     │     "id": 1,
     │     "name": "Red Roses",
     │     "price": 500,
     │     "description": "...",
     │     "stock_status": "in_stock",  ← NEW FIELD
     │     "florist": {...}
     │   }
     │
     │ Display in FlowerDetails page
     │ Show stock status badge
     │ Enable/Disable add to cart button based on stock


┌─────────────────────────────────────────────────────────────────┐
│                   FLORIST MANAGING FLOWERS                       │
└─────────────────────────────────────────────────────────────────┘

Frontend: FloristFlowerMgmt (NEW)   Backend: /api/flowers/florist/my-flowers
     │
     │──── GET /api/flowers/florist/my-flowers ────────→ (Auth header)
     │
     │                                    Get florist ID from JWT
     │                                    Query flowers WHERE florist_id = X
     │                                    Include stock_status
     │
     │←────── Florist's flowers JSON ──────────────────
     │   [
     │     {
     │       "id": 1,
     │       "name": "Red Roses",
     │       "price": 500,
     │       "stock_status": "in_stock",  ← NEW FIELD
     │     }
     │   ]
     │
     │ Click Add/Edit Flower
     │
Frontend: FloristFlowerMgmt Form     Backend: /api/flowers
     │
     │──── POST /api/flowers ────────────────────────→ (Auth header)
     │   {
     │     "name": "White Lilies",
     │     "price": 600,
     │     "stock_status": "in_stock"  ← NEW FIELD
     │   }
     │
     │                                 Create Flower
     │                                 Save with florist_id
     │
     │←─────── Success response ──────────────────────
     │ Refresh flowers list
     │
     │ Click Toggle Stock Button
     │
     │──── PUT /api/flowers/1 ────────────────────────→ (Auth header)
     │   {
     │     "stock_status": "out_of_stock"  ← NEW FIELD
     │   }
     │
     │                                 Update stock_status
     │
     │←─────── Success response ──────────────────────
     │ Update UI immediately
     │ Badge changes to "Out of Stock"
```

---

## Database Schema (Before & After)

### Before
```
Flowers Table:
┌────────────────┬──────────┐
│ id (PK)        │ INT      │
├────────────────┼──────────┤
│ name           │ VARCHAR  │
│ price          │ FLOAT    │
│ image_url      │ VARCHAR  │
│ description    │ VARCHAR  │
│ florist_id (FK)│ INT      │
│ user_id (FK)   │ INT      │
│ created_at     │ DATETIME │
│ updated_at     │ DATETIME │
└────────────────┴──────────┘
```

### After (UPDATED)
```
Flowers Table:
┌────────────────┬──────────┐
│ id (PK)        │ INT      │
├────────────────┼──────────┤
│ name           │ VARCHAR  │
│ price          │ FLOAT    │
│ image_url      │ VARCHAR  │
│ description    │ VARCHAR  │
│ stock_status   │ VARCHAR  │ ← NEW FIELD
│ florist_id (FK)│ INT      │
│ user_id (FK)   │ INT      │
│ created_at     │ DATETIME │
│ updated_at     │ DATETIME │
└────────────────┴──────────┘

stock_status values:
  - "in_stock" (default)
  - "out_of_stock"
```

---

## File Organization

```
PROJECT ROOT
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── BrowseFlowers.js        (Updated - Links to details)
│   │   │   ├── FloristFlowerManagement.js  ✨ NEW
│   │   │   ├── FlowerDetails.js            ✨ NEW
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Checkout.js
│   │   │   └── ...
│   │   │
│   │   ├── components/
│   │   │   ├── FloristDashboard.js     (Updated - Add Manage button)
│   │   │   ├── BuyerDashboard.js
│   │   │   └── ...
│   │   │
│   │   ├── styles/
│   │   │   ├── FloristFlowerManagement.css  ✨ NEW
│   │   │   ├── FlowerDetails.css            ✨ NEW
│   │   │   ├── global.css              (Updated)
│   │   │   └── ...
│   │   │
│   │   └── App.js                      (Updated - New routes)
│   │
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── models.py                   (Updated - Added stock_status)
│   │   ├── routes/
│   │   │   └── flowers.py              (Updated - Added CRUD + stock)
│   │   └── ...
│   │
│   ├── migrations/
│   │   └── versions/
│   │       └── add_stock_status_to_flowers.py  ✨ NEW
│   │
│   ├── run.py
│   └── requirements.txt
│
└── Documentation
    ├── FLORIST_MANAGEMENT_IMPLEMENTATION.md  ✨ NEW
    ├── QUICK_START_FLORIST_MANAGEMENT.md     ✨ NEW
    ├── IMPLEMENTATION_STATUS.md              ✨ NEW (This file)
    └── ...
```

---

## User Roles & Permissions

```
┌────────────┬─────────────────────────────────────────────┐
│   Role     │         Permissions                         │
├────────────┼─────────────────────────────────────────────┤
│  BUYER     │ • View all flowers                          │
│            │ • View flower details                       │
│            │ • Add in-stock flowers to cart              │
│            │ • Create orders                             │
├────────────┼─────────────────────────────────────────────┤
│  FLORIST   │ • Manage own flowers (CRUD)                 │
│            │ • Set stock status                          │
│            │ • View incoming orders                      │
│            │ • Update order status                       │
│            │ • View all flowers (for reference)          │
└────────────┴─────────────────────────────────────────────┘
```

---

## State Management Flow

```
┌──────────────────────────────────┐
│  FloristFlowerManagement         │
│  State:                          │
│  - flowers []                    │
│  - editingId (null or id)        │
│  - showForm (true/false)         │
│  - formData {...}                │
│  - loading (true/false)          │
│  - error & success messages      │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  FlowerDetails                   │
│  State:                          │
│  - flower {...}                  │
│  - quantity (1+)                 │
│  - loading (true/false)          │
│  - error messages                │
│  - addedToCart feedback          │
└──────────────────────────────────┘
```

---

**This architecture provides:**
✅ Clean separation of concerns
✅ Scalable component structure
✅ Proper API design with CRUD operations
✅ Role-based access control
✅ Real-time UI updates
✅ Comprehensive error handling
