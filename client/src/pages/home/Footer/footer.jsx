import './footer.css';
import { useState } from 'react';

const Footer = () => {
  const [toast, setToast] = useState('');

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleDiscord = () => {
    showToast('Discord coming soon 🚧');
  };

  const handleX = () => {
    window.open('https://x.com/ChibiOnInk', '_blank');
  };

  return (
    <>
      <footer className="footer">
        <div className="footer-container">
          {/* TOP */}
          <div className="footer-top">
            {/* BRAND */}
            <div className="footer-brand">
              <h2>
                <span className="logo-white">CHIBI</span>
                <span className="logo-purple">NK</span>
              </h2>
              <p>Building something beyond NFTs on INK.</p>
            </div>

            {/* CONTACT */}
            <div className="footer-contact">
              <p className="footer-label">Contact</p>
              <span>contact@chibionink2026@gmail.com</span>
            </div>

            {/* SOCIAL */}
            <div className="footer-socials">
              <p className="footer-label">Community</p>

              <div className="social-buttons">
                <button className="btn-discord" onClick={handleDiscord}>
                  Discord
                </button>
                <button className="btn-x" onClick={handleX}>
                  X
                </button>
              </div>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="footer-divider" />

          {/* BOTTOM */}
          <div className="footer-bottom">
            <div className="footer-links">
              <p>Terms</p>
              <p>Privacy Policy</p>
            </div>

            <p className="footer-copy">© 2026 CHIBINK. All rights reserved.</p>
          </div>
        </div>

        {/* GLOW */}
        <div className="footer-glow glow-1"></div>
        <div className="footer-glow glow-2"></div>
      </footer>

      {/* 🔥 TOAST (GLOBAL FEEL) */}
      {toast && <div className="footer-toast">{toast}</div>}
    </>
  );
};

export default Footer;
