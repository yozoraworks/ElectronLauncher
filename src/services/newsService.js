import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Function to fetch global news
export const fetchGlobalNews = async () => {
  try {
    const response = await axios.get(`${API_URL}/news/global`);
    return { success: true, data: response.data.data || [] };
  } catch (error) {
    console.error('Error fetching global news:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to fetch global news' 
    };
  }
};

// Function to fetch news for a specific game
export const fetchGameNews = async (gameId) => {
  try {
    const response = await axios.get(`${API_URL}/news/game/${gameId}`);
    return { success: true, data: response.data.data || [] };
  } catch (error) {
    console.error(`Error fetching news for game ${gameId}:`, error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to fetch game news' 
    };
  }
}; 