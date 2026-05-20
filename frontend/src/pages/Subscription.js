import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Subscription.css';

const Subscription = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState('standard');
  const navigate = useNavigate();

  const plans = {
    basic: {
      name: 'Basic',
      monthlyPrice: 9,
      yearlyPrice: 90,
      features: [
        'HD Streaming',
        '1 Screen',
        'Limited Library',
        'Mobile Access'
      ]
    },
    standard: {
      name: 'Standard',
      monthlyPrice: 15,
      yearlyPrice: 150,
      features: [
        'Full HD + 4K',
        '2 Screens',
        'Full Library',
        'Downloads',
        'No Ads'
      ],
      popular: true
    },
    premium: {
      name: 'Premium',
      monthlyPrice: 22,
      yearlyPrice: 220,
      features: [
        '4K + HDR',
        '4 Screens',
        'Full Library',
        'Downloads',
        'No Ads',
        'Early Access',
        'Priority Support'
      ]
    }
  };

  const handleSubscribe = (planType) => {
    // In a real app, this would integrate with payment processing
    alert(`Subscribing to ${plans[planType].name} plan!`);
    navigate('/');
  };

  return (
    <div className="subscription-page">
      <Navbar />
      
      <div className="subscription-container">
        <div className="subscription-header">
          <p className="choose-plan-text">CHOOSE YOUR PLAN</p>
          <h1 className="unlock-title">UNLOCK EVERYTHING</h1>
          <p className="unlock-subtitle">
            Stream thousands of hours of premium content. Cancel anytime.
          </p>
          
          <div className="billing-toggle">
            <span className={billingCycle === 'monthly' ? 'active' : ''}>Monthly</span>
            <div className="toggle-switch" onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}>
              <div className={`toggle-slider ${billingCycle === 'yearly' ? 'yearly' : ''}`}></div>
            </div>
            <span className={billingCycle === 'yearly' ? 'active' : ''}>Yearly</span>
            <span className="save-badge">Save 20%</span>
          </div>
        </div>

        <div className="plans-container">
          {Object.entries(plans).map(([key, plan]) => (
            <div 
              key={key}
              className={`plan-card ${key} ${selectedPlan === key ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
              onClick={() => setSelectedPlan(key)}
            >
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              
              <div className="plan-header">
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                  <span className="currency">$</span>
                  <span className="amount">
                    {billingCycle === 'monthly' ? plan.monthlyPrice : Math.floor(plan.yearlyPrice / 12)}
                  </span>
                  <span className="period">/mo</span>
                </div>
              </div>

              <div className="plan-features">
                {plan.features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <span className="feature-check">✓</span>
                    <span className="feature-text">{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                className={`plan-button ${selectedPlan === key ? 'selected' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubscribe(key);
                }}
              >
                {selectedPlan === key ? '✓ Selected' : `Choose ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        <div className="subscription-footer">
          <button className="subscribe-now-btn" onClick={() => handleSubscribe(selectedPlan)}>
            Subscribe Now
          </button>
          <p className="terms-text">
            By subscribing, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Subscription;