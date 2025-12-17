import { useState } from "react";
import api from "../api/axios";

export default function Register({ setUser, toggleRegister }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    // Prevent page refresh if used inside a <form>
    if (e) e.preventDefault();
    setError("");

    // Basic frontend validation
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Register the user
      // URL: http://127.0.0.1:5000/api/auth/register
      await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });

      // 2️⃣ Automatically log them in after successful registration
      // URL: http://127.0.0.1:5000/api/auth/login
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      // 3️⃣ Destructure the token and user from our new Flask response
      const { token, user } = res.data;

      // 4️⃣ Save session
      localStorage.setItem("token", token);
      api.setAuthToken(token);

      // 5️⃣ Update global App state
      setUser(user);

    } catch (err) {
      console.error("REGISTER ERROR:", err);
      
      // Pull the specific error message from Flask (e.g., "Email already exists")
      const message = err.response?.data?.error || "Cannot reach server. Check backend or CORS.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create an Account</h2>
        <p style={styles.subtitle}>Join our flower delivery community</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <div style={styles.inputGroup}>
          <label>Full Name</label>
          <input
            style={styles.input}
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Email Address</label>
          <input
            style={styles.input}
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div style={styles.inputGroup}>
          <label>I am a:</label>
          <select 
            style={styles.input} 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="buyer">Buyer (I want to send flowers)</option>
            <option value="florist">Florist (I want to sell flowers)</option>
          </select>
        </div>

        <button
          style={{
            ...styles.button,
            backgroundColor: loading ? "#ccc" : "#d4a5a5",
          }}
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Register"}
        </button>

        <p style={styles.toggleText}>
          Already have an account?{" "}
          <span style={styles.link} onClick={toggleRegister}>
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "80vh",
    fontFamily: "sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
  },
  title: {
    textAlign: "center",
    margin: "0 0 0.5rem 0",
    color: "#333",
  },
  subtitle: {
    textAlign: "center",
    fontSize: "0.9rem",
    color: "#666",
    marginBottom: "1.5rem",
  },
  inputGroup: {
    marginBottom: "1rem",
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "10px",
    marginTop: "5px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "1rem",
  },
  button: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "6px",
    color: "white",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "1rem",
  },
  errorBox: {
    padding: "10px",
    backgroundColor: "#ffebee",
    color: "#c62828",
    borderRadius: "6px",
    marginBottom: "1rem",
    fontSize: "0.9rem",
    textAlign: "center",
  },
  toggleText: {
    textAlign: "center",
    marginTop: "1.5rem",
    fontSize: "0.9rem",
  },
  link: {
    color: "#d4a5a5",
    cursor: "pointer",
    fontWeight: "bold",
    textDecoration: "underline",
  },
};