// Authors: 7100, 7099, 7144 //

import React, { useState, useEffect } from 'react';
import { auth, db } from "../../components/Firebase";
import { updateDoc, doc, getDoc } from "firebase/firestore";
import { updatePassword, updateEmail } from "firebase/auth";
import { toast } from "react-toastify";
import './MyProfile.css';

const MyProfile = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    selectedPlan: '',
    photo: '',
    billingDate: null,
    nextPaymentDate: null,
    billingCycle: 'monthly', 
    subscriptionStartDate: null
  });
  
  const [editMode, setEditMode] = useState({
    personalInfo: false,
    password: false,
    membership: false,
    billing: false
  });
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
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
        '2 Group training sessions a week',
        'Spa access'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$79.99/month',
      features: [
        'All Standard plan features',
        'Personal training (2x/month)',
        'Recovery area access',
        'Guest passes (2/month)'
      ]
    }
  ];

  const billingCycleOptions = [
    { value: 'monthly', label: 'Monthly', description: 'Pay once every month' },
    { value: 'quarterly', label: 'Quarterly', description: 'Pay once every 3 months (5% discount)' },
    { value: 'annual', label: 'Annual', description: 'Pay once per year (15% discount)' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const user = auth.currentUser;
        if (!user) {
          // Redirect to login the user is not logged in
          window.location.href = '/login';
          return;
        }
        
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          
          const subscriptionStartDate = data.subscriptionStartDate ? data.subscriptionStartDate.toDate() : new Date();
          const nextPaymentDate = data.nextPaymentDate ? data.nextPaymentDate.toDate() : calculateNextPaymentDate(subscriptionStartDate, data.billingCycle || 'monthly');
          
          setUserData({
            ...data,
            subscriptionStartDate,
            nextPaymentDate
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load your membership data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []); 
  
  const calculateNextPaymentDate = (startDate, billingCycle) => {
    const nextPayment = new Date(startDate);
    
    switch(billingCycle) {
      case 'quarterly':
        nextPayment.setMonth(nextPayment.getMonth() + 3);
        break;
      case 'annual':
        nextPayment.setFullYear(nextPayment.getFullYear() + 1);
        break;
      case 'monthly':
      default:
        nextPayment.setMonth(nextPayment.getMonth() + 1);
        break;
    }
    
    return nextPayment;
  };
  
  const calculateRemainingDays = (nextPaymentDate) => {
    if (!nextPaymentDate) return 0;
    
    const today = new Date();
    const timeDiff = nextPaymentDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return daysRemaining > 0 ? daysRemaining : 0;
  };
  
  const formatDate = (date) => {
    if (!date) return 'Not available';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };
  
  const handlePlanSelect = (planId) => {
    setUserData({
      ...userData,
      selectedPlan: planId
    });
  };
  
  const handleBillingCycleSelect = (cycle) => {
    const nextPaymentDate = calculateNextPaymentDate(
      userData.subscriptionStartDate || new Date(), 
      cycle
    );
    
    setUserData({
      ...userData,
      billingCycle: cycle,
      nextPaymentDate
    });
  };
  
  const toggleEditMode = (section) => {
    setEditMode({
      ...editMode,
      [section]: !editMode[section]
    });
  };
  
  const updatePersonalInfo = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      
      // Update email in Firebase Auth if the user change it
      if (user.email !== userData.email) {
        await updateEmail(user, userData.email);
      }
      
      // Update user data in Firestore
      await updateDoc(doc(db, "users", user.uid), {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone
      });
      
      toggleEditMode('personalInfo');
      toast.success("Personal information updated successfully!");
    } catch (error) {
      console.error("Error updating personal info:", error);
      toast.error(error.message || "Failed to update personal information");
    } finally {
      setLoading(false);
    }
  };
  
  const updateUserPassword = async () => {
    try {
      if (newPassword !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      
      setLoading(true);
      const user = auth.currentUser;
      
      await updatePassword(user, newPassword);
      
      setNewPassword('');
      setConfirmPassword('');
      toggleEditMode('password');
      toast.success("Password updated successfully!");
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error(error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };
  
  const updateMembership = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      
      await updateDoc(doc(db, "users", user.uid), {
        selectedPlan: userData.selectedPlan
      });
      
      toggleEditMode('membership');
      toast.success("Membership plan updated successfully!");
    } catch (error) {
      console.error("Error updating membership:", error);
      toast.error(error.message || "Failed to update membership plan");
    } finally {
      setLoading(false);
    }
  };
  
  const updateBillingInfo = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      
      const nextPaymentDate = calculateNextPaymentDate(
        userData.subscriptionStartDate || new Date(), 
        userData.billingCycle
      );
      
      await updateDoc(doc(db, "users", user.uid), {
        billingCycle: userData.billingCycle,
        nextPaymentDate,
      });
      
      setUserData({
        ...userData,
        nextPaymentDate
      });
      
      toggleEditMode('billing');
      toast.success("Billing information updated successfully!");
    } catch (error) {
      console.error("Error updating billing info:", error);
      toast.error(error.message || "Failed to update billing information");
    } finally {
      setLoading(false);
    }
  };
  
  const cancelEdit = (section) => {
    if (section === 'password') {
      setNewPassword('');
      setConfirmPassword('');
    }
    toggleEditMode(section);
  };
  
  const getCurrentPlanPrice = () => {
    const plan = plans.find(p => p.id === userData.selectedPlan);
    if (!plan) return 'Not available';
    
    const priceMatch = plan.price.match(/\$(\d+\.\d+)/);
    if (!priceMatch) return plan.price;
    
    const monthlyPrice = parseFloat(priceMatch[1]);
    
    switch(userData.billingCycle) {
      case 'quarterly':
        return `$${(monthlyPrice * 3 * 0.95).toFixed(2)} (5% discount)`;
      case 'annual':
        return `$${(monthlyPrice * 12 * 0.85).toFixed(2)} (15% discount)`;
      default:
        return plan.price;
    }
  };
  
  if (loading) {
    return (
      <div className="MyProfile-loading-container">
        <div className="MyProfile-loading-spinner"></div>
        <p>Loading your membership details...</p>
      </div>
    );
  }
  
  return (
    <div className="MyProfile-page">
      <header className="MyProfile-header">
        <h1>Profile</h1>
        <p>Update your personal information, manage your membership plan, and keep your fitness journey on track.</p>
      </header>
      
      <div className="MyProfile-container">
        <div className="MyProfile-section">
          <h2>Manage Your Profile</h2>
          
          <div className="MyProfile-card">
            <div className="MyProfile-card-header">
              <h3>Personal Information</h3>
              <button 
                className="MyProfile-edit-button"
                onClick={() => toggleEditMode('personalInfo')}
              >
                {editMode.personalInfo ? 'Cancel' : 'Edit'}
              </button>
            </div>
            
            {editMode.personalInfo ? (
              <div className="MyProfile-edit-form">
                <div className="MyProfile-form-group">
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={userData.firstName}
                    onChange={handleInputChange}
                    className={userData.firstName ? "has-value" : ""}
                    placeholder=" "
                  />
                  <label htmlFor="firstName">First Name</label>
                </div>
                
                <div className="MyProfile-form-group">
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={userData.lastName}
                    onChange={handleInputChange}
                    className={userData.lastName ? "has-value" : ""}
                    placeholder=" "
                  />
                  <label htmlFor="lastName">Last Name</label>
                </div>
                
                <div className="MyProfile-form-group">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    className={userData.email ? "has-value" : ""}
                    placeholder=" "
                  />
                  <label htmlFor="email">Email</label>
                </div>
                
                <div className="MyProfile-form-group">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={userData.phone}
                    onChange={handleInputChange}
                    className={userData.phone ? "has-value" : ""}
                    placeholder=" "
                  />
                  <label htmlFor="phone">Phone Number</label>
                </div>
                
                <div className="MyProfile-form-actions">
                  <button className="MyProfile-cancel-button" onClick={() => cancelEdit('personalInfo')}>
                    Cancel
                  </button>
                  <button className="MyProfile-save-button" onClick={updatePersonalInfo}>
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="MyProfile-info-display">
                <div className="MyProfile-info-row">
                  <span className="MyProfile-info-label">Name:</span>
                  <span className="MyProfile-info-value">{userData.firstName} {userData.lastName}</span>
                </div>
                <div className="MyProfile-info-row">
                  <span className="MyProfile-info-label">Email:</span>
                  <span className="MyProfile-info-value">{userData.email}</span>
                </div>
                <div className="MyProfile-info-row">
                  <span className="MyProfile-info-label">Phone:</span>
                  <span className="MyProfile-info-value">{userData.phone}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="MyProfile-card">
            <div className="MyProfile-card-header">
              <h3>Password</h3>
              <button 
                className="MyProfile-edit-button"
                onClick={() => toggleEditMode('password')}
              >
                {editMode.password ? 'Cancel' : 'Change Password'}
              </button>
            </div>
            
            {editMode.password ? (
              <div className="MyProfile-edit-form">
                <div className="MyProfile-form-group">
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={newPassword ? "has-value" : ""}
                    placeholder=" "
                  />
                  <label htmlFor="newPassword">New Password</label>
                </div>
                
                <div className="MyProfile-form-group">
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={confirmPassword ? "has-value" : ""}
                    placeholder=" "
                  />
                  <label htmlFor="confirmPassword">Confirm Password</label>
                </div>
                
                <div className="MyProfile-form-actions">
                  <button className="MyProfile-cancel-button" onClick={() => cancelEdit('password')}>
                    Cancel
                  </button>
                  <button 
                    className="MyProfile-save-button" 
                    onClick={updateUserPassword}
                    disabled={!newPassword || !confirmPassword}
                  >
                    Update Password
                  </button>
                </div>
              </div>
            ) : (
              <div className="MyProfile-info-display">
                <div className="MyProfile-info-row">
                  <span className="MyProfile-info-value">••••••••</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="MyProfile-card">
            <div className="MyProfile-card-header">
              <h3>Membership Plan</h3>
              <button 
                className="MyProfile-edit-button"
                onClick={() => toggleEditMode('membership')}
              >
                {editMode.membership ? 'Cancel' : 'Change Plan'}
              </button>
            </div>
            
            {editMode.membership ? (
              <div className="MyProfile-edit-form">
                <div className="MyProfile-plan-selection">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`MyProfile-plan-option ${userData.selectedPlan === plan.id ? 'selected' : ''}`}
                      onClick={() => handlePlanSelect(plan.id)}
                    >
                      <div className="MyProfile-plan-radio">
                        <input
                          type="radio"
                          id={plan.id}
                          name="plan"
                          checked={userData.selectedPlan === plan.id}
                          onChange={() => handlePlanSelect(plan.id)}
                          className="MyProfile-radio-input"
                        />
                      </div>
                      <div className="MyProfile-plan-details">
                        <div className="MyProfile-plan-header">
                          <span className="MyProfile-plan-name">{plan.name}</span>
                          <span className="MyProfile-plan-price">{plan.price}</span>
                        </div>
                        <ul className="MyProfile-plan-features">
                          {plan.features.map((feature, idx) => (
                            <li key={idx}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="MyProfile-form-actions">
                  <button className="MyProfile-cancel-button" onClick={() => cancelEdit('membership')}>
                    Cancel
                  </button>
                  <button className="MyProfile-save-button" onClick={updateMembership}>
                    Update Membership
                  </button>
                </div>
              </div>
            ) : (
              <div className="MyProfile-info-display">
                <div className="MyProfile-current-plan">
                  {userData.selectedPlan && (
                    <>
                      <div className="MyProfile-plan-header">
                        <span className="MyProfile-plan-name">
                          {plans.find(p => p.id === userData.selectedPlan)?.name || 'Unknown'} Plan
                        </span>
                        <span className="MyProfile-plan-price">
                          {plans.find(p => p.id === userData.selectedPlan)?.price || ''}
                        </span>
                      </div>
                      <ul className="MyProfile-plan-features">
                        {plans.find(p => p.id === userData.selectedPlan)?.features.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="MyProfile-card">
            <div className="MyProfile-card-header">
              <h3>Billing Information</h3>
              <button 
                className="MyProfile-edit-button"
                onClick={() => toggleEditMode('billing')}
              >
                {editMode.billing ? 'Cancel' : 'Edit Billing'}
              </button>
            </div>
            
            {editMode.billing ? (
              <div className="MyProfile-edit-form">
                <div className="MyProfile-plan-selection">
                  {billingCycleOptions.map((cycle) => (
                    <div
                      key={cycle.value}
                      className={`MyProfile-plan-option ${userData.billingCycle === cycle.value ? 'selected' : ''}`}
                      onClick={() => handleBillingCycleSelect(cycle.value)}
                    >
                      <div className="MyProfile-plan-radio">
                        <input
                          type="radio"
                          id={cycle.value}
                          name="billingCycle"
                          checked={userData.billingCycle === cycle.value}
                          onChange={() => handleBillingCycleSelect(cycle.value)}
                          className="MyProfile-radio-input"
                        />
                      </div>
                      <div className="MyProfile-plan-details">
                        <div className="MyProfile-plan-header">
                          <span className="MyProfile-plan-name">{cycle.label} Billing</span>
                        </div>
                        <p className="MyProfile-plan-description">{cycle.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="MyProfile-form-actions">
                  <button className="MyProfile-cancel-button" onClick={() => cancelEdit('billing')}>
                    Cancel
                  </button>
                  <button className="MyProfile-save-button" onClick={updateBillingInfo}>
                    Update Billing
                  </button>
                </div>
              </div>
            ) : (
              <div className="MyProfile-info-display">
                <div className="MyProfile-billing-info">
                  <div className="MyProfile-info-row">
                    <span className="MyProfile-info-label">Plan:</span>
                    <span className="MyProfile-info-value">
                      {plans.find(p => p.id === userData.selectedPlan)?.name || 'Unknown'} Plan
                    </span>
                  </div>
                  
                  <div className="MyProfile-info-row">
                    <span className="MyProfile-info-label">Subscription Started:</span>
                    <span className="MyProfile-info-value">
                      {formatDate(userData.subscriptionStartDate)}
                    </span>
                  </div>
                  
                  <div className="MyProfile-info-row">
                    <span className="MyProfile-info-label">Billing Cycle:</span>
                    <span className="MyProfile-info-value">
                      {billingCycleOptions.find(c => c.value === userData.billingCycle)?.label || 'Monthly'}
                    </span>
                  </div>
                  
                  <div className="MyProfile-info-row">
                    <span className="MyProfile-info-label">Next Payment:</span>
                    <span className="MyProfile-info-value highlight">
                      {formatDate(userData.nextPaymentDate)}
                    </span>
                  </div>
                  
                  <div className="MyProfile-info-row">
                    <span className="MyProfile-info-label">Amount Due:</span>
                    <span className="MyProfile-info-value highlight">
                      {getCurrentPlanPrice()}
                    </span>
                  </div>
                  
                  {calculateRemainingDays(userData.nextPaymentDate) <= 7 && (
                    <div className="MyProfile-payment-reminder">
                      <div className="MyProfile-reminder-icon">
                        <i className="fas fa-exclamation-circle"></i>
                      </div>
                      <div className="MyProfile-reminder-text">
                        <p>Your next payment is due in {calculateRemainingDays(userData.nextPaymentDate)} days.</p>
                        <p>Please ensure your payment method is up to date.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;