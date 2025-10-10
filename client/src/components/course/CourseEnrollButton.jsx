import { useState } from 'react';
import axios from 'axios';

const CourseEnrollButton = ({ course, onEnrollSuccess }) => {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
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
        setShowPaymentConfirm(true);
      } else {
        alert(error.response?.data?.message || 'Failed to enroll in course');
      }
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleDummyPayment = async () => {
    try {
      setIsEnrolling(true);
      const token = localStorage.getItem('token');

      // Create dummy payment
      const paymentResponse = await axios.post(
        `http://localhost:5000/api/v1/courses/${course._id}/dummy-payment`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (paymentResponse.data.success) {
        const paymentId = paymentResponse.data.data.paymentId;
        setPaymentId(paymentId);
        setShowPaymentConfirm(false);

        // Automatically enroll after successful payment
        await handleEnroll(paymentId);
      }
    } catch (error) {
      console.error('Dummy payment error:', error);
      alert(error.response?.data?.message || 'Payment failed. Please try again.');
      setShowPaymentConfirm(false);
    } finally {
      setIsEnrolling(false);
    }
  };

  const isFree = course.pricing?.type === 'free';
  const amount = course.pricing?.discountPrice || course.pricing?.amount || 0;

  if (showPaymentConfirm) {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl p-6">
          <div className="text-center mb-4">
            <div className="text-5xl mb-3">💳</div>
            <h3 className="text-xl font-bold text-white mb-2">Complete Payment</h3>
            <p className="text-gray-300 text-sm mb-4">
              This is a dummy payment for testing purposes
            </p>
          </div>

          <div className="bg-black/20 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Course:</span>
              <span className="text-white font-medium">{course.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Price:</span>
              <span className="text-2xl font-bold text-white">
                {course.pricing?.currency === 'USD' ? '$' : '₹'}{amount}
              </span>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
            <div className="flex items-start space-x-2">
              <span className="text-yellow-500 text-lg">⚠️</span>
              <div>
                <p className="text-yellow-300 text-sm font-medium">Test Mode</p>
                <p className="text-yellow-400/80 text-xs">
                  No real payment will be processed. This is for development only.
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleDummyPayment}
          disabled={isEnrolling}
          className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
            'Complete Test Payment'
          )}
        </button>

        <button
          onClick={() => setShowPaymentConfirm(false)}
          disabled={isEnrolling}
          className="w-full px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
