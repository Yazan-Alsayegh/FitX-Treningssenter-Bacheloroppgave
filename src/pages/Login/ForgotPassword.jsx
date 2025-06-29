// Authors: 7100, 7099 //

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../components/Firebase";
import { toast } from "react-toastify";
import "./ForgotPassword.css";

const ForgotPassword = ({ isOpen, onClose, onBackToLogin }) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address", {
        position: "bottom-center",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await sendPasswordResetEmail(auth, email);
      setIsEmailSent(true);
      toast.success("Password reset email sent! Check your inbox.", {
        position: "top-center",
      });
    } catch (error) {
      console.error("Error sending password reset email:", error);
      let errorMessage = "Failed to send password reset email. Please try again.";
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email address.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      }
      
      toast.error(errorMessage, {
        position: "bottom-center",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = (e) => {
    e.preventDefault();
    if (onBackToLogin) {
      onBackToLogin();
    } else {
      navigate("/login");
    }
  };
  
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/");
    }
  };

  if (isOpen === false) {
    return null;
  }

  const handleContainerClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="forgot-password-overlay" onClick={handleClose}>
      <div className="forgot-password-container" onClick={handleContainerClick}>
        <div className="forgot-password-header">
          <div className="forgot-password-logo">
            <div className="forgot-password-logo-text">
              <span className="forgot-password-fit-text">Fit</span>
              <span className="forgot-password-x-text">X</span>
            </div>
          </div>
          <button className="forgot-password-close-button" onClick={handleClose}>×</button>
        </div>

        <div className="forgot-password-content">
          {!isEmailSent ? (
            <>
              <h2>Reset Password</h2>
              <p>Enter your email address and we'll send you a link to reset your password.</p>

              <form onSubmit={handleSubmit}>
                <div className="forgot-password-form-group">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder=" "
                    disabled={isSubmitting}
                  />
                  <label htmlFor="email">Email</label>
                </div>

                <button 
                  type="submit" 
                  className="forgot-password-reset-button" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "SENDING..." : "SEND RESET LINK"}
                </button>
              </form>
            </>
          ) : (
            <div className="forgot-password-reset-success">
              <div className="forgot-password-success-icon">✓</div>
              <h2>Email Sent</h2>
              <p>
                We've sent a password reset link to <strong>{email}</strong>. 
                Please check your inbox and follow the instructions to reset your password.
              </p>
              <p className="forgot-password-email-note">
                If you don't see the email, check your spam folder or request 
                another reset link.
              </p>
            </div>
          )}

          <div className="forgot-password-back-to-login">
            <a href="#login" onClick={handleBackToLogin}>
              Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;