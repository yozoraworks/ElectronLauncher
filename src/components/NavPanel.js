import React from 'react';
import UserButton from './UserButton';

function NavPanel({ games, selectedItem, setSelectedItem }) {
  return (
    <div className="nav-panel">
      {/* Home Navigation Item */}
      <div 
        className={`nav-item ${selectedItem === 'home' ? 'active' : ''}`}
        onClick={() => setSelectedItem('home')}
      >
        <div className="nav-icon home-icon">🏠</div>
        <div className="nav-text">Home</div>
      </div>
      
      <div className="nav-divider"></div>
      
      {/* Games Navigation */}
      <div className="nav-games">
        {games.map(game => (
          <div 
            key={game.id} 
            className={`nav-item ${selectedItem === game.id ? 'active' : ''}`}
            onClick={() => setSelectedItem(game.id)}
          >
            <div className="nav-icon">
              <img src={game.icon} alt={game.name} onError={(e) => {e.target.src = '/assets/placeholder.svg'}} />
            </div>
            <div className="nav-text">{game.name}</div>
          </div>
        ))}
      </div>

      {/* User button at the bottom */}
      <div className="nav-footer">
        <UserButton />
      </div>
    </div>
  );
}

export default NavPanel; 