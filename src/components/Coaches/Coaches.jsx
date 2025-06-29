// Authors: 7100, 7099 //

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Coaches.css';
import sarahCoach from '../../assets/Sarah_coach.png';
import michaelCoach from '../../assets/Michael_coach.png';
import jamesCoach from '../../assets/James_coach.png';
import taylorCoach from '../../assets/Taylor_coach.png';

const Coaches = () => {
  const [selectedCoach, setSelectedCoach] = useState(null);
  const navigate = useNavigate(); 

  const coaches = [
    {
      id: 1,
      name: 'Sarah Johnson',
      image: sarahCoach,
      title: 'Head Fitness Coach',
      specialties: [
        'Strength Training',
        'HIIT Workouts',
        'Nutrition Planning'
      ],
      bio: 'Sarah has over 10 years of experience in fitness training with certifications in strength conditioning and nutritional science. She specializes in helping clients achieve balanced fitness goals.'
    },
    {
      id: 2,
      name: 'Michael Chen',
      image: michaelCoach,
      title: 'Yoga & Mobility Specialist',
      specialties: [
        'Vinyasa Yoga',
        'Mobility Training',
        'Injury Rehabilitation'
      ],
      bio: 'Michael brings a holistic approach to fitness with his background in physical therapy and advanced yoga training. He helps clients improve flexibility, prevent injuries, and develop mindful movement practices.'
    },
    {
      id: 3,
      name: 'James Wilson',
      image: jamesCoach,
      title: 'Performance Coach',
      specialties: [
        'Sports Conditioning',
        'Olympic Lifting',
        'Athletic Performance'
      ],
      bio: 'James works with athletes of all levels to improve performance through advanced training techniques. His background in sports science allows him to create targeted programs for specific athletic goals.'
    },
    {
      id: 4,
      name: 'Taylor Williams',
      image: taylorCoach,
      title: 'Nutrition Specialist',
      specialties: [
        'Sports Nutrition',
        'Meal Planning',
        'Performance-Based Diets'
      ],
      bio: 'Taylor provides expert guidance on nutrition strategies tailored for fitness and athletic performance. She designs personalized plans to fuel training, enhance recovery, and achieve health goals.'
    }
  ];

  const handleCoachClick = (coach) => {
    setSelectedCoach(coach.id === selectedCoach ? null : coach.id);
  };

  const closeModal = () => {
    setSelectedCoach(null);
  };

  const navigateToBooking = (coachId) => {
    closeModal();

    if (window.location.pathname.includes('/services')) {
      const bookingElement = document.querySelector('.booking-system');
      if (bookingElement) {
        bookingElement.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/services?coach=${coachId}#booking-system`);
    }
  };

  return (
    <section className="coaches-section">
      <div className="coaches-header">
        <h1 className="coaches-title" data-shadow-text="COACHES">OUR COACHES</h1>
      </div>
      
      <div className="coaches-cards">
        {coaches.map(coach => (
          <div 
            className="coach-card" 
            key={coach.id}
            onClick={() => handleCoachClick(coach)}
          >
            <div className="coach-image">
              <img src={coach.image} alt={coach.name} />
            </div>
            <div className="coach-info">
              <h2 className="coach-name">{coach.name}</h2>
              <p className="coach-title">{coach.title}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedCoach && (
        <div className="coach-modal-overlay" onClick={closeModal}>
          <div className="coach-modal" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={closeModal}>×</button>
            
            {coaches.filter(coach => coach.id === selectedCoach).map(coach => (
              <div className="coach-details" key={coach.id}>
                <div className="coach-modal-header">
                  <img src={coach.image} alt={coach.name} className="coach-modal-image" />
                  <div>
                    <h2 className="coach-modal-name">{coach.name}</h2>
                    <p className="coach-modal-title">{coach.title}</p>
                  </div>
                </div>
                
                <div className="coach-modal-bio">
                  <p>{coach.bio}</p>
                </div>
                
                <div className="coach-specialties">
                  <h4>Specializations</h4>
                  <ul>
                    {coach.specialties.map((specialty, index) => (
                      <li key={index}>{specialty}</li>
                    ))}
                  </ul>
                </div>
                
                <button 
                  className="schedule-button"
                  onClick={() => navigateToBooking(coach.id)}
                >
                  Schedule a Session
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default Coaches;