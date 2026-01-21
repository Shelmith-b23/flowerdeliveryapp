# Testing Guide - Florist Management & Flower Details

## Pre-Testing Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] Database migration applied (`python run.py db upgrade`)
- [ ] Browser cache cleared
- [ ] Console open to catch any errors

---

## 1. DATABASE MIGRATION TEST

### Step 1: Apply Migration
```bash
cd backend
python run.py db upgrade
```

**Expected Output:**
```
INFO  [alembic.runtime.migration] Context impl SQLiteImpl.
INFO  [alembic.runtime.migration] Will assume non-transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade edef582d8750 -> add_stock_status
INFO  [alembic.runtime.migration] Done with sqlalchemy.schema operations
```

**Success Criteria:**
- [ ] Migration runs without errors
- [ ] Database file updated
- [ ] New `stock_status` column created in flowers table

---

## 2. FLORIST FEATURE TESTING

### Test 2.1: Access Flower Management Page

**Steps:**
1. Log in as florist (or register new florist account)
2. On FloristDashboard, look for "🌸 Manage Flowers" button in header
3. Click the button

**Expected Results:**
- [ ] Button visible in header next to Logout
- [ ] Clicking navigates to `/florist/manage-flowers`
- [ ] Page loads without errors
- [ ] Florist sees "Manage Your Flowers" header

---

### Test 2.2: Add New Flower

**Steps:**
1. On Manage Flowers page, click "➕ Add New Flower"
2. Fill in form:
   - Name: "Red Roses"
   - Price: "500"
   - Description: "Beautiful red roses bouquet"
   - Image URL: (any valid image URL)
   - Stock Status: Select "In Stock"
3. Click "Add Flower"

**Expected Results:**
- [ ] Form appears after clicking add button
- [ ] All form fields render correctly
- [ ] Stock status dropdown has two options
- [ ] Success alert appears: "Flower added successfully"
- [ ] Form clears
- [ ] New flower appears in grid below
- [ ] Stock badge shows "✓ In Stock"

---

### Test 2.3: View Flowers Grid

**Steps:**
1. After adding flowers, observe the grid

**Expected Results:**
- [ ] Flowers display in responsive grid
- [ ] Each flower card shows:
  - [ ] Flower image
  - [ ] Flower name
  - [ ] Price (KSh format)
  - [ ] Stock status badge
- [ ] Badge colors: Green for in-stock, Red for out-of-stock
- [ ] Three action buttons visible per flower:
  - [ ] 📦 Stock status toggle
  - [ ] ✏️ Edit button
  - [ ] 🗑️ Delete button

---

### Test 2.4: Toggle Stock Status

**Steps:**
1. Find a flower in the grid
2. Click the "📦 In Stock" button
3. Observe the change
4. Click again to toggle back

**Expected Results:**
- [ ] Button text changes to "📭 Out of Stock"
- [ ] Badge changes to red
- [ ] API call completes successfully
- [ ] Success alert shows: "Stock status updated"
- [ ] Changes persist on refresh
- [ ] Can toggle back to in stock

---

### Test 2.5: Edit Flower

**Steps:**
1. Click "✏️ Edit" on any flower
2. Form appears with pre-filled data
3. Change the flower name to "White Lilies"
4. Change stock status to "Out of Stock"
5. Click "Update Flower"

**Expected Results:**
- [ ] Form shows with title "Edit Flower"
- [ ] All fields pre-populated with current data
- [ ] Can modify any field
- [ ] Success alert: "Flower updated successfully"
- [ ] Flower card updates immediately
- [ ] Changes visible in grid

---

### Test 2.6: Delete Flower

**Steps:**
1. Click "🗑️ Delete" on any flower
2. Browser shows confirmation dialog
3. Click "OK" to confirm
4. Observe result

**Expected Results:**
- [ ] Confirmation dialog appears
- [ ] Canceling closes dialog without deleting
- [ ] Confirming deletion proceeds
- [ ] Success alert: "Flower deleted successfully"
- [ ] Flower disappears from grid
- [ ] Flower no longer appears on refresh

---

### Test 2.7: Form Validation

**Steps:**
1. Click "➕ Add New Flower"
2. Click "Add Flower" without entering data

**Expected Results:**
- [ ] Error alert appears: "Name and price are required"
- [ ] Form doesn't submit
- [ ] Try adding with only name (no price)
- [ ] Error alert prevents submission

---

### Test 2.8: Empty State

**Steps:**
1. Delete all flowers from management page
2. Refresh page

