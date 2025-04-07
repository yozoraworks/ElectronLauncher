import React, { useState } from 'react';
import { logout } from '../services/authService';

function UserPanel({ user, onLogout }) {
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const handleLogoutClick = () => {
    setConfirmingLogout(true);
  };

  const handleCancelLogout = () => {
    setConfirmingLogout(false);
  };

  const handleConfirmLogout = async () => {
    try {
      const result = await logout();
      
      if (result.success) {
        setConfirmingLogout(false);
        onLogout();
      } else {
        console.error('Logout failed:', result.error);
        alert('Logout failed. Please try again.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('An error occurred during logout.');
    }
  };

  return (
    <div className="user-panel">
      <h3>Your Account</h3>
      
      <div className="user-info">
        <div className="user-avatar">
          <div className="avatar-placeholder">
            {user?.displayName?.charAt(0) || '?'}
          </div>
        </div>
        
        <div className="user-details">
          <div className="user-name">{user?.displayName || 'User'}</div>
          <div className="user-email">{user?.email || 'No email available'}</div>
        </div>
      </div>
      
      <div className="user-actions">
        {confirmingLogout ? (
          <div className="logout-confirmation">
            <p>Are you sure you want to logout?</p>
            <div className="confirmation-buttons">
              <button 
                className="cancel-button"
                onClick={handleCancelLogout}
              >
                Cancel
              </button>
              <button 
                className="confirm-button"
                onClick={handleConfirmLogout}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        ) : (
          <button 
            className="logout-button"
            onClick={handleLogoutClick}
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}

export default UserPanel; 