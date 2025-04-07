import React from 'react';

function TitleBar() {
  const handleMinimize = () => {
    if (window.electron) {
      window.electron.minimizeWindow();
    }
  };

  const handleMaximize = () => {
    if (window.electron) {
      window.electron.maximizeWindow();
    }
  };

  const handleClose = () => {
    if (window.electron) {
      window.electron.closeWindow();
    }
  };

  return (
    <div className="title-bar">
      <div className="title-bar-title">Game Launcher</div>
      <div className="window-controls">
        <button className="window-control minimize" onClick={handleMinimize}></button>
        <button className="window-control maximize" onClick={handleMaximize}></button>
        <button className="window-control close" onClick={handleClose}></button>
      </div>
    </div>
  );
}

export default TitleBar; 