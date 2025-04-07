import React from 'react';
import HomeContent from './HomeContent';
import GameContent from './GameContent';

function ContentArea({ 
  selectedItem, 
  games, 
  globalNews, 
  isLoading, 
  error, 
  launchGame,
  installPaths,
  onGameInstalled
}) {
  const renderContent = () => {
    if (selectedItem === 'home') {
      return <HomeContent 
        globalNews={globalNews} 
        isLoading={isLoading} 
        error={error} 
      />;
    } else {
      const game = games.find(g => g.id === selectedItem);
      if (!game) return <div className="no-selection">Select a game from the sidebar</div>;
      
      return (
        <GameContent 
          game={game} 
          launchGame={launchGame} 
          installPaths={installPaths}
          onGameInstalled={onGameInstalled}
        />
      );
    }
  };

  return (
    <div className="content-area">
      {renderContent()}
    </div>
  );
}

export default ContentArea; 