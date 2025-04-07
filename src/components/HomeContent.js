import React from 'react';

function HomeContent({ globalNews, isLoading, error }) {
  // Function to open URL in external browser
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

  if (isLoading) {
    return <div className="loading-message">Loading news...</div>;
  }
  
  if (error) {
    return <div className="error-message">Error loading news: {error}</div>;
  }
  
  if (!globalNews || globalNews.length === 0) {
    return <div className="no-news-message">No news available.</div>;
  }
  
  return (
    <div className="home-content">
      <h1>Gaming News</h1>
      <div className="news-grid">
        {globalNews.map(news => (
          <div 
            className="news-card" 
            key={news.id}
            onClick={(e) => openNewsUrl(e, news.url)}
            style={{ cursor: news.url ? 'pointer' : 'default' }}
          >
            <img src={news.image} alt={news.title} onError={(e) => {e.target.src = '/assets/placeholder.svg'}} />
            <div className="news-info">
              <h3>{news.title}</h3>
              <p>{news.summary}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomeContent; 