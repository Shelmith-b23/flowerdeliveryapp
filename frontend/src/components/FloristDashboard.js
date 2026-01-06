import { useEffect, useState } from "react";
import api from "../api/axios";

const FloristDashboard = () => {
  const [profile, setProfile] = useState(null);

  // Get logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const res = await api.get(`/florists/${user.id}`);
        setProfile(res.data);
      } catch (error) {
        console.error("Failed to fetch florist profile", error);
      }
    };

    fetchProfile();
  }, [user]);

  if (!profile) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h2>Welcome, {profile.shop_name}</h2>
      <p>Email: {profile.email}</p>
      <p>Phone: {profile.phone}</p>
    </div>
  );
};

export default FloristDashboard;
