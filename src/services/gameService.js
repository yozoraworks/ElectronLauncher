import { fetchGames as fetchGamesFromApi } from './apiService';

// Function to load games from API or Electron backend
export const loadGames = async () => {
  // First try to fetch games from the API
  const apiResult = await fetchGamesFromApi();
  
  // If API fetch succeeded, return the results
  if (apiResult.success && apiResult.data.length > 0) {
    console.log('Games loaded from API');
    
    // Transform API data to match our app's format if needed
    const formattedGames = apiResult.data.map(game => ({
      id: game.id || Math.floor(Math.random() * 10000),
      name: game.name,
      version: game.version,
      exePath: game.exePath || `${game.name}.exe`, // Use provided exePath or create default
      icon: game.icon || './assets/icons/default.svg',
      filelistUrl: game.filelistUrl,
      downloadBucketUrl: game.downloadBucketUrl,
      news: game.news || []
    }));
    
    return { success: true, data: formattedGames };
  }
};

// Function to launch a game
export const launchGame = async (gamePath) => {
  console.log(`Attempting to launch game at: ${gamePath}`);
  
  if (window.electron) {
    try {
      const result = await window.electron.launchGame(gamePath);
      if (result.success) {
        console.log('Game launched successfully via Electron');
        return { success: true };
      } else {
        console.error(`Failed to launch game: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error calling Electron API:', error);
      return { success: false, error: 'Error launching game' };
    }
  } else {
    console.log('Electron API not available. This would only work in the Electron environment.');
    return { success: false, error: 'Game launching is only available in the desktop application.' };
  }
};

// Function to check if a game is installed
export const checkGameInstalled = async (gameName, installPath) => {
  if (window.electron) {
    try {
      // Check if the game is installed at the default or configured path
      const path = installPath || `./games/${gameName}`;
      console.log('Checking if game is installed at:', path);
      const result = await window.electron.checkGameInstalled(path);
      
      return { 
        success: true, 
        installed: result.installed 
      };
    } catch (error) {
      console.error('Error checking if game is installed:', error);
      return { success: false, error: 'Error checking game installation' };
    }
  } else {
    console.log('Electron API not available. Cannot check if game is installed.');
    return { success: false, error: 'Electron API not available' };
  }
};

// Function to show file dialog for selecting install location
export const selectInstallLocation = async (gameName) => {
  console.log(`selectInstallLocation called for game: ${gameName}`);
  
  if (!window.electron) {
    console.log('Electron API not available. Using browser fallback for testing.');
    
    // In browser environment, simulate the dialog with a mock path
    if (confirm(`This would open a directory selection dialog in the Electron app.\nUse './games/${gameName}' as the installation path for testing?`)) {
      const mockPath = `/mock/path/games/${gameName}`;
      console.log(`Selected mock path: ${mockPath}`);
      return { success: true, path: mockPath };
    } else {
      return { success: false, error: 'User cancelled the operation' };
    }
  }
  
  try {
    console.log(`Calling electron.selectDirectory for ${gameName}`);
    
    // Use minimal options - just the title
    const options = {
      title: `Select Install Location for ${gameName}`
    };
    
    // Make the actual call
    const result = await window.electron.selectDirectory(options);
    console.log('selectDirectory result:', result);
    
    if (result && result.success && result.path) {
      return { success: true, path: result.path };
    } else {
      console.log('User cancelled directory selection or no path returned');
      return { 
        success: false, 
        error: result && result.error ? result.error : 'No directory selected'
      };
    }
  } catch (error) {
    console.error('Error in selectInstallLocation:', error);
    return { 
      success: false, 
      error: error.message || 'Error showing directory selection dialog'
    };
  }
};

// Function to install a game
export const installGame = async (gameId, gameName, installPath, exePath) => {
  if (window.electron) {
    try {
      // In a real app, this would trigger the download/installation process
      const result = await window.electron.installGame({
        gameId,
        gameName,
        installPath,
        exePath
      });
      
      if (result.success) {
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Failed to install game' };
      }
    } catch (error) {
      console.error('Error installing game:', error);
      return { success: false, error: 'Error installing game' };
    }
  } else {
    console.log('Electron API not available. Cannot install game.');
    return { success: false, error: 'Electron API not available' };
  }
}; 