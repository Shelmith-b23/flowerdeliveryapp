import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${orderId}`)
      .then(res => setOrder(res.data))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <p>Loading order...</p>;
  if (!order) return <p>Order not found</p>;

  return (
    <div className="order-confirmation">
      <h1>Order Confirmed 🎉</h1>
      <p><strong>Order Number:</strong> #{order.id}</p>

      <h3>Items Ordered</h3>
      <ul>
        {order.items.map(item => (
          <li key={item.id}>
            {item.name} × {item.quantity} — KES {item.price}
          </li>
        ))}
      </ul>

      <h3>Total: KES {order.total}</h3>

      <div className="order-actions">
        <Link to="/orders" className="btn">
          View Orders
        </Link>
        <Link to="/" className="btn btn-secondary">
          Back Home
        </Link>
      </div>
    </div>
  );
}
