// Authors: 7100, 7094, 7099, 7144 //

import React, { useState, useRef, useEffect } from 'react';
import { getAuth } from "firebase/auth";
import ReactMarkdown from 'react-markdown';
import Cookies from 'js-cookie';
import './FitXChatbot.css';

const FitXChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Get current user ID from Firebase Auth
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const userId = currentUser ? currentUser.uid : 'guest';

  // Load chat history from cookies when component mounts
  useEffect(() => {
    try {
      // Get the cookie consent status
      const consentStatus = Cookies.get('cookie_consent');
      
      // If no messages have been loaded yet, try to load from cookies
      if (!initialLoadDone) {
        // Default welcome message if no history or consent declined
        const defaultMessage = {
          sender: 'bot',
          content: 'Hi there! 👋 How can I help you today? Ask me about our **membership options**, **classes**, **coaches**, or anything else about FitX!'
        };
        
        // Only load saved messages if user consented to cookies
        if (consentStatus === 'accepted') {
          const chatHistoryKey = `fitx_chat_history_${userId}`;
          const chatStateKey = `fitx_chat_state_${userId}`;
          
          // Try to get chat history
          const savedMessagesString = Cookies.get(chatHistoryKey);
          if (savedMessagesString) {
            try {
              const savedMessages = JSON.parse(savedMessagesString);
              if (Array.isArray(savedMessages) && savedMessages.length > 0) {
                setMessages(savedMessages);
              } else {
                setMessages([defaultMessage]);
              }
            } catch (e) {
              console.error('Error parsing chat history:', e);
              setMessages([defaultMessage]);
            }
          } else {
            setMessages([defaultMessage]);
          }
          
          // Try to get chat state
          const savedStateString = Cookies.get(chatStateKey);
          if (savedStateString) {
            try {
              const savedState = JSON.parse(savedStateString);
              if (savedState && typeof savedState.isOpen === 'boolean') {
                setIsOpen(savedState.isOpen);
              }
            } catch (e) {
              console.error('Error parsing chat state:', e);
            }
          }
        } else {
          // No consent or no cookie, use default message
          setMessages([defaultMessage]);
        }
        
        setInitialLoadDone(true);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Set default message on error
      setMessages([{
        sender: 'bot',
        content: 'Hi there! 👋 How can I help you today? Ask me about our **membership options**, **classes**, **coaches**, or anything else about FitX!'
      }]);
      setInitialLoadDone(true);
    }
  }, [userId, initialLoadDone]);

  // Save chat history to cookies 
  useEffect(() => {
    try {
      // Only save if initial load is complete 
      if (initialLoadDone) {
        const consentStatus = Cookies.get('cookie_consent');
        
        // Only save if user has accepted cookies
        if (consentStatus === 'accepted') {
          const chatHistoryKey = `fitx_chat_history_${userId}`;
          const chatStateKey = `fitx_chat_state_${userId}`;
          
          // Limit to last 20 messages to keep cookie size manageable
          const messagesToSave = messages.slice(-20);
          
          // Save messages
          Cookies.set(chatHistoryKey, JSON.stringify(messagesToSave), { 
            expires: 30, 
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
          });
          
          Cookies.set(chatStateKey, JSON.stringify({ isOpen }), {
            expires: 30,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
          });
        }
      }
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }, [messages, isOpen, userId, initialLoadDone]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (inputMessage.trim() === '') return;

    // Add user message
    const userMessage = inputMessage;
    const newMessages = [...messages, { sender: 'user', content: userMessage }];
    setMessages(newMessages);
    setInputMessage('');

    // Set loading state
    setLoading(true);

    try {
      // Call backend API
      const response = await fetch('http://localhost:5000/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          userId: userId 
        }),
      });

      const data = await response.json();

      // Add bot response to chat
      setMessages([...newMessages, {
        sender: 'bot',
        content: data.reply
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages([...newMessages, {
        sender: 'bot',
        content: 'Sorry, I encountered an error. Please try again later.',
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const RobotIcon = ({ isHeader }) => (
    <div className={`robot-icon-container ${isHeader ? 'header-robot-icon' : ''}`}>
      {isHeader ? (
        <div className="robot-circle">
          <div className="robot-message-icon">
            <div className="message-lines">
              <div className="line line-1"></div>
              <div className="line line-2"></div>
              <div className="line line-3"></div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="robot-antenna"></div>
          <div className="robot-head">
            <div className="robot-visor">
              <div className="robot-eye robot-eye-left"></div>
              <div className="robot-eye robot-eye-right"></div>
            </div>
            <div className="robot-mouth-line"></div>
          </div>
          <div className="robot-neck"></div>
        </>
      )}
    </div>
  );

  return (
    <div className="fitx-chatbot-container">
      {isOpen ? (
        <div className="chat-window">
          <div className="chat-header">
            <RobotIcon isHeader={true} />
            <div className="header-title">FitX AI Assistant</div>
            <div className="header-controls">
              <button className="close-btn" onClick={toggleChat}>×</button>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.sender === 'bot' ? 'bot-message' : 'user-message'} ${message.error ? 'error-message' : ''}`}
              >
                {message.sender === 'bot' ? (
                  <div className="bot-message-content markdown-content">
                    <ReactMarkdown>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="user-message-content">
                    {message.content}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="message bot-message loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={handleInputChange}
              disabled={loading}
              className="chat-input"
            />
            <button type="submit" className="send-button" disabled={loading || inputMessage.trim() === ''}>
              <span className="send-icon"></span>
            </button>
          </form>
        </div>
      ) : (
        <button onClick={toggleChat} className="chat-toggle-button" aria-label="Toggle chat">
          <RobotIcon isHeader={false} />
        </button>
      )}
    </div>
  );
};

export default FitXChatbot;