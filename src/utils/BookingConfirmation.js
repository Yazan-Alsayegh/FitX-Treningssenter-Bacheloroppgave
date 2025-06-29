// Author: 7100 //

import emailjs from '@emailjs/browser';

class BookingConfirmation {
  constructor() {
    // EmailJS configuration
    this.serviceId = 'service_348w0fu';
    this.privateTemplateId = 'template_kdizc6m';
    this.classTemplateId = 'template_uqdkjm7';
    this.publicKey = 'CzzadyZf7a0sljH15';
  }

  /**
   * 
   * @param {Date|Object} date 
   * @returns {string} 
   */
  formatDate(date) {
    // Handle Firestore timestamp
    const jsDate = date instanceof Date 
      ? date 
      : new Date(date.seconds * 1000);
    
    return jsDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Send booking confirmation email
   * @param {Object} booking - Booking data
   * @returns {Promise<boolean>} True if email sent successfully, false otherwise
   */
  async sendConfirmation(booking) {
    try {
      // Validate required fields
      if (!booking.userEmail) {
        console.error('Error: User email is required for sending confirmation');
        return false;
      }

      console.log("Sending confirmation to email:", booking.userEmail);

      const templateParams = {
        // Standard EmailJS parameters
        to_name: booking.userName || 'Member',
        to_email: booking.userEmail,
        from_name: 'FitX Bookings',
        reply_to: 'fitx.help1@gmail.com',
        
        // User information
        user_name: booking.userName || 'Member',
        user_email: booking.userEmail,
        email: booking.userEmail,
        user_id: booking.userId || '',
        
        // Booking details
        booking_id: booking.bookingId || '',
        date: this.formatDate(booking.date),
        booking_link: `${window.location.origin}/mybookings`,
        session_type: booking.type === 'private' ? 'Private Session' : 'Group Class',
        
        coach_name: booking.coachName || booking.trainer || '',
        coach_specialty: booking.coachSpecialty || '',
        time_slot: booking.timeSlot || booking.time || '',
        time: booking.timeSlot || booking.time || '',
        
        class_name: booking.className || '',
        trainer: booking.trainer || '',
        instructor: booking.trainer || '',
        location: booking.location || '',
        
        instructor_label: booking.type === 'private' ? 'Coach' : 'Instructor',
        
        name: booking.userName || 'Member',
        message: `Your ${booking.type === 'private' ? 'private session' : 'group class'} has been confirmed.`
      };

      console.log("Template parameters:", templateParams);
      
      // Select the template based on booking type
      const templateId = booking.type === 'private' ? this.privateTemplateId : this.classTemplateId;
      
      // Send email using the selected template
      const result = await emailjs.send(
        this.serviceId,
        templateId,
        templateParams,
        this.publicKey
      );
      
      console.log("Email sent successfully:", result);
      return true;
    } catch (error) {
      console.error('Error sending booking confirmation email:', error);
      return false;
    }
  }
}

export default BookingConfirmation;