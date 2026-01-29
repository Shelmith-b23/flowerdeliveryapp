import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";

export default function BrowseFlowers() {
  const [flowers, setFlowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    fetchFlowers();
  }, []);

  const fetchFlowers = async () => {
    try {
      const res = await api.get("/flowers");
      setFlowers(res.data);
    } catch (err) {
      console.error("Error fetching flowers:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFlowers = flowers.filter(flower =>
    flower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flower.shop_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flower.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedByFlorist = filteredFlowers.reduce((acc, flower) => {
    const floristId = flower.florist_id;
    if (!acc[floristId]) {
      acc[floristId] = {
        florist: flower.florist,
        flowers: []
      };
    }
    acc[floristId].flowers.push(flower);
    return acc;
  }, {});

  return (
    <div style={{ padding: "40px", backgroundColor: "#f9f7f4", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ color: "#d81b60", marginBottom: "10px" }}>🌸 Browse Beautiful Flowers</h1>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            Discover exquisite flowers from our local florists
          </p>

          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search by flower name, shop, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 15px",
              border: "2px solid #e0e0e0",
              borderRadius: "8px",
              fontSize: "1em",
              marginBottom: "10px",
              transition: "border-color 0.3s"
            }}
            onFocus={(e) => e.target.style.borderColor = "#d81b60"}
            onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
          />
        </div>

        {loading ? (
          <p style={{ textAlign: "center", color: "#999" }}>Loading flowers...</p>
        ) : filteredFlowers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
            <p>No flowers found matching your search.</p>
            <button 
              onClick={() => setSearchTerm("")}
              style={{
                padding: "10px 20px",
                backgroundColor: "#d81b60",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                marginTop: "10px"
              }}
            >
              Clear Search
            </button>
          </div>
        ) : (
          /* Florist Sections */
          Object.entries(groupedByFlorist).map(([floristId, { florist, flowers: floristFlowers }]) => (
            <div key={floristId} style={{ marginBottom: "40px" }}>
              {/* Florist Card Header */}
              <div style={{
                backgroundColor: "white",
                borderLeft: "4px solid #d81b60",
                padding: "20px",
                borderRadius: "8px",
                marginBottom: "20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h2 style={{ color: "#333", margin: "0 0 8px 0" }}>
                      🌺 {florist?.shop_name || florist?.name}
                    </h2>
                    <p style={{ color: "#666", margin: "0 0 5px 0", fontSize: "0.95em" }}>
                      👤 Owned by {florist?.name}
                    </p>
                    {florist?.shop_address && (
                      <p style={{ color: "#999", margin: "0", fontSize: "0.9em" }}>
                        📍 {florist.shop_address}
                      </p>
                    )}
                    {florist?.shop_contact && (
                      <p style={{ color: "#999", margin: "0", fontSize: "0.9em" }}>
                        📞 {florist.shop_contact}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ color: "#4CAF50", fontWeight: "600", margin: "0" }}>
                      ✓ Verified Florist
                    </p>
                    <p style={{ color: "#999", fontSize: "0.9em", margin: "5px 0 0 0" }}>
                      {floristFlowers.length} flower{floristFlowers.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Florist's Flowers Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px" }}>
                {floristFlowers.map(flower => (
                  <div
                    key={flower.id}
                    style={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      overflow: "hidden",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      transition: "transform 0.3s, box-shadow 0.3s",
                      cursor: "pointer"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-5px)";
                      e.currentTarget.style.boxShadow = "0 4px 15px rgba(216, 27, 96, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                    }}
                  >
                    {/* Flower Image */}
                    <div style={{ position: "relative", overflow: "hidden" }}>
                      <img
                        src={flower.image_url || "https://placehold.co/250x200?text=No+Image"}
                        alt={flower.name}
                        style={{
                          width: "100%",
                          height: "200px",
                          objectFit: "cover",
                          backgroundColor: "#f0f0f0"
                        }}
                      />
                    </div>

                    {/* Flower Details */}
                    <div style={{ padding: "15px" }}>
                      <Link
                        to={`/flower-details/${flower.id}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <h3 style={{ margin: "0 0 8px 0", color: "#333", fontSize: "1.1em" }}>
                          {flower.name}
                        </h3>
                      </Link>

                      {flower.description && (
                        <p style={{
                          margin: "0 0 12px 0",
                          color: "#666",
                          fontSize: "0.9em",
                          lineHeight: "1.4"
                        }}>
                          {flower.description.length > 60
                            ? flower.description.substring(0, 60) + "..."
                            : flower.description}
                        </p>
                      )}

                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "1px solid #eee",
                        paddingTop: "12px"
                      }}>
                        <span style={{
                          fontSize: "1.3em",
                          fontWeight: "700",
                          color: "#d81b60"
                        }}>
                          KSh {flower.price}
                        </span>
                        <button
                          onClick={() => addToCart(flower)}
                          style={{
                            backgroundColor: "#d81b60",
                            color: "white",
                            border: "none",
                            padding: "8px 15px",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontSize: "0.9em",
                            fontWeight: "600",
                            transition: "background-color 0.3s"
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = "#ad1457"}
                          onMouseLeave={(e) => e.target.style.backgroundColor = "#d81b60"}
                        >
                          🛒 Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
