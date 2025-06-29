// Authors: 7100, 7094, 7099, 7144 //

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../components/Firebase";
import { toast } from "react-toastify";
import "./Login.css";

const Login = ({ isOpen, onClose, onForgotPassword }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen !== false) {
      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');
      
      if (emailInput && email) {
        emailInput.setAttribute('value', email);
      }
      
      if (passwordInput && password) {
        passwordInput.setAttribute('value', password);
      }
    }
  }, [email, password, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("User Logged in Successfully");
      toast.success("User Logged in Successfully", {
        position: "top-center",
      });
    
      if (onClose) onClose(); 
      navigate("/"); 
    } catch (error) {
      console.log(error.message);
      toast.error(error.message, {
        position: "bottom-center",
      });
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (onClose) onClose(); 
    if (onForgotPassword) onForgotPassword();
    else navigate("/forgot-password"); 
  };
  
  const handleClose = () => {
    if (onClose) {
      onClose(); 
    } else {
      navigate("/"); 
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (isOpen === false) {
    return null;
  }

  const handleContainerClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="login-popup-overlay" onClick={handleClose}>
      <div className="login-popup-container" onClick={handleContainerClick}>
        <div className="login-header">
          <div className="logo">
            <div className="logo-text">
              <span className="fit-text">Fit</span>
              <span className="x-text">X</span>
            </div>
          </div>
          <button className="login-close" onClick={handleClose}>×</button>
        </div>

        <div className="login-content">
          <h2>Welcome Back</h2>
          <p>Enter your credentials to access your account</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder=""
              />
              <label htmlFor="email">Email</label>
            </div>

            <div className="form-group password-group">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder=""
              />
              <label htmlFor="password">Password</label>
              <button 
                type="button" 
                className="toggle-password" 
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                    <line x1="2" y1="2" x2="22" y2="22" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            <div className="form-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember">Remember me</label>
              </div>
              <div className="forgot-password">
                <a href="#forgot-password" onClick={handleForgotPassword}>
                  Forgot Password?
                </a>
              </div>
            </div>

            <button type="submit" className="Login-button">LOG IN</button>
          </form>

          <div className="separator">
            <span>OR</span>
          </div>

          <div className="signup-prompt">
            Don't have an account? <a href="/signup">Sign Up</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;