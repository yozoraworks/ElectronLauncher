// This is the entry point for Electron
// It simply requires and runs the actual main.js file from the electron folder
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');
const crypto = require('crypto');
const { autoUpdater } = require('electron-updater');

// GitHub repository where updates will be hosted
const GITHUB_REPOSITORY = 'yozoraworks/ElectronLauncher';

let mainWindow;
const configPath = path.join(app.getPath('userData'), 'game-config.json');
// App directory for storing games
const appDirectory = path.dirname(app.getPath('exe'));

// Auto-update configuration
function setupAutoUpdater() {
  // Configure for GitHub repository
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: GITHUB_REPOSITORY.split('/')[0],
    repo: GITHUB_REPOSITORY.split('/')[1],
  });

  // Check for updates on startup (except in dev environment)
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }

  // Check for updates every hour
  setInterval(() => {
    if (!isDev) {
      autoUpdater.checkForUpdatesAndNotify();
    }
  }, 60 * 60 * 1000);

  // Auto updater events
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for update...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info);
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('Update not available:', info);
  });

  autoUpdater.on('error', (err) => {
    console.error('Error in auto-updater:', err);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    const message = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`;
    console.log(message);
    if (mainWindow) {
      mainWindow.webContents.send('update-progress', progressObj);
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded; will install now', info);
    // Notify renderer process that an update has been downloaded
    if (mainWindow) {
      mainWindow.webContents.send('update-downloaded', info);
      
      // Prompt user to restart the app to apply the update
      dialog.showMessageBox({
        type: 'info',
        title: 'Update Ready',
        message: 'A new version has been downloaded. Restart the application to apply the updates.',
        buttons: ['Restart', 'Later']
      }).then(result => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
    }
  });
}

// Create the main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#121212',
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

  // Open DevTools in both development and production modes
  mainWindow.webContents.openDevTools({ mode: 'detach' });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App events
app.whenReady().then(() => {
  createWindow();
  setupAutoUpdater();
});

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