// Authors: 7100, 7094, 7099, 7144 //

import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import Services from "./pages/Services/Services";
import Membership from "./pages/Membership/Membership";
import About from "./pages/About/About";
import SignUp from "./pages/Signup/SignUp";
import MyProfile from "./pages/MyProfile/MyProfile";
import Footer from "./components/Footer/Footer";
import Login from "./pages/Login/Login";
import ForgotPassword from "./pages/Login/ForgotPassword";
import ResetPassword from "./pages/Login/ResetPassword";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthContext";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./components/Firebase";
import ContactButton from './components/Contact/ContactButton';
import FitXChatbot from './components/Chatbot/FitXChatbot';
import MyBookings from "./pages/MyProfile/MyBookings";
import ScrollToTop from "./utils/ScrollToTop"; 
import CookieConsent from './components/CookieConsent/CookieConsent';
import "./App.css";
import "react-toastify/dist/ReactToastify.css";

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signup" />;
  }

  return children;
};

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  useEffect(() => {
    const handleOpenLoginModal = () => {
      setIsLoginOpen(true);
    };

    window.addEventListener('openLoginModal', handleOpenLoginModal);

    return () => {
      window.removeEventListener('openLoginModal', handleOpenLoginModal);
    };
  }, []);

  const handleForgotPassword = () => {
    setIsLoginOpen(false);
    setIsForgotPasswordOpen(true);
  };

  const handleBackToLogin = () => {
    setIsForgotPasswordOpen(false);
    setIsLoginOpen(true);
  };

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="app-container">
          <Navbar onLoginClick={() => setIsLoginOpen(true)} />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/membership" element={<Membership />} />
              <Route path="/about" element={<About />} />
              <Route path="/signup" element={<SignUp onLoginClick={() => setIsLoginOpen(true)} />} />
              <Route path="/mybookings" element={<MyBookings />} />
              <Route
                path="/myprofile"
                element={
                  <ProtectedRoute>
                    <MyProfile />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/forgot-password" 
                element={<ForgotPassword onBackToLogin={() => setIsLoginOpen(true)} />} 
              />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
            <ToastContainer position="top-center" autoClose={3000} />
          </main>
          <Footer />
          <FitXChatbot />
          <ContactButton />
          <CookieConsent />
          
          {isLoginOpen && (
            <Login 
              isOpen={isLoginOpen} 
              onClose={() => setIsLoginOpen(false)}
              onForgotPassword={handleForgotPassword}
            />
          )}
          
          {isForgotPasswordOpen && (
            <ForgotPassword
              isOpen={isForgotPasswordOpen}
              onClose={() => setIsForgotPasswordOpen(false)}
              onBackToLogin={handleBackToLogin}
            />
          )}
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;