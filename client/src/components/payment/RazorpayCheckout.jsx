import { useState, useEffect } from 'react';
import axios from 'axios';

const RazorpayCheckout = ({ type, itemId, amount, onSuccess, onFailure }) => {
  const [loading, setLoading] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState('');

  useEffect(() => {
    // Fetch Razorpay key
    const fetchRazorpayKey = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/v1/payments/key');
        setRazorpayKey(response.data.key);
      } catch (error) {
        console.error('Failed to fetch Razorpay key:', error);
      }
    };
    fetchRazorpayKey();
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Failed to load Razorpay SDK. Please check your internet connection.');
        setLoading(false);
        return;
      }

      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to continue');
        setLoading(false);
        return;
      }

      // Create order based on type
      let endpoint = '';
      let payload = {};

      if (type === 'course') {
        endpoint = 'http://localhost:5000/api/v1/payments/order/course';
        payload = { courseId: itemId };
      } else if (type === 'content') {
        endpoint = 'http://localhost:5000/api/v1/payments/order/content';
        payload = { contentId: itemId };
      } else if (type === 'subscription') {
        endpoint = 'http://localhost:5000/api/v1/payments/order/subscription';
        payload = { plan: itemId.plan, duration: itemId.duration };
      }

      const orderResponse = await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const { order } = orderResponse.data;

      // Configure Razorpay options
      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: 'Mindfulness Platform',
        description: `Payment for ${type}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            // Verify payment
            const verifyResponse = await axios.post(
              'http://localhost:5000/api/v1/payments/verify',
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                paymentId: order.paymentId
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );

            if (verifyResponse.data.success) {
              onSuccess && onSuccess(verifyResponse.data.payment);
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
            onFailure && onFailure(error);
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#6366f1'
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            onFailure && onFailure({ message: 'Payment cancelled' });
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setLoading(false);
    } catch (error) {
      console.error('Payment error:', error);
      setLoading(false);
      onFailure && onFailure(error);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading || !razorpayKey}
      className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? 'Processing...' : `Pay ₹${amount}`}
    </button>
  );
};

export default RazorpayCheckout;
