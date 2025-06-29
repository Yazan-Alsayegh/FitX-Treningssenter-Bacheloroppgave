// Authors: 7100, 7094, 7099, 7144 //

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Services.css';
import BookingSystem from './BookingSystem';
import FitnessGoalVisualizer from '../../components/SmartFeatures/FitnessGoalVisualizer';
import SarahCoach from '../../assets/Sarah_coach.png';
import AlexCoach from '../../assets/Alex_coach.png';
import JamesCoach from '../../assets/James_coach.png';
import MichelleCoach from '../../assets/Michelle_coach.png';
import heroServicesImg from '../../assets/hero_services.png';

const Services = () => {
  const [selectedProgram, setSelectedProgram] = useState({
    title: "Personal Training",
    description: "Experience an intense, full-body workout designed to push your limits and achieve maximum results.",
    duration: "60 MINUTES",
    intensity: "HIGH",
    fitnessLevel: "ADVANCED",
    schedule: "MONDAY, FRIDAY",
    instructor: "Sarah Johnson",
    instructorImg: SarahCoach
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated } = useAuth(); 
  const navigate = useNavigate(); 
  
  
  const handleButtonClick = () => {
    if (isAuthenticated) {
      
      navigate('/mybookings');
    } else {
      
      navigate('/signup');
    }
  };

  const trainingPrograms = [
    {
      id: 1,
      title: "Personal Training",
      icon: "🏋️",
      description: "One-on-one sessions with expert trainers tailored to your specific fitness goals",
      details: {
        description: "Experience an intense, full-body workout designed to push your limits and achieve maximum results.",
        duration: "60 MINUTES",
        intensity: "HIGH",
        fitnessLevel: "ADVANCED",
        schedule: "MONDAY, FRIDAY",
        instructor: "Sarah Johnson",
        instructorImg: SarahCoach
      }
    },
    {
      id: 2,
      title: "Group Classes",
      icon: "👥",
      description: "High-energy group workouts led by certified instructors in various disciplines",
      details: {
        description: "Join our energetic group sessions where you'll be motivated by others while our instructors guide you through effective workouts.",
        duration: "45 MINUTES",
        intensity: "MEDIUM-HIGH",
        fitnessLevel: "ALL LEVELS",
        schedule: "TUESDAY, THURSDAY, SATURDAY",
        instructor: "Alex Rodriguez",
        instructorImg: AlexCoach
      }
    },
    {
      id: 3,
      title: "Specialized Programs",
      icon: "🎯",
      description: "Custom programs for weight loss, muscle gain, and athletic performance",
      details: {
        description: "Focused training programs designed specifically for your goals, whether it's weight loss, muscle building, or sports performance.",
        duration: "75 MINUTES",
        intensity: "VARIES",
        fitnessLevel: "CUSTOMIZED",
        schedule: "FLEXIBLE",
        instructor: "James Wilson",
        instructorImg: JamesCoach
      }
    },
    {
      id: 4,
      title: "HIIT Training",
      icon: "⏱️",
      description: "High-intensity interval training sessions for maximum results in minimum time",
      details: {
        description: "Short bursts of intense exercise followed by recovery periods. The most efficient way to burn calories and improve cardiovascular health.",
        duration: "30 MINUTES",
        intensity: "VERY HIGH",
        fitnessLevel: "INTERMEDIATE-ADVANCED",
        schedule: "MONDAY, WEDNESDAY, FRIDAY",
        instructor: "Michelle Park",
        instructorImg: MichelleCoach
      }
    },
  ];

  const handleProgramClick = (program) => {
    setSelectedProgram(program.details);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="Services-container">
      <div className="hero-section">
        <img src={heroServicesImg} alt="Our services" className="hero-image" />
        <div className="hero-services">
          <h1 className="slogan_services">Our Services</h1>
          <div className="button-container">
            <button 
              onClick={handleButtonClick} 
              className={isAuthenticated ? "MyBookings-button" : "JoinUs-button"}
            >
              {isAuthenticated ? "My Bookings" : "Join Us"}
            </button>
          </div>
        </div>
      </div>

      <div className="training-programs-section">
        <h2 className="training-title" data-shadow-text="PROGRAMS">Training Programs</h2>
        
        <div className="programs-grid">
          {trainingPrograms.map((program) => (
            <div 
              key={program.id} 
              className="program-card"
              onClick={() => handleProgramClick(program)}
            >
              <div className="program-icon">{program.icon}</div>
              <h3>{program.title}</h3>
              <p>{program.description}</p>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={closeModal}>&times;</button>
            
            <div className="class-details-container">
              <div className="class-info">
                <h2>CLASS DETAILS</h2>
                <p>{selectedProgram.description}</p>
                
                <div className="class-specs">
                  <div className="spec-item">
                    <span className="spec-icon">🕒</span>
                    <span className="spec-label">DURATION:</span>
                    <span className="spec-value">{selectedProgram.duration}</span>
                  </div>
                  
                  <div className="spec-item">
                    <span className="spec-icon">🔥</span>
                    <span className="spec-label">INTENSITY:</span>
                    <span className="spec-value">{selectedProgram.intensity}</span>
                  </div>
                  
                  <div className="spec-item">
                    <span className="spec-icon">📊</span>
                    <span className="spec-label">FITNESS LEVEL:</span>
                    <span className="spec-value">{selectedProgram.fitnessLevel}</span>
                  </div>
                  
                  <div className="spec-item">
                    <span className="spec-icon">📅</span>
                    <span className="spec-label">SCHEDULE:</span>
                    <span className="spec-value">{selectedProgram.schedule}</span>
                  </div>
                </div>
                
                <div className="instructor-info">
                  <h3>INSTRUCTOR</h3>
                  <div className="instructor-profile">
                    <div className="instructor-image">
                      <img src={selectedProgram.instructorImg} alt={selectedProgram.instructor} style={{ width: 80, height: 80, borderRadius: '50%' }} />
                    </div>
                    <div className="instructor-name">{selectedProgram.instructor}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <BookingSystem />
      <FitnessGoalVisualizer/>
    </div>    
  );
};

export default Services;