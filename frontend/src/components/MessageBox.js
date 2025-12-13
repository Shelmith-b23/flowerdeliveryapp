import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";

export default function MessageBox({ orderId, userId }) {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const fetchMessages = useCallback(async () => { const res = await api.get(`/messages/order/${orderId}`); setMessages(res.data); }, [orderId]);
  useEffect(() => { fetchMessages(); const interval = setInterval(fetchMessages, 3000); return () => clearInterval(interval); }, [fetchMessages]);
  const sendMessage = async () => { if (!content) return; await api.post("/messages", { sender_id: userId, receiver_id: 0, order_id: orderId, content }); setContent(""); fetchMessages(); };
  return (
    <div>
      <h4>Messages</h4>
      <div style={{ maxHeight: "150px", overflowY: "scroll", border: "1px solid #ccc",
padding: "5px" }}>
        {messages.map(m => (
          <p key={m.id}><strong>{m.sender_id === userId ? "You" : "Other"}:</strong> {m.content}</p>
        ))}
      </div>
      <input 
        value={content} 
        onChange={e => setContent(e.target.value)} 
        placeholder="Type a message..." 
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
