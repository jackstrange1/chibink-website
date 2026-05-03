import './whitelist.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Whitelist = () => {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState({
    follow: false,
    like: false,
    comment: false,
  });

  const [tweetLink, setTweetLink] = useState('');
  const [wallet, setWallet] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('wl_tasks'));
    if (saved) setTasks(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('wl_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const completeTask = task => {
    setTimeout(() => {
      setTasks(prev => ({ ...prev, [task]: true }));
    }, 1000);
  };

  const handleSubmit = async () => {
    if (!tasks.follow || !tasks.like || !tasks.comment) {
      setError('⚠️ Complete all tasks first');
      return;
    }

    if (!tweetLink || !wallet) {
      setError('⚠️ Fill all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await axios.post('https://chibink-website.onrender.com/api/whitelist', {
        wallet,
        tweetLink,
        tasks,
      });

      setSubmitted(true);

      setTimeout(() => navigate('/'), 2500);
    } catch (err) {
      setError(err.response?.data?.msg || '❌ Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wl-page">
      {/* HEADER BAR */}
      <div className="wl-header">
        <button className="wl-home-btn" onClick={() => navigate('/')}>
          ← Back Home
        </button>
      </div>

      <div className="wl-card">
        <h1 className="wl-title">Join Whitelist</h1>

        {/* TASKS */}
        <div className="wl-tasks">
          <div
            className={`wl-task ${tasks.follow ? 'done' : ''}`}
            onClick={() => {
              window.open('https://x.com/ChibiOnInk', '_blank');
              completeTask('follow');
            }}
          >
            <span>Follow on X</span>
            <span>{tasks.follow ? '✔' : '→'}</span>
          </div>

          <div
            className={`wl-task ${tasks.like ? 'done' : ''}`}
            onClick={() => {
              window.open(
                'https://x.com/ChibiOnInk/status/2050105535002001444?s=20',
                '_blank'
              );
              completeTask('like');
            }}
          >
            <span>Like & Repost</span>
            <span>{tasks.like ? '✔' : '→'}</span>
          </div>

          <div
            className={`wl-task ${tasks.comment ? 'done' : ''}`}
            onClick={() => {
              window.open(
                'https://x.com/ChibiOnInk/status/2050105535002001444?s=20',
                '_blank'
              );
              completeTask('comment');
            }}
          >
            <span>Comment + Tag 3 Friends</span>
            <span>{tasks.comment ? '✔' : '→'}</span>
          </div>
        </div>

        {/* INPUTS */}
        <div className="wl-inputs">
          <input
            type="text"
            placeholder="Paste your tweet link"
            value={tweetLink}
            onChange={e => setTweetLink(e.target.value)}
          />

          <input
            type="text"
            placeholder="Enter wallet address"
            value={wallet}
            onChange={e => setWallet(e.target.value)}
          />
        </div>

        {/* ERROR */}
        {error && <p className="wl-error">{error}</p>}

        {/* SUBMIT */}
        <button
          className={`wl-submit ${loading ? 'loading' : ''}`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>

      {/* SUCCESS */}
      {submitted && (
        <div className="wl-success-overlay">
          <div className="wl-success-box">
            <h2>🎉 Whitelist Submitted</h2>
            <p>You're in! Redirecting...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Whitelist;
