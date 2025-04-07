// Function to get the installation paths for games
export const getGameInstallPaths = async () => {
  if (window.electron) {
    try {
      const result = await window.electron.getGameConfig();
      if (result.success) {
        return { success: true, data: result.data || {} };
      } else {
        console.error('Failed to load game config:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error calling Electron API:', error);
      return { success: false, error: 'Error loading game config' };
    }
  } else {
    console.log('Electron API not available. Cannot access game config.');
    return { success: false, error: 'Electron API not available' };
  }
};

// Function to save a game installation path
export const saveGameInstallPath = async (gameId, installPath) => {
  if (window.electron) {
    try {
      const result = await window.electron.saveGameConfig(gameId, installPath);
      if (result.success) {
        return { success: true };
      } else {
        console.error('Failed to save game config:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error calling Electron API:', error);
      return { success: false, error: 'Error saving game config' };
    }
  } else {
    console.log('Electron API not available. Cannot save game config.');
    return { success: false, error: 'Electron API not available' };
  }
}; 