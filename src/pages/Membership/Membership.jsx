// Authors: 7100, 7099, 7144 //

import React, { useState } from 'react';
import './Membership.css';
import Plans from '../../components/Plans/Plans';
import { useAuth } from '../../context/AuthContext'; 
import { useNavigate } from 'react-router-dom'; 

const Membership = () => {
  const { isAuthenticated } = useAuth(); 
  const navigate = useNavigate(); 
  
  const testimonialData = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Member since 2022",
      text: "Joining this gym was one of the best decisions I've made. The trainers are knowledgeable and supportive, and the community atmosphere keeps me motivated. I've lost 25 pounds and feel stronger than ever!"
    },
    {
      id: 2,
      name: "Marcus Chen",
      role: "Member since 2021",
      text: "As someone who was intimidated by gyms for years, I can't believe how comfortable I feel here now. The staff took time to help me develop a personalized fitness plan, and the results speak for themselves. My endurance has improved tremendously."
    },
    {
      id: 3,
      name: "Jessica Williams",
      role: "Member since 2023",
      text: "The variety of classes here keeps my workouts fresh and exciting! From HIIT to yoga, there's always something that fits my mood. The instructors are passionate and the equipment is always well-maintained."
    },
    {
      id: 4,
      name: "Robert Torres",
      role: "Member since 2020",
      text: "After trying several gyms in the area, this is the only one where I've stuck with my routine for over three years. The 24/7 access fits my busy schedule, and the personal training sessions have helped me correct my form and prevent injuries."
    },
    {
      id: 5,
      name: "Aisha Patel",
      role: "Member since 2022",
      text: "I love the community events and challenges this gym organizes! It's more than just a place to work out - it's a supportive community that celebrates everyone's fitness journey. I've made great friends here while getting in the best shape of my life."
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    const isFirstTestimonial = currentIndex === 0;
    const newIndex = isFirstTestimonial ? testimonialData.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastTestimonial = currentIndex === testimonialData.length - 1;
    const newIndex = isLastTestimonial ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const handleButtonClick = () => {
    if (isAuthenticated) {
      navigate('/myprofile');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="membership-container">
      <section className="membership-hero">
        <div className="hero-content">
          <h1 className="slogan">Transform Your Fitness Journey</h1>
          <button 
            onClick={handleButtonClick} 
            className={isAuthenticated ? "Profile-button" : "JoinUs-button"}
          >
            {isAuthenticated ? "MY PROFILE" : "Join Us"}
          </button>
        </div>
        <div className="hero-overlay"></div>
      </section>
      
      <section className="Plans">
        <Plans />  
      </section>
      
      <section className="testimonials-container">
        <div className="testimonials-title-wrapper">
          <h2 className="testimonials-title" data-shadow-text="TESTIMONIALS">
            What Our Members Say
          </h2>
        </div>
        
        <div className="testimonials-content">
          <div className="testimonial-card">
            <div className="testimonial-image-container">
              <div className="testimonial-image">
                <div className="Icon-user-container">
                  <span className="Icon-user"></span>
                </div>
              </div>
            </div>
            
            <div className="testimonial-text-content">
              <p className="testimonial-quote">"{testimonialData[currentIndex].text}"</p>
              <div className="testimonial-author">
                <h3>{testimonialData[currentIndex].name}</h3>
                <p>{testimonialData[currentIndex].role}</p>
              </div>
            </div>
          </div>
          
          <div className="testimonial-controls">
            <button className="control-button" onClick={goToPrevious}>
              Previous
            </button>
            <div className="testimonial-indicators">
              {testimonialData.map((_, index) => (
                <span 
                  key={index} 
                  className={`indicator ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
            <button className="control-button" onClick={goToNext}>
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Membership;