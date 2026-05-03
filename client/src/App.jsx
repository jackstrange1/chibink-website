import './App.css';
import { Routes, Route } from 'react-router-dom';

import Home from './pages/home/home';
import ParticleEffect from './components/particles/particles';
import Whitelist from './pages/Whitelist/whitelist';

const App = () => {
  return (
    <div className="app">
      {/* GLOBAL PARTICLES */}
      <ParticleEffect />

      {/* ROUTING */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/whitelist" element={<Whitelist />} />
      </Routes>
    </div>
  );
};

export default App;
