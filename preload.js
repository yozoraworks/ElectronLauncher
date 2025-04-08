// Preload script
const { contextBridge, ipcRenderer } = require('electron');

// Log when preload script runs
console.log('Preload script is running');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    // Window control methods
    minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
    maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
    closeWindow: () => ipcRenderer.invoke('window:close'),
    
    launchGame: (path) => ipcRenderer.invoke('games:launch', path),
    
    // Game installation methods
    checkGameInstalled: (path) => {
      console.log('Checking if game is installed at:', path);
      return ipcRenderer.invoke('games:check-installed', path);
    },
    selectDirectory: (options) => {
      console.log('Showing directory selection dialog with options:', options);
      return ipcRenderer.invoke('dialog:select-directory', options);
    },
    
    // Config management methods
    getGameConfig: () => ipcRenderer.invoke('config:get-game-paths'),
    saveGameConfig: (gameId, path) => ipcRenderer.invoke('config:save-game-path', gameId, path),
    
    // App directory method
    getAppDirectory: () => ipcRenderer.invoke('app:get-directory'),
    
    // File operations for game updates
    fileExists: (path) => ipcRenderer.invoke('file:exists', path),
    readFile: (path) => ipcRenderer.invoke('file:read', path),
    writeFile: (path, content) => ipcRenderer.invoke('file:write', path, content),
    readFileBinary: (path) => ipcRenderer.invoke('file:read-binary', path),
    writeFileBinary: (path, data) => ipcRenderer.invoke('file:write-binary', path, data),
    ensureDir: (path) => ipcRenderer.invoke('file:ensure-dir', path),
    calculateMD5: (path) => ipcRenderer.invoke('file:calculate-md5', path),
    deleteFile: (path) => ipcRenderer.invoke('file:delete', path)
  }
); 