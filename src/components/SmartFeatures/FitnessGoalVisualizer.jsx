// Authors: 7100, 7094 //

import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, Timestamp, doc, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../Firebase'; 
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BookingConfirmation from '../../utils/BookingConfirmation'; 
import './FitnessGoalVisualizer.css';

const FitnessGoalVisualizer = () => {
  const bookingConfirmation = new BookingConfirmation();
  
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendedClasses, setRecommendedClasses] = useState([]);
  const [today] = useState(new Date());
  const [currentStep, setCurrentStep] = useState(1);
  const [intensity, setIntensity] = useState('medium');
  const [timePeriod, setTimePeriod] = useState('4-weeks');
  const [isFullProgramVisible, setIsFullProgramVisible] = useState(false);
  const [fullProgramClasses, setFullProgramClasses] = useState([]);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [userBookings, setUserBookings] = useState([]);

  const goals = [
    {
      id: 'strength',
      label: 'Build Strength',
      iconClass: 'icon-strength',
      color: '#E63946',
      description: 'Increase muscle mass and overall body strength',
      recommendClasses: (availableClasses, intensity) => {
        const strengthClasses = availableClasses.filter(cls => 
          ['Strength Circuit', 'Bootcamp'].includes(cls.name)
        );
        return strengthClasses;
      }
    },
    {
      id: 'endurance',
      label: 'Boost Endurance',
      iconClass: 'icon-endurance',
      color: '#457B9D',
      description: 'Improve stamina and cardiovascular health',
      recommendClasses: (availableClasses, intensity) => {
        const enduranceClasses = availableClasses.filter(cls => 
          ['Spin Class', 'Bootcamp'].includes(cls.name)
        );
        return enduranceClasses;
      }
    },
    {
      id: 'overall',
      label: 'Overall Fitness',
      iconClass: 'icon-overall',
      color: '#F9C74F',
      description: 'Achieve a well-rounded approach to fitness and health',
      recommendClasses: (availableClasses, intensity) => {
        return availableClasses;
      }
    }
  ];

  // Intensity options
  const intensityOptions = [
    { value: 'light', label: 'Light', description: 'Gentle progression with lower intensity workouts' },
    { value: 'medium', label: 'Medium', description: 'Moderate challenge with balanced intensity' },
    { value: 'high', label: 'High', description: 'Maximum results with high intensity training' }
  ];

  // Time period options
  const timePeriodOptions = [
    { value: '2-weeks', label: '2 Weeks', description: 'Short-term kickstart program' },
    { value: '4-weeks', label: '4 Weeks', description: 'Standard one-month program' },
    { value: '8-weeks', label: '8 Weeks', description: 'Extended transformation program' }
  ];

  // Check if the user is authenticated
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      if (user) {
        fetchUserBookings(user.uid);
      } else {
        setUserBookings([]);
      }
    });
    
    return () => {
      unsubscribeAuth();
    };
  }, []);

  // Fetch user's bookings
  const fetchUserBookings = async (userId) => {
    try {
      const bookingsQuery = query(collection(db, "bookings"), where("userId", "==", userId));
      
      const snapshot = await getDocs(bookingsQuery);
      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserBookings(bookings);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      toast.error("Failed to load your bookings");
    }
  };

  const formatDateForComparison = (date) => {
    return date.getFullYear() + "-" + 
           String(date.getMonth() + 1).padStart(2, "0") + "-" + 
           String(date.getDate()).padStart(2, "0");
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Check if class is full
  const isClassFull = (classItem) => {
    if (!classItem) return false;
    
    const [taken, total] = classItem.spots.split('/').map(num => parseInt(num.trim(), 10));
    return taken >= total;
  };

  // Check if user has already booked this class
  const hasUserBookedClass = (classId, date) => {
    if (!userBookings.length) return false;
    
    const formattedSelectedDate = formatDateForComparison(date);
    
    const normalizedInputId = classId.toString().startsWith('class') 
      ? classId 
      : `class${classId}`;
    
    return userBookings.some(booking => {
      if (!booking.classId || !booking.date) return false;
      
      const bookingDate = booking.date.toDate();
      const formattedBookingDate = formatDateForComparison(bookingDate);
      
      const normalizedBookingId = booking.classId.toString().startsWith('class') 
        ? booking.classId 
        : `class${booking.classId}`;
      
      return normalizedBookingId === normalizedInputId && 
             formattedBookingDate === formattedSelectedDate;
    });
  };

  // Handle class booking with date-specific availability
  const handleClassBooking = async (classItem) => {
    try {
      if (!currentUser) {
        toast.warning("Please sign in to book a class");
        return;
      }
      
      const classDate = classItem.dateObj;
      const formattedDate = formatDateForComparison(classDate);
      
      const classId = classItem.classId || classItem.id;
      const numericClassId = classId.toString().replace(/^class/, '');
      const normalizedClassId = `class${numericClassId}`;
      
      const docId = `${normalizedClassId}_${formattedDate}`;
      const classAvailabilityDoc = await getDoc(doc(db, "classAvailability", docId));
      
      if (!classAvailabilityDoc.exists()) {
        toast.error("Class not found for this date");
        return;
      }
      
      const classData = classAvailabilityDoc.data();
      
      // Check if class is full
      const [taken, total] = classData.spots.split('/').map(num => parseInt(num.trim(), 10));
      if (taken >= total) {
        toast.warning("This class is fully booked");
        return;
      }
      
      // Check if user has already booked this class
      if (hasUserBookedClass(normalizedClassId, classDate)) {
        toast.info("You have already booked this class");
        return;
      }
      
      // Update spots for this specific date's class
      const newTaken = taken + 1;
      const newSpots = `${newTaken}/${total}`;
      
      await updateDoc(doc(db, "classAvailability", docId), {
        spots: newSpots
      });
      
      // Create booking record
      const bookingRef = await addDoc(collection(db, "bookings"), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || "Member",
        classId: normalizedClassId,
        className: classData.name,
        trainer: classData.trainer,
        time: classData.time,
        location: classData.location,
        date: Timestamp.fromDate(classDate),
        type: "class",
        createdAt: Timestamp.now()
      });
      
      // Send confirmation email
      const bookingData = {
        bookingId: bookingRef.id,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || "Member",
        className: classData.name,
        trainer: classData.trainer,
        time: classData.time,
        location: classData.location,
        date: classDate,
        type: "class"
      };
      
      const emailSent = await bookingConfirmation.sendConfirmation(bookingData);
      
      toast.success(`You've successfully booked ${classData.name}${emailSent ? '. A confirmation email has been sent.' : ''}`);
      
      fetchUserBookings(currentUser.uid);
    } catch (error) {
      console.error("Error booking class:", error);
      toast.error("Failed to book class. Please try again.");
    }
  };

  // Fetch available classes from Firestore
  useEffect(() => {
    const fetchAvailableClasses = async () => {
      try {
        const todayStart = new Date(today);
        todayStart.setHours(0, 0, 0, 0);
        const todayTimestamp = Timestamp.fromDate(todayStart);
        
        const futureDate = new Date(today);
        const weeks = timePeriod === '2-weeks' ? 2 : timePeriod === '4-weeks' ? 4 : 8;
        futureDate.setDate(today.getDate() + (weeks * 7));
        futureDate.setHours(23, 59, 59, 999);
        const futureTimestamp = Timestamp.fromDate(futureDate);
        
        const classQuery = query(
          collection(db, 'classAvailability'),
          where('date', '>=', todayTimestamp),
          where('date', '<=', futureTimestamp)
        );
        
        const classSnapshot = await getDocs(classQuery);
        const availableClasses = classSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          dateObj: doc.data().date.toDate()
        }));
        
        availableClasses.sort((a, b) => a.dateObj - b.dateObj);
        
        setClasses(availableClasses);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching available classes: ", error);
        setLoading(false);
      }
    };

    if (currentStep >= 3) {
      fetchAvailableClasses();
    }
  }, [today, timePeriod, currentStep]);

  const handleGoalSelect = (goal) => {
    setSelectedGoal(goal);
    setCurrentStep(2);
  };

  const handleIntensitySelect = (selectedIntensity) => {
    setIntensity(selectedIntensity);
    setCurrentStep(3);
  };

  const handleTimePeriodSelect = (selectedTimePeriod) => {
    setTimePeriod(selectedTimePeriod);
    setCurrentStep(4);
  };

  useEffect(() => {
    if (selectedGoal && intensity && timePeriod && currentStep === 4 && !loading && classes.length > 0) {
      const filtered = selectedGoal.recommendClasses(classes, intensity);
      
      const classesPerWeek = intensity === 'light' ? 2 : intensity === 'medium' ? 3 : 4;
      
      const totalClasses = Math.min(3, Math.min(filtered.length, classesPerWeek));
      
      const topClasses = filtered
        .sort((a, b) => a.dateObj - b.dateObj)
        .slice(0, totalClasses);
      
      setRecommendedClasses(topClasses);
    }
  }, [selectedGoal, intensity, timePeriod, currentStep, loading, classes]);

  const handleViewFullProgram = () => {
    if (selectedGoal && classes.length > 0) {
      const programWeeks = timePeriod === '2-weeks' ? 2 : timePeriod === '4-weeks' ? 4 : 8;
      
      const filteredClasses = selectedGoal.recommendClasses(classes, intensity);
      
      const classesPerWeek = intensity === 'light' ? 2 : intensity === 'medium' ? 3 : 4;
      
      const totalProgramClasses = Math.min(filteredClasses.length, programWeeks * classesPerWeek);
      
      const programClasses = filteredClasses
        .sort((a, b) => a.dateObj - b.dateObj)
        .slice(0, totalProgramClasses);
      
      setFullProgramClasses(programClasses);
      setIsFullProgramVisible(true);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  const resetFlow = () => {
    setSelectedGoal(null);
    setIntensity('medium');
    setTimePeriod('4-weeks');
    setCurrentStep(1);
    setRecommendedClasses([]);
    setIsFullProgramVisible(false);
    setFullProgramClasses([]);
  };

  const getBookingStatusInfo = (classItem) => {
    const isPast = isPastDate(classItem.dateObj);
    const alreadyBooked = hasUserBookedClass(classItem.classId || classItem.id, classItem.dateObj);
    const classFull = isClassFull(classItem);
    
    if (isPast) {
      return { text: 'Class Passed', className: 'past', disabled: true };
    } else if (alreadyBooked) {
      return { text: 'Already Booked', className: 'booked', disabled: true };
    } else if (classFull) {
      return { text: 'Class Full', className: 'full', disabled: true };
    } else if (!currentUser) {
      return { text: 'Sign In to Book', className: 'sign-in', disabled: false };
    } else {
      return { text: 'Book This Class', className: '', disabled: false };
    }
  };

  // Handle book button click
  const handleBookButtonClick = (classItem) => {
    if (!currentUser) {
      toast.warning("Please sign in to book a class");
      return;
    }
    
    const isPast = isPastDate(classItem.dateObj);
    const alreadyBooked = hasUserBookedClass(classItem.classId || classItem.id, classItem.dateObj);
    const classFull = isClassFull(classItem);
    
    if (isPast) {
      toast.warning("This class has already passed");
    } else if (alreadyBooked) {
      toast.info("You've already booked this class");
    } else if (classFull) {
      toast.warning("This class is fully booked");
    } else {
      handleClassBooking(classItem);
    }
  };

  return (
    <div className="goal-visualizer-container">
      <ToastContainer position="top-center" autoClose={3000} />
      
      <div className="goal-visualizer-header">
        <h2>Create Your Fitness Journey</h2>
        <p className="subtitle">Set goals, choose your intensity, and get a personalized program</p>
          <div className="progress-steps">
          <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Choose Goal</div>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Select Intensity</div>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Set Timeline</div>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${currentStep >= 4 ? 'active' : ''}`}>
            <div className="step-number">4</div>
            <div className="step-label">Your Program</div>
          </div>
        </div>
      </div>
      
      <div className="goal-visualizer-content">
        {currentStep === 1 && (
          <div className="goal-selection step-content">
            <h3>What's your primary fitness goal?</h3>
            <div className="goals-grid">
              {goals.map((goal) => (
                <div 
                  key={goal.id}
                  className="goal-card"
                  onClick={() => handleGoalSelect(goal)}
                >
                  <div className={`goal-icon ${goal.iconClass}`} style={{ backgroundColor: goal.color }}>
                  </div>
                  <h4>{goal.label}</h4>
                  <p>{goal.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {currentStep === 2 && selectedGoal && (
          <div className="intensity-selection step-content">
            <div className="selection-header">
              <div className="back-button icon-back" onClick={() => setCurrentStep(1)}>
                Back
              </div>
              <h3>How challenging do you want your program?</h3>
              <div className="selected-goal">
                <div className={`goal-icon small ${selectedGoal.iconClass}`} style={{ backgroundColor: selectedGoal.color }}>
                </div>
                <span>{selectedGoal.label}</span>
              </div>
            </div>
            
            <div className="intensity-options">
              {intensityOptions.map((option) => (
                <div 
                  key={option.value}
                  className={`intensity-option ${intensity === option.value ? 'selected' : ''}`}
                  onClick={() => handleIntensitySelect(option.value)}
                >
                  <div className="intensity-level">
                    <div className={`intensity-indicator ${option.value}`}></div>
                    <h4>{option.label}</h4>
                  </div>
                  <p>{option.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {currentStep === 3 && selectedGoal && (
          <div className="time-selection step-content">
            <div className="selection-header">
              <div className="back-button icon-back" onClick={() => setCurrentStep(2)}>
                Back
              </div>
              <h3>How long do you want your program to run?</h3>
              <div className="selection-summary">
                <div className={`goal-icon small ${selectedGoal.iconClass}`} style={{ backgroundColor: selectedGoal.color }}>
                </div>
                <span>{selectedGoal.label}</span>
                <div className={`intensity-indicator small ${intensity}`}></div>
                <span>{intensityOptions.find(opt => opt.value === intensity)?.label} Intensity</span>
              </div>
            </div>
            
            <div className="time-options">
              {timePeriodOptions.map((option) => (
                <div 
                  key={option.value}
                  className={`time-option ${timePeriod === option.value ? 'selected' : ''}`}
                  onClick={() => handleTimePeriodSelect(option.value)}
                >
                  <h4>{option.label}</h4>
                  <p>{option.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {currentStep === 4 && selectedGoal && (
          <div className="program-results step-content">
            <div className="selection-header">
              <div className="back-button icon-back" onClick={() => setCurrentStep(3)}>
                Back
              </div>
              <h3>Your Personalized Fitness Program</h3>
              <div className="program-summary">
                <div className="summary-pill" style={{ backgroundColor: selectedGoal.color + '20', color: selectedGoal.color }}>
                  <span className={`summary-icon ${selectedGoal.iconClass}`}></span>
                  <span>{selectedGoal.label}</span>
                </div>
                <div className={`summary-pill intensity-${intensity}`}>
                  <span className="summary-icon icon-fire"></span>
                  <span>{intensityOptions.find(opt => opt.value === intensity)?.label} Intensity</span>
                </div>
                <div className="summary-pill time">
                  <span className="summary-icon icon-calendar"></span>
                  <span>{timePeriodOptions.find(opt => opt.value === timePeriod)?.label}</span>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Creating your personalized program...</p>
              </div>
            ) : (
              <div className="program-content">
                <div className="program-description">
                  <h4>Your Perfect Path to {selectedGoal.label}</h4>
                  <p>
                    We've designed a {intensityOptions.find(opt => opt.value === intensity)?.label.toLowerCase()} 
                    intensity {timePeriodOptions.find(opt => opt.value === timePeriod)?.label.toLowerCase()} program 
                    to help you {selectedGoal.label.toLowerCase()}. Here are your recommended classes to start with:
                  </p>
                </div>
                
                {recommendedClasses.length > 0 ? (
                  <div className="recommended-classes">
                    {recommendedClasses.map((cls) => {
                      const bookingStatus = getBookingStatusInfo(cls);
                      
                      return (
                        <div key={cls.id} className="program-class-card">
                          <div className="class-date">{formatDate(cls.dateObj)}</div>
                          <div className="class-card-content">
                            <h4>{cls.name}</h4>
                            <div className="class-details">
                              <div className="class-detail">
                                <span className="detail-label icon-clock">Time:</span>
                                <span className="detail-value">{cls.time}</span>
                              </div>
                              <div className="class-detail">
                                <span className="detail-label icon-user">Instructor:</span>
                                <span className="detail-value">{cls.trainer}</span>
                              </div>
                              <div className="class-detail">
                                <span className="detail-label icon-level">Level:</span>
                                <span className="detail-value">{cls.level}</span>
                              </div>
                              <div className="class-detail">
                                <span className="detail-label icon-location">Location:</span>
                                <span className="detail-value">{cls.location}</span>
                              </div>
                              <div className="class-detail">
                                <span className="detail-label icon-users">Availability:</span>
                                <span className="detail-value">{cls.spots}</span>
                              </div>
                            </div>
                            <button 
                              className={`book-class-btn ${bookingStatus.className}`}
                              onClick={() => handleBookButtonClick(cls)}
                              disabled={bookingStatus.disabled}
                            >
                              {bookingStatus.text}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="program-actions">
                      <button 
                        className="view-full-program-btn" 
                        onClick={handleViewFullProgram}
                      >
                        View Full {timePeriodOptions.find(opt => opt.value === timePeriod)?.label} Program
                      </button>
                      <button className="reset-btn" onClick={resetFlow}>Create Different Program</button>
                    </div>
                  </div>
                ) : (
                  <div className="no-classes-message">
                    <p>We couldn't find classes matching your criteria right now. Try adjusting your goals or check back later!</p>
                    <button className="reset-btn" onClick={resetFlow}>Start Over</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {isFullProgramVisible && (
          <div className="full-program-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Your {timePeriodOptions.find(opt => opt.value === timePeriod)?.label} {selectedGoal.label} Program</h3>
                <button className="close-modal" onClick={() => setIsFullProgramVisible(false)}>
                  <i className="fa fa-times" aria-label="Close"></i>
                </button>
              </div>
              
              <div className="program-overview">
                <div className="program-pills">
                  <div className="summary-pill" style={{ backgroundColor: selectedGoal.color + '20', color: selectedGoal.color }}>
                    <span className={`summary-icon ${selectedGoal.iconClass}`}></span>
                    <span>{selectedGoal.label}</span>
                  </div>
                  <div className={`summary-pill intensity-${intensity}`}>
                    <span className="summary-icon icon-fire"></span>
                    <span>{intensityOptions.find(opt => opt.value === intensity)?.label} Intensity</span>
                  </div>
                  <div className="summary-pill time">
                    <span className="summary-icon icon-calendar"></span>
                    <span>{timePeriodOptions.find(opt => opt.value === timePeriod)?.label}</span>
                  </div>
                </div>
                
                <p className="program-description-text">
                  This personalized program is designed to help you reach your {selectedGoal.label.toLowerCase()} goals 
                  over {timePeriodOptions.find(opt => opt.value === timePeriod)?.label.toLowerCase()}. 
                  We recommend attending {intensity === 'light' ? '2' : intensity === 'medium' ? '3' : '4'} classes 
                  per week for optimal results.
                </p>
              </div>
              
              <div className="full-program-classes">
                <h4>Your Program Schedule</h4>
                
                {fullProgramClasses.length > 0 ? (
                  <div className="program-classes-list">
                    {fullProgramClasses.map((cls, index) => {
                      const bookingStatus = getBookingStatusInfo(cls);
                      
                      return (
                        <div key={cls.id} className="program-class-item">
                          <div className="class-week-label">
                            Week {Math.floor(index / (intensity === 'light' ? 2 : intensity === 'medium' ? 3 : 4)) + 1}
                          </div>
                          <div className="program-class-card">
                            <div className="class-date">{formatDate(cls.dateObj)}</div>
                            <div className="class-card-content">
                              <h4>{cls.name}</h4>
                              <div className="class-details">
                                <div className="class-detail">
                                  <span className="detail-label icon-clock">Time:</span>
                                  <span className="detail-value">{cls.time}</span>
                                </div>
                                <div className="class-detail">
                                  <span className="detail-label icon-user">Instructor:</span>
                                  <span className="detail-value">{cls.trainer}</span>
                                </div>
                                <div className="class-detail">
                                  <span className="detail-label icon-level">Level:</span>
                                  <span className="detail-value">{cls.level}</span>
                                </div>
                                <div className="class-detail">
                                  <span className="detail-label icon-location">Location:</span>
                                  <span className="detail-value">{cls.location}</span>
                                </div>
                                <div className="class-detail">
                                  <span className="detail-label icon-users">Availability:</span>
                                  <span className="detail-value">{cls.spots}</span>
                                </div>
                              </div>
                              <button 
                                className={`book-class-btn ${bookingStatus.className}`}
                                onClick={() => handleBookButtonClick(cls)}
                                disabled={bookingStatus.disabled}
                              >
                                {bookingStatus.text}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="no-classes-message">
                    <p>We couldn't find enough classes for your full program. Try adjusting your goals or check back later!</p>
                  </div>
                )}
                
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FitnessGoalVisualizer;