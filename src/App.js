import React, { useState, useEffect } from 'react';
import './App.css';
import TitleBar from './components/TitleBar';
import NavPanel from './components/NavPanel';
import ContentArea from './components/ContentArea';
import { loadGames, launchGame as launchGameService } from './services/gameService';
import { getGameInstallPaths } from './services/configService';
import { fetchGlobalNews } from './services/newsService';

function App() {
  // Game data state
  const [games, setGames] = useState([]);
  const [selectedItem, setSelectedItem] = useState('home');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [installPaths, setInstallPaths] = useState({});
  const [globalNews, setGlobalNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState(null);

  // Load games from API or Electron backend when component mounts
  useEffect(() => {
    const fetchGames = async () => {
      setIsLoading(true);
      setError(null);
      
      const result = await loadGames();
      
      if (result.success) {
        // If games were loaded successfully, update the state
        if (result.data && result.data.length > 0) {
          setGames(result.data);
        } else {
          setError('No games found');
        }
      } else {
        setError(result.error || 'Failed to load games');
      }
      
      setIsLoading(false);
    };

    fetchGames();
  }, []);

  // Load global news
  useEffect(() => {
    const loadGlobalNews = async () => {
      setNewsLoading(true);
      setNewsError(null);
      
      const result = await fetchGlobalNews();
      
      if (result.success) {
        setGlobalNews(result.data);
      } else {
        setNewsError(result.error);
        console.error('Failed to load global news:', result.error);
      }
      
      setNewsLoading(false);
    };
    
    loadGlobalNews();
  }, []);

  // Load game installation paths
  useEffect(() => {
    const fetchInstallPaths = async () => {
      const result = await getGameInstallPaths();
      
      if (result.success) {
        setInstallPaths(result.data);
      } else {
        console.error('Failed to load game installation paths:', result.error);
      }
    };

    fetchInstallPaths();
  }, []);

  // Function to launch a game
  const handleLaunchGame = async (gamePath) => {
    const result = await launchGameService(gamePath);
    
    if (!result.success) {
      // You could show an error message to the user here
      alert(`Failed to launch game: ${result.error}`);
    }
  };

  // Function to handle when a game is installed
  const handleGameInstalled = (gameId, installPath) => {
    setInstallPaths(prevPaths => ({
      ...prevPaths,
      [gameId]: installPath
    }));
  };

  return (
    <div className="App">
      {/* Custom Title Bar */}
      <TitleBar />
      
      {/* Main Content */}
      <div className="app-content">
        {/* Navigation Panel */}
        <NavPanel 
          games={games} 
          selectedItem={selectedItem} 
          setSelectedItem={setSelectedItem} 
        />
        
        {/* Content Area */}
        <ContentArea 
          selectedItem={selectedItem}
          games={games}
          globalNews={globalNews}
          isLoading={isLoading || newsLoading}
          error={error || newsError}
          launchGame={handleLaunchGame}
          installPaths={installPaths}
          onGameInstalled={handleGameInstalled}
        />
      </div>
    </div>
  );
}

export default App; 