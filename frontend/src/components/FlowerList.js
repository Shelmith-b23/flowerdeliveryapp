import OrderForm from "./OrderForm";

export default function FlowerList({ user, flowers, onOrderPlaced }) {
  if (!flowers || flowers.length === 0) return <p>No flowers available.</p>;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
      {flowers.map(f => (
        <div key={f.id} style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "6px", width: "180px" }}>
          <img src={f.image_url} alt={f.name} width="100%" style={{ borderRadius: "4px" }} />
          <h4>{f.name}</h4>
          <p>{f.description?.slice(0, 50)}{f.description?.length > 50 ? "..." : ""}</p>
          <p><strong>${f.price?.toFixed(2)}</strong></p>
          {user?.role === "buyer" && <OrderForm user={user} flower={f} onOrderPlaced={onOrderPlaced} />}
        </div>
      ))}
    </div>
  );
}
