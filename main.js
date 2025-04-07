// This is the entry point for Electron
// It simply requires and runs the actual main.js file from the electron folder
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');
const crypto = require('crypto');

let mainWindow;
const configPath = path.join(app.getPath('userData'), 'game-config.json');
// App directory for storing games
const appDirectory = path.dirname(app.getPath('exe'));

// Create the main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false, // For custom title bar
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Load the React app
  const startUrl = isDev 
    ? process.env.ELECTRON_START_URL 
    : `file://${path.join(__dirname, './build/index.html')}`;
  
  console.log('Loading URL:', startUrl);
  mainWindow.loadURL(startUrl);

  // Open DevTools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App events
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Helper functions for config file
const readGameConfig = () => {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(data);
    }
    return {};
  } catch (error) {
    console.error('Error reading game config file:', error);
    return {};
  }
};

const writeGameConfig = (config) => {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing game config file:', error);
    return false;
  }
};

// IPC handlers
// Window control handlers
ipcMain.handle('window:minimize', () => {
  mainWindow.minimize();
  return { success: true };
});

ipcMain.handle('window:maximize', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.restore();
  } else {
    mainWindow.maximize();
  }
  return { success: true };
});

ipcMain.handle('window:close', () => {
  mainWindow.close();
  return { success: true };
});

