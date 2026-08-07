// src/components/Layout.jsx
import { Link, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function Layout() {
  const { isAuthenticated, logout, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="text-xl font-bold tracking-tighter text-black">
              FlashScale.
            </Link>
            <div className="flex items-center gap-6 text-sm">
              {isAuthenticated ? (
                <>
                  <span className="text-gray-500 hidden sm:block">Hello, {user?.name}</span>
                  <Link to="/orders" className="hover:text-black transition-colors">Orders</Link>
                  <button onClick={logout} className="text-gray-500 hover:text-black transition-colors">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="hover:text-black transition-colors">Login</Link>
                  <Link to="/signup" className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}