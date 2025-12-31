export default function Profile({ user, logout }) {
  return (
    <div>
      <h1>My Profile</h1>
      <p>Name: {user?.name}</p>
      <p>Phone: {user?.phone}</p>
      <p>Address: {user?.address}</p>

      <button onClick={logout}>Logout</button>
    </div>
  );
}
