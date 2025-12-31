import TopNav from "../components/TopNav";
import BuyerDashboard from "../components/BuyerDashboard";
import FloristDashboard from "../components/FloristDashboard";

export default function Dashboard({ user, logout }) {
  if (!user) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Please log in to view your dashboard</h2>
        <p>You can login or register from the home page.</p>
      </div>
    );
  }

  const role = user.role?.toLowerCase();

  return (
    <div>
      <TopNav user={user} logout={logout} />

      <div style={{ padding: 24 }}>
        {role === "buyer" && (
          <BuyerDashboard user={user} logout={logout} />
        )}

        {role === "florist" && (
          <FloristDashboard user={user} logout={logout} />
        )}

        {!["buyer", "florist"].includes(role) && (
          <div>Invalid user role</div>
        )}
      </div>
    </div>
  );
}