**Expected Results:**
- [ ] Empty state message appears: "No flowers yet..."
- [ ] Grid disappears
- [ ] Add button still visible and functional

---

## 3. BUYER FEATURE TESTING

### Test 3.1: Access Flower Details Page

**Steps:**
1. Log in as buyer (or register new buyer account)
2. Go to "🌸 Browse Beautiful Flowers" page
3. Find a flower card
4. Click on the flower name

**Expected Results:**
- [ ] Browser navigates to `/flower-details/{id}`
- [ ] Detailed flower page loads
- [ ] Page doesn't show errors
- [ ] Back button visible

---

### Test 3.2: Flower Details Display

**Steps:**
1. On Flower Details page, check all elements

**Expected Results:**
- [ ] Large flower image displays (or placeholder if invalid URL)
- [ ] Flower name prominently shown
- [ ] Price displays in KSh format
- [ ] Stock status badge visible
- [ ] Florist information card shows:
  - [ ] Shop name
  - [ ] Address (if available)
  - [ ] Contact number (if available)
- [ ] Description displays (if available)
- [ ] "Continue Shopping" button visible
- [ ] Back to flowers button visible

---

### Test 3.3: Stock Status for In-Stock Flower

**Steps:**
1. Navigate to details of an in-stock flower
2. Check quantity selector
3. Add to cart

**Expected Results:**
- [ ] Stock badge shows "✓ In Stock" (green)
- [ ] Add to Cart button enabled
- [ ] Quantity selector visible with:
  - [ ] Minus button (−)
  - [ ] Input field (default 1)
  - [ ] Plus button (+)
- [ ] Can change quantity
- [ ] "🛒 Add to Cart" button functional
- [ ] Can add multiple quantities

---

### Test 3.4: Stock Status for Out-of-Stock Flower

**Steps:**
1. Toggle a flower to "out of stock" in florist dashboard
2. As buyer, navigate to that flower's details page

**Expected Results:**
- [ ] Stock badge shows "✗ Out of Stock" (red)
- [ ] Out of stock overlay appears on image
- [ ] Message: "❌ This flower is currently out of stock"
- [ ] Add to Cart button hidden/disabled
- [ ] Quantity selector hidden
- [ ] Can still view flower information
- [ ] Can navigate back to browse

---

### Test 3.5: Quantity Selector

**Steps:**
1. On in-stock flower details
2. Click + button multiple times
3. Click - button
4. Manually enter quantity
5. Try entering 0 or negative

**Expected Results:**
- [ ] Plus button increments quantity
- [ ] Minus button decrements (minimum 1)
- [ ] Can manually type quantity
- [ ] Quantity can't go below 1
- [ ] Add to cart adds correct quantity

---

### Test 3.6: Add Multiple to Cart

**Steps:**
1. Set quantity to 3
2. Click "🛒 Add to Cart"
3. Check Cart

**Expected Results:**
- [ ] Button shows "✓ Added to Cart" briefly
- [ ] Flower added 3 times to cart
- [ ] Cart count increases
- [ ] Can view in cart page

---

### Test 3.7: Navigation Flow

**Steps:**
1. On flower details page, click "Back to Flowers" button
2. From browse page, click another flower
3. From details page, click "Continue Shopping"

**Expected Results:**
- [ ] All navigation buttons work
- [ ] URLs update correctly
- [ ] Page refreshes on navigate
- [ ] Can browse multiple flowers sequentially

---

## 4. RESPONSIVE DESIGN TESTING

### Test 4.1: Desktop View (1920px)
- [ ] Florist management: Grid with 4-5 columns
- [ ] Flower details: Two-column layout (image | details)
- [ ] All buttons visible and well-spaced

### Test 4.2: Tablet View (768px)
- [ ] Florist management: Grid with 2-3 columns
- [ ] Flower details: Stack vertically
- [ ] Buttons remain accessible
- [ ] Touch targets adequate size

### Test 4.3: Mobile View (375px)
- [ ] Florist management: Single column
- [ ] Flower details: Single column
- [ ] Images scale appropriately
- [ ] Buttons stack vertically
- [ ] No horizontal scroll

---

## 5. ERROR HANDLING TESTING

### Test 5.1: Network Error
**Steps:**
1. Stop backend server
2. Try to load flower management page
3. Restart backend

**Expected Results:**
- [ ] Error message displays
- [ ] Page doesn't crash
- [ ] Can retry after restart

---

### Test 5.2: Invalid Image URL
**Steps:**
1. Add flower with invalid image URL
2. Check display

