// Authors: 7100, 7094 //

import React, { useState, useEffect } from 'react';
import { auth, db } from "../../components/Firebase";
import { deleteDoc, doc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import './MyBookings.css';

const MyBookings = () => {
  const [loading, setLoading] = useState(true);
  const [bookedClasses, setBookedClasses] = useState([]);
  const [bookingEditMode, setBookingEditMode] = useState(null);
  
  const formatDateForDocument = (date) => {
    return date.getFullYear() + "-" + 
        String(date.getMonth() + 1).padStart(2, "0") + "-" + 
        String(date.getDate()).padStart(2, "0");
  };

  useEffect(() => {
    const fetchUserBookings = async (userId) => {
      try {
        const bookingsQuery = query(collection(db, "bookings"), where("userId", "==", userId));
        const bookingsSnapshot = await getDocs(bookingsQuery);
        
        const bookingsData = [];
        
        for (const bookingDoc of bookingsSnapshot.docs) {
          const bookingData = {
            id: bookingDoc.id,
            ...bookingDoc.data(),
            date: bookingDoc.data().date ? bookingDoc.data().date.toDate() : null
          };
          
          if (bookingData.type === 'class' && bookingData.date) {
            const formattedDate = formatDateForDocument(bookingData.date);
            
            if (bookingData.classId) {
              try {
                const classAvailabilityDoc = await getDoc(doc(db, "classAvailability", `${bookingData.classId}_${formattedDate}`));
                
                if (classAvailabilityDoc.exists()) {
                  bookingData.classDetails = classAvailabilityDoc.data();
                }
              } catch (err) {
                console.error("Error fetching class details:", err);
              }
            }
          }
          
          bookingsData.push(bookingData);
        }
        
        // Sort bookings by date 
        bookingsData.sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;
          return b.date - a.date;
        });
        
        setBookedClasses(bookingsData);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Failed to load your bookings");
      }
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        
        const user = auth.currentUser;
        if (!user) {
          // Redirect to login if the user is not logged in
          window.location.href = '/login';
          return;
        }
        
        await fetchUserBookings(user.uid);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load your bookings");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []); 
  
  const toggleBookingEditMode = (bookingId) => {
    setBookingEditMode(bookingEditMode === bookingId ? null : bookingId);
  };
  
  // Cancel a booking
  const cancelBooking = async (bookingId, type, classId, date) => {
    try {
      setLoading(true);
      
      // Delete the booking
      await deleteDoc(doc(db, "bookings", bookingId));
      
      if (type === 'class' && classId && date) {
        const formattedDate = formatDateForDocument(date);
        const classDocId = `${classId}_${formattedDate}`;
        
        const classDoc = await getDoc(doc(db, "classAvailability", classDocId));
        
        if (classDoc.exists()) {
          const classData = classDoc.data();
          const [taken, total] = classData.spots.split('/').map(num => parseInt(num.trim(), 10));
          
          const newTaken = Math.max(0, taken - 1);
          const newSpots = `${newTaken}/${total}`;
          
          // Update the class availability
          await updateDoc(doc(db, "classAvailability", classDocId), {
            spots: newSpots
          });
        }
      }
      
      // If it's a private session, add the time slot back to coach's availability
      if (type === 'private' && date) {
        const formattedDate = formatDateForDocument(date);
        const booking = bookedClasses.find(b => b.id === bookingId);
        
        if (booking && booking.coachId && booking.timeSlot) {
          const coachNum = booking.coachId.replace('coach', '');
          const docId = `coach${coachNum}_${formattedDate}`;
          
          // Get the current coach availability
          const availabilityDoc = await getDoc(doc(db, "dateAvailability", docId));
          
          if (availabilityDoc.exists()) {
            const availabilityData = availabilityDoc.data();
            const timeSlots = [...(availabilityData.timeSlots || [])];
            
            if (!timeSlots.includes(booking.timeSlot)) {
              timeSlots.push(booking.timeSlot);
              
              timeSlots.sort();
              
              // Update the coach availability
              await updateDoc(doc(db, "dateAvailability", docId), {
                timeSlots: timeSlots
              });
            }
          }
        }
      }
      
      // Refresh the bookings list
      const user = auth.currentUser;
      if (user) {
        const bookingsQuery = query(collection(db, "bookings"), where("userId", "==", user.uid));
        const bookingsSnapshot = await getDocs(bookingsQuery);
        
        const bookingsData = [];
        
        for (const bookingDoc of bookingsSnapshot.docs) {
          const bookingData = {
            id: bookingDoc.id,
            ...bookingDoc.data(),
            date: bookingDoc.data().date ? bookingDoc.data().date.toDate() : null
          };
          
          if (bookingData.type === 'class' && bookingData.date) {
            const formattedDate = formatDateForDocument(bookingData.date);
            
            if (bookingData.classId) {
              try {
                const classAvailabilityDoc = await getDoc(doc(db, "classAvailability", `${bookingData.classId}_${formattedDate}`));
                
                if (classAvailabilityDoc.exists()) {
                  bookingData.classDetails = classAvailabilityDoc.data();
                }
              } catch (err) {
                console.error("Error fetching class details:", err);
              }
            }
          }
          
          bookingsData.push(bookingData);
        }
        
        bookingsData.sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;
          return b.date - a.date;
        });
        
        setBookedClasses(bookingsData);
      }
      
      toast.success("Booking canceled successfully!");
    } catch (error) {
      console.error("Error canceling booking:", error);
      toast.error(error.message || "Failed to cancel booking");
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (date) => {
    if (!date) return "N/A";
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const getSessionTypeDescription = (booking) => {
    if (booking.type === 'private') {
      if (booking.sessionType) {
        return booking.sessionType;
      }
      return 'Personal Training Session';
    } else if (booking.type === 'class') {
      if (booking.className) {
        return booking.className;
      }
      return 'Group Fitness Class';
    }
    return 'Fitness Session';
  };
  
  if (loading) {
    return (
      <div className="MyBookings-loading-container">
        <div className="MyBookings-loading-spinner"></div>
        <p>Loading your bookings...</p>
      </div>
    );
  }
  
  return (
    <div className="MyBookings-page">
      <header className="MyBookings-header">
        <h1>Bookings</h1>
        <p>View and manage all your upcoming fitness sessions, classes, and personal training appointments.</p>
      </header>
      
      <div className="MyBookings-container">
        <div className="MyBookings-section">
          <h2>Manage Your Bookings</h2>
          
          <div className="MyBookings-card"> 
            <div className="MyBookings-bookings-container">
              {bookedClasses.length > 0 ? (
                <div className="MyBookings-bookings-list">
                  {bookedClasses.map(booking => (
                    <div key={booking.id} className="MyBookings-booking-item">
                      <div className="MyBookings-booking-header">
                        <div className="MyBookings-booking-type">
                          <span className={`MyBookings-booking-badge ${booking.type === 'private' ? 'private' : 'class'}`}>
                            {booking.type === 'private' ? 'Private Session' : 'Group Class'}
                          </span>
                          <div className={`MyBookings-session-type ${booking.type}`}>
                            {getSessionTypeDescription(booking)}
                          </div>
                          <h3 className="MyBookings-booking-title">
                            {booking.type === 'private' 
                              ? `Session with ${booking.coachName}` 
                              : booking.className || 'Class'
                            }
                          </h3>
                        </div>
                        
                        <button 
                          className="MyBookings-booking-edit-button"
                          onClick={() => toggleBookingEditMode(booking.id)}
                        >
                          {bookingEditMode === booking.id ? 'Cancel' : 'Edit'}
                        </button>
                      </div>
                      
                      <div className="MyBookings-booking-details">
                        <div className="MyBookings-booking-detail">
                          <i className="MyBookings-detail-icon fas fa-calendar-alt"></i>
                          <span>{booking.date ? formatDate(booking.date) : 'Date not available'}</span>
                        </div>
                        
                        <div className="MyBookings-booking-detail">
                          <i className="MyBookings-detail-icon fas fa-clock"></i>
                          <span>{booking.timeSlot || booking.time || 'Time not available'}</span>
                        </div>
                        
                        {booking.type === 'class' && booking.location && (
                          <div className="MyBookings-booking-detail">
                            <i className="MyBookings-detail-icon fas fa-map-marker-alt"></i>
                            <span>{booking.location}</span>
                          </div>
                        )}
                        
                        {booking.type === 'class' && booking.trainer && (
                          <div className="MyBookings-booking-detail">
                            <i className="MyBookings-detail-icon fas fa-user-tie"></i>
                            <span>Coach: {booking.trainer}</span>
                          </div>
                        )}

                        {booking.type === 'private' && booking.coachName && (
                          <div className="MyBookings-booking-detail">
                            <i className="MyBookings-detail-icon fas fa-user-tie"></i>
                            <span>Coach: {booking.coachName}</span>
                          </div>
                        )}

                        {booking.type === 'private' && booking.sessionType && (
                          <div className="MyBookings-booking-detail">
                            <i className="MyBookings-detail-icon fas fa-running"></i>
                            <span>Session Type: {booking.sessionType}</span>
                          </div>
                        )}
                      </div>
                      
                      {bookingEditMode === booking.id && (
                        <div className="MyBookings-booking-actions">
                          <p className="MyBookings-booking-warning">
                            Warning: Canceling this booking will remove it from your schedule.
                          </p>
                          <div className="MyBookings-booking-buttons">
                            <button 
                              className="MyBookings-cancel-button"
                              onClick={() => toggleBookingEditMode(null)}
                            >
                              Keep Booking
                            </button>
                            <button 
                              className="MyBookings-delete-button"
                              onClick={() => cancelBooking(
                                booking.id, 
                                booking.type, 
                                booking.classId, 
                                booking.date
                              )}
                            >
                              Cancel Booking
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="MyBookings-no-bookings">
                  <p>You don't have any bookings yet.</p>
                  <p>Visit the Services page to schedule your sessions or classes.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBookings;