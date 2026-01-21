#!/usr/bin/env python3
"""
Test script to verify complete order flow
"""
import requests
import json

BASE_URL = "http://127.0.0.1:5000"

# Step 1: Florist (Bob) login
print("\n🌺 Step 1: Logging in as florist (Bob)...")
florist_login = requests.post(
    f"{BASE_URL}/api/auth/login",
    json={"email": "bob@example.com", "password": "password123"}
)
if florist_login.status_code != 200:
    print(f"❌ Florist login failed: {florist_login.json()}")
    exit(1)
florist_token = florist_login.json()["token"]
florist_id = florist_login.json()["user"]["id"]
print(f"✅ Florist logged in (Bob, ID: {florist_id})")

# Step 2: Create a flower for Bob
print("\n🌸 Step 2: Creating a flower for Bob...")
create_flower = requests.post(
    f"{BASE_URL}/api/flowers",
    json={
        "name": "Red Roses",
        "price": 800,
        "description": "Beautiful red roses",
        "image_url": "https://via.placeholder.com/200?text=Red+Roses"
    },
    headers={"Authorization": f"Bearer {florist_token}"}
)
if create_flower.status_code == 201:
    flower_id = create_flower.json()["id"]
    print(f"✅ Flower created (ID: {flower_id})")
else:
    print(f"⚠️  Flower creation: {create_flower.status_code}")
    print(create_flower.json())
    # Try to get existing flowers
    flowers_response = requests.get(f"{BASE_URL}/api/flowers")
    if flowers_response.status_code == 200:
        flowers = flowers_response.json()
        bob_flowers = [f for f in flowers if f["florist_id"] == florist_id]
        if bob_flowers:
            flower_id = bob_flowers[0]["id"]
            print(f"✅ Using existing flower (ID: {flower_id}): {bob_flowers[0]['name']}")
        else:
            print("❌ No flowers available for Bob")
            exit(1)
    else:
        exit(1)

# Step 3: Buyer (Alice) login
print("\n🔐 Step 3: Logging in as buyer (Alice)...")
buyer_login = requests.post(
    f"{BASE_URL}/api/auth/login",
    json={"email": "alice@example.com", "password": "password123"}
)
if buyer_login.status_code != 200:
    print(f"❌ Buyer login failed: {buyer_login.json()}")
    exit(1)
buyer_token = buyer_login.json()["token"]
buyer_id = buyer_login.json()["user"]["id"]
print(f"✅ Buyer logged in (Alice, ID: {buyer_id})")

# Step 4: Create order with Bob's flower
print(f"\n📦 Step 4: Creating order with flower ID {flower_id}...")
order_payload = {
    "buyer_name": "Alice Johnson",
    "buyer_phone": "+254712345678",
    "delivery_address": "123 Nairobi Avenue, Nairobi, Kenya",
    "items": [
        {"flower_id": flower_id, "quantity": 3}
    ]
}
order_response = requests.post(
    f"{BASE_URL}/api/orders/create",
    json=order_payload,
    headers={"Authorization": f"Bearer {buyer_token}"}
)
if order_response.status_code == 201:
    order_data = order_response.json()
    order_id = order_data["order_id"]
    total = order_data["total_price"]
    print(f"✅ Order created (ID: {order_id}) - Total: KSh {total}")
else:
    print(f"❌ Failed to create order: {order_response.json()}")
    exit(1)

# Step 5: Mark order as paid
print(f"\n💳 Step 5: Marking order #{order_id} as paid...")
pay_response = requests.post(
    f"{BASE_URL}/api/orders/{order_id}/pay",
    headers={"Authorization": f"Bearer {buyer_token}"}
)
if pay_response.status_code == 200:
    print(f"✅ Order marked as paid")
else:
    print(f"❌ Failed to mark as paid: {pay_response.json()}")

# Step 6: Florist views incoming orders
print("\n📦 Step 6: Florist (Bob) viewing incoming orders...")
florist_orders = requests.get(
    f"{BASE_URL}/api/orders/florist",
    headers={"Authorization": f"Bearer {florist_token}"}
)
if florist_orders.status_code == 200:
    orders = florist_orders.json()
    print(f"✅ Florist sees {len(orders)} order(s)")
    for order in orders:
        print(f"\n   📋 Order #{order['id']}:")
        print(f"      👤 Customer: {order['buyer_name']}")
        print(f"      📞 Phone: {order['buyer_phone']}")
        print(f"      📍 Address: {order['delivery_address']}")
        print(f"      💰 Total: KSh {order['total_price']}")
        print(f"      ✅ Paid: {'Yes' if order['paid'] else 'No'}")
        print(f"      📦 Status: {order['status']}")
        print(f"      🌸 Items:")
        for item in order['items']:
            print(f"         - {item['flower_name']} x{item['quantity']}")
else:
    print(f"❌ Failed to get florist orders: {florist_orders.json()}")
    exit(1)

# Step 7: Florist updates order status
print(f"\n🚚 Step 7: Florist updating order status to 'processing'...")
update_response = requests.put(
    f"{BASE_URL}/api/orders/{order_id}/status",
    json={"status": "processing"},
    headers={"Authorization": f"Bearer {florist_token}"}
)
if update_response.status_code == 200:
    print(f"✅ Order status updated to 'processing'")
else:
    print(f"❌ Failed to update status: {update_response.json()}")

# Step 8: Buyer views their order
print("\n👤 Step 8: Buyer viewing their orders...")
buyer_orders = requests.get(
    f"{BASE_URL}/api/orders/buyer",
    headers={"Authorization": f"Bearer {buyer_token}"}
)
if buyer_orders.status_code == 200:
    orders = buyer_orders.json()
    print(f"✅ Buyer has {len(orders)} order(s)")
    for order in orders:
        print(f"\n   📋 Order #{order['id']}:")
        print(f"      💰 Total: KSh {order['total_price']}")
        print(f"      ✅ Paid: {'Yes' if order['paid'] else 'No'}")
        print(f"      📦 Status: {order['status']}")
else:
    print(f"❌ Failed to get buyer orders: {buyer_orders.json()}")

print("\n✨ Complete order flow test finished successfully!")
