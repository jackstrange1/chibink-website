import './navbar.css';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Wallet from '../Wallet/ wallet';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const goToPage = path => {
    navigate(path);
    setMenuOpen(false);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // ==========================================
  // GO TO ABOUT
  // ==========================================

  const goToAbout = () => {
    setMenuOpen(false);

    // If already on Explore
    if (location.pathname === '/') {
      document.getElementById('about')?.scrollIntoView({
        behavior: 'smooth',
      });

      return;
    }

    // If on another page, go to Explore first
    navigate('/');

    setTimeout(() => {
      document.getElementById('about')?.scrollIntoView({
        behavior: 'smooth',
      });
    }, 150);
  };

  // ==========================================
  // BUY YOUR CHIBI
  // ==========================================

  const handleBuyChibi = () => {
    window.open(
      'https://opensea.io/collection/chibink',
      '_blank',
      'noopener,noreferrer'
    );

    setMenuOpen(false);
  };

  // ==========================================
  // DISCORD
  // ==========================================

  const handleDiscord = () => {
    setToast('Discord coming soon 🚧');

    setTimeout(() => {
      setToast('');
    }, 2500);
  };

  // ==========================================
  // X / TWITTER
  // ==========================================

  const handleTwitter = () => {
    window.open('https://x.com/ChibiOnInk', '_blank', 'noopener,noreferrer');
  };

  // ==========================================
  // NAVBAR SCROLL
  // ==========================================

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // ==========================================
  // LOCK SCROLL WHEN MOBILE MENU IS OPEN
  // ==========================================

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : 'auto';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [menuOpen]);

  return (
    <>
      {/* ==========================================
          NAVBAR
      ========================================== */}

      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        {/* LOGO */}

        <div className="nav-logo" onClick={() => goToPage('/')}>
          <h1>
            <span className="logo-white">CHIBI</span>

            <span className="logo-purple">NK</span>
          </h1>
        </div>

        {/* ==========================================
            DESKTOP MENU
        ========================================== */}

        <div className="nav-tools">
          <p
            className={location.pathname === '/' ? 'active' : ''}
            onClick={() => goToPage('/')}
          >
            EXPLORE
          </p>

          <p
            className={location.pathname === '/collections' ? 'active' : ''}
            onClick={() => goToPage('/collections')}
          >
            COLLECTIONS
          </p>

          <p className="nav-buy-link" onClick={handleBuyChibi}>
            BUY YOUR CHIBI
          </p>

          {/* ABOUT */}

          <p className="nav-about-link" onClick={goToAbout}>
            ABOUT
          </p>
        </div>

        {/* ==========================================
            DESKTOP BUTTONS
        ========================================== */}

        <div className="nav-btns">
          <button onClick={handleDiscord}>Discord</button>

          <button onClick={handleTwitter}>X</button>

          <Wallet />
        </div>

        {/* ==========================================
            MOBILE TOGGLE
        ========================================== */}

        <div
          className={`nav-toggle ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </nav>

      {/* ==========================================
          MOBILE MENU
      ========================================== */}

      <div className={`mobile-menu ${menuOpen ? 'show' : ''}`}>
        <p
          className={location.pathname === '/' ? 'active' : ''}
          onClick={() => goToPage('/')}
        >
          EXPLORE
        </p>

        <p
          className={location.pathname === '/collections' ? 'active' : ''}
          onClick={() => goToPage('/collections')}
        >
          COLLECTIONS
        </p>

        <p className="nav-buy-link" onClick={handleBuyChibi}>
          BUY YOUR CHIBI
        </p>

        {/* ABOUT */}

        <p className="nav-about-link" onClick={goToAbout}>
          ABOUT
        </p>

        {/* MOBILE BUTTONS */}

        <div className="mobile-btns">
          <button onClick={handleDiscord}>Discord</button>

          <button onClick={handleTwitter}>X</button>

          <Wallet />
        </div>
      </div>

      {/* ==========================================
          TOAST
      ========================================== */}

      {toast && <div className="toast">{toast}</div>}
    </>
  );
};

export default Navbar;
