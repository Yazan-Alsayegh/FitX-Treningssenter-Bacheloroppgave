// Authors: 7099, 7144 //

import React from 'react';
import './Plans.css';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom'; 

const Plans = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate(); 
  
  const Plans = [
    {
      id: 1,
      title: 'Basic Plan',
      price: '$29.99',
      features: ['Full gym access', 'Locker use', '24/7 access']
    },
    {
      id: 2,
      title: 'Standard Plan',
      price: '$49.99',
      features: ['All Basic plan features', 'Unlimited group classes', 'Spa access']
    },
    {
      id: 3,
      title: 'Premium Plan',
      price: '$79.99',
      features: ['All Standard plan features', 'Personal training (2x/week)', 'Recovery area access', 'Guest passes (2/month)']
    }
  ];

  const handleJoinNow = (planId) => {
    if (isAuthenticated) {
      // User is logged in, navigate to myprofile page
      navigate(`/myprofile?plan=${planId}`);
    } else {
      // User is not logged in, navigate to signup
      navigate(`/signup?plan=${planId}`);
    }
  };

  return (
    <section className="memberships-section">
      <div className="memberships-container">
        <div className="memberships-title-wrapper">
          <h2 className="memberships-title" data-shadow-text="PLANS">
            Our Memberships
          </h2>
        </div>
        
        <div className="memberships-cards">
          {Plans.map(plan => (
            <div className="membership-card" key={plan.id}>
              <div className="membership-header">
                <h3 className="membership-title">{plan.title}</h3>
                <p className="membership-price">{plan.price}<span className="price-period">/month</span></p>
              </div>
              
              <div className="membership-features">
                <ul>
                  {plan.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              
              <button className="join-button" onClick={() => handleJoinNow(plan.id)}>
                {isAuthenticated ? 'Modify Membership' : 'Join Now'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Plans;