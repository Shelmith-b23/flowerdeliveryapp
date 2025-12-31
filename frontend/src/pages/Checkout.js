export default function Checkout() {
  return (
    <div>
      <h1>Checkout</h1>

      <input placeholder="Delivery Address" />
      <input type="date" />
      <input type="time" />

      <select>
        <option>M-Pesa</option>
        <option>Card (Coming Soon)</option>
      </select>

      <button
        onClick={() => {
          window.history.pushState({}, "", "/order-confirmation");
          window.dispatchEvent(new PopStateEvent("popstate"));
        }}
      >
        Place Order
      </button>
    </div>
  );
}
