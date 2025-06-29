// Authors: 7100, 7094, 7099, 7144 //

import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "../../components/Firebase";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import './SignUp.css';

const SignUp = ({ onLoginClick }) => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumbers: false
  });

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    validatePassword(formData.password);
  }, [formData.password]);

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    // Calculate password strength (0-4)
    const strength = [minLength, hasUpperCase, hasLowerCase, hasNumbers].filter(Boolean).length;
    
    setPasswordStrength(strength);
    setPasswordValidation({
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers,
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  const handleNextStep = () => {
    setCurrentStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Check password validation before proceeding
    if (!passwordValidation.isValid) {
      toast.error("Please ensure your password meets all requirements", {
        position: "bottom-center",
      });
      return;
    }
    
    try {
      // Create user account with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      // Store additional user information in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        selectedPlan: selectedPlan,
      });
      
      toast.success("Sign up successful! Welcome to FitX!", {
        position: "top-center",
      });
      
      // Redirect to Home Page page after successful signup
      navigate('/');
    } catch (error) {
      console.log(error.message);
      toast.error(error.message, {
        position: "bottom-center",
      });
    }
  };

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '$29.99/month',
      features: [
        'Full gym access',
        'Locker use',
        '24/7 access'
      ]
    },
    {
      id: 'standard',
      name: 'Standard',
      price: '$49.99/month',
      features: [
        'All Basic plan features',
        'Unlimited group classes',
        'Spa access'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$79.99/month',
      features: [
        'All Standard plan features',
        'Personal training (2x/week)',
        'Recovery area access',
        'Guest passes (2/month)'
      ]
    }
  ];

  return (
    <div className="SignUp">
      <header className="header">
        <h1>FitX</h1>
        <p>Your Fitness Journey Starts Here</p>
      </header>

      <div className="container">
        {currentStep === 1 ? (
          <div className="SignUp-step">
            <div className="step-header">
              <h2>Sign Up</h2>
              <button className="step-button" disabled>Select Plan</button>
            </div>
            
            <div className="SignUp-container">
              <div className="SignUp-form">
                <h3>Your Information</h3>
                <div className="form-group">
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={formData.firstName ? "has-value" : ""}
                    placeholder=" "
                    required
                  />
                  <label htmlFor="firstName">First Name</label>
                </div>
                
                <div className="form-group">
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={formData.lastName ? "has-value" : ""}
                    placeholder=" "
                  />
                  <label htmlFor="lastName">Last Name</label>
                </div>
                
                <div className="form-group">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={formData.email ? "has-value" : ""}
                    placeholder=" "
                    required
                  />
                  <label htmlFor="email">Email</label>
                </div>
                
                <div className="form-group password-group">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={formData.password ? "has-value" : ""}
                    placeholder=" "
                    required
                  />
                  <label htmlFor="password">Password</label>
                  
                  {formData.password && (
                    <div className="password-strength-container">
                      <div className="password-strength-meter">
                        <div 
                          className={`password-strength-value strength-${passwordStrength}`} 
                          style={{ width: `${(passwordStrength / 4) * 100}%` }}
                        ></div>
                      </div>
                      <div className="password-strength-text">
                        {passwordStrength === 0 && "Very Weak"}
                        {passwordStrength === 1 && "Weak"}
                        {passwordStrength === 2 && "Fair"}
                        {passwordStrength === 3 && "Good"}
                        {passwordStrength === 4 && "Strong"}
                      </div>
                    </div>
                  )}
                  
                  {formData.password && (
                    <div className="password-requirements">
                      <div className={`requirement ${passwordValidation.minLength ? "valid" : "invalid"}`}>
                        <span className="check-icon">{passwordValidation.minLength ? "✓" : "✗"}</span>
                        <span>At least 8 characters</span>
                      </div>
                      <div className={`requirement ${passwordValidation.hasUpperCase ? "valid" : "invalid"}`}>
                        <span className="check-icon">{passwordValidation.hasUpperCase ? "✓" : "✗"}</span>
                        <span>At least 1 uppercase letter</span>
                      </div>
                      <div className={`requirement ${passwordValidation.hasLowerCase ? "valid" : "invalid"}`}>
                        <span className="check-icon">{passwordValidation.hasLowerCase ? "✓" : "✗"}</span>
                        <span>At least 1 lowercase letter</span>
                      </div>
                      <div className={`requirement ${passwordValidation.hasNumbers ? "valid" : "invalid"}`}>
                        <span className="check-icon">{passwordValidation.hasNumbers ? "✓" : "✗"}</span>
                        <span>At least 1 number</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="form-group">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={formData.phone ? "has-value" : ""}
                    placeholder=" "
                    required
                  />
                  <label htmlFor="phone">Phone Number</label>
                </div>
                
                <div className="login-link">
                  <p>Already registered? <a href="#login" onClick={(e) => {
                    e.preventDefault();
                    onLoginClick();
                  }}>Login</a></p>
                </div>
              </div>

              <div className="plan-selection">
                <h3>Select Your Plan</h3>
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`plan-option ${selectedPlan === plan.id ? 'selected' : ''}`}
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    <div className="plan-radio">
                      <input
                        type="radio"
                        id={plan.id}
                        name="plan"
                        checked={selectedPlan === plan.id}
                        onChange={() => handlePlanSelect(plan.id)}
                        className="radio-input"
                      />
                    </div>
                    <div className="plan-details">
                      <div className="plan-header">
                        <span className="plan-name">{plan.name}</span>
                        <span className="plan-price">{plan.price}</span>
                      </div>
                      <ul className="plan-features">
                        {plan.features.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-actions">
              <button
                className="button next-button"
                onClick={handleNextStep}
                disabled={
                  !selectedPlan || 
                  !formData.firstName || 
                  !formData.email || 
                  !formData.phone || 
                  !passwordValidation.isValid 
                }
              >
                Continue to Payment
              </button>
            </div>
          </div>
        ) : (
          <div className="payment-step">
            <div className="step-header">
              <button className="step-button" onClick={() => setCurrentStep(1)}>Sign Up</button>
              <h2>Payment</h2>
            </div>
            
            <div className="payment-container">
              <div className="payment-form">
                <h3>Payment Details</h3>
                
                <div className="payment-disclaimer">
                  <p><strong>This is a test form.</strong> This is not a real payment system and your card information will not be stored in our database.</p>
                </div>
                
                <div className="form-group">
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    className={formData.cardNumber ? "has-value" : ""}
                    placeholder=" "
                    required
                  />
                  <label htmlFor="cardNumber">Card Number</label>
                </div>
                
                <div className="form-row">
                  <div className="form-group half">
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className={formData.expiryDate ? "has-value" : ""}
                      placeholder=" "
                      required
                    />
                    <label htmlFor="expiryDate">Expiry Date</label>
                  </div>
                  
                  <div className="form-group half">
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      className={formData.cvv ? "has-value" : ""}
                      placeholder=" "
                      required
                    />
                    <label htmlFor="cvv">CVV</label>
                  </div>
                </div>
              </div>

              <div className="selected-plan-summary">
                <h3>Selected Plan</h3>
                {selectedPlan && (
                  <div className="plan-summary">
                    <div className="plan-header">
                      <span className="plan-name">{plans.find(p => p.id === selectedPlan).name}</span>
                      <span className="plan-price">{plans.find(p => p.id === selectedPlan).price}</span>
                    </div>
                    <ul className="plan-features">
                      {plans.find(p => p.id === selectedPlan).features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            <div className="form-actions">
              <button
                className="button submit-button"
                onClick={handleRegister}
                disabled={!formData.cardNumber || !formData.expiryDate || !formData.cvv}
              >
                Complete Sign Up
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUp;