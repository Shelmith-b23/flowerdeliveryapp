import { useState, useEffect } from "react";
import api from "../api/axios";

export default function FloristProfile({ user, logout }) {
  const [profile, setProfile] = useState({
    name: "",
    shop_name: "",
    location: "",
    contact_info: "",
    available: false,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/florists/${user.id}`);
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        alert("Unable to load profile");
      }
    };
    fetchProfile();
  }, [user.id]);

  // Toggle availability
  const toggleAvailability = async () => {
    setLoading(true);
    try {
      const newStatus = !profile.available;
      await api.put(`/florists/${user.id}`, { available: newStatus });
      setProfile(prev => ({ ...prev, available: newStatus }));
    } catch (err) {
      alert("Failed to update availability");
    } finally {
      setLoading(false);
    }
  };

  // Save profile changes
  const updateProfile = async () => {
    if (!profile.name || !profile.shop_name || !profile.location || !profile.contact_info) {
      alert("Please fill in all fields");
      return;
    }

    setSaving(true);
    try {
      await api.put(`/florists/${user.id}`, profile);
      alert("Profile updated successfully");
    } catch (err) {
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Handle input change
  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 20 }}>
      <h2>My Profile</h2>

      <div style={{ marginBottom: 12 }}>
        <label>Full Name</label>
        <input
          type="text"
          value={profile.name}
          onChange={e => handleChange("name", e.target.value)}
          style={{ width: "100%", padding: 8, marginTop: 4 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Shop Name</label>
        <input
          type="text"
          value={profile.shop_name}
          onChange={e => handleChange("shop_name", e.target.value)}
          style={{ width: "100%", padding: 8, marginTop: 4 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Location</label>
        <input
          type="text"
          value={profile.location}
          onChange={e => handleChange("location", e.target.value)}
          style={{ width: "100%", padding: 8, marginTop: 4 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Contact Info</label>
        <input
          type="text"
          value={profile.contact_info}
          onChange={e => handleChange("contact_info", e.target.value)}
          style={{ width: "100%", padding: 8, marginTop: 4 }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <strong>Availability:</strong>{" "}
        <button onClick={toggleAvailability} disabled={loading}>
          {profile.available ? "Available" : "Unavailable"}
        </button>
      </div>

      <button onClick={updateProfile} disabled={saving} style={{ padding: "10px 16px", marginRight: 12 }}>
        {saving ? "Saving..." : "Save Profile"}
      </button>

      <button onClick={logout} style={{ padding: "10px 16px", background: "#ccc" }}>
        Logout
      </button>
    </div>
  );
}
