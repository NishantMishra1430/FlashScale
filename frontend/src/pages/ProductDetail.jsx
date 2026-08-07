// src/pages/ProductDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await apiClient.get(`/api/products/${id}`);
        setProduct(response.data.data);
      } catch (error) {
        toast.error('Product not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to reserve this item.');
      return navigate('/login');
    }

    setBuying(true);
    try {
      // POST to API Gateway -> routed to Order Service
      // The Order Service handles DB tx, calls Inventory, and fires RabbitMQ event
      await apiClient.post('/api/orders', {
        productId: product._id,
        quantity: 1,
        totalAmount: product.price
      });
      
      toast.success('Order placed successfully!');
      
      // Optimistically decrement local stock display
      setProduct((prev) => ({ ...prev, totalStock: prev.totalStock - 1 }));
      
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error('Flash sale ended! Out of stock.');
        // Refresh product to show actual stock state
        setProduct((prev) => ({ ...prev, totalStock: 0 }));
      } else {
        toast.error(error.response?.data?.error || 'Failed to process order.');
      }
    } finally {
      setBuying(false);
    }
  };

  if (loading) return <div className="text-gray-500 mt-10">Loading details...</div>;
  if (!product) return null;

  const isSoldOut = product.totalStock <= 0;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg border border-gray-200 shadow-sm mt-10">
      <div className="text-sm text-gray-500 uppercase tracking-wide mb-2">{product.category}</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
      <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>
      
      <div className="flex items-center justify-between border-t border-gray-100 pt-6">
        <div>
          <div className="text-3xl font-semibold">${product.price}</div>
          <div className={`text-sm mt-1 ${isSoldOut ? 'text-red-500' : 'text-green-600'}`}>
            {isSoldOut ? 'Out of Stock' : `${product.totalStock} units remaining`}
          </div>
        </div>
        
        <button
          onClick={handleBuyNow}
          disabled={isSoldOut || buying}
          className={`px-8 py-3 rounded-md text-white font-medium transition-colors ${
            isSoldOut 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-black hover:bg-gray-800 disabled:opacity-75'
          }`}
        >
          {buying ? 'Processing...' : isSoldOut ? 'Sold Out' : 'Buy Now'}
        </button>
      </div>
    </div>
  );
}