// Game management handlers
ipcMain.handle('games:get', async () => {
  try {
    // In a real implementation, this would fetch games from a database or API
    // For this example, we'll return a few sample games with the requested fields
    const games = [
      {
        id: 1,
        name: 'Minecraft',
        version: '1.19.2',
        exePath: 'minecraft.exe', // Relative executable path
        icon: '/assets/icons/minecraft.svg',
        filelistUrl: 'https://example.com/games/minecraft/filelist.json',
        downloadBucketUrl: 'https://storage.example.com/minecraft/',
        news: [
          {
            id: 1,
            date: '2023-04-01',
            title: 'New Minecraft Update 1.19',
            content: 'Explore the new Wild Update featuring new biomes and mobs like the Warden and the Allay.'
          },
          {
            id: 2,
            date: '2023-03-15',
            title: 'Minecraft Community Event',
            content: 'Join the community building event this weekend to help create a massive collaborative world.'
          }
        ]
      },
      {
        id: 2,
        name: 'Fortnite',
        version: '23.10.0',
        exePath: 'FortniteClient-Win64-Shipping.exe', // Relative executable path
        icon: '/assets/icons/fortnite.svg',
        filelistUrl: 'https://example.com/games/fortnite/filelist.json',
        downloadBucketUrl: 'https://storage.example.com/fortnite/',
        news: [
          {
            id: 1,
            date: '2023-04-05',
            title: 'Chapter 4 Season 2 Now Live',
            content: 'Drop into the new season with new locations, weapons, and the ability to use vehicles in creative mode.'
          },
          {
            id: 2,
            date: '2023-03-20',
            title: 'Fortnite Competitive Update',
            content: 'Changes to competitive play and tournament structure have been announced for the upcoming FNCS.'
          }
        ]
      },
      {
        id: 3,
        name: 'Valorant',
        version: '5.12',
        exePath: 'VALORANT.exe', // Relative executable path
        icon: '/assets/icons/valorant.svg',
        filelistUrl: 'https://example.com/games/valorant/filelist.json',
        downloadBucketUrl: 'https://storage.example.com/valorant/',
        news: [
          {
            id: 1,
            date: '2023-04-02',
            title: 'New Agent Revealed',
            content: 'Meet the newest agent joining the Valorant roster, with unique abilities that will change the meta.'
          },
          {
            id: 2,
            date: '2023-03-25',
            title: 'Map Updates and Balance Changes',
            content: 'Several maps have received updates to address balance issues and improve gameplay flow.'
          }
        ]
      }
    ];

    return {
      success: true,
      data: games
    };
  } catch (error) {
    console.error('Error getting games:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('games:launch', async (event, gamePath) => {
  try {
    // In a real app, this would launch the game executable
    console.log(`Launching game at: ${gamePath}`);
    
    // Check if the file exists
    if (!fs.existsSync(gamePath)) {
      return { success: false, error: 'Game executable not found' };
    }
    
    // Launch the game (simulated for now)
    // const child = require('child_process').spawn(gamePath, [], { detached: true });
    // child.unref();
    
    return { success: true };
  } catch (error) {
    console.error('Error launching game:', error);
    return { success: false, error: error.message };
  }
});

// Game installation handlers
ipcMain.handle('games:check-installed', async (event, installPath) => {
  try {
    console.log('Checking if game is installed at path:', installPath);
    const installed = fs.existsSync(installPath);
    console.log('Game installed:', installed);
    return { installed };
  } catch (error) {
    console.error('Error checking if game is installed:', error);
    return { installed: false };
  }
});

ipcMain.handle('dialog:select-directory', async (event, options) => {
  console.log('Select directory handler called with options:', options);
  
  try {
    // Show the dialog with minimal options
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: options.title || 'Select Directory'
    });
    
    console.log('Dialog result:', result);
    
    return {
      success: !result.canceled,
      path: result.filePaths && result.filePaths.length > 0 ? result.filePaths[0] : null
    };
  } catch (error) {
    console.error('Error showing directory dialog:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('games:install', async (event, options) => {
  try {
    const { gameId, gameName, installPath, exePath } = options;
    
    // In a real app, this would download and install the game
    // For now, we'll simulate by creating the directory
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(installPath)) {
      fs.mkdirSync(installPath, { recursive: true });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error installing game:', error);
    return { success: false, error: error.message };
  }
});

// Config management handlers
ipcMain.handle('config:get-game-paths', async () => {
  try {
    const config = readGameConfig();
    return { success: true, data: config };
  } catch (error) {
    console.error('Error getting game config:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('config:save-game-path', async (event, gameId, installPath) => {
  try {
    const config = readGameConfig();
    config[gameId] = installPath;
    
    if (writeGameConfig(config)) {
      return { success: true };
    } else {
      return { success: false, error: 'Failed to write config file' };
    }
  } catch (error) {
    console.error('Error saving game config:', error);
    return { success: false, error: error.message };
  }
});

// File operation handlers
ipcMain.handle('file:exists', async (event, filePath) => {
  try {
    const exists = fs.existsSync(filePath);
    return exists;
  } catch (error) {
    console.error('Error checking if file exists:', error);
    return false;
  }
});

ipcMain.handle('file:read', async (event, filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
});

ipcMain.handle('file:write', async (event, filePath, content) => {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing file:', error);
    throw error;
  }
});

ipcMain.handle('file:read-binary', async (event, filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);
    return buffer;
  } catch (error) {
    console.error('Error reading binary file:', error);
    throw error;
  }
});

ipcMain.handle('file:write-binary', async (event, filePath, data) => {
  try {
    // Ensure data is a Buffer
    const buffer = Buffer.from(data);
    fs.writeFileSync(filePath, buffer);
    return true;
  } catch (error) {
    console.error('Error writing binary file:', error);
    throw error;
  }
});

ipcMain.handle('file:ensure-dir', async (event, dirPath) => {
  try {
    // Recursively create directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return true;
  } catch (error) {
    console.error('Error ensuring directory exists:', error);
    throw error;
  }
});

// Add MD5 calculation handler
ipcMain.handle('file:calculate-md5', async (event, filePath) => {
  try {
    // Read the file as a buffer
    const buffer = fs.readFileSync(filePath);
    
    // Calculate MD5 hash
    const hash = crypto.createHash('md5');
    hash.update(buffer);
    const checksum = hash.digest('hex');
    
    return checksum;
  } catch (error) {
    console.error('Error calculating MD5 for file:', error);
    throw error;
  }
});

// Add IPC handler for getting app directory
ipcMain.handle('app:get-directory', () => {
  return { success: true, path: appDirectory };
});

// Add handler for deleting files
ipcMain.handle('file:delete', async (event, filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { success: true };
    } else {
      return { success: false, error: 'File does not exist' };
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    return { success: false, error: error.message };
  }
}); 