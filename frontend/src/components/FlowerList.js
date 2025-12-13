import { useEffect, useState } from "react";
import api from "../api/axios";
import OrderForm from "./OrderForm";

export default function FlowerList({ user }) {
  const [flowers, setFlowers] = useState([]);
  useEffect(() => { api.get("/flowers").then(res => setFlowers(res.data)); }, []);
  return (
    <div>
      <h2>Available Flowers</h2>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {flowers.map(f => (
          <div key={f.id} style={{ border: "1px solid #ccc", margin: "5px", padding: "10px" }}>
            <img src={f.image_url} alt={f.name} width="100" />
            <h4>{f.name}</h4>
            <p>{f.description}</p>
            <p>${f.price}</p>
            {user?.role === "buyer" && <OrderForm user={user} flower={f} />}
          </div>
        ))}
      </div>
    </div>
  );
}
