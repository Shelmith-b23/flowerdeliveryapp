import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // Redirect logged-in users to their dashboard
  React.useEffect(() => {
    if (user) {
      if (user.role === "buyer") navigate("/buyer-dashboard");
      else if (user.role === "florist") navigate("/florist-dashboard");
    }
  }, [user, navigate]);

  return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <h1>Fresh Flowers Delivered to Your Door Step</h1>
      <p>Beautiful arrangements from the best local florists.</p>
      <div style={{ marginTop: '30px' }}>
        <Link 
          to="/login" 
          style={{ 
            margin: '10px', 
            padding: '10px 20px', 
            background: '#e91e63', 
            color: '#fff', 
            textDecoration: 'none', 
            borderRadius: '5px' 
          }}
        >
          Login
        </Link>
        <Link 
          to="/browse" 
          style={{ 
            margin: '10px', 
            padding: '10px 20px', 
            border: '1px solid #e91e63', 
            color: '#e91e63', 
            textDecoration: 'none', 
            borderRadius: '5px' 
          }}
        >
          Browse Flowers
        </Link>
      </div>
    </div>
  );
}
