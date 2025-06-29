// Author: 7100 //

import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import './CookieConsent.css';

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const consentCookie = Cookies.get('cookie_consent');
    if (!consentCookie) {

      setVisible(true);
    }
  }, []);
  
  const acceptCookies = () => {
    // Set cookie consent to accepted for 1 year
    Cookies.set('cookie_consent', 'accepted', { 
      expires: 365, 
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });
    setVisible(false);
  };
  
  const declineCookies = () => {
    // Set cookie consent to declined for 1 year
    Cookies.set('cookie_consent', 'declined', { 
      expires: 365, 
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });
    setVisible(false);
  };
  
  if (!visible) return null;
  
  return (
    <div className="cookie-consent">
      <div className="cookie-content">
        <h3>Cookie Notice</h3>
        <p>
          We use cookies to enhance your experience on our website and to remember your chat conversations. 
          By clicking "Accept", you consent to our use of cookies. You can decline if you prefer not to 
          save your chat history between visits.
        </p>
        <div className="cookie-buttons">
          <button 
            className="cookie-button accept"
            onClick={acceptCookies}
          >
            Accept
          </button>
          <button 
            className="cookie-button decline"
            onClick={declineCookies}
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;