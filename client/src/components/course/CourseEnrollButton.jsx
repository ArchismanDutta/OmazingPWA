import { useState } from 'react';
import axios from 'axios';
import RazorpayCheckout from '../payment/RazorpayCheckout';

const CourseEnrollButton = ({ course, onEnrollSuccess }) => {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentId, setPaymentId] = useState(null);

  const handleEnroll = async (completedPaymentId = null) => {
    try {
      setIsEnrolling(true);
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `http://localhost:5000/api/v1/courses/${course._id}/enroll`,
        completedPaymentId ? { paymentId: completedPaymentId } : {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        alert('Successfully enrolled in course!');
        onEnrollSuccess && onEnrollSuccess();
        window.location.reload();
      }
    } catch (error) {
      console.error('Enrollment error:', error);

      // Check if payment is required
      if (error.response?.data?.requiresPayment) {
        setShowPayment(true);
      } else {
        alert(error.response?.data?.message || 'Failed to enroll in course');
      }
    } finally {
      setIsEnrolling(false);
    }
  };

  const handlePaymentSuccess = async (payment) => {
    setPaymentId(payment.id);
    setShowPayment(false);

    // Automatically enroll after successful payment
    await handleEnroll(payment.id);
  };

  const handlePaymentFailure = (error) => {
    console.error('Payment failed:', error);
    alert('Payment failed. Please try again.');
    setShowPayment(false);
  };

  const isFree = course.pricing?.type === 'free';
  const amount = course.pricing?.discountPrice || course.pricing?.amount || 0;

  if (showPayment) {
    return (
      <div className="space-y-4">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-2">Complete Payment</h3>
          <p className="text-gray-300 text-sm mb-4">
            Complete your payment to enroll in {course.title}
          </p>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400">Course Price:</span>
            <span className="text-2xl font-bold text-white">
              {course.pricing?.currency === 'USD' ? '$' : '₹'}{amount}
            </span>
          </div>
        </div>

        <RazorpayCheckout
          type="course"
          itemId={course._id}
          amount={amount}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
        />

        <button
          onClick={() => setShowPayment(false)}
          className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => handleEnroll()}
      disabled={isEnrolling}
      className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
        isFree
          ? 'bg-green-600 hover:bg-green-700 text-white'
          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
      } disabled:bg-gray-400 disabled:cursor-not-allowed`}
    >
      {isEnrolling ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processing...
        </span>
      ) : (
        <>
          {isFree ? 'Enroll for Free' : `Enroll Now - ${course.pricing?.currency === 'USD' ? '$' : '₹'}${amount}`}
        </>
      )}
    </button>
  );
};

export default CourseEnrollButton;
