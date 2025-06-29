// Authors: 7100, 7094, 7144 //

import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "../../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../Firebase";
import { toast } from "react-toastify";
import GymOccupancy from "../GymCapacity/GymCapacity";

const Navbar = ({ onLoginClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]); 

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully", {
        position: "top-center",
      });
      navigate("/");
    } catch (error) {
      toast.error("Error logging out", {
        position: "bottom-center",
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          <div className="logo">
            <Link to="/">
              <div className="logo-text">
                <span className="fit-text">Fit</span>
                <span className="x-text">X</span>
              </div>
            </Link>
          </div>

          <div className="desktop-nav">
            <Link to="/">HOME</Link>
            <Link to="/services">SERVICES</Link>
            <Link to="/membership">MEMBERSHIP</Link>
            <Link to="/about">ABOUT</Link>
          </div>

          <div className="auth-buttons">
            <GymOccupancy />
            
            {isAuthenticated ? (
              <div className="user-profile" ref={dropdownRef}>
                <div 
                  className="profile-container" 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <div className="profile-info">
                    <span className="user-greeting">
                      {currentUser.email.split('@')[0].toUpperCase()}
                    </span>
                    <div className="profile-image">
                      <i className="icon-user"></i>
                    </div>
                    <span className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}>
                      ▼
                    </span>
                  </div>
                </div>
                
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <Link to="/myprofile" onClick={() => setDropdownOpen(false)}>
                      My Profile
                    </Link>
                    <Link to="/mybookings" onClick={() => setDropdownOpen(false)}>
                      My Bookings
                    </Link>
                    <button onClick={handleLogout}>
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button className="login-button" onClick={onLoginClick}>
                  LOG IN
                </button>
                <button onClick={() => navigate("/signup")} className="sign-up-button"> 
                  SIGN UP
                </button>
              </>
            )}
          </div>

          <div className="mobile-menu-button">
            <button onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-nav">
          <div className="mobile-nav-content">
            <div className="mobile-header">
              <div className="mobile-logo">
                <span className="fit-text">Fit</span>
                <span className="x-text">X</span>
              </div>
              
              <div className="mobile-top-gym-status">
                <GymOccupancy isMobile={true} />
              </div>
              
              <button 
                className="mobile-close-button" 
                onClick={() => setMenuOpen(false)}
              >
                ✕
              </button>
            </div>
            
            {isAuthenticated && (
              <div className="mobile-user-profile">
                <div className="profile-info-mobile">
                  <div className="profile-image-mobile">
                    <i className="icon-user"></i>
                  </div>
                  <div className="mobile-user-links">
                    <div className="user-greeting-mobile">
                      {currentUser.email.split('@')[0].toUpperCase()}
                    </div>
                    <div className="mobile-dropdown-links">
                      <Link to="/myprofile" onClick={() => setMenuOpen(false)}>
                        My Profile
                      </Link>
                      <Link to="/mybookings" onClick={() => setMenuOpen(false)}>
                        My Bookings
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mobile-nav-links">
              <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link to="/services" onClick={() => setMenuOpen(false)}>Services</Link>
              <Link to="/membership" onClick={() => setMenuOpen(false)}>Membership</Link>
              <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>
            </div>
            
            {!isAuthenticated ? (
              <div className="mobile-auth-buttons">
                <button className="login-button" onClick={() => { 
                  setMenuOpen(false); 
                  onLoginClick(); 
                }}>
                  LOG IN
                </button>
                <Link to="/signup" className="sign-up-button" onClick={() => setMenuOpen(false)}>
                  SIGN UP
                </Link>
              </div>
            ) : (
              <div className="mobile-auth-buttons">
                <button className="logout-button" onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}>
                  LOG OUT
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;