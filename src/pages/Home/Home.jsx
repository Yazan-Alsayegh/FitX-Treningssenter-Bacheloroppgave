// Authors: 7100, 7094, 7099, 7144 //

import React from 'react';
import './Home.css';
import Plans from '../../components/Plans/Plans';
import Coaches from '../../components/Coaches/Coaches';
import heroVideo from '../../assets/hero1.mp4';
import img from '../../assets/Services_img.jpeg';
import img2 from '../../assets/Services_img2.jpeg'; 
import { useAuth } from '../../context/AuthContext'; 
import { useNavigate } from 'react-router-dom';



const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate(); 
  
  const handleButtonClick = () => {
    if (isAuthenticated) {
      navigate('/Services');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="homepage">
      <section className="hero-section">
        <div className="video-container">
          <video autoPlay muted loop className="background-video">
            <source src={heroVideo} type="video/mp4" />
          </video>
        </div>
        
        <div className="hero-content">
          <h1 className="slogan">Elevate Your Performance</h1>
          <button 
            onClick={handleButtonClick} 
            className={isAuthenticated ? "BookSession-button" : "JoinUs-button"}
          >
            {isAuthenticated ? "Book a Session" : "Join Us"}
          </button>
        </div>
      </section>

      <section className="training-services">
        <div className="services-title-wrapper">
          <h2 className="services-title" data-shadow-text="SERVICES">
            OUR TRAINING SERVICES
          </h2>
        </div>
        
        <div className="services-container">
          <div className="service-card">
            <div className="service-image">
              <img src={img} alt="Personal Training" />
            </div>
            <p className="service-text">Personal Training</p>
            <a href="/services" className="learn-more-button">Learn More</a>
          </div>
          
          <div className="service-card">
            <div className="service-image">
            <img src={img2} alt="Group Classes" />
            </div>
            <p className="service-text">Group Classes</p>
            <a href="/services" className="learn-more-button">Learn More</a>
          </div>
        </div>
      </section>
      
      <Plans />  
      <Coaches />
     
    </div>
  );
};

export default Home;