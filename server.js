const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;

// Enable CORS
app.use(cors());

// Parse JSON body
app.use(express.json());

// Serve static files from the public_files directory
app.use('/files', express.static('public_files'));

// Game-specific news data
const gameNews = {
  1: [ // Minecraft news
    {
      id: 1,
      date: '2023-04-01',
      title: 'New Minecraft Update 1.19',
      content: 'Explore the new Wild Update featuring new biomes and mobs like the Warden and the Allay.',
      image: '/assets/news/minecraft-update.jpg',
      url: ''
    },
    {
      id: 2,
      date: '2023-03-15',
      title: 'Minecraft Community Event',
      content: 'Join the community building event this weekend to help create a massive collaborative world.',
      image: '/assets/news/minecraft-event.jpg',
      url: 'https://www.minecraft.net/en-us/community'
    },
    {
      id: 3,
      date: '2023-02-28',
      title: 'Minecraft Marketplace Updates',
      content: 'Check out the latest additions to the Minecraft marketplace with new skins and texture packs.',
      image: '/assets/news/minecraft-marketplace.jpg',
    }
  ],
  2: [ // Fortnite news
    {
      id: 1,
      date: '2023-04-05',
      title: 'Chapter 4 Season 2 Now Live',
      content: 'Drop into the new season with new locations, weapons, and the ability to use vehicles in creative mode.',
      image: '/assets/news/fortnite-season.jpg',
      url: 'https://www.google.com/search?q=fortnite+chapter+4+season+2'
    },
    {
      id: 2,
      date: '2023-03-20',
      title: 'Fortnite Competitive Update',
      content: 'Changes to competitive play and tournament structure have been announced for the upcoming FNCS.',
      image: '/assets/news/fortnite-competitive.jpg',
      url: 'https://www.epicgames.com/fortnite/competitive'
    },
    {
      id: 3,
      date: '2023-03-10',
      title: 'New Collaboration Skins',
      content: 'Famous movie characters join the Fortnite universe with exclusive skins and emotes.',
      image: '/assets/news/fortnite-skins.jpg',
      url: 'https://www.epicgames.com/fortnite/en-US/news'
    }
  ],
  3: [ // Valorant news
    {
      id: 1,
      date: '2023-04-02',
      title: 'New Agent Revealed',
      content: 'Meet the newest agent joining the Valorant roster, with unique abilities that will change the meta.',
      image: '/assets/news/valorant-agent.jpg',
      url: 'https://www.google.com/search?q=valorant+new+agent'
    },
    {
      id: 2,
      date: '2023-03-25',
      title: 'Map Updates and Balance Changes',
      content: 'Several maps have received updates to address balance issues and improve gameplay flow.',
      image: '/assets/news/valorant-maps.jpg',
      url: 'https://playvalorant.com/en-us/news/game-updates/'
    },
    {
      id: 3,
      date: '2023-03-15',
      title: 'Valorant Championship Series',
      content: 'The biggest Valorant tournament of the year is coming soon with teams from around the world.',
      image: '/assets/news/valorant-tournament.jpg',
      url: 'https://valorantesports.com'
    }
  ]
};

// Global news data
const globalNews = [
  {
    id: 1,
    title: 'Gaming Industry News',
    image: '/assets/global-news-1.svg',
    summary: 'Latest trends in the gaming industry show a shift towards cross-platform play and more indie game success stories.',
    url: 'https://www.google.com/search?q=gaming+industry+trends'
  },
  {
    id: 2,
    title: 'E-Sports Tournament Announced',
    image: '/assets/global-news-2.svg',
    summary: 'The biggest e-sports event of the year has been announced with a record-breaking prize pool.',
    url: 'https://www.esportsinsider.com/news'
  },
  {
    id: 3,
    title: 'New Gaming Hardware Released',
    image: '/assets/global-news-3.svg',
    summary: 'Next-gen gaming hardware hits the market with impressive performance improvements and new features.',
    url: 'https://www.techradar.com/news/computing-components/graphics-cards'
  },
  {
    id: 4,
    title: 'Game Developer Conference Highlights',
    image: '/assets/global-news-4.svg',
    summary: 'Catch up on all the exciting announcements and demos from this year\'s Game Developer Conference.',
    url: 'https://gdconf.com'
  }
];

// Sample games data (without news, which is now separate)
const games = [
  {
    id: 1,
    name: 'test',
    version: '1.19.2',
    exePath: 'test.exe',
    icon: '/assets/icons/minecraft.svg',
    filelistUrl: 'http://localhost:3001/files/minecraft/filelist.json',
    downloadBucketUrl: 'http://localhost:3001/files/minecraft/'
  },
  {
    id: 2,
    name: 'Fortnite',
    version: '23.10.0',
    exePath: 'FortniteClient-Win64-Shipping.exe',
    icon: '/assets/icons/fortnite.svg',
    filelistUrl: 'https://example.com/games/fortnite/filelist.json',
    downloadBucketUrl: 'https://storage.example.com/fortnite/'
  },
  {
    id: 3,
    name: 'Valorant',
    version: '5.12',
    exePath: 'VALORANT.exe',
    icon: '/assets/icons/valorant.svg',
    filelistUrl: 'https://example.com/games/valorant/filelist.json',
    downloadBucketUrl: 'https://storage.example.com/valorant/'
  }
];

// API routes
// Get all games
app.get('/api/games', (req, res) => {
  res.json({
    success: true,
    data: games
  });
});

// Get a specific game
app.get('/api/games/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const game = games.find(g => g.id === id);
  
  if (game) {
    res.json({
      success: true,
      data: game
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Game not found'
    });
  }
});

// Get global news
app.get('/api/news/global', (req, res) => {
  res.json({
    success: true,
    data: globalNews
  });
});

// Get news for a specific game
app.get('/api/news/game/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const news = gameNews[id];
  
  if (news) {
    res.json({
      success: true,
      data: news
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'News not found for this game'
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
}); 