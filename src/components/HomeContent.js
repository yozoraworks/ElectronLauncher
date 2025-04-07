import React from 'react';

function HomeContent({ globalNews, isLoading, error }) {
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
          <div className="news-card" key={news.id}>
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