// Authors: 7100, 7144 //

import React, { useState, useEffect } from 'react';
import './About.css';
import facility1 from '../../assets/facility1.png'; 
import facility2 from '../../assets/facility2.png';
import facility3 from '../../assets/facility3.png';

const About = () => {
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const carouselImages = [
    {
      id: 1,
      src: facility1,
      alt: "Modern gym equipment"
    },
    {
      id: 2,
      src: facility2,
      alt: "Spacious workout area"
    },
    {
      id: 3,
      src: facility3,
      alt: "Luxury spa and relaxation area"
    }
  ];
  
  const faqData = [
    {
      id: 1,
      question: "What are your gym hours?",
      answer: "Our gym is open 24/7 with membership card access. Our staffed hours are Monday to Friday from 6:00 AM to 12:00 PM, and weekends from 6:00 AM to 9:00 PM. You can access our facilities anytime with your membership card."
    },
    {
      id: 2,
      question: "What membership options do you offer?",
      answer: "We offer three membership tiers: Basic ($29.99/month) which includes full gym access, locker use, and 24/7 access; Standard ($49.99/month) which includes all Basic features plus unlimited group classes and spa access; and Premium ($79.99/month) which includes all Standard features plus personal training (2x/week), recovery area access, and guest passes (2/month)."
    },
    {
      id: 3,
      question: "How do I sign up for a membership?",
      answer: "The sign-up process is simple: First, visit our website and click the 'Sign Up' button or 'JOIN NOW' in our membership section. Second, select your desired membership plan (Basic, Standard, or Premium). Third, complete the registration form with your personal details and payment information. After signing up, you can immediately start booking sessions and creating your personalized fitness program."
    },
    {
      id: 4,
      question: "What classes do you offer?",
      answer: "We offer a variety of group classes including Spin Class led by Michelle Park, Bootcamp led by James Wilson, Yoga Flow led by Alex Rodriguez, and Strength Circuit led by Sarah Johnson. Classes are scheduled throughout the week with different options available each day. Check our weekly schedule for specific timings and availability."
    },
    {
      id: 5,
      question: "Can I book sessions with personal trainers?",
      answer: "Yes, we offer personal training sessions with our expert coaches. You can book private sessions with all our coaches based on their availability through our online booking system. Our trainers include Sarah Johnson (Strength training), Michael Chen (Yoga & Mobility), James Wilson (Performance), and Taylor Williams (Nutrition & Weight Loss), each specializing in different fitness areas."
    },
    {
      id: 6,
      question: "What facilities are available at your gym?",
      answer: "Our facilities include Studio A (for Spin Classes), Studio B (for Yoga Flow), Main Floor (for Bootcamp sessions), Weight Area (for Strength Circuit), spa facilities (for Standard and Premium members), recovery area (for Premium members only), locker facilities, and 24/7 secure access. Our modern equipment and specialized training areas cater to all fitness needs."
    },
    {
      id: 7,
      question: "How does the booking system work?",
      answer: "Our online booking system allows members to easily book private sessions with trainers or group classes. You can view available sessions in a weekly view, select any day of the week, and see available times. All bookings are updated in real-time, and you can view all your booked sessions in the 'My Bookings' section. The system also provides personalized recommendations based on your booking history."
    },
    {
      id: 8,
      question: "What is the 'Create Your Fitness Journey' program?",
      answer: "Our 'Create Your Fitness Journey' is a 4-step personalized program creation process. First, choose your goal (Build Strength, Boost Endurance, or Overall Fitness). Second, select your preferred workout intensity level. Third, set your desired timeframe for achieving goals. Finally, based on your selections, we create a customized fitness program tailored to your specific needs and preferences."
    },
    {
      id: 9,
      question: "How can I contact FitX for support?",
      answer: "You can contact us by phone at (555) 123-4567 or by email at fitx.help1@gmail.com. Our staff is available during our staffed hours (Monday-Friday 6:00 AM-12:00 PM, Saturday-Sunday 6:00 AM-9:00 PM) to assist you with any questions or concerns you might have about our services or facilities."
    },
    {
      id: 10,
      question: "What's included in your weekly class schedule?",
      answer: "Our weekly class schedule includes: Monday (Spin Class, Bootcamp), Tuesday (Bootcamp, Yoga Flow), Wednesday (Spin Class, Yoga Flow, Strength Circuit), Thursday (Bootcamp, Strength Circuit), Friday (Spin Class, Yoga Flow), Saturday (Strength Circuit), and Sunday (Yoga Flow). All classes are led by certified instructors and designed to accommodate various fitness levels."
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % carouselImages.length);
    }, 5000); 
    
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const toggleQuestion = (id) => {
    setActiveQuestion(activeQuestion === id ? null : id);
  };
  
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="about-page">
      <div className="hero-section">
        <div className="carousel-container">
          {carouselImages.map((image, index) => (
            <div
              key={image.id}
              className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
            >
              <img 
                src={image.src} 
                alt={image.alt}
                className="carousel-image"
              />
            </div>
          ))}
          
          <div className="carousel-controls">
            <div className="carousel-dots">
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                ></button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="hero-about">
          <h1 className="slogan_about">Our Facilities</h1>
        </div>
      </div>

      <div className="our-story-section">
        <div className="story-container">
          <div className="story-header">
            <h2 className="story-title">Our Story</h2>
            <div className="title-underline"></div>
          </div>
          
          <div className="story-content">
            <div className="story-timeline">
              <div className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <h3>The Beginning</h3>
                  <p>We began our journey in 2010 from a small studio filled with equipment. Today, we are as passionate about fitness and wellbeing as ever and continue to expand our horizons.</p>
                </div>
              </div>
              
              <div className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <h3>Growth & Expansion</h3>
                  <p>In 2015, we increased our facilities with sophisticated equipment, special training areas, and our first group fitness classes that changed how our members approached their fitness journey.</p>
                </div>
              </div>
              
              <div className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <h3>Today</h3>
                  <p>We've created a great fitness community and evolved into a leading fitness destination (multiple locations). Our approach combines cutting-edge equipment, coaching, nutrition and recovery in one place.</p>
                </div>
              </div>
            </div>
            
            <div className="story-quote">
              <blockquote>
                "We don't just build better bodies, we build better lives through the transformative power of fitness."
              </blockquote>
              <cite>— Founder & Head Coach</cite>
            </div>
          </div>
        </div>
      </div>

      <div className="faq-section">
        <div className="faq-header">
          <h1 className="faq-title" data-shadow-text="FAQ">FREQUENTLY ASKED QUESTIONS</h1>
        </div>
        
        <div className="faq-container">
          {faqData.map((item) => (
            <div 
              key={item.id} 
              className="faq-item"
            >
              <div 
                className="faq-question"
                onClick={() => toggleQuestion(item.id)}
              >
                <span>{item.question}</span>
                <span className={`faq-icon ${activeQuestion === item.id ? 'active' : ''}`}>
                  &#x25BC;
                </span>
              </div>
              {activeQuestion === item.id && (
                <div className="faq-answer">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;