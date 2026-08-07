// src/pages/Catalog.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiClient.get('/api/products');
        setProducts(response.data.data);
      } catch (error) {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div className="text-gray-500 mt-10">Loading catalog...</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Live Flash Sales</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link 
            key={product._id} 
            to={`/product/${product._id}`}
            className="group block bg-white p-5 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              {product.category}
            </div>
            <h2 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 mb-1">
              {product.title}
            </h2>
            <div className="flex items-center justify-between mt-4">
              <span className="text-xl font-semibold">${product.price}</span>
              <span className={`text-xs px-2 py-1 rounded ${product.totalStock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {product.totalStock > 0 ? `${product.totalStock} left` : 'Sold Out'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}