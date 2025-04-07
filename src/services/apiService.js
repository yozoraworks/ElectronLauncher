import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Function to fetch games from the API
export const fetchGames = async () => {
  try {
    const response = await axios.get(`${API_URL}/games`);
    return { success: true, data: response.data.data || [] };
  } catch (error) {
    console.error('Error fetching games:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to fetch games' 
    };
  }
};

// Function to get game details
export const fetchGameDetails = async (gameId) => {
  try {
    const response = await axios.get(`${API_URL}/games/${gameId}`);
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error(`Error fetching details for game ${gameId}:`, error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to fetch game details' 
    };
  }
}; 