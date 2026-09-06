import './topRated.css';
import Navbar from '../../components/Navbar/navbar';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TopRated = () => {
  const navigate = useNavigate();

  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ==========================================
  // FETCH TOP RATED NFTs
  // ==========================================

  useEffect(() => {
    const fetchTopRated = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await axios.get(
          'http://localhost:3000/api/discovery/top-rated'
        );

        setNfts(response.data.nfts || []);
      } catch (error) {
        console.error('Failed to fetch top rated NFTs:', error);

        setError('Failed to load top rated NFTs');
      } finally {
        setLoading(false);
      }
    };

    fetchTopRated();
  }, []);

  // ==========================================
  // OPEN COLLECTION
  // ==========================================

  const openCollection = collectionSlug => {
    navigate(`/collections/${collectionSlug}`);
  };

  return (
    <main className="top-rated-page">
      <Navbar />

      {/* ==========================================
          HERO
      ========================================== */}

      <section className="top-rated-hero">
        <div className="top-rated-hero-content">
          <p className="top-rated-eyebrow">DISCOVER • RATE • EXPLORE</p>

          <h1 className="top-rated-title">
            Top <span>Rated NFTs</span>
          </h1>

          <p className="top-rated-description">
            Explore the NFTs with the highest ratings from the INK community.
          </p>
        </div>
      </section>

      {/* ==========================================
          TOP RATED CONTENT
      ========================================== */}

      <section className="top-rated-content">
        {/* SECTION HEADER */}

        <div className="top-rated-section-header">
          <div className="top-rated-section-heading">
            <h2>
              <span className="top-rated-star">★</span>
              Top Rated NFTs
            </h2>

            <p>NFTs ranked by their community ratings.</p>
          </div>

          {!loading && !error && (
            <span className="top-rated-count">{nfts.length} NFTs</span>
          )}
        </div>

        {/* ==========================================
            LOADING
        ========================================== */}

        {loading && (
          <div className="top-rated-state top-rated-loading">
            <div className="top-rated-loader">
              <span></span>
            </div>

            <p>Loading top rated NFTs...</p>
          </div>
        )}

        {/* ==========================================
            ERROR
        ========================================== */}

        {!loading && error && (
          <div className="top-rated-state top-rated-error">
            <div className="top-rated-state-icon">!</div>

            <h3>Something went wrong</h3>

            <p>{error}</p>
          </div>
        )}

        {/* ==========================================
            NFT GRID
        ========================================== */}

        {!loading && !error && nfts.length > 0 && (
          <div className="top-rated-grid">
            {nfts.map(nft => (
              <article
                className="top-rated-card"
                key={`${nft.contractAddress}-${nft.tokenId}`}
                onClick={() => openCollection(nft.collectionSlug)}
              >
                {/* NFT IMAGE */}

                <div className="top-rated-card-image">
                  {nft.image ? (
                    <img
                      src={nft.image}
                      alt={nft.name || `NFT #${nft.tokenId}`}
                      className="top-rated-image"
                    />
                  ) : (
                    <div className="top-rated-image-placeholder">
                      <span>INK</span>
                    </div>
                  )}
                </div>

                {/* NFT INFO */}

                <div className="top-rated-card-body">
                  <div className="top-rated-card-heading">
                    <div className="top-rated-card-title">
                      <h3>{nft.name || `#${nft.tokenId}`}</h3>

                      <p>{nft.collection || nft.collectionSlug}</p>
                    </div>
                  </div>

                  {/* RATING */}

                  <div className="top-rated-stat-row">
                    <div className="top-rated-stat">
                      <span className="top-rated-stat-icon">★</span>

                      <strong>
                        {typeof nft.averageRating === 'number'
                          ? nft.averageRating.toFixed(1)
                          : '0.0'}
                      </strong>

                      <span className="top-rated-stat-label">Rating</span>

                      <span className="top-rated-votes">
                        ({nft.ratingCount || 0})
                      </span>
                    </div>
                  </div>

                  {/* INTERACTION HINT */}

                  <div className="top-rated-interaction">
                    <span>Click to view & interact</span>

                    <span className="top-rated-arrow">→</span>
                  </div>

                  {/* OPENSEA */}

                  {nft.openseaUrl && (
                    <button
                      className="top-rated-opensea"
                      type="button"
                      onClick={event => {
                        event.stopPropagation();

                        window.open(nft.openseaUrl, '_blank');
                      }}
                    >
                      <span>View on OpenSea</span>

                      <span className="top-rated-opensea-arrow">↗</span>
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
          <div className="top-rated-state top-rated-empty">
            <div className="top-rated-state-icon">★</div>

            <h3>No rated NFTs yet</h3>

            <p>
              Community ratings will appear here once NFTs start receiving
              ratings.
            </p>
          </div>
        )}
      </section>

      {/* ==========================================
          BOTTOM INFO
      ========================================== */}

      {!loading && !error && nfts.length > 0 && (
        <section className="top-rated-bottom">
          <div className="top-rated-bottom-content">
            <span className="top-rated-bottom-icon">★</span>

            <div>
              <h3>Community rated</h3>

              <p>
                Rankings are based on ratings submitted by the INK community.
              </p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default TopRated;
