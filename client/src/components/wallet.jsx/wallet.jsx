import './wallet.css';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const WalletChecker = ({ isOpen, onClose }) => {
  const [wallet, setWallet] = useState('');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState(''); // success | error
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const checkWallet = async () => {
    const value = wallet.trim().toLowerCase();

    if (!value) {
      setStatus('error');
      setResult('Please enter a wallet address');
      return;
    }

    if (!/^0x[a-f0-9]{40}$/.test(value)) {
      setStatus('error');
      setResult('Invalid wallet address');
      return;
    }

    try {
      setLoading(true);
      setResult('');
      setStatus('');

      const res = await axios.get(
        `https://chibink-website.onrender.com/api/wallet/${value}`
      );

      setStatus('success');
      setResult(res.data.msg);
    } catch (err) {
      setStatus('error');
      setResult(err.response?.data?.msg || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  // ESC CLOSE
  useEffect(() => {
    const handleEsc = e => e.key === 'Escape' && onClose();
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // LOCK SCROLL
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    return () => (document.body.style.overflow = 'auto');
  }, [isOpen]);

  // RESET
  useEffect(() => {
    if (isOpen) {
      setWallet('');
      setResult('');
      setStatus('');

      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="wallet-overlay" onClick={onClose}>
      <div className="wallet-modal" onClick={e => e.stopPropagation()}>
        <button className="wallet-close" onClick={onClose}>
          ✕
        </button>

        <div className="wallet-content">
          <div className="wallet-icon-top">✦</div>

          <h2>Check Wallet Status</h2>

          <div className="wallet-box">
            <input
              ref={inputRef}
              type="text"
              placeholder="0x..."
              value={wallet}
              onChange={e => setWallet(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && checkWallet()}
            />

            <button onClick={checkWallet} disabled={loading}>
              {loading ? <span className="loader"></span> : 'Check'}
            </button>
          </div>

          {result && (
            <p className={`wallet-result ${status}`}>
              {status === 'success' ? '✅' : '❌'} {result}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletChecker;
