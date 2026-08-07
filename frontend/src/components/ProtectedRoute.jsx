// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function ProtectedRoute({ children }) {
  // Pull the authentication state directly from our Zustand store
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // If the user is not logged in, redirect to the login page.
  // We use "replace" so they don't get stuck in a redirect loop if they hit the back button.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If they are logged in, render the protected component (like Orders)
  return children;
}