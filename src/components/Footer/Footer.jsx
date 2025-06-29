// Authors: 7100, 7144 //

import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-column">
        <div className="logo">
              <div className="logo-text">
                <span className="fit-text">Fit</span>
                <span className="x-text">X</span>
              </div>
          </div>
          <p className="footer-description">
            Dedicated to helping you achieve your fitness goals through expert coaching and a supportive community.
          </p>
          
        </div>
        
        <div className="footer-column">
          <h3 className="footer-heading">Quick Links</h3>
          <ul className="footer-links">
            <li><a href="/">Home</a></li>
            <li><a href="/services">Services</a></li>
            <li><a href="/membership">Membership</a></li>
            <li><a href="/about">About</a></li>
            
          </ul>
        </div>
        
        <div className="footer-column">
          <h3 className="footer-heading">Contact Us</h3>
          <div className="footer-contact">
            <p><i className="location"></i> 123 Fitness Street, Gym City</p>
            <p><i className="phone"></i> (555) 123-4567</p>
            <p><i className="mail"></i> fitx.help1@gmail.com</p>
          </div>
          
          <h3 className="footer-heading gym-hours">Gym Hours</h3>
          <div className="footer-hours">
            <p>Monday - Friday: 6:00 AM - 12:00 PM</p>
            <p>Saturday - Sunday: 6:00 AM - 9:00 PM</p>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="footer-container">
          <p className="copyright">© {currentYear}  FitX. All Rights Reserved.</p>
          <div className="footer-legal">
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;