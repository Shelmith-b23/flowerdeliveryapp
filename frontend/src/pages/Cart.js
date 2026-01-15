import { useCart } from "../context/CartContext";

export default function Cart() {
  const { cartItems, increaseQty, decreaseQty, removeItem, subtotal } = useCart();

  return (
    <div>
      <h2>Your Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        cartItems.map((item) => (
          <div key={item.id} style={{ borderBottom: "1px solid #ccc", margin: "10px 0" }}>
            <h4>{item.name}</h4>
            <p>Price: KSh {item.price}</p>
            <p>Qty: {item.quantity}</p>
            
            {/* Now 'item' is defined because we are inside the .map() loop */}
            <button onClick={() => decreaseQty(item.id)}>-</button>
            <button onClick={() => increaseQty(item.id)}>+</button>
            <button onClick={() => removeItem(item.id)} style={{ color: 'red' }}>
              Remove
            </button>
          </div>
        ))
      )}
      
      <hr />
      <h3>Total: KSh {subtotal}</h3>
    </div>
  );
}