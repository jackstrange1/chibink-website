import './App.css';
import { Routes, Route } from 'react-router-dom';

import ParticleEffect from './components/particles/particles';
import Explore from './pages/Explore/explore';
import Collections from './pages/Collections/collections';
import Collection from './pages/Collection/collection';
import MostLiked from './pages/Discovery/mostLiked';
import TopRated from './pages/Discovery/topRated';

const Leaderboard = () => {
  return (
    <div>
      <h1>Leaderboard</h1>
      <p>INK NFT leaderboard coming soon...</p>
    </div>
  );
};

const App = () => {
  return (
    <div className="app">
      {/* GLOBAL PARTICLES */}
      <ParticleEffect />

      {/* ROUTING */}
      <Routes>
        {/* Main Page */}
        <Route path="/" element={<Explore />} />

        {/* Explore */}
        <Route path="/explore" element={<Explore />} />

        {/* Collections */}
        <Route path="/collections" element={<Collections />} />
        <Route path="/collections/:slug" element={<Collection />} />
        <Route path="/discover/liked" element={<MostLiked />} />
        <Route path="/discover/rated" element={<TopRated />} />

        {/* Leaderboard */}
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </div>
  );
};

export default App;
