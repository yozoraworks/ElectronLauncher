import React, { useState, useEffect, useRef } from 'react';
import { isLoggedIn, getCurrentUser } from '../services/authService';
import LoginPanel from './LoginPanel';
import UserPanel from './UserPanel';

function UserButton() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  // Check login status when component mounts
  useEffect(() => {
    checkLoginStatus();
  }, []);

  // Add escape key listener to close the modal
  useEffect(() => {
    function handleEscapeKey(event) {
      if (event.key === 'Escape' && showPanel) {
        setShowPanel(false);
      }
    }

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showPanel]);

  // Function to check if user is logged in
  const checkLoginStatus = () => {
    const loggedInStatus = isLoggedIn();
    setLoggedIn(loggedInStatus);
    
    if (loggedInStatus) {
      setUser(getCurrentUser());
    } else {
      setUser(null);
    }
  };

  // Toggle the panel
  const togglePanel = () => {
    setShowPanel(!showPanel);
  };

  // Close modal when clicking outside the content
  const handleModalClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      setShowPanel(false);
    }
  };

  // Handle successful login
  const handleLoginSuccess = () => {
    checkLoginStatus();
    setShowPanel(false);
  };

  // Handle logout
  const handleLogout = () => {
    checkLoginStatus();
    setShowPanel(false);
  };

  return (
    <div className="user-button-container">
      <div 
        className="user-button" 
        onClick={togglePanel}
        ref={buttonRef}
      >
        <div className="user-icon">
          {loggedIn ? '👤' : '👤'}
        </div>
        <div className="user-text">
          {loggedIn ? user?.displayName || 'User' : 'Login'}
        </div>
      </div>

      {showPanel && (
        <div className="modal-overlay" onClick={handleModalClick}>
          <div className="modal-container" ref={panelRef}>
            {loggedIn ? (
              <UserPanel user={user} onLogout={handleLogout} />
            ) : (
              <LoginPanel onLoginSuccess={handleLoginSuccess} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserButton; 