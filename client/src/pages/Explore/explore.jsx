import './explore.css';
import Navbar from '../../components/Navbar/navbar';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// =====================================================
// EXPLORE LIMIT
//
// 8 cards per row × 2 rows = 16 slots.
//
// If there are more than 16 NFTs:
// 15 NFTs + 1 View All card = 16 slots.
// =====================================================

const EXPLORE_NFT_LIMIT = 16;

const Explore = () => {
  const navigate = useNavigate();

  const [mostLiked, setMostLiked] = useState([]);
  const [topRated, setTopRated] = useState([]);

  // Trending is the default view
  const [activeFilter, setActiveFilter] = useState('trending');

  const [mostLikedLoading, setMostLikedLoading] = useState(true);

  const [topRatedLoading, setTopRatedLoading] = useState(true);

  const [mostLikedError, setMostLikedError] = useState('');

  const [topRatedError, setTopRatedError] = useState('');

  // =====================================================
  // FETCH MOST LIKED NFTs
  // =====================================================

  useEffect(() => {
    const fetchMostLiked = async () => {
      try {
        setMostLikedLoading(true);
        setMostLikedError('');

        const response = await axios.get(`${API_URL}/discovery/most-liked`);

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

  // =====================================================
  // FETCH TOP RATED NFTs
  // =====================================================

  useEffect(() => {
    const fetchTopRated = async () => {
      try {
        setTopRatedLoading(true);
        setTopRatedError('');

        const response = await axios.get(`${API_URL}/discovery/top-rated`);

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

  // =====================================================
  // OPEN COLLECTION
  // =====================================================

  const openCollection = collectionSlug => {
    if (!collectionSlug) {
      return;
    }

    navigate(`/collections/${collectionSlug}`);
  };

  // =====================================================
  // VIEW ALL
  // =====================================================

  const openMostLiked = () => {
    navigate('/discover/liked');
  };

  const openTopRated = () => {
    navigate('/discover/rated');
  };

  // =====================================================
  // TRENDING SCORE
  //
  // Likes = 50%
  // Rating = 50%
  // =====================================================

  const trendingNFTs = useMemo(() => {
    const nftMap = new Map();

    // -------------------------------------------------
    // Add Most Liked NFTs
    // -------------------------------------------------

    mostLiked.forEach(nft => {
      const key = `${nft.contractAddress}-${nft.tokenId}`;

      nftMap.set(key, {
        ...nft,
      });
    });

    // -------------------------------------------------
    // Merge Top Rated NFTs
    // -------------------------------------------------

    topRated.forEach(nft => {
      const key = `${nft.contractAddress}-${nft.tokenId}`;

      const existing = nftMap.get(key);

      if (existing) {
        nftMap.set(key, {
          ...existing,
          ...nft,

          likeCount:
            typeof nft.likeCount === 'number'
              ? nft.likeCount
              : existing.likeCount || 0,

          averageRating:
            typeof nft.averageRating === 'number'
              ? nft.averageRating
              : existing.averageRating || 0,

          ratingCount:
            typeof nft.ratingCount === 'number'
              ? nft.ratingCount
              : existing.ratingCount || 0,

          image: nft.image || existing.image,

          name: nft.name || existing.name,

          collection: nft.collection || existing.collection,

          collectionSlug: nft.collectionSlug || existing.collectionSlug,

          openseaUrl: nft.openseaUrl || existing.openseaUrl,
        });
      } else {
        nftMap.set(key, {
          ...nft,
        });
      }
    });

    const combinedNFTs = Array.from(nftMap.values());

    // -------------------------------------------------
    // Find highest like count
    // -------------------------------------------------

    const highestLikeCount = Math.max(
      ...combinedNFTs.map(nft => nft.likeCount || 0),
      1
    );

    // -------------------------------------------------
    // Calculate Trending Score
    // -------------------------------------------------

    return combinedNFTs
      .map(nft => {
        const likeCount = Number(nft.likeCount) || 0;

        const averageRating = Number(nft.averageRating) || 0;

        const likePercentage = (likeCount / highestLikeCount) * 100;

        const ratingPercentage = Math.min(
          Math.max((averageRating / 5) * 100, 0),
          100
        );

        const trendingScore = likePercentage * 0.5 + ratingPercentage * 0.5;

        return {
          ...nft,
          likePercentage,
          ratingPercentage,
          trendingScore,
        };
      })
      .sort((a, b) => b.trendingScore - a.trendingScore);
  }, [mostLiked, topRated]);

  // =====================================================
  // MOST LIKED SORTING
  // =====================================================

  const sortedMostLiked = useMemo(() => {
    return [...mostLiked].sort(
      (a, b) => (Number(b.likeCount) || 0) - (Number(a.likeCount) || 0)
    );
  }, [mostLiked]);

  // =====================================================
  // TOP RATED SORTING
  // =====================================================

  const sortedTopRated = useMemo(() => {
    return [...topRated].sort((a, b) => {
      const ratingDifference =
        (Number(b.averageRating) || 0) - (Number(a.averageRating) || 0);

      if (ratingDifference !== 0) {
        return ratingDifference;
      }

      return (Number(b.ratingCount) || 0) - (Number(a.ratingCount) || 0);
    });
  }, [topRated]);

  // =====================================================
  // ACTIVE DATASET
  // =====================================================

  const filteredNFTs =
    activeFilter === 'liked'
      ? sortedMostLiked
      : activeFilter === 'rated'
        ? sortedTopRated
        : trendingNFTs;

  // =====================================================
  // VIEW ALL REQUIRED?
  //
  // If there are more than 16 NFTs,
  // reserve the 16th slot for View All.
  //
  // Therefore:
  //
  // 16 NFTs or less:
  //     show all NFTs
  //
  // 17+ NFTs:
  //     show 15 NFTs + View All
  // =====================================================

  const shouldShowViewAll = filteredNFTs.length > EXPLORE_NFT_LIMIT;

  const nftDisplayLimit = shouldShowViewAll
    ? EXPLORE_NFT_LIMIT - 1
    : EXPLORE_NFT_LIMIT;

  const displayedNFTs = filteredNFTs.slice(0, nftDisplayLimit);

  // =====================================================
  // LOADING
  // =====================================================

  const filteredLoading =
    activeFilter === 'liked'
      ? mostLikedLoading
      : activeFilter === 'rated'
        ? topRatedLoading
        : mostLikedLoading || topRatedLoading;

  // =====================================================
  // ERROR
  // =====================================================

  const filteredError =
    activeFilter === 'liked'
      ? mostLikedError
      : activeFilter === 'rated'
        ? topRatedError
        : mostLikedError && topRatedError
          ? `${mostLikedError}. ${topRatedError}`
          : mostLikedError || topRatedError;

  // =====================================================
  // TITLE
  // =====================================================

  const filteredTitle =
    activeFilter === 'liked'
      ? '🔥 Most Liked NFTs'
      : activeFilter === 'rated'
        ? '⭐ Top Rated NFTs'
        : '🔥 Trending NFTs';

  // =====================================================
  // DESCRIPTION
  // =====================================================

  const filteredDescription =
    activeFilter === 'liked'
      ? 'The NFTs getting the most love from the INK community.'
      : activeFilter === 'rated'
        ? 'NFTs receiving the highest ratings from the INK community.'
        : 'A community-driven mix of likes and ratings across the INK ecosystem.';

  // =====================================================
  // VIEW ALL HANDLER
  // =====================================================

  const handleViewAll = () => {
    if (activeFilter === 'liked') {
      openMostLiked();
      return;
    }

    if (activeFilter === 'rated') {
      openTopRated();
      return;
    }

    // There is currently no dedicated trending route.
    // Use Most Liked as the existing discovery page.
    openMostLiked();
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="explore-page">
      <Navbar />

      {/* =================================================
          HERO
      ================================================= */}

      <section className="explore-hero-section explore-hero-compact">
        <div className="explore-header">
          <p className="explore-eyebrow">DISCOVER • RATE • LIKE • DISCUSS</p>

          <h1>
            Discover <span>INK NFTs</span>
          </h1>

          <p className="explore-description">
            Discover the NFTs getting attention from the INK community through
            likes, ratings and community activity.
          </p>
        </div>
      </section>

      {/* =================================================
          FILTERS
      ================================================= */}

      <section className="explore-controls explore-controls-compact">
        <div className="explore-filters">
          {/* TRENDING */}

          <button
            className={`filter-btn ${
              activeFilter === 'trending' ? 'active' : ''
            }`}
            onClick={() => setActiveFilter('trending')}
          >
            <span>Trending</span>

            <span className="filter-count">{trendingNFTs.length}</span>
          </button>

          {/* MOST LIKED */}

          <button
            className={`filter-btn ${activeFilter === 'liked' ? 'active' : ''}`}
            onClick={() => setActiveFilter('liked')}
          >
            <span>Most Liked</span>

            <span className="filter-count">{mostLiked.length}</span>
          </button>

          {/* TOP RATED */}

          <button
            className={`filter-btn ${activeFilter === 'rated' ? 'active' : ''}`}
            onClick={() => setActiveFilter('rated')}
          >
            <span>Top Rated</span>

            <span className="filter-count">{topRated.length}</span>
          </button>
        </div>
      </section>

      {/* =================================================
          COMMUNITY DISCOVERY
      ================================================= */}

      <section className="nft-section discovery-section filtered-discovery-section compact-discovery-section">
        {/* HEADER */}

        <div className="nft-section-header compact-section-header">
          <div>
            <h2>{filteredTitle}</h2>

            <p>{filteredDescription}</p>
          </div>

          {!filteredLoading && !filteredError && (
            <span className="nft-count">
              {filteredNFTs.length > EXPLORE_NFT_LIMIT
                ? `Showing ${displayedNFTs.length} + View All`
                : `Showing ${displayedNFTs.length}`}{' '}
              NFTs
            </span>
          )}
        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {filteredLoading && (
          <div className="explore-message compact-message">Loading NFTs...</div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {!filteredLoading && filteredError && (
          <div className="explore-message compact-message">{filteredError}</div>
        )}

        {/* =================================================
            NFT GRID
        ================================================= */}

        {!filteredLoading && !filteredError && displayedNFTs.length > 0 && (
          <div className="nft-grid filtered-nft-grid compact-nft-grid">
            {/* =================================================
                NFT CARDS
            ================================================= */}

            {displayedNFTs.map(nft => (
              <article
                className="nft-card discovery-card compact-nft-card"
                key={`${nft.contractAddress}-${nft.tokenId}`}
                onClick={() => openCollection(nft.collectionSlug)}
              >
                {/* IMAGE */}

                <div className="nft-image-wrapper compact-image-wrapper">
                  {nft.image ? (
                    <img
                      src={nft.image}
                      alt={nft.name || `NFT #${nft.tokenId}`}
                      className="nft-image"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="nft-image-placeholder">INK</div>
                  )}
                </div>

                {/* INFO */}

                <div className="nft-info compact-nft-info">
                  <div className="nft-title-row">
                    <div>
                      <h3>{nft.name || `#${nft.tokenId}`}</h3>

                      <p>{nft.collection || nft.collectionSlug}</p>
                    </div>
                  </div>

                  {/* TRENDING STATS */}

                  {activeFilter === 'trending' && (
                    <div className="discovery-stat-row">
                      <div className="discovery-stat like-stat">
                        <span className="discovery-stat-icon">♥</span>

                        <strong>{nft.likeCount || 0}</strong>

                        <span className="discovery-stat-label">Likes</span>
                      </div>

                      <div className="discovery-stat rating-stat">
                        <span className="discovery-stat-icon">★</span>

                        <strong>
                          {typeof nft.averageRating === 'number'
                            ? nft.averageRating.toFixed(1)
                            : '0.0'}
                        </strong>

                        <span className="discovery-stat-label">Rating</span>
                      </div>
                    </div>
                  )}

                  {/* MOST LIKED STATS */}

                  {activeFilter === 'liked' && (
                    <div className="discovery-stat-row">
                      <div className="discovery-stat like-stat">
                        <span className="discovery-stat-icon">♥</span>

                        <strong>{nft.likeCount || 0}</strong>

                        <span className="discovery-stat-label">Likes</span>
                      </div>
                    </div>
                  )}

                  {/* TOP RATED STATS */}

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

                  {/* INTERACTION */}

                  <div className="interaction-hint">
                    <span>Click to view & interact</span>

                    <span className="interaction-arrow">→</span>
                  </div>

                  {/* OPENSEA */}

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

            {/* =================================================
                VIEW ALL
                IMPORTANT:

                This comes AFTER 15 NFTs when there are
                more than 16 items.

                Therefore:
                15 NFTs + View All = 16 grid slots.
            ================================================= */}

            {shouldShowViewAll && (
              <article
                className="discovery-view-all-card"
                onClick={handleViewAll}
              >
                <div className="view-all-icon">→</div>

                <h3>View All</h3>

                <p>
                  {activeFilter === 'liked'
                    ? `Explore all ${filteredNFTs.length} most liked NFTs`
                    : activeFilter === 'rated'
                      ? `Explore all ${filteredNFTs.length} top rated NFTs`
                      : `Explore all ${filteredNFTs.length} trending NFTs`}
                </p>
              </article>
            )}
          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!filteredLoading && !filteredError && filteredNFTs.length === 0 && (
          <div className="explore-message compact-message">No NFTs found.</div>
        )}
      </section>

      {/* =================================================
          ABOUT CHIBINK
      ================================================= */}

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

      {/* =================================================
          FOOTER
      ================================================= */}

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
