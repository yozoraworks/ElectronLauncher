import React, { useState, useEffect } from 'react';
import { checkGameInstalled, selectInstallLocation, installGame } from '../services/gameService';
import { saveGameInstallPath } from '../services/configService';
import { checkGameVersion, updateGame } from '../services/gameUpdaterService';
import { fetchGameNews } from '../services/newsService';

function GameContent({ game, launchGame, installPaths, onGameInstalled }) {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installError, setInstallError] = useState(null);
  const [installStatus, setInstallStatus] = useState('');
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [currentVersion, setCurrentVersion] = useState('0.0.0');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updatePhase, setUpdatePhase] = useState('');
  const [updateError, setUpdateError] = useState(null);
  const [gameNews, setGameNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [changingInstallPath, setChangingInstallPath] = useState(false);
  
  // Check if the game is installed and if it needs an update
  const checkInstallation = async () => {
    const installPath = installPaths[game.id];
    
    // First check if the game is installed
    const installResult = await checkGameInstalled(game.name, installPath);
    
    if (installResult.success && installResult.installed) {
      setIsInstalled(true);
      
      // Then check if it needs an update
      if (installPath) {
        const versionResult = await checkGameVersion(game.name, installPath);
        
        if (!versionResult.error) {
          setCurrentVersion(versionResult.currentVersion);
          
          // Compare versions
          const serverVersion = game.version || '0.0.0';
          setNeedsUpdate(serverVersion !== versionResult.currentVersion);
        }
      }
    } else {
      setIsInstalled(false);
      setNeedsUpdate(false);
    }
  };

  useEffect(() => {
    checkInstallation();
  }, [game, installPaths]);
  
  // Load game news
  useEffect(() => {
    const loadGameNews = async () => {
      if (!game || !game.id) return;
      
      setNewsLoading(true);
      setNewsError(null);
      
      const result = await fetchGameNews(game.id);
      
      if (result.success) {
        setGameNews(result.data);
      } else {
        setNewsError(result.error);
        console.error(`Failed to load news for game ${game.id}:`, result.error);
      }
      
      setNewsLoading(false);
    };
    
    loadGameNews();
  }, [game]);
  
  // Handle the install button click
  const handleInstall = async () => {
    setIsInstalling(true);
    setInstallError(null);
    setInstallStatus('Opening location selector...');
    
    try {
      // Show file dialog to select install location
      const locationResult = await selectInstallLocation(game.name);
      
      if (locationResult.success) {
        setInstallStatus(`Installing ${game.name} to ${locationResult.path}...`);
        console.log(`Selected installation path: ${locationResult.path}`);
        
        // Start installation process
        const installResult = await installGame(
          game.id, 
          game.name, 
          locationResult.path, 
          game.exePath
        );
        
        if (installResult.success) {
          setInstallStatus('Saving configuration...');
          // Save the selected install path to config
          const saveResult = await saveGameInstallPath(game.id, locationResult.path);
          
          if (saveResult.success) {
            // Update the UI to reflect installation
            setIsInstalled(true);
            setInstallStatus('Installation complete!');
            
            // Create version.txt file with current version
            if (window.electron) {
              try {
                const versionPath = `${locationResult.path}/version.txt`;
                await window.electron.writeFile(versionPath, game.version || '0.0.0');
                setCurrentVersion(game.version || '0.0.0');
                setNeedsUpdate(false);
              } catch (error) {
                console.error('Error creating version file:', error);
              }
            }
            
            // Notify parent component
            if (onGameInstalled) {
              onGameInstalled(game.id, locationResult.path);
            }
            
            // Automatically trigger update to download files
            await handleUpdate();
          } else {
            setInstallError(`Failed to save configuration: ${saveResult.error}`);
          }
        } else {
          setInstallError(installResult.error || 'Installation failed');
        }
      } else {
        console.log('User cancelled installation location selection', locationResult);
        setInstallStatus('');
      }
    } catch (error) {
      console.error('Error during installation process:', error);
      setInstallError(`Installation error: ${error.message || 'Unknown error'}`);
    } finally {
      if (installStatus !== 'Installation complete!') {
        setInstallStatus('');
      }
      setIsInstalling(false);
      
      // Clear success message after 3 seconds
      if (installStatus === 'Installation complete!') {
        setTimeout(() => setInstallStatus(''), 3000);
      }
    }
  };
  
  // Handle update button click
  const handleUpdate = async () => {
    setIsUpdating(true);
    setUpdateError(null);
    setUpdateProgress(0);
    setUpdatePhase('initializing');
    
    try {
      const installPath = installPaths[game.id];
      
      if (!installPath) {
        throw new Error('Game installation path not found');
      }
      
      // Start update process
      const updateResult = await updateGame(game, installPath, (progressData) => {
        // Update progress UI
        setUpdatePhase(progressData.phase);
        setUpdateProgress(progressData.progress);
      });
      
      if (updateResult.success) {
        // Update was successful
        setCurrentVersion(game.version);
        setNeedsUpdate(false);
        setUpdatePhase('complete');
        setUpdateProgress(1);
        
        // Clear update status after 3 seconds
        setTimeout(() => {
          setUpdatePhase('');
          setUpdateProgress(0);
          setIsUpdating(false);
        }, 3000);
      } else {
        setUpdateError(updateResult.error || 'Update failed');
        setIsUpdating(false);
      }
    } catch (error) {
      console.error('Error during update process:', error);
      setUpdateError(`Update error: ${error.message || 'Unknown error'}`);
      setIsUpdating(false);
    }
  };
  
  // Handle changing the installation path
  const handleChangeInstallPath = async () => {
    setChangingInstallPath(true);
    
    try {
      // Show file dialog to select new install location
      const locationResult = await selectInstallLocation(game.name);
      
      if (locationResult.success) {
        // Save the new install path to config
        const saveResult = await saveGameInstallPath(game.id, locationResult.path);
        
        if (saveResult.success) {
          // Notify parent component about the changed path
          if (onGameInstalled) {
            onGameInstalled(game.id, locationResult.path);
          }
          
          // Recheck installation status
          await checkInstallation();
          
          setShowSettings(false); // Close the settings modal
        } else {
          console.error('Failed to save new installation path:', saveResult.error);
        }
      }
    } catch (error) {
      console.error('Error changing install path:', error);
    } finally {
      setChangingInstallPath(false);
    }
  };
  
  // Handle fixing the game (remove version.txt and run update)
  const handleFixGame = async () => {
    const installPath = installPaths[game.id];
    
    if (!installPath) {
      console.error('Game installation path not found');
      return;
    }
    
    try {
      // Delete version.txt file
      if (window.electron) {
        const versionPath = `${installPath}/version.txt`;
        const exists = await window.electron.fileExists(versionPath);
        
        if (exists) {
          await window.electron.deleteFile(versionPath);
          console.log('Deleted version.txt file');
        }
      }
      
      // Close settings modal
      setShowSettings(false);
      
      // Run update process
      await handleUpdate();
    } catch (error) {
      console.error('Error fixing game:', error);
    }
  };
  
  // Helper function to render the progress bar
  const renderProgressBar = () => {
    let statusText = '';
    
    switch (updatePhase) {
      case 'fetch_filelist':
        statusText = 'Fetching file list...';
        break;
      case 'check_files':
        statusText = 'Checking files...';
        break;
      case 'download':
        statusText = `Downloading files (${Math.round(updateProgress * 100)}%)...`;
        break;
      case 'complete':
        statusText = 'Update complete!';
        break;
      default:
        statusText = 'Preparing update...';
    }
    
    return (
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${Math.round(updateProgress * 100)}%` }}
          ></div>
        </div>
        <div className="progress-text">{statusText}</div>
      </div>
    );
  };
  
  // Helper function to get the full executable path
  const getExecutablePath = (game, installPath) => {
    if (!installPath) return null;
    
    // Combine the install path with the executable path
    return `${installPath}/${game.exePath}`;
  };
  
  // Handle horizontal scrolling with the mouse wheel
  const handleNewsListScroll = (e) => {
    if (e.deltaY !== 0) {
      e.currentTarget.scrollLeft += e.deltaY;
    }
  };
  
  // Open URL in external browser
  const openNewsUrl = (e, url) => {
    if (!url) return;
    
    e.stopPropagation(); // Prevent event bubbling
    
    // Use electron shell to open URL in default browser
    if (window.electron && window.electron.openExternal) {
      window.electron.openExternal(url);
    } else {
      // Fallback to window.open for non-electron environments
      window.open(url, '_blank');
    }
  };
  
  // Render the settings modal
  const renderSettingsModal = () => {
    if (!showSettings) return null;
    
    const installPath = installPaths[game.id] || 'Not set';
    
    return (
      <div className="settings-modal-overlay" onClick={() => setShowSettings(false)}>
        <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
          <div className="settings-modal-header">
            <h2>{game.name} Settings</h2>
            <button className="close-button" onClick={() => setShowSettings(false)}>×</button>
          </div>
          
          <div className="settings-modal-content">
            <div className="settings-section">
              <h3>Installation Path</h3>
              <div className="settings-option">
                <div className="current-path">{installPath}</div>
                <button 
                  className="change-path-button"
                  onClick={handleChangeInstallPath}
                  disabled={changingInstallPath}
                >
                  {changingInstallPath ? 'Changing...' : 'Change Path'}
                </button>
              </div>
            </div>
            
            <div className="settings-section">
              <h3>Game Repair</h3>
              <div className="settings-option">
                <p>If your game is not working properly, you can try to fix it.</p>
                <button 
                  className="fix-game-button"
                  onClick={handleFixGame}
                >
                  Fix Game
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="game-content">
      <div className="game-header">
        <img className="game-detail-icon" src={game.icon} alt={game.name} onError={(e) => {e.target.src = '/assets/placeholder.svg'}} />
        <div className="game-title-info">
          <h1>{game.name}</h1>
          <div className="game-version-info">
            {game.version && <div className="game-version">Server Version: {game.version}</div>}
            {currentVersion !== '0.0.0' && <div className="game-version">Installed Version: {currentVersion}</div>}
            {needsUpdate && isInstalled && <div className="update-needed">Update Available!</div>}
          </div>
        </div>
      </div>
      
      <div className="game-news-section">
        <h2>Game News</h2>
        {newsLoading ? (
          <div className="loading-message">Loading news...</div>
        ) : newsError ? (
          <div className="error-message">Could not load news: {newsError}</div>
        ) : gameNews.length === 0 ? (
          <div className="no-news-message">No news available for this game.</div>
        ) : (
          <div className="game-news-list" onWheel={handleNewsListScroll}>
            {gameNews.map(item => (
              <div 
                className="game-news-item" 
                key={item.id}
                onClick={(e) => openNewsUrl(e, item.url)}
                style={{ cursor: item.url ? 'pointer' : 'default' }}
              >
                {item.image && <img className="news-image" src={item.image} alt={item.title} />}
                <div className="news-text">
                  <div className="news-date">{item.date}</div>
                  <h3>{item.title}</h3>
                  <p>{item.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="game-action">
        {isInstalling ? (
          <div className="install-status">
            <button className="install-button installing" disabled>
              Installing...
            </button>
            {installStatus && <div className="install-progress">{installStatus}</div>}
          </div>
        ) : isUpdating ? (
          <div className="update-status">
            <button className="update-button updating" disabled>
              Updating...
            </button>
            {renderProgressBar()}
          </div>
        ) : isInstalled ? (
          <div className="game-buttons">
            <button className="settings-button" onClick={() => setShowSettings(true)}>
              ⚙️
            </button>
            {needsUpdate ? (
              <button className="update-button" onClick={handleUpdate}>
                Update {game.name}
              </button>
            ) : (
              <button className="launch-button" onClick={() => launchGame(getExecutablePath(game, installPaths[game.id]))}>
                Launch {game.name}
              </button>
            )}
          </div>
        ) : (
          <button className="install-button" onClick={handleInstall}>
            Install {game.name}
          </button>
        )}
        
        {installError && (
          <div className="install-error">
            {installError}
          </div>
        )}
        
        {updateError && (
          <div className="update-error">
            {updateError}
          </div>
        )}
        
        {!isInstalling && installStatus && (
          <div className="install-success">
            {installStatus}
          </div>
        )}
      </div>
      
      {renderSettingsModal()}
    </div>
  );
}

export default GameContent; 