**Expected Results:**
- [ ] Placeholder image shows instead of breaking
- [ ] No console errors
- [ ] Flower still displays

---

### Test 5.3: API Timeout
**Steps:**
1. Try adding flower while network is slow

**Expected Results:**
- [ ] Graceful handling
- [ ] Loading state shows
- [ ] Error message if fails

---

## 6. API ENDPOINT TESTING

### Using cURL or Postman

#### Test 6.1: Get All Flowers
```bash
curl -X GET http://localhost:5000/api/flowers
```
**Expected:** List of flowers with stock_status field

#### Test 6.2: Get Flower Details
```bash
curl -X GET http://localhost:5000/api/flowers/1
```
**Expected:** Single flower with complete details

#### Test 6.3: Add Flower (with Auth)
```bash
curl -X POST http://localhost:5000/api/flowers \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Flower",
    "price": 100,
    "stock_status": "in_stock"
  }'
```
**Expected:** 201 Created with flower data

#### Test 6.4: Update Stock Status
```bash
curl -X PUT http://localhost:5000/api/flowers/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"stock_status": "out_of_stock"}'
```
**Expected:** 200 OK with updated flower

#### Test 6.5: Get Florist's Flowers
```bash
curl -X GET http://localhost:5000/api/flowers/florist/my-flowers \
  -H "Authorization: Bearer <token>"
```
**Expected:** Filtered list of florist's flowers only

---

## 7. PERSISTENCE TESTING

### Test 7.1: Page Refresh
**Steps:**
1. Add/edit flower
2. Refresh page
3. Check if changes persisted

**Expected Results:**
- [ ] Flowers still visible after refresh
- [ ] Changes saved to database
- [ ] No data loss

---

### Test 7.2: Browser Restart
**Steps:**
1. Add several flowers
2. Close browser completely
3. Reopen and login

**Expected Results:**
- [ ] All flowers still present
- [ ] Data persisted correctly
- [ ] Stock status maintained

---

## 8. SECURITY TESTING

### Test 8.1: Unauthorized Access
**Steps:**
1. Clear localStorage tokens
2. Try accessing `/florist/manage-flowers`

**Expected Results:**
- [ ] Redirected to login
- [ ] Protected route working

---

### Test 8.2: Role-Based Access
**Steps:**
1. Log in as buyer
2. Try accessing `/florist/manage-flowers`

**Expected Results:**
- [ ] Redirected to home
- [ ] Can't access florist-only pages

---

### Test 8.3: Ownership Check
**Steps:**
1. As florist A, add flower
2. Get auth token for florist B
3. Try to update/delete flower from florist A

**Expected Results:**
- [ ] Request denied (403 Unauthorized)
- [ ] Florist can only modify own flowers

---

## 9. PERFORMANCE TESTING

### Test 9.1: Load Time
- [ ] Flower management page loads < 2 seconds
- [ ] Details page loads < 1.5 seconds
- [ ] No unnecessary API calls

### Test 9.2: Grid Rendering
- [ ] 50+ flowers render smoothly
- [ ] No lag when scrolling
- [ ] Images load progressively

---

## 10. CROSS-BROWSER TESTING

Test in different browsers:
- [ ] Chrome (Latest)
- [ ] Firefox (Latest)
- [ ] Safari (if on Mac)
- [ ] Edge (Latest)

---

## Test Summary Report

Create a test report with:
```
FLORIST FEATURES:
- [ ] Access management page
- [ ] Add flower
- [ ] Edit flower
- [ ] Delete flower
- [ ] Toggle stock status
- [ ] Form validation
- [ ] Empty state

BUYER FEATURES:
- [ ] View flower details
- [ ] Stock status display
- [ ] Quantity selector
- [ ] Add to cart
- [ ] Navigation

TECHNICAL:
- [ ] API endpoints working
- [ ] Database persisting data
- [ ] Error handling
- [ ] Responsive design
- [ ] Security checks

ISSUES FOUND:
(List any bugs or issues encountered)

RECOMMENDATIONS:
(List improvements needed)
```

---

## Bug Report Template

If issues are found, report with:
```
BUG #: [Number]
Title: [Brief description]
Severity: [Low/Medium/High]
Steps to Reproduce:
  1. ...
  2. ...
Expected: ...
Actual: ...
Browser/Device: ...
Screenshots: [if applicable]
```

---

## Sign-Off

All tests completed and passed: [ ] YES [ ] NO
Date: _______________
Tester: _______________
