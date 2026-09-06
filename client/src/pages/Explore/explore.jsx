import './explore.css';
import Navbar from '../../components/Navbar/navbar';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Explore = () => {
  const navigate = useNavigate();

  const [mostLiked, setMostLiked] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [biggestSales, setBiggestSales] = useState([]);
  const [floorUp, setFloorUp] = useState([]);

  const [activeFilter, setActiveFilter] = useState('trending');

  const [floorUpLoading, setFloorUpLoading] = useState(true);
  const [floorUpError, setFloorUpError] = useState('');

  const [mostLikedLoading, setMostLikedLoading] = useState(true);
  const [topRatedLoading, setTopRatedLoading] = useState(true);

  const [biggestSalesLoading, setBiggestSalesLoading] = useState(true);
  const [biggestSalesError, setBiggestSalesError] = useState('');

  const [mostLikedError, setMostLikedError] = useState('');
  const [topRatedError, setTopRatedError] = useState('');

  // ==========================================
  // FETCH MOST LIKED NFTs
  // ==========================================

  useEffect(() => {
    const fetchMostLiked = async () => {
      try {
        setMostLikedLoading(true);
        setMostLikedError('');

        const response = await axios.get(
          'http://localhost:3000/api/discovery/most-liked'
        );

        setMostLiked(response.data.nfts || []);
      } catch (error) {
        console.error('Failed to fetch most liked NFTs:', error);

        setMostLikedError('Failed to load most liked NFTs');
      } finally {
        setMostLikedLoading(false);
      }
    };

    fetchMostLiked();
  }, []);

  // ==========================================
  // FETCH TOP RATED NFTs
  // ==========================================

  useEffect(() => {
    const fetchTopRated = async () => {
      try {
        setTopRatedLoading(true);
        setTopRatedError('');

        const response = await axios.get(
          'http://localhost:3000/api/discovery/top-rated'
        );

        setTopRated(response.data.nfts || []);
      } catch (error) {
        console.error('Failed to fetch top rated NFTs:', error);

        setTopRatedError('Failed to load top rated NFTs');
      } finally {
        setTopRatedLoading(false);
      }
    };

    fetchTopRated();
  }, []);

  // ==========================================
  // FETCH BIGGEST SALES
  // ==========================================

  useEffect(() => {
    const fetchBiggestSales = async () => {
      try {
        setBiggestSalesLoading(true);
        setBiggestSalesError('');

        const response = await axios.get(
          'http://localhost:3000/api/opensea/sales-24h'
        );

        setBiggestSales(response.data.events || []);
      } catch (error) {
        console.error('Failed to fetch biggest sales:', error);

        setBiggestSalesError('Failed to load biggest sales');
      } finally {
        setBiggestSalesLoading(false);
      }
    };

    fetchBiggestSales();
  }, []);

  // ==========================================
  // FETCH FLOOR UP — LAST 24H
  // ==========================================

  useEffect(() => {
    const fetchFloorUp = async () => {
      try {
        setFloorUpLoading(true);
        setFloorUpError('');

        const response = await axios.get(
          'http://localhost:3000/api/opensea/floor-up-24h'
        );

        setFloorUp(response.data.collections || []);
      } catch (error) {
        console.error('Failed to fetch floor up collections:', error);

        setFloorUpError('Failed to load floor up collections');
      } finally {
        setFloorUpLoading(false);
      }
    };

    fetchFloorUp();
  }, []);

  // ==========================================
  // OPEN COLLECTION
  // ==========================================

  const openCollection = collectionSlug => {
    navigate(`/collections/${collectionSlug}`);
  };

  // ==========================================
  // VIEW ALL
  // ==========================================

  const openMostLiked = () => {
    navigate('/discover/liked');
  };

  const openTopRated = () => {
    navigate('/discover/rated');
  };

  // ==========================================
  // FILTERED DISCOVERY NFTs
  // ==========================================

  const trendingNFTs = [
    ...mostLiked,
    ...topRated.filter(
      ratedNFT =>
        !mostLiked.some(
          likedNFT =>
            likedNFT.contractAddress === ratedNFT.contractAddress &&
            likedNFT.tokenId === ratedNFT.tokenId
        )
    ),
  ];

  const filteredNFTs =
    activeFilter === 'liked'
      ? mostLiked
      : activeFilter === 'rated'
        ? topRated
        : trendingNFTs;

  const filteredLoading =
    activeFilter === 'liked'
      ? mostLikedLoading
      : activeFilter === 'rated'
        ? topRatedLoading
        : mostLikedLoading || topRatedLoading;

  const filteredError =
    activeFilter === 'liked'
      ? mostLikedError
      : activeFilter === 'rated'
        ? topRatedError
        : mostLikedError || topRatedError;

  const filteredTitle =
    activeFilter === 'liked'
      ? '🔥 Most Liked NFTs'
      : activeFilter === 'rated'
        ? '⭐ Top Rated NFTs'
        : '🔥 Trending NFTs';

  const filteredDescription =
    activeFilter === 'liked'
      ? 'The most liked NFTs from the INK community.'
      : activeFilter === 'rated'
        ? 'NFTs with the highest community ratings.'
        : 'Discover trending NFTs across the INK ecosystem.';

  return (
    <main className="explore-page">
      <Navbar />

      {/* ==========================================
          HERO
      ========================================== */}

      <section className="explore-hero-section explore-hero-compact">
        <div className="explore-header">
          <p className="explore-eyebrow">DISCOVER • RATE • LIKE • DISCUSS</p>

          <h1>
            Discover <span>INK NFTs</span>
          </h1>

          <p className="explore-description">
            Explore the most exciting NFTs from the INK ecosystem, discover
            trending artwork, top rated NFTs, and more.
          </p>
        </div>
      </section>

      {/* ==========================================
          FILTERS
      ========================================== */}

      <section className="explore-controls explore-controls-compact">
        <div className="explore-filters">
          <button
            className={`filter-btn ${
              activeFilter === 'trending' ? 'active' : ''
            }`}
            onClick={() => setActiveFilter('trending')}
          >
            Trending
          </button>

          <button
            className={`filter-btn ${activeFilter === 'liked' ? 'active' : ''}`}
            onClick={() => setActiveFilter('liked')}
          >
            Most Liked
          </button>

          <button
            className={`filter-btn ${activeFilter === 'rated' ? 'active' : ''}`}
            onClick={() => setActiveFilter('rated')}
          >
            Top Rated
          </button>
        </div>
      </section>

      {/* ==========================================
          MARKET DASHBOARD
      ========================================== */}

      <div className="market-dashboard-row compact-market-row">
        {/* ==========================================
            BIGGEST SALES — LAST 24H
        ========================================== */}

        <section className="nft-section discovery-section biggest-sales-section compact-discovery-section">
          <div className="nft-section-header compact-section-header">
            <div>
              <h2>💰 Biggest Sales — Last 24H</h2>

              <p>The biggest NFT sales across the INK ecosystem.</p>
            </div>

            {!biggestSalesLoading && !biggestSalesError && (
              <span className="nft-count">{biggestSales.length} Sales</span>
            )}
          </div>

          {biggestSalesLoading && (
            <div className="explore-message compact-message">
              Loading biggest sales...
            </div>
          )}

          {!biggestSalesLoading && biggestSalesError && (
            <div className="explore-message compact-message">
              {biggestSalesError}
            </div>
          )}

          {!biggestSalesLoading &&
            !biggestSalesError &&
            biggestSales.length > 0 && (
              <div className="nft-grid biggest-sales-grid compact-nft-grid">
                {biggestSales.map(event => (
                  <article
                    className="nft-card discovery-card compact-nft-card"
                    key={event.eventId || event.id}
                  >
                    <div className="nft-image-wrapper compact-image-wrapper">
                      {event.nft?.image_url ? (
                        <img
                          src={event.nft.image_url}
                          alt={event.nft.name || `NFT #${event.nft.identifier}`}
                          className="nft-image"
                        />
                      ) : (
                        <div className="nft-image-placeholder">INK</div>
                      )}
                    </div>

                    <div className="nft-info compact-nft-info">
                      <div className="nft-title-row">
                        <div>
                          <h3>
                            {event.nft?.name || `#${event.nft?.identifier}`}
                          </h3>

                          <p>
                            {event.collection?.name ||
                              event.collection?.slug ||
                              'INK Collection'}
                          </p>
                        </div>
                      </div>

                      <div className="discovery-stat-row">
                        <div className="discovery-stat">
                          <span className="discovery-stat-icon">◆</span>

                          <strong>{event.saleValue}</strong>

                          <span className="discovery-stat-label">
                            {event.saleCurrency}
                          </span>
                        </div>
                      </div>

                      <div className="interaction-hint">
                        <span>View NFT on OpenSea</span>

                        <span className="interaction-arrow">→</span>
                      </div>

                      {event.nft?.opensea_url && (
                        <button
                          className="opensea-btn"
                          type="button"
                          onClick={clickEvent => {
                            clickEvent.stopPropagation();

                            window.open(event.nft.opensea_url, '_blank');
                          }}
                        >
                          View on OpenSea
                          <span>↗</span>
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}

          {!biggestSalesLoading &&
            !biggestSalesError &&
            biggestSales.length === 0 && (
              <div className="explore-message compact-message">
                No sales found in the last 24 hours.
              </div>
            )}
        </section>

        {/* ==========================================
            FLOOR UP — LAST 24H
        ========================================== */}

        <section className="nft-section discovery-section floor-up-section compact-discovery-section">
          <div className="nft-section-header compact-section-header">
            <div>
              <h2>📈 Floor Up — Last 24H</h2>

              <p>INK collections with the biggest floor price increases.</p>
            </div>

            {!floorUpLoading && !floorUpError && (
              <span className="nft-count">{floorUp.length} Collections</span>
            )}
          </div>

          {floorUpLoading && (
            <div className="explore-message compact-message">
              Loading floor movement...
            </div>
          )}

          {!floorUpLoading && floorUpError && (
            <div className="explore-message compact-message">
              {floorUpError}
            </div>
          )}

          {!floorUpLoading && !floorUpError && floorUp.length > 0 && (
            <div className="floor-up-list compact-floor-list">
              {floorUp.map(collection => (
                <article
                  className="floor-up-card compact-floor-card"
                  key={collection.slug}
                  onClick={() => navigate(`/collections/${collection.slug}`)}
                >
                  <div>
                    <h3>{collection.name}</h3>

                    <p>
                      Floor: {collection.currentFloor} {collection.currency}
                    </p>
                  </div>

                  <div className="floor-up-change">
                    <strong>+{collection.changePercent.toFixed(2)}%</strong>

                    <span>24H</span>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!floorUpLoading && !floorUpError && floorUp.length === 0 && (
            <div className="explore-message compact-message">
              No collections have increased their floor in the last 24 hours.
            </div>
          )}
        </section>
      </div>

      {/* ==========================================
          FILTERED DISCOVERY NFTs
      ========================================== */}

      <section className="nft-section discovery-section filtered-discovery-section compact-discovery-section">
        <div className="nft-section-header compact-section-header">
          <div>
            <h2>{filteredTitle}</h2>

            <p>{filteredDescription}</p>
          </div>

          {!filteredLoading && !filteredError && (
            <span className="nft-count">{filteredNFTs.length} NFTs</span>
          )}
        </div>

        {filteredLoading && (
          <div className="explore-message compact-message">Loading NFTs...</div>
        )}

        {!filteredLoading && filteredError && (
          <div className="explore-message compact-message">{filteredError}</div>
        )}

        {!filteredLoading && !filteredError && filteredNFTs.length > 0 && (
          <div className="nft-grid filtered-nft-grid compact-nft-grid">
            {filteredNFTs.slice(0, 8).map(nft => (
              <article
                className="nft-card discovery-card compact-nft-card"
                key={`${nft.contractAddress}-${nft.tokenId}`}
                onClick={() => openCollection(nft.collectionSlug)}
              >
                <div className="nft-image-wrapper compact-image-wrapper">
                  {nft.image ? (
                    <img
                      src={nft.image}
                      alt={nft.name || `NFT #${nft.tokenId}`}
                      className="nft-image"
                    />
                  ) : (
                    <div className="nft-image-placeholder">INK</div>
                  )}
                </div>

                <div className="nft-info compact-nft-info">
                  <div className="nft-title-row">
                    <div>
                      <h3>{nft.name || `#${nft.tokenId}`}</h3>

                      <p>{nft.collection || nft.collectionSlug}</p>
                    </div>
                  </div>

                  {/* LIKE INFORMATION */}

                  {activeFilter !== 'rated' && (
                    <div className="discovery-stat-row">
                      <div className="discovery-stat like-stat">
                        <span className="discovery-stat-icon">♥</span>

                        <strong>{nft.likeCount || 0}</strong>

                        <span className="discovery-stat-label">Likes</span>
                      </div>
                    </div>
                  )}

                  {/* RATING INFORMATION */}

                  {activeFilter === 'rated' && (
                    <div className="discovery-stat-row">
                      <div className="discovery-stat rating-stat">
                        <span className="discovery-stat-icon">★</span>

                        <strong>
                          {typeof nft.averageRating === 'number'
                            ? nft.averageRating.toFixed(1)
                            : '0.0'}
                        </strong>

                        <span className="discovery-stat-label">Rating</span>

                        <span className="rating-votes">
                          ({nft.ratingCount || 0})
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="interaction-hint">
                    <span>Click to view & interact</span>

                    <span className="interaction-arrow">→</span>
                  </div>

                  {nft.openseaUrl && (
                    <button
                      className="opensea-btn"
                      type="button"
                      onClick={event => {
                        event.stopPropagation();

                        window.open(nft.openseaUrl, '_blank');
                      }}
                    >
                      View on OpenSea
                      <span>↗</span>
                    </button>
                  )}
                </div>
              </article>
            ))}

            {/* VIEW ALL */}

            {activeFilter === 'liked' && (
              <article
                className="discovery-view-all-card"
                onClick={openMostLiked}
              >
                <div className="view-all-icon">→</div>

                <h3>View All</h3>

                <p>Explore all most liked NFTs</p>
              </article>
            )}

            {activeFilter === 'rated' && (
              <article
                className="discovery-view-all-card"
                onClick={openTopRated}
              >
                <div className="view-all-icon">→</div>

                <h3>View All</h3>

                <p>Explore all top rated NFTs</p>
              </article>
            )}

            {activeFilter === 'trending' && (
              <article
                className="discovery-view-all-card"
                onClick={openMostLiked}
              >
                <div className="view-all-icon">→</div>

                <h3>View All</h3>

                <p>Explore trending NFTs</p>
              </article>
            )}
          </div>
        )}

        {!filteredLoading && !filteredError && filteredNFTs.length === 0 && (
          <div className="explore-message compact-message">No NFTs found.</div>
        )}
      </section>

      {/* ==========================================
          ABOUT CHIBINK
      ========================================== */}

      <section id="about" className="explore-about-section">
        <div className="explore-about-container">
          <div className="explore-about-header">
            <p className="explore-eyebrow">ABOUT • CHIBINK</p>

            <h2>
              Discover the <span>INK NFT ecosystem.</span>
            </h2>

            <p>
              ChibiNK is a community-driven place to discover, explore and
              interact with NFTs building on INK. We bring collections and
              collectors together in one simple experience.
            </p>
          </div>

          <div className="explore-about-grid">
            <article className="explore-about-card">
              <div className="explore-about-icon">◈</div>

              <h3>Discover</h3>

              <p>
                Find interesting NFT collections and artwork from across the INK
                ecosystem.
              </p>
            </article>

            <article className="explore-about-card">
              <div className="explore-about-icon">♥</div>

              <h3>Community Driven</h3>

              <p>
                Likes, ratings and discussions help the community surface
                artwork worth discovering.
              </p>
            </article>

            <article className="explore-about-card">
              <div className="explore-about-icon">★</div>

              <h3>Explore Quality</h3>

              <p>
                Discover highly rated and trending NFTs based on community
                activity.
              </p>
            </article>
          </div>

          <div className="explore-about-note">
            <span>INK ecosystem</span>

            <p>
              Built for collectors, creators and everyone exploring what is
              being built on INK.
            </p>
          </div>
        </div>
      </section>

      {/* ==========================================
          FOOTER
      ========================================== */}

      <footer className="explore-footer">
        <div className="explore-footer-main">
          <div className="explore-footer-brand">
            <div className="explore-footer-logo">
              <span>CHIBI</span>
              <strong>NK</strong>
            </div>

            <p>Discover, rate and explore NFTs from the INK ecosystem.</p>

            <a
              href="https://x.com/ChibiOnInk"
              target="_blank"
              rel="noreferrer"
              className="explore-footer-social"
            >
              Follow us on X ↗
            </a>
          </div>

          <div className="explore-footer-column">
            <h4>Explore</h4>

            <button
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth',
                })
              }
            >
              Explore
            </button>

            <button onClick={() => navigate('/collections')}>
              Collections
            </button>

            <button onClick={() => navigate('/leaderboard')}>
              Leaderboard
            </button>
          </div>

          <div className="explore-footer-column">
            <h4>Community</h4>

            <button
              onClick={() => {
                document.getElementById('about')?.scrollIntoView({
                  behavior: 'smooth',
                });
              }}
            >
              About
            </button>

            <button
              onClick={() => window.open('https://x.com/ChibiOnInk', '_blank')}
            >
              X / Twitter
            </button>

            <button
              onClick={() => window.open('https://discord.com', '_blank')}
            >
              Discord
            </button>
          </div>
        </div>

        <div className="explore-footer-bottom">
          <p>
            © {new Date().getFullYear()} ChibiNK. Built for the INK ecosystem.
          </p>

          <span>INK NFT Discovery</span>
        </div>
      </footer>
    </main>
  );
};

export default Explore;
