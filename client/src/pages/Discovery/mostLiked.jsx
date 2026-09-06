import './mostLiked.css';
import Navbar from '../../components/Navbar/navbar';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MostLiked = () => {
  const navigate = useNavigate();

  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ==========================================
  // FETCH MOST LIKED NFTs
  // ==========================================

  useEffect(() => {
    const fetchMostLiked = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/discovery/most-liked`
        );

        setNfts(response.data.nfts || []);
      } catch (error) {
        console.error('Failed to fetch most liked NFTs:', error);

        setError('Failed to load most liked NFTs');
      } finally {
        setLoading(false);
      }
    };

    fetchMostLiked();
  }, []);

  // ==========================================
  // OPEN COLLECTION
  // ==========================================

  const openCollection = collectionSlug => {
    navigate(`/collections/${collectionSlug}`);
  };

  return (
    <main className="most-liked-page">
      <Navbar />

      {/* ==========================================
          HERO
      ========================================== */}

      <section className="most-liked-hero">
        <div className="most-liked-hero-content">
          <p className="most-liked-eyebrow">DISCOVER • LIKE • EXPLORE</p>

          <h1 className="most-liked-title">
            Most <span>Liked NFTs</span>
          </h1>

          <p className="most-liked-description">
            Explore the NFTs that are getting the most love from the INK
            community.
          </p>
        </div>
      </section>

      {/* ==========================================
          MOST LIKED CONTENT
      ========================================== */}

      <section className="most-liked-content">
        {/* SECTION HEADER */}

        <div className="most-liked-section-header">
          <div className="most-liked-section-heading">
            <h2>
              <span className="most-liked-heart">♥</span>
              Most Liked NFTs
            </h2>

            <p>NFTs ranked by the number of community likes.</p>
          </div>

          {!loading && !error && (
            <span className="most-liked-count">{nfts.length} NFTs</span>
          )}
        </div>

        {/* ==========================================
            LOADING
        ========================================== */}

        {loading && (
          <div className="most-liked-state most-liked-loading">
            <div className="most-liked-loader">
              <span></span>
            </div>

            <p>Loading most liked NFTs...</p>
          </div>
        )}

        {/* ==========================================
            ERROR
        ========================================== */}

        {!loading && error && (
          <div className="most-liked-state most-liked-error">
            <div className="most-liked-state-icon">!</div>

            <h3>Something went wrong</h3>

            <p>{error}</p>
          </div>
        )}

        {/* ==========================================
            NFT GRID
        ========================================== */}

        {!loading && !error && nfts.length > 0 && (
          <div className="most-liked-grid">
            {nfts.map(nft => (
              <article
                className="most-liked-card"
                key={`${nft.contractAddress}-${nft.tokenId}`}
                onClick={() => openCollection(nft.collectionSlug)}
              >
                {/* NFT IMAGE */}

                <div className="most-liked-card-image">
                  {nft.image ? (
                    <img
                      src={nft.image}
                      alt={nft.name || `NFT #${nft.tokenId}`}
                      className="most-liked-image"
                    />
                  ) : (
                    <div className="most-liked-image-placeholder">
                      <span>INK</span>
                    </div>
                  )}
                </div>

                {/* NFT INFO */}

                <div className="most-liked-card-body">
                  <div className="most-liked-card-heading">
                    <div className="most-liked-card-title">
                      <h3>{nft.name || `#${nft.tokenId}`}</h3>

                      <p>{nft.collection || nft.collectionSlug}</p>
                    </div>
                  </div>

                  {/* LIKE COUNT */}

                  <div className="most-liked-stat-row">
                    <div className="most-liked-stat">
                      <span className="most-liked-stat-icon">♥</span>

                      <strong>{nft.likeCount || 0}</strong>

                      <span className="most-liked-stat-label">Likes</span>
                    </div>
                  </div>

                  {/* INTERACTION HINT */}

                  <div className="most-liked-interaction">
                    <span>Click to view & interact</span>

                    <span className="most-liked-arrow">→</span>
                  </div>

                  {/* OPENSEA */}

                  {nft.openseaUrl && (
                    <button
                      className="most-liked-opensea"
                      type="button"
                      onClick={event => {
                        event.stopPropagation();

                        window.open(nft.openseaUrl, '_blank');
                      }}
                    >
                      <span>View on OpenSea</span>

                      <span className="most-liked-opensea-arrow">↗</span>
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* ==========================================
            EMPTY
        ========================================== */}

        {!loading && !error && nfts.length === 0 && (
          <div className="most-liked-state most-liked-empty">
            <div className="most-liked-state-icon">♥</div>

            <h3>No liked NFTs yet</h3>

            <p>
              Community likes will appear here once NFTs start receiving likes.
            </p>
          </div>
        )}
      </section>

      {/* ==========================================
          BOTTOM INFO
      ========================================== */}

      {!loading && !error && nfts.length > 0 && (
        <section className="most-liked-bottom">
          <div className="most-liked-bottom-content">
            <span className="most-liked-bottom-icon">♥</span>

            <div>
              <h3>Community powered</h3>

              <p>Rankings are based on likes from the INK community.</p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default MostLiked;
