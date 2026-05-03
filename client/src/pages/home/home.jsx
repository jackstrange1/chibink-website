import './home.css';
import Navbar from '../../components/Navbar/navbar';
import Roadmap from '../Roadmap/roadmap';
import About from './About/about';
import Footer from './Footer/footer';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  // ===== SCROLL URL SYNC =====
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'footer', el: document.getElementById('footer') },
        { id: 'roadmap', el: document.getElementById('roadmap') },
        { id: 'about', el: document.getElementById('about') },
        { id: 'home', el: document.getElementById('home') },
      ];

      for (let section of sections) {
        if (!section.el) continue;

        const rect = section.el.getBoundingClientRect();

        if (
          rect.top <= window.innerHeight * 0.3 &&
          rect.bottom >= window.innerHeight * 0.3
        ) {
          window.history.replaceState(
            null,
            '',
            section.id === 'home' ? '/' : `#${section.id}`
          );
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const goToWhitelist = () => navigate('/whitelist');

  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="home-wrapper">
      <Navbar />

      {/* ===== HERO ===== */}
      <section id="home" className="home">
        <div className="hero-content">
          <h1 className="hero-title">
            THE CUTEST <br />
            <span>CHIBINK</span>
          </h1>

          <p className="hero-subtitle">
            A next-gen NFT collection on <span>INK</span>
          </p>

          <div className="hero-buttons">
            <button className="primary-btn" onClick={goToWhitelist}>
              ✦ Join Whitelist
            </button>

            <button className="secondary-btn" onClick={scrollToAbout}>
              Explore
            </button>
          </div>

          <p className="hero-tagline">
            555 unique chibis • Free mint • Built for community
          </p>
        </div>

        {/* GLOW EFFECTS */}
        <div className="hero-glow glow-1"></div>
        <div className="hero-glow glow-2"></div>
        <div className="hero-glow glow-3"></div>
      </section>

      {/* ABOUT */}
      <section id="about">
        <About />
      </section>

      {/* ROADMAP */}
      <section id="roadmap">
        <Roadmap />
      </section>

      {/* FOOTER */}
      <section id="footer">
        <Footer />
      </section>
    </div>
  );
};

export default Home;
