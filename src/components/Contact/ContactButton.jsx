// Authors: 7100, 7144 //

import React, { useState } from 'react';
import ContactPopup from './ContactPopup';
import './ContactPopup.css';

const ContactButton = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const openPopup = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <>
      <button className="contact-trigger-button" onClick={openPopup}>
        <span className="contact-trigger-icon">Contact Us</span>
      </button>
      <ContactPopup isOpen={isPopupOpen} onClose={closePopup} />
    </>
  );
};

export default ContactButton;