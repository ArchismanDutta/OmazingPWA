import { useState } from 'react';
import RazorpayCheckout from './RazorpayCheckout';

const SubscriptionPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      duration: 'forever',
      features: [
        'Access to basic meditation content',
        'Limited course access',
        'Basic progress tracking',
        'Community access'
      ],
      popular: false
    },
    {
      id: 'premium-monthly',
      name: 'Premium Monthly',
      price: 299,
      duration: 'monthly',
      features: [
        'Unlimited access to all content',
        'All courses included',
        'Advanced progress analytics',
        'Offline downloads',
        'Priority support',
        'No ads'
      ],
      popular: true
    },
    {
      id: 'premium-yearly',
      name: 'Premium Yearly',
      price: 2999,
      duration: 'yearly',
      features: [
        'All Premium Monthly features',
        'Save ₹580 annually',
        'Exclusive yearly content',
        'Early access to new features',
        'Certificate of completion',
        'Priority customer support'
      ],
      popular: false,
      savings: '₹580'
    }
  ];

  const handlePaymentSuccess = (payment) => {
    alert('Subscription activated successfully!');
    setSelectedPlan(null);
    // Refresh user data or redirect
    window.location.reload();
  };

  const handlePaymentFailure = (error) => {
    alert('Payment failed. Please try again.');
    setSelectedPlan(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-lg text-gray-600">
          Start your mindfulness journey today
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all hover:scale-105 ${
              plan.popular ? 'ring-2 ring-indigo-600' : ''
            }`}
          >
            {plan.popular && (
              <div className="bg-indigo-600 text-white text-center py-2 font-semibold text-sm">
                MOST POPULAR
              </div>
            )}

            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h3>

              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">
                  ₹{plan.price}
                </span>
                {plan.duration !== 'forever' && (
                  <span className="text-gray-600 ml-2">/{plan.duration}</span>
                )}
              </div>

              {plan.savings && (
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full inline-block text-sm font-semibold mb-6">
                  Save {plan.savings}
                </div>
              )}

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.id === 'free' ? (
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-600 py-3 rounded-lg font-semibold cursor-not-allowed"
                >
                  Current Plan
                </button>
              ) : (
                <div>
                  {selectedPlan === plan.id ? (
                    <RazorpayCheckout
                      type="subscription"
                      itemId={{
                        plan: 'premium',
                        duration: plan.duration
                      }}
                      amount={plan.price}
                      onSuccess={handlePaymentSuccess}
                      onFailure={handlePaymentFailure}
                    />
                  ) : (
                    <button
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                        plan.popular
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                      }`}
                    >
                      Select Plan
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center text-gray-600">
        <p className="text-sm">
          All plans include a 7-day free trial. Cancel anytime.
        </p>
        <p className="text-sm mt-2">
          Questions? Contact us at support@mindfulness.com
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
