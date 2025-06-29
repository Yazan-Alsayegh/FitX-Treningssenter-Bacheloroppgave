// Authors: 7094, 7099 //

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "../../components/Firebase";
import { toast } from "react-toastify";
import "./ResetPassword.css";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [actionCode, setActionCode] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumbers: false
  });
  
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const oobCode = queryParams.get("oobCode");
    
    if (!oobCode) {
      setError("Invalid or expired password reset link.");
      return;
    }
    
    setActionCode(oobCode);
    
    verifyPasswordResetCode(auth, oobCode)
      .then((email) => {
        setEmail(email);
      })
      .catch((error) => {
        console.error("Error verifying reset code:", error);
        setError("Invalid or expired password reset link. Please request a new one.");
      });
  }, [location]);
  
  useEffect(() => {
    validatePassword(password);
  }, [password]);

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match", {
        position: "bottom-center",
      });
      return;
    }
    
    if (!passwordValidation.isValid) {
      toast.error("Please ensure your password meets all requirements", {
        position: "bottom-center",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await confirmPasswordReset(auth, actionCode, password);
      setIsPasswordReset(true);
      toast.success("Password reset successful! You can now log in with your new password.", {
        position: "top-center",
      });
    } catch (error) {
      console.error("Error resetting password:", error);
      
      let errorMessage = "Failed to reset password. Please try again.";
      if (error.code === 'auth/expired-action-code') {
        errorMessage = "This password reset link has expired. Please request a new one.";
      } else if (error.code === 'auth/invalid-action-code') {
        errorMessage = "Invalid password reset link. Please request a new one.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Please use a stronger password.";
      }
      
      toast.error(errorMessage, {
        position: "bottom-center",
      });
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToLogin = () => {
    navigate("/");
    setTimeout(() => {
      const loginEvent = new CustomEvent('openLoginModal');
      window.dispatchEvent(loginEvent);
    }, 100);
  };

  if (error) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="reset-password-header">
            <div className="reset-password-logo">
              <div className="reset-password-logo-text">
                <span className="reset-password-fit-text">Fit</span>
                <span className="reset-password-x-text">X</span>
              </div>
            </div>
          </div>
          
          <div className="reset-password-content">
            <div className="reset-password-error-message">
              <div className="reset-password-error-icon">!</div>
              <h2>Reset Link Invalid</h2>
              <p>{error}</p>
              <button className="reset-password-login-button" onClick={handleGoToLogin}>
                GO TO LOGIN
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="reset-password-header">
          <div className="reset-password-logo">
            <div className="reset-password-logo-text">
              <span className="reset-password-fit-text">Fit</span>
              <span className="reset-password-x-text">X</span>
            </div>
          </div>
        </div>
        
        <div className="reset-password-content">
          {!isPasswordReset ? (
            <>
              <h2>Create New Password</h2>
              {email && (
                <p>Set a new password for your account: <strong>{email}</strong></p>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="reset-password-form-group reset-password-group">
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder=" "
                    disabled={isSubmitting}
                  />
                  <label htmlFor="password">New Password</label>
                  
                  {password && (
                    <div className="reset-password-strength-container">
                      <div className="reset-password-strength-meter">
                        <div 
                          className={`reset-password-strength-value reset-password-strength-${passwordStrength}`} 
                          style={{ width: `${(passwordStrength / 4) * 100}%` }}
                        ></div>
                      </div>
                      <div className="reset-password-strength-text">
                        {passwordStrength === 0 && "Very Weak"}
                        {passwordStrength === 1 && "Weak"}
                        {passwordStrength === 2 && "Fair"}
                        {passwordStrength === 3 && "Good"}
                        {passwordStrength === 4 && "Strong"}
                      </div>
                    </div>
                  )}
                  
                  {password && (
                    <div className="reset-password-requirements">
                      <div className={`reset-password-requirement ${passwordValidation.minLength ? "reset-password-valid" : "reset-password-invalid"}`}>
                        <span className="reset-password-check-icon">{passwordValidation.minLength ? "✓" : "✗"}</span>
                        <span>At least 8 characters</span>
                      </div>
                      <div className={`reset-password-requirement ${passwordValidation.hasUpperCase ? "reset-password-valid" : "reset-password-invalid"}`}>
                        <span className="reset-password-check-icon">{passwordValidation.hasUpperCase ? "✓" : "✗"}</span>
                        <span>At least 1 uppercase letter</span>
                      </div>
                      <div className={`reset-password-requirement ${passwordValidation.hasLowerCase ? "reset-password-valid" : "reset-password-invalid"}`}>
                        <span className="reset-password-check-icon">{passwordValidation.hasLowerCase ? "✓" : "✗"}</span>
                        <span>At least 1 lowercase letter</span>
                      </div>
                      <div className={`reset-password-requirement ${passwordValidation.hasNumbers ? "reset-password-valid" : "reset-password-invalid"}`}>
                        <span className="reset-password-check-icon">{passwordValidation.hasNumbers ? "✓" : "✗"}</span>
                        <span>At least 1 number</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="reset-password-form-group">
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder=" "
                    disabled={isSubmitting}
                  />
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  
                  {password && confirmPassword && password !== confirmPassword && (
                    <div className="reset-password-error">Passwords do not match</div>
                  )}
                </div>
                
                <button 
                  type="submit" 
                  className="reset-password-button" 
                  disabled={isSubmitting || !passwordValidation.isValid || password !== confirmPassword}
                >
                  {isSubmitting ? "RESETTING..." : "RESET PASSWORD"}
                </button>
              </form>
            </>
          ) : (
            <div className="reset-password-success">
              <div className="reset-password-success-icon">✓</div>
              <h2>Password Reset Complete</h2>
              <p>
                Your password has been successfully reset. You can now log in with your new password.
              </p>
              <button className="reset-password-login-button" onClick={handleGoToLogin}>
                GO TO LOGIN
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;