import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Subscription.css';

const Subscription = () => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const navigate = useNavigate();

  const plans = [
    {
      key: 'free',
      name: 'Free Trial',
      price: 0,
      period: '7 days',
      label: 'Free',
      sublabel: 'No credit card required',
      features: [
        'Trailers only',
        'Limited browsing',
        '1 screen',
        'SD quality',
      ],
    },
    {
      key: 'weekly',
      name: 'Weekly',
      price: 99,
      period: 'per week',
      label: '₹99',
      sublabel: '/ week',
      features: [
        'Full HD streaming',
        '1 screen',
        'Full library access',
        'No ads',
      ],
    },
    {
      key: 'monthly',
      name: 'Monthly',
      price: 199,
      period: 'per month',
      label: '₹199',
      sublabel: '/ month',
      popular: true,
      features: [
        'Full HD + 4K streaming',
        '2 screens',
        'Full library access',
        'Downloads',
        'No ads',
      ],
    },
    {
      key: 'yearly',
      name: 'Yearly',
      price: 1999,
      period: 'per year',
      label: '₹1,999',
      sublabel: '/ year',
      badge: 'Best Value',
      features: [
        '4K + HDR streaming',
        '4 screens',
        'Full library access',
        'Downloads',
        'No ads',
        'Early access to new releases',
        'Priority support',
      ],
    },
  ];

  const handleSubscribe = (plan) => {
    if (plan.key === 'free') {
      navigate('/');
      return;
    }
    alert(`Subscribing to ${plan.name} plan — ₹${plan.price} ${plan.period}`);
    navigate('/');
  };

  return (
    <div className="subscription-page">
      <div className="subscription-container">
        <div className="subscription-header">
          <p className="choose-plan-text">CHOOSE YOUR PLAN</p>
          <h1 className="unlock-title">UNLOCK EVERYTHING</h1>
          <p className="unlock-subtitle">
            Stream thousands of hours of premium content. Cancel anytime.
          </p>
        </div>

        <div className="plans-container">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`plan-card ${plan.key} ${selectedPlan === plan.key ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
              onClick={() => setSelectedPlan(plan.key)}
            >
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              {plan.badge && <div className="popular-badge best-value">{plan.badge}</div>}

              <div className="plan-header">
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                  <span className="amount">{plan.label}</span>
                  <span className="period">{plan.sublabel}</span>
                </div>
              </div>

              <div className="plan-features">
                {plan.features.map((feature, i) => (
                  <div key={i} className="feature-item">
                    <span className="feature-check">✓</span>
                    <span className="feature-text">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                className={`plan-button ${selectedPlan === plan.key ? 'selected' : ''}`}
                onClick={(e) => { e.stopPropagation(); handleSubscribe(plan); }}
              >
                {plan.key === 'free' ? 'Start Free Trial' : selectedPlan === plan.key ? '✓ Selected' : `Choose ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        <div className="subscription-footer">
          <button
            className="subscribe-now-btn"
            onClick={() => handleSubscribe(plans.find(p => p.key === selectedPlan))}
          >
            {selectedPlan === 'free' ? 'Start Free Trial' : 'Subscribe Now'}
          </button>
          <p className="terms-text">
            By subscribing, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Subscription;