// Simple authentication service for the launcher
// In a real application, this would connect to a backend API

// Mock user data - in a real app, this would come from an API
const mockUsers = [
  { id: 1, username: 'user1', password: 'password1', displayName: 'Demo User', email: 'demo@example.com' }
];

// Store the current user in localStorage
const storageKey = 'launcher_user';

// Check if user is logged in
export const isLoggedIn = () => {
  const userData = localStorage.getItem(storageKey);
  return !!userData;
};

// Get current user data
export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem(storageKey);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Log in a user
export const login = async (username, password) => {
  try {
    // In a real app, this would be an API call
    const user = mockUsers.find(u => u.username === username && u.password === password);
    
    if (user) {
      // Don't store the password in localStorage
      const { password: _, ...userDataToStore } = user;
      
      // Store the user data
      localStorage.setItem(storageKey, JSON.stringify(userDataToStore));
      
      return { 
        success: true, 
        data: userDataToStore 
      };
    } else {
      return { 
        success: false, 
        error: 'Invalid username or password' 
      };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      error: 'An error occurred during login' 
    };
  }
};

// Log out the current user
export const logout = () => {
  try {
    localStorage.removeItem(storageKey);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { 
      success: false, 
      error: 'An error occurred during logout' 
    };
  }
}; 