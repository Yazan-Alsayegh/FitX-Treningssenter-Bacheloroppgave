// Authors: 7100, 7094, 7099, 7144 //

import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './BookingSystem.css';
import { db, auth } from '../../components/Firebase';
import { 
  collection, getDocs, doc, getDoc, updateDoc, addDoc, 
  query, where, Timestamp, onSnapshot 
} from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SmartRecommendations from '../../components/SmartFeatures/SmartRecommendations';
import BookingConfirmation from '../../utils/BookingConfirmation';
import sarahCoach from '../../assets/Sarah_coach.png';
import michaelCoach from '../../assets/Michael_coach.png';
import jamesCoach from '../../assets/James_coach.png';
import taylorCoach from '../../assets/Taylor_coach.png';


const coachImages = {
  'coach1': sarahCoach,    
  'coach2': michaelCoach, 
  'coach3': jamesCoach,    
  'coach4': taylorCoach   
};

const BookingSystem = () => {
  // Create a booking confirmation instance
  const bookingConfirmation = new BookingConfirmation();
  const bookingSystemRef = useRef(null);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('private');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date();
    return (today.getDay() + 6) % 7; 
  });
  const [selectedTimeSlots, setSelectedTimeSlots] = useState({}); 
  
  // Firebase data 
  const [coaches, setCoaches] = useState([]);
  const [coachTimeSlots, setCoachTimeSlots] = useState({});
  const [classAvailability, setClassAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [selectedCoachId, setSelectedCoachId] = useState(null);

  useEffect(() => {
    if (!loading) { 
      const queryParams = new URLSearchParams(location.search);
      const coachId = queryParams.get('coach');
      
      if (coachId) {
        setActiveTab('private');
        
        const normalizedCoachId = coachId.startsWith('coach') ? coachId : `coach${coachId}`;
        setSelectedCoachId(normalizedCoachId);
        
        // Find the specific coach
        const coachIndex = coaches.findIndex(c => c.id === normalizedCoachId);
        
        if (coachIndex !== -1) {
          setTimeout(() => {
            if (bookingSystemRef.current) {
              bookingSystemRef.current.scrollIntoView({ behavior: 'smooth' });
              
              // auto-scroll to the coach card
              const coachCards = document.querySelectorAll('.booking-card');
              if (coachCards && coachCards[coachIndex]) {
                coachCards[coachIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }
          }, 300);
        }
      } else if (location.hash === '#booking-system') {
        setTimeout(() => {
          if (bookingSystemRef.current) {
            bookingSystemRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 300);
      }
    }
  }, [location, coaches, loading]);

  // Fetch data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch coaches
        const coachesSnapshot = await getDocs(collection(db, "coaches"));
        const coachesData = coachesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCoaches(coachesData);
        
        const unsubscribeAvailability = onSnapshot(collection(db, "dateAvailability"), (snapshot) => {
          const timeSlotsData = {};
          
          snapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.coachId && data.date) {
              const availabilityDate = data.date.toDate();
              const formattedDate = formatDateForComparison(availabilityDate);
              
              if (!timeSlotsData[data.coachId]) {
                timeSlotsData[data.coachId] = {};
              }
              
              timeSlotsData[data.coachId][formattedDate] = data.timeSlots;
            }
          });
          
          setCoachTimeSlots(timeSlotsData);
        });
        
        const unsubscribeClassAvailability = onSnapshot(collection(db, "classAvailability"), (snapshot) => {
          const classAvailabilityData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setClassAvailability(classAvailabilityData);
          setLoading(false);
        });
        
        // Get current user
        const unsubscribeAuth = auth.onAuthStateChanged(user => {
          setCurrentUser(user);
          if (user) {
            // Fetch user's bookings when they're logged in
            fetchUserBookings(user.uid);
          } else {
            setUserBookings([]);
          }
        });
        
        return () => {
          unsubscribeAvailability();
          unsubscribeClassAvailability();
          unsubscribeAuth();
        };
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load booking data");
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Fetch user's bookings
  const fetchUserBookings = async (userId) => {
    try {
      const bookingsQuery = query(collection(db, "bookings"), where("userId", "==", userId));
      
      const unsubscribe = onSnapshot(bookingsQuery, (snapshot) => {
        const bookings = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUserBookings(bookings);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      toast.error("Failed to load your bookings");
    }
  };

  const getWeekDates = () => {
    const dates = [];
    const monday = new Date(currentDate);
    const dayOfWeek = currentDate.getDay();
    const diff = currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    monday.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date);
    }
    return dates;
  };
  
  const weekDates = getWeekDates();
  
  const formatDateRange = () => {
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return `${weekDates[0].toLocaleDateString('en-US', options)} - ${weekDates[6].toLocaleDateString('en-US', options)}`;
  };
  
  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };
  
  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };
  
  const selectDay = (index) => {
    setSelectedDay(index);
    setSelectedTimeSlots({}); 
  };

  const selectTimeSlot = (coachId, time) => {
    setSelectedTimeSlots(prev => ({
      ...prev,
      [coachId]: time
    }));
  };
  
  const toggleRecommendations = () => {
    setShowRecommendations(prev => !prev);
  };

  const formatDateForComparison = (date) => {
    return date.getFullYear() + "-" + 
           String(date.getMonth() + 1).padStart(2, "0") + "-" + 
           String(date.getDate()).padStart(2, "0");
  };

  // Check if a specific time has passed on today
  const isPastTimeSlot = (date, timeSlot) => {
    const now = new Date();
    const bookingDate = new Date(date);
    
    if (bookingDate.toDateString() !== now.toDateString()) {
      return isPastDate(date);
    }
    
    const [timeStr, period] = timeSlot.split(' '); 
    let [hours, minutes] = timeStr.split(':').map(num => parseInt(num, 10));
    
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    
    return (hours < currentHours || (hours === currentHours && minutes <= currentMinutes));
  };

  const getAvailableTimes = (coachId) => {
    if (!coachTimeSlots[coachId]) return [];
    
    const selectedDate = weekDates[selectedDay];
    const formattedDate = formatDateForComparison(selectedDate);
    const allTimeSlots = coachTimeSlots[coachId][formattedDate] || [];
    
    return allTimeSlots.filter(timeSlot => !isPastTimeSlot(selectedDate, timeSlot));
  };

  const getClassesForSelectedDay = () => {
    const selectedDate = weekDates[selectedDay];
    const formattedDate = formatDateForComparison(selectedDate);
    
    // Filter class availability for the selected date
    return classAvailability.filter(classItem => {
      if (!classItem.date) return false;
      
      const classDate = classItem.date.toDate();
      const formattedClassDate = formatDateForComparison(classDate);
      
      return formattedClassDate === formattedDate;
    });
  };

  // Check if a date is in the past
  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Check if a time slot is already booked with full date comparison
  const isTimeSlotBooked = (coachId, timeSlot, date) => {
    if (!userBookings.length) return false;
    
    const formattedSelectedDate = formatDateForComparison(date);
    
    return userBookings.some(booking => {
      if (!booking.coachId || !booking.timeSlot || !booking.date) return false;
      
      const bookingDate = booking.date.toDate();
      const formattedBookingDate = formatDateForComparison(bookingDate);
      
      return booking.coachId === coachId && 
             booking.timeSlot === timeSlot && 
             formattedBookingDate === formattedSelectedDate;
    });
  };
  
  // Check if class is full
  const isClassFull = (classItem) => {
    if (!classItem) return false;
    
    const [taken, total] = classItem.spots.split('/').map(num => parseInt(num.trim(), 10));
    return taken >= total;
  };
  
  // Check if user has already booked this class with consistent ID handling
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

  const handleBooking = async (coachId, time) => {
    try {
      if (!currentUser) {
        toast.warning("Please sign in to book a session");
        return;
      }
      
      const selectedDate = weekDates[selectedDay];
      const formattedDate = formatDateForComparison(selectedDate);
      const coachNum = coachId.replace('coach', '');
      const docId = `coach${coachNum}_${formattedDate}`;
      
      const availabilityDoc = await getDoc(doc(db, "dateAvailability", docId));
      
      if (!availabilityDoc.exists()) {
        toast.error("No availability found for this date");
        return;
      }
      
      const availabilityData = availabilityDoc.data();
      const timeSlots = availabilityData.timeSlots || [];
      
      if (!timeSlots.includes(time)) {
        toast.error("This time slot is no longer available");
        return;
      }
      
      // Check if user has already booked this slot
      if (isTimeSlotBooked(coachId, time, selectedDate)) {
        toast.info("You have already booked this session");
        return;
      }
      
      // Get coach details
      const coach = coaches.find(c => c.id === coachId);
      
      // Create booking in Firestore
      const bookingRef = await addDoc(collection(db, "bookings"), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || "Member",
        coachId,
        coachName: coach?.name || "Unknown Coach",
        timeSlot: time,
        date: Timestamp.fromDate(selectedDate),
        type: "private",
        createdAt: Timestamp.now()
      });
      
      const updatedTimeSlots = timeSlots.filter(t => t !== time);
      await updateDoc(doc(db, "dateAvailability", docId), {
        timeSlots: updatedTimeSlots
      });
      
      // Send confirmation email
      const bookingData = {
        bookingId: bookingRef.id,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || "Member",
        coachId,
        coachName: coach?.name || "Unknown Coach",
        coachSpecialty: coach?.specialty || "",
        timeSlot: time,
        date: selectedDate,
        type: "private"
      };
      
      const emailSent = await bookingConfirmation.sendConfirmation(bookingData);
      
      toast.success(`Booking confirmed with ${coach?.name} at ${time}${emailSent ? '. A confirmation email has been sent.' : ''}`);
      
      setSelectedTimeSlots({});
    } catch (error) {
      console.error("Error booking session:", error);
      toast.error("Failed to book your session. Please try again.");
    }
  };

  const handleClassBooking = async (classId) => {
    try {
      if (!currentUser) {
        toast.warning("Please sign in to book a class");
        return;
      }
      
      const selectedDate = weekDates[selectedDay];
      const formattedDate = formatDateForComparison(selectedDate);
      
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
      if (hasUserBookedClass(normalizedClassId, selectedDate)) {
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
        date: Timestamp.fromDate(selectedDate),
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
        date: selectedDate,
        type: "class"
      };
      
      const emailSent = await bookingConfirmation.sendConfirmation(bookingData);
      
      toast.success(`You've successfully booked ${classData.name}${emailSent ? '. A confirmation email has been sent.' : ''}`);
    } catch (error) {
      console.error("Error booking class:", error);
      toast.error("Failed to book class. Please try again.");
    }
  };

  // Filter coaches based on search 
  const filteredCoaches = coaches.filter(coach => 
    coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coach.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter classes based on search 
  const filteredClasses = getClassesForSelectedDay().filter(classItem => 
    classItem.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.trainer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.level?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="booking-loading">Loading booking system...</div>;
  }

  return (
    <div className="booking-system" ref={bookingSystemRef} id="booking-system">
      <ToastContainer position="top-center" autoClose={3000} />
      
      <div className="booking-header">
        <div className="booking-header-main">
          <h2 className="booking-title">Book a Session</h2>
          
          <div className="booking-action-buttons">
            <button 
              className={`booking-my-bookings-button ${!currentUser ? 'disabled' : ''}`}
              onClick={() => {
                if (!currentUser) {
                  toast.warning("Please sign in to view your bookings");
                  return;
                }
                window.location.href = '/mybookings';
              }}
              disabled={!currentUser}
              title={!currentUser ? "Please sign in to view your bookings" : "View your bookings"}
            >
              <i className="icon-calendar-check booking-my-bookings-icon"></i>
              <span>My Bookings</span>
            </button>
            
            {currentUser && userBookings.length > 0 && (
              <button 
                className={`booking-recommendations-button ${!showRecommendations ? 'collapsed' : ''}`}
                onClick={toggleRecommendations}
                aria-label={showRecommendations ? 'Hide Recommendations' : 'Show Recommendations'}
              >
                <i className={`icon-lightbulb ${showRecommendations ? 'icon-lightbulb-off' : ''}`}></i>
                <span>{showRecommendations ? 'Hide Tips' : 'Show Tips'}</span>
              </button>
            )}
          </div>
        </div>
        
        <div className="booking-nav-container">
          <div className="booking-tabs-container">
            <div className="booking-tabs">
              <button 
                className={`booking-tab ${activeTab === 'private' ? 'active' : ''}`}
                onClick={() => setActiveTab('private')}
              >
                <i className="icon-user booking-tab-icon"></i>
                <span>Private Sessions</span>
              </button>
              <button 
                className={`booking-tab ${activeTab === 'group' ? 'active' : ''}`}
                onClick={() => setActiveTab('group')}
              >
                <i className="icon-users booking-tab-icon"></i>
                <span>Group Classes</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {currentUser && userBookings.length > 0 && showRecommendations && (
        <div className="recommendations-section">
          <SmartRecommendations 
            userBookings={userBookings}
            classAvailability={classAvailability}
            coaches={coaches}
            isPastDate={isPastDate}
            handleClassBooking={handleClassBooking}
            handleBooking={handleBooking}
            currentUser={currentUser}
            coachTimeSlots={coachTimeSlots}
            weekDates={weekDates}
            selectedDay={selectedDay}
          />
        </div>
      )}
      
      <div className="booking-calendar">
        <div className="booking-calendar-header">
          <div className="booking-date-display">
            <i className="icon-calendar booking-calendar-icon"></i>
            <h3 className="booking-date-text">{formatDateRange()}</h3>
          </div>
          <div className="booking-nav-buttons">
            <button className="booking-nav-button" onClick={goToPreviousWeek}>
              <i className="icon-chevron-left"></i>
            </button>
            <button className="booking-nav-button" onClick={goToNextWeek}>
              <i className="icon-chevron-right"></i>
            </button>
          </div>
        </div>
        
        <div className="booking-weekdays">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
            const isDisabled = isPastDate(weekDates[index]);
            return (
              <div 
                key={index} 
                className={`booking-day ${index === selectedDay ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                onClick={() => !isDisabled && selectDay(index)}
              >
                <div className="booking-day-name">{day}</div>
                <div className="booking-day-number">
                  {weekDates[index].getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="booking-search-filters">
        <div className="booking-search-container">
          <i className="icon-search booking-search-icon"></i>
          <input 
            type="text" 
            placeholder={activeTab === 'private' ? "Search coaches..." : "Search classes..."}
            className="booking-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {activeTab === 'private' ? (
        <div className="booking-grid-view">
          {filteredCoaches.length > 0 ? (
            filteredCoaches.map(coach => {
              const availableTimes = getAvailableTimes(coach.id);
              const hasAvailability = availableTimes.length > 0 && availableTimes[0] !== 'No availability';
              const isSelected = coach.id === selectedCoachId;
              
              return (
                <div 
                  key={coach.id} 
                  className={`booking-card ${isSelected ? 'selected-coach' : ''}`}
                  id={`coach-card-${coach.id}`}
                >
                  <div className="booking-card-content">
                    <div className="booking-coach-profile">
                      <img 
                        src={coachImages[coach.id] || coach.img || '/api/placeholder/64/64'} 
                        alt={coach.name} 
                        className="booking-coach-avatar"
                      />
                      <div>
                        <h3 className="booking-coach-name">{coach.name}</h3>
                        <p className="booking-coach-specialty">{coach.specialty}</p>
                      </div>
                    </div>
                    
                    <div className="booking-availability-booking">
                      <span className="booking-availability">
                        <i className="icon-clock booking-availability-icon"></i>
                        {hasAvailability ? `${availableTimes.length} slots available` : 'No availability'}
                      </span>
                    </div>
                  </div>
                  
                  {hasAvailability && (
                    <div className="booking-available-times">
                      <h4 className="booking-times-title">
                        Available on {weekDates[selectedDay].toLocaleDateString('en-US', {weekday: 'long', month: 'short', day: 'numeric'})}:
                      </h4>
                      <div className="booking-times-grid">
                        {availableTimes.map((time, i) => {
                          const alreadyBooked = isTimeSlotBooked(coach.id, time, weekDates[selectedDay]);
                          return (
                            <button 
                              key={i}
                              className={`booking-time-slot ${selectedTimeSlots[coach.id] === time ? 'active' : ''} ${alreadyBooked ? 'booked' : ''}`}
                              onClick={() => !alreadyBooked && selectTimeSlot(coach.id, time)}
                              disabled={alreadyBooked}
                              title={alreadyBooked ? "You've already booked this time" : ""}
                            >
                              {time}
                              {alreadyBooked && <span className="booking-booked-indicator">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                      
                      {selectedTimeSlots[coach.id] && (
                        <button 
                          className="booking-btn booking-grid-book-btn"
                          onClick={() => {
                            if (currentUser) {
                              handleBooking(coach.id, selectedTimeSlots[coach.id]);
                            } else {
                              toast.warning("Please sign in to book a session");
                            }
                          }}
                        >
                          Book {selectedTimeSlots[coach.id]}
                        </button>
                      )}
                    </div>
                  )}
                  
                  {!hasAvailability && (
                    <div className="booking-available-times booking-no-availability">
                      <p>No availability on {weekDates[selectedDay].toLocaleDateString('en-US', {weekday: 'long', month: 'short', day: 'numeric'})}</p>
                      <p>Please select another day</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="booking-no-results">
              <p>No coaches match your search</p>
            </div>
          )}
        </div>
      ) : (
        <div className="booking-grid-view">
          {filteredClasses.length > 0 ? (
            filteredClasses.map(classItem => {
              const classFull = isClassFull(classItem);
              const alreadyBooked = hasUserBookedClass(classItem.classId || classItem.id, weekDates[selectedDay]);
              
              return (
                <div key={classItem.id} className="booking-card">
                  <div className="booking-card-content">
                    <div>
                      <h3 className="booking-class-title">{classItem.name}</h3>
                      <p className="booking-instructor">Instructor: {classItem.trainer}</p>
                      
                      <div className="booking-class-details">
                        <div className="booking-detail">
                          <i className="icon-clock booking-detail-icon"></i>
                          <span>{classItem.time}</span>
                        </div>
                        <div className="booking-detail">
                          <i className="icon-map-pin booking-detail-icon"></i>
                          <span>{classItem.location}</span>
                        </div>
                      </div>
                      
                      <div className="booking-class-meta">
                        <div>
                          <span className="booking-level-badge">
                            {classItem.level}
                          </span>
                          <span className={`booking-spots ${classFull ? 'full' : ''}`}>
                            {classItem.spots} spots
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      className={`booking-btn booking-grid-book-btn ${classFull || alreadyBooked ? 'disabled' : ''}`}
                      onClick={() => {
                        if (classFull) {
                          toast.warning("This class is fully booked");
                        } else if (alreadyBooked) {
                          toast.info("You've already booked this class");
                        } else if (!currentUser) {
                          toast.warning("Please sign in to book a class");
                        } else {
                          handleClassBooking(classItem.classId || classItem.id);
                        }
                      }}
                      disabled={classFull || alreadyBooked}
                    >
                      {alreadyBooked ? 'Already Booked' : classFull ? 'Class Full' : 'Book Class'}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="booking-no-classes">
              <p>No classes scheduled on {weekDates[selectedDay].toLocaleDateString('en-US', {weekday: 'long', month: 'short', day: 'numeric'})}</p>
              <p>Please select another day</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingSystem;