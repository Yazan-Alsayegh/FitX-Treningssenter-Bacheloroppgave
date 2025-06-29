// Authors: 7100, 7094, 7099, 7144 //

import React, { useEffect, useState, useCallback } from 'react';
import '../SmartFeatures/SmartRecommendations.css';

const formatDate = (date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Function to check if a time slot has already passed
 * @param {Date} date
 * @param {String} timeSlot 
 * @returns {Boolean} 
 */
const isPastTimeSlot = (date, timeSlot) => {
  const now = new Date();
  const bookingDate = new Date(date);
  
  if (bookingDate.toDateString() !== now.toDateString()) {
    return bookingDate < now;
  }
  
  const [timeStr, period] = timeSlot.split(' '); 
  let [hours, minutes] = timeStr.split(':').map(num => parseInt(num, 10));
  
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  
  return (hours < currentHours || (hours === currentHours && minutes <= currentMinutes));
};

/**
 * SmartRecommendations component that suggests both private sessions and group classes
 * 
 * @param {Array} userBookings 
 * @param {Array} classAvailability 
 * @param {Array} coaches 
 * @param {Function} isPastDate 
 * @param {Function} handleClassBooking 
 * @param {Function} handleBooking 
 * @param {Object} currentUser 
 * @param {Object} coachTimeSlots 
 * @param {Array} weekDates 
 * @param {Number} selectedDay 
 * @returns {JSX.Element}
 */
const SmartRecommendations = ({ 
  userBookings, 
  classAvailability, 
  coaches = [],
  isPastDate, 
  handleClassBooking,
  handleBooking,
  currentUser,
  coachTimeSlots,
  weekDates,
  selectedDay = 0
}) => {
  const [recommendations, setRecommendations] = useState({
    coachRecommendations: [],
    classRecommendations: [],
    hasPrivate: false,
    hasGroup: false
  });

  const getUserPreferences = useCallback(() => {
    // Track user preferences based on both private sessions and group classes
    const userPreferences = {
      coaches: {}, 
      specialties: {}, 
      trainers: {}, 
      hasPrivate: false, 
      hasGroup: false
    };
    
    userBookings.forEach(booking => {
      if (booking.type === "class" && booking.className) {
        userPreferences.hasGroup = true;
        
        const classNameLower = booking.className.toLowerCase();
        const category = classNameLower.split(' ')[0];
        userPreferences.specialties[category] = (userPreferences.specialties[category] || 0) + 1;
        
        if (booking.trainer) {
          const trainerKey = booking.trainer.toLowerCase();
          userPreferences.trainers[trainerKey] = (userPreferences.trainers[trainerKey] || 0) + 1;
        }
      }
      
      if (booking.type === "private" && booking.coachName) {
        userPreferences.hasPrivate = true;
        
        const coachKey = booking.coachName.toLowerCase();
        userPreferences.coaches[coachKey] = (userPreferences.coaches[coachKey] || 0) + 1;
        
        if (coaches && coaches.length > 0) {
          const coach = coaches.find(c => c.name === booking.coachName);
          if (coach && coach.specialty) {
            const specialtyKey = coach.specialty.toLowerCase().split(' ')[0];
            userPreferences.specialties[specialtyKey] = (userPreferences.specialties[specialtyKey] || 0) + 1;
          }
        }
        
        const specialtyWords = ["yoga", "strength", "hiit", "spin", "bootcamp", "pilates", "cardio"];
        const coachNameLower = booking.coachName.toLowerCase();
        
        for (const word of specialtyWords) {
          if (coachNameLower.includes(word)) {
            userPreferences.specialties[word] = (userPreferences.specialties[word] || 0) + 1;
          }
        }
      }
    });
    
    if (Object.keys(userPreferences.specialties).length === 0 && userBookings.length > 0) {
      userPreferences.specialties = {
        "yoga": 1,
        "strength": 1,
        "spin": 1,
        "bootcamp": 1
      };
    }
    
    return userPreferences;
  }, [userBookings, coaches]);
  
  const getCoachRecommendations = useCallback((userPreferences) => {
    if (!coaches || coaches.length === 0 || !coachTimeSlots) {
      return [];
    }
    
    const getAvailableTimesForCoach = (coachId) => {
      if (!coachTimeSlots[coachId]) return [];
      
      const selectedDate = weekDates[selectedDay];
      if (!selectedDate) return [];
      
      const formattedDate = selectedDate.getFullYear() + "-" + 
      String(selectedDate.getMonth() + 1).padStart(2, "0") + "-" + 
      String(selectedDate.getDate()).padStart(2, "0");
      
      const availableTimes = coachTimeSlots[coachId][formattedDate] || [];
      
      return availableTimes.filter(time => !isPastTimeSlot(selectedDate, time));
    };
    
    const coachRecommendations = [];
    
    for (const coachName in userPreferences.coaches) {
      const coach = coaches.find(c => c.name.toLowerCase() === coachName);
      if (coach) {
        const availableTimes = getAvailableTimesForCoach(coach.id);
        if (availableTimes.length > 0 && availableTimes[0] !== 'No availability') {
          coachRecommendations.push({
            ...coach,
            availableTimes,
            score: userPreferences.coaches[coachName] * 2 // Weight higher for previous bookings
          });
        }
      }
    }
    
    for (const specialty in userPreferences.specialties) {
      coaches.forEach(coach => {
        if (coachRecommendations.some(c => c.id === coach.id)) return;
        
        if (coach.specialty && coach.specialty.toLowerCase().includes(specialty)) {
          const availableTimes = getAvailableTimesForCoach(coach.id);
          if (availableTimes.length > 0 && availableTimes[0] !== 'No availability') {
            coachRecommendations.push({
              ...coach,
              availableTimes,
              score: userPreferences.specialties[specialty]
            });
          }
        }
      });
    }
    
    if (coachRecommendations.length < 2) {
      coaches.forEach(coach => {
        if (coachRecommendations.some(c => c.id === coach.id)) return;
        
        const availableTimes = getAvailableTimesForCoach(coach.id);
        if (availableTimes.length > 0 && availableTimes[0] !== 'No availability') {
          coachRecommendations.push({
            ...coach,
            availableTimes,
            score: 0.5 
          });
        }
      });
    }
    
    return coachRecommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);
  }, [coaches, coachTimeSlots, selectedDay, weekDates]);
  
  const getClassRecommendations = useCallback((userPreferences) => {
    if (!classAvailability || classAvailability.length === 0) {
      return [];
    }
    
    const classesForSelectedDay = classAvailability.filter(cls => {
      if (!cls.date) return false;
      
      const classDate = cls.date.toDate();
      const selectedDate = weekDates[selectedDay];
      
      const formattedClassDate = classDate.getFullYear() + "-" + 
      String(classDate.getMonth() + 1).padStart(2, "0") + "-" + 
      String(classDate.getDate()).padStart(2, "0");
      
      const formattedSelectedDate = selectedDate.getFullYear() + "-" + 
      String(selectedDate.getMonth() + 1).padStart(2, "0") + "-" + 
      String(selectedDate.getDate()).padStart(2, "0");
      
      return formattedClassDate === formattedSelectedDate;
    });
    
    // Find group classes that match preferences
    let matchingClasses = classesForSelectedDay.filter(cls => {
      if (!cls.name || !cls.date || !cls.time) return false;
      
      if (isPastDate(cls.date.toDate())) return false;
      
      if (isPastTimeSlot(cls.date.toDate(), cls.time.split(' - ')[0])) return false;
      
      const classNameLower = cls.name.toLowerCase();
      
      for (const specialty in userPreferences.specialties) {
        if (classNameLower.includes(specialty)) {
          return true;
        }
      }
      
      if (cls.trainer) {
        const trainerLower = cls.trainer.toLowerCase();
        
        if (userPreferences.trainers[trainerLower]) {
          return true;
        }
        
        for (const coachName in userPreferences.coaches) {
          if (trainerLower.includes(coachName)) {
            return true;
          }
        }
      }
      
      return false;
    });
    
    if (matchingClasses.length === 0) {
      matchingClasses = classesForSelectedDay
        .filter(cls => cls.date && !isPastDate(cls.date.toDate()) && cls.time && !isPastTimeSlot(cls.date.toDate(), cls.time.split(' - ')[0]));
    }
    
    const sortedMatches = [...matchingClasses].sort((a, b) => {
      const dateA = a.date.toDate();
      const dateB = b.date.toDate();
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }
      
      const timeA = a.time.split(' - ')[0]; 
      const timeB = b.time.split(' - ')[0];
      
      const [timeStrA, periodA] = timeA.split(' ');
      const [hoursA, minutesA] = timeStrA.split(':').map(num => parseInt(num, 10));
      
      const [timeStrB, periodB] = timeB.split(' ');
      const [hoursB, minutesB] = timeStrB.split(':').map(num => parseInt(num, 10));
      
      let hours24A = hoursA;
      if (periodA === 'PM' && hoursA < 12) hours24A += 12;
      if (periodA === 'AM' && hoursA === 12) hours24A = 0;
      
      let hours24B = hoursB;
      if (periodB === 'PM' && hoursB < 12) hours24B += 12;
      if (periodB === 'AM' && hoursB === 12) hours24B = 0;
      
      if (hours24A !== hours24B) {
        return hours24A - hours24B;
      }
      
      return minutesA - minutesB;
    });
    
    return sortedMatches.slice(0, 3); 
  }, [classAvailability, selectedDay, weekDates, isPastDate]);
  
  const getRecommendations = useCallback(() => {
    const userPreferences = getUserPreferences();
    
    return {
      coachRecommendations: getCoachRecommendations(userPreferences),
      classRecommendations: getClassRecommendations(userPreferences),
      hasPrivate: userPreferences.hasPrivate,
      hasGroup: userPreferences.hasGroup
    };
  }, [getUserPreferences, getCoachRecommendations, getClassRecommendations]);
  
  useEffect(() => {
    if (userBookings.length > 0) {
      try {
        const newRecommendations = getRecommendations();
        setRecommendations(newRecommendations);
      } catch (error) {
      }
    }
  }, [selectedDay, userBookings, getRecommendations]);
  
  // Recommendations not showing if user is not logged in
  if (!currentUser) {
    return null;
  }
  
  const hasCoachRecommendations = recommendations.coachRecommendations.length > 0;
  const hasClassRecommendations = recommendations.classRecommendations.length > 0;
  const shouldShowEmptyState = !hasCoachRecommendations && !hasClassRecommendations;
  
  return (
    <div className="smart-recommendations">
      <h3>Recommended for You</h3>
      
      {shouldShowEmptyState ? (
        <p className="recommendation-empty-message">Book more sessions to get personalized recommendations!</p>
      ) : (
        <div className="recommendations-wrapper">
          {hasCoachRecommendations && (
            <div className="recommendation-section">
              <h4 className="recommendation-section-title">
                <span className="recommendation-section-icon private"></span>
                Private Sessions
              </h4>
              
              <div className="recommendations-container">
                {recommendations.coachRecommendations.map(coach => (
                  <div key={coach.id} className="recommendation-card coach-card">
                    <h4>{coach.name}</h4>
                    <p className="recommendation-specialty">{coach.specialty}</p>
                    
                    <div className="recommendation-time-slots">
                      <p className="recommendation-timeslot-title">Available times:</p>
                      {coach.availableTimes.slice(0, 3).map((time, index) => (
                        <button 
                          key={index}
                          className="recommendation-time-slot"
                          onClick={() => handleBooking(coach.id, time)}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                    
                    <button 
                      className="recommendation-btn"
                      onClick={() => handleBooking(coach.id, coach.availableTimes[0])}
                    >
                      Book Session
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasClassRecommendations && (
            <div className="recommendation-section">
              <h4 className="recommendation-section-title">
                <span className="recommendation-section-icon group"></span>
                Group Classes
              </h4>
              
              <div className="recommendations-container">
                {recommendations.classRecommendations.map(cls => (
                  <div key={cls.id} className="recommendation-card class-card">
                    <h4>{cls.name}</h4>
                    <p className="recommendation-date">{formatDate(cls.date.toDate())}</p>
                    <p className="recommendation-trainer">with {cls.trainer}</p>
                    <p className="recommendation-location">{cls.location}</p>
                    <div className="recommendation-details">
                      <span className="recommendation-level">{cls.level}</span>
                      <span className={`recommendation-spots ${cls.spots.split('/')[0] === cls.spots.split('/')[1] ? 'full' : ''}`}>
                        {cls.spots}
                      </span>
                    </div>
                    <button 
                      className="recommendation-btn"
                      onClick={() => handleClassBooking(cls.classId || cls.id)}
                    >
                      Book Class
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartRecommendations;