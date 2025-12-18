import React, { Suspense } from 'react';
import TopNav from '../components/TopNav';
const BuyerDashboard = React.lazy(() => import('../components/BuyerDashboard'));
const FloristDashboard = React.lazy(() => import('../components/FloristDashboard'));

export default function Dashboard({ user, logout }) {
  if (!user) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>Please log in to view your dashboard</h2>
        <p>You can login or register from the home page.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 0 }}>
      <TopNav user={user} logout={logout} />
      <div style={{ padding: 24 }}>
        <Suspense fallback={<div>Loading dashboard…</div>}>
          {user.role === 'buyer' ? (
            <BuyerDashboard user={user} logout={logout} />
          ) : (
            <FloristDashboard user={user} logout={logout} />
          )}
        </Suspense>
      </div>
    </div>
  );
}
