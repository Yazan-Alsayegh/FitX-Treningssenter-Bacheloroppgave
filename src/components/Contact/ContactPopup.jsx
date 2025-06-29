// Authors: 7100, 7144 //

import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../Firebase';
import { toast } from 'react-toastify';
import './ContactPopup.css';

const ContactPopup = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [activeField, setActiveField] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    message: ''
  });

  useEffect(() => {
    const auth = getAuth();
    if (auth.currentUser) {
      // Set email from authentication
      setFormData(prev => ({
        ...prev,
        email: auth.currentUser.email || prev.email,
      }));
      
      // Get firstName and lastName from Firestore
      const fetchUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const fullName = `${userData.firstName} ${userData.lastName}`;
            setFormData(prev => ({
              ...prev,
              name: fullName,
            }));
          } else {
            setFormData(prev => ({
              ...prev,
              name: auth.currentUser.displayName || prev.name,
            }));
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      email: '',
      message: ''
    };

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!formData.email.includes('@') || !formData.email.includes('.')) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSending(true);
      
      try {
        const auth = getAuth();
        const userId = auth.currentUser ? auth.currentUser.uid : 'Not logged in';
        
        // Form data for Web3Forms
        const formDataToSend = new FormData();
        formDataToSend.append('access_key', '2e976031-07bf-4656-8e78-83eeb317a1e7');
        formDataToSend.append('name', formData.name);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('phone', formData.phone || 'Not provided');
        formDataToSend.append('message', formData.message);
        formDataToSend.append('user_id', userId);
        formDataToSend.append('subject', 'New contact form submission from FitX');
        
        // Send the form data to Web3Forms
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formDataToSend
        });
        
        const data = await response.json();
        
        if (data.success) {
          toast.success("Message sent successfully!", {
            position: "top-center",
          });
          
          setSubmitted(true);
          setTimeout(() => {
            setFormData({
              name: '',
              email: '',
              phone: '',
              message: '',
            });
            setSubmitted(false);
            onClose();
          }, 3500);
        } else {
          throw new Error('Failed to send message');
        }
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error("Failed to send message. Please try again.", {
          position: "bottom-center",
        });
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: '',
    });
    setErrors({
      name: '',
      email: '',
      message: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        {submitted ? (
          <div className="success-message-container">
            <div className="contact-submitted">
              <div className="submitted-icon">
                ✉️
              </div>
              <h2>Message Sent!</h2>
              <p>Thank you for reaching out. We'll get back to you shortly.</p>
            </div>
          </div>
        ) : (
          <div className="contact-wrapper popup-contact-wrapper">
            <div className="contact-info">
              <div className="contact-header">
                <h1>Let's get in touch</h1>
                <p>We'd love to hear from you. Fill out the form and our team will get back to you as soon as possible.</p>
              </div>
              <div className="contact-details">
                <div className="contact-detail">
                  <div className="contact-icon">📧</div>
                  <span>fitx.help1@gmail.com</span>
                </div>
                <div className="contact-detail">
                  <div className="contact-icon">📞</div>
                  <span>(555) 123-4567</span>
                </div>
                <div className="contact-detail">
                  <div className="contact-icon">📍</div>
                  <span>123 Fitness Street, Gym City</span>
                </div>
              </div>
            </div>
            
            <div className="contact-form">
              <h2>Send us a message</h2>
              <form onSubmit={handleSubmit}>
                <input type="hidden" name="access_key" value="2e976031-07bf-4656-8e78-83eeb317a1e7" />
                <input type="hidden" name="subject" value="New contact form submission from FitX" />
                <input type="hidden" name="from_name" value="FitX Contact Form" />
                <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />

                <div className="form-fields">
                  <div className={`form-field ${activeField === 'name' ? 'active' : ''}`}>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      onFocus={() => setActiveField('name')}
                      onBlur={() => setActiveField(null)}
                      className={`form-input ${errors.name ? 'input-error' : ''} ${formData.name ? 'has-value' : ''}`}
                      placeholder=" "
                    />
                    <label htmlFor="name">Your Name</label>
                    {errors.name && <div className="error-message">{errors.name}</div>}
                  </div>
                  
                  <div className={`form-field ${activeField === 'email' ? 'active' : ''}`}>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onFocus={() => setActiveField('email')}
                      onBlur={() => setActiveField(null)}
                      className={`form-input ${errors.email ? 'input-error' : ''} ${formData.email ? 'has-value' : ''}`}
                      placeholder=" "
                    />
                    <label htmlFor="email">Email Address</label>
                    {errors.email && <div className="error-message">{errors.email}</div>}
                  </div>
                  
                  <div className={`form-field ${activeField === 'phone' ? 'active' : ''}`}>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      onFocus={() => setActiveField('phone')}
                      onBlur={() => setActiveField(null)}
                      className={`form-input ${formData.phone ? 'has-value' : ''}`}
                      placeholder=" "
                    />
                    <label htmlFor="phone">Phone Number</label>
                  </div>
                  
                  <div className={`form-field ${activeField === 'message' ? 'active' : ''}`}>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      onFocus={() => setActiveField('message')}
                      onBlur={() => setActiveField(null)}
                      className={`form-input ${errors.message ? 'input-error' : ''} ${formData.message ? 'has-value' : ''}`}
                      placeholder=" "
                    />
                    <label htmlFor="message">Your Message</label>
                    {errors.message && <div className="error-message">{errors.message}</div>}
                  </div>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="contact-button primary"
                    disabled={isSending}
                  >
                    {isSending ? 'Sending...' : 'Send Message'}
                  </button>
                  <button
                    type="button"
                    className="contact-button secondary"
                    onClick={handleReset}
                  >
                    Reset Form
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactPopup;