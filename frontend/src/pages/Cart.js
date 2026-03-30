import { useCart } from "../context/CartContext";

export default function Cart() {
  const { cartItems, increaseQty, decreaseQty, removeFromCart, subtotal } = useCart();

  return (
    <div className="cart-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      <h2>Your Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        cartItems.map((item) => (
          <div key={item.id} className="cart-item" style={{ margin: "0 0 10px 0" }}>
            <h4>{item.name}</h4>
            <p>Price: KSh {item.price}</p>
            <p>Qty: {item.quantity}</p>
            
            {/* Now 'item' is defined because we are inside the .map() loop */}
            <div className="cart-qty-actions">
              <button onClick={() => decreaseQty(item.id)} className="cart-button">-</button>
              <button onClick={() => increaseQty(item.id)} className="cart-button">+</button>
              <button onClick={() => removeFromCart(item.id)} className="cart-button cart-remove">Remove</button>
            </div>
          </div>
        ))
      )}
      
      <hr />
      <h3>Total: KSh {subtotal}</h3>
      {cartItems.length > 0 && (
        <button className="btn-fora" onClick={() => window.location.href = '/checkout'} style={{ marginTop: '20px' }}>
          Proceed to Checkout
        </button>
      )}
    </div>
  );
}