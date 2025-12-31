import TopNav from "../components/TopNav";

export default function FloristHome({ user, logout }) {
  return (
    <>
      <TopNav user={user} logout={logout} />

      <div style={{ padding: 24 }}>
        <h1>Welcome back, {user.name}</h1>

        <div style={{ marginTop: 20 }}>
          <p><strong>Shop:</strong> {user.shop_name}</p>
          <p><strong>Location:</strong> {user.location}</p>
          <p><strong>Status:</strong> {user.available ? "Open" : "Closed"}</p>
        </div>

        <div style={{ marginTop: 30 }}>
          <button onClick={() => {
            window.history.pushState({}, "", "/dashboard");
            window.dispatchEvent(new Event("popstate"));
          }}>
            Go to Dashboard
          </button>
        </div>
      </div>
    </>
  );
}
