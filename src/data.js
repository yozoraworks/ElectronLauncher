// Note: This file is kept for reference/backup purposes.
// News data is now fetched from the server

// Sample game data - for fallback purposes only
export const sampleGames = [
  {
    id: 1,
    name: 'Minecraft',
    version: '1.19.2',
    exePath: 'minecraft.exe',
    icon: '/assets/icons/minecraft.svg',
    filelistUrl: 'https://example.com/games/minecraft/filelist.json',
    downloadBucketUrl: 'https://storage.example.com/minecraft/'
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

// Global news for the home page
export const globalNews = [
  {
    id: 1,
    title: 'Gaming Industry News',
    image: '/assets/global-news-1.svg',
    summary: 'Latest trends in the gaming industry show a shift towards cross-platform play and more indie game success stories.'
  },
  {
    id: 2,
    title: 'E-Sports Tournament Announced',
    image: '/assets/global-news-2.svg',
    summary: 'The biggest e-sports event of the year has been announced with a record-breaking prize pool.'
  },
  {
    id: 3,
    title: 'New Gaming Hardware Released',
    image: '/assets/global-news-3.svg',
    summary: 'Next-gen gaming hardware hits the market with impressive performance improvements and new features.'
  },
  {
    id: 4,
    title: 'Game Developer Conference Highlights',
    image: '/assets/global-news-4.svg',
    summary: 'Catch up on all the exciting announcements and demos from this year\'s Game Developer Conference.'
  }
]; 