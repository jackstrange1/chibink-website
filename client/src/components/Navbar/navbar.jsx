import './navbar.css';
import { useState, useEffect } from 'react';
import WalletChecker from '../wallet.jsx/wallet';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState('');

  const scrollToSection = id => {
    const el = document.getElementById(id);
    if (!el) return;

    const offset = 70;
    const top = el.offsetTop - offset;

    window.scrollTo({ top, behavior: 'smooth' });

    setMenuOpen(false);
  };

  const handleDiscord = () => {
    setToast('Discord coming soon 🚧');
    setTimeout(() => setToast(''), 2500);
  };

  const handleTwitter = () => {
    window.open('https://x.com/ChibiOnInk', '_blank');
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 🔥 LOCK SCROLL WHEN MENU OPEN
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : 'auto';
  }, [menuOpen]);

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        {/* LOGO */}
        <div className="nav-logo" onClick={() => scrollToSection('home')}>
          <h1>
            <span className="logo-white">CHIBI</span>
            <span className="logo-purple">NK</span>
          </h1>
        </div>

        {/* DESKTOP MENU */}
        <div className="nav-tools">
          <p onClick={() => scrollToSection('home')}>HOME</p>
          <p onClick={() => setWalletOpen(true)}>WALLET</p>
          <p onClick={() => scrollToSection('about')}>ABOUT</p>
          <p onClick={() => scrollToSection('roadmap')}>ROADMAP</p>
        </div>

        {/* DESKTOP BUTTONS */}
        <div className="nav-btns">
          <button onClick={handleDiscord}>Discord</button>
          <button onClick={handleTwitter}>X</button>
        </div>

        {/* MOBILE TOGGLE */}
        <div
          className={`nav-toggle ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${menuOpen ? 'show' : ''}`}>
        <p onClick={() => scrollToSection('home')}>HOME</p>
        <p
          onClick={() => {
            setWalletOpen(true);
            setMenuOpen(false);
          }}
        >
          WALLET
        </p>
        <p onClick={() => scrollToSection('about')}>ABOUT</p>
        <p onClick={() => scrollToSection('roadmap')}>ROADMAP</p>

        <div className="mobile-btns">
          <button onClick={handleDiscord}>Discord</button>
          <button onClick={handleTwitter}>X</button>
        </div>
      </div>

      {/* WALLET MODAL */}
      <WalletChecker isOpen={walletOpen} onClose={() => setWalletOpen(false)} />

      {/* TOAST */}
      {toast && <div className="toast">{toast}</div>}
    </>
  );
};

export default Navbar;
