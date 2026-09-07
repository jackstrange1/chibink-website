import './explore.css';
import Navbar from '../../components/Navbar/navbar';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
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

const EXPLORE_NFT_LIMIT = 12;

const Explore = () => {
  const navigate = useNavigate();
  const { address } = useAccount();

  // =====================================================
  // DISCOVERY DATA
  // =====================================================

  const [mostLiked, setMostLiked] = useState([]);
  const [topRated, setTopRated] = useState([]);

  // Trending is the default view
  const [activeFilter, setActiveFilter] = useState('trending');

  const [mostLikedLoading, setMostLikedLoading] = useState(true);
  const [topRatedLoading, setTopRatedLoading] = useState(true);

  const [mostLikedError, setMostLikedError] = useState('');
  const [topRatedError, setTopRatedError] = useState('');

  // =====================================================
  // NFT INTERACTION DATA
  // =====================================================

  const [ratings, setRatings] = useState({});
  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});

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
  // VIEW ALL
  //
  // 16 NFTs or less:
  // show all NFTs
  //
  // 17+ NFTs:
  // show 15 NFTs + View All
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
  // FETCH RATINGS, LIKES AND COMMENTS
  //
  // Uses the same interaction APIs as Collection.jsx.
  // =====================================================

  useEffect(() => {
    const loadNFTData = async () => {
      if (displayedNFTs.length === 0) {
        return;
      }

      const token = localStorage.getItem('chibink_auth_token');

      try {
        const results = await Promise.all(
          displayedNFTs.map(async nft => {
            try {
              const collectionSlug = nft.collectionSlug;

              const contractAddress = nft.contractAddress;

              const tokenId = nft.tokenId;

              if (!collectionSlug || !contractAddress || !tokenId) {
                return null;
              }

              // ---------------------------------------------
              // Rating
              // ---------------------------------------------

              const ratingPromise = axios.get(
                `${API_URL}/rating/${collectionSlug}/${contractAddress}/${tokenId}`
              );

              // ---------------------------------------------
              // Like
              // ---------------------------------------------

              const likePromise = axios.get(
                `${API_URL}/like/${collectionSlug}/${contractAddress}/${tokenId}`,
                token
                  ? {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  : undefined
              );

              // ---------------------------------------------
              // Comments
              // ---------------------------------------------

              const commentPromise = axios.get(
                `${API_URL}/comment/${collectionSlug}/${contractAddress}/${tokenId}`
              );

              // ---------------------------------------------
              // User rating
              // ---------------------------------------------

              let userRatingPromise = Promise.resolve({
                data: {
                  userRating: null,
                },
              });

              if (token) {
                userRatingPromise = axios
                  .get(
                    `${API_URL}/rating/user/${collectionSlug}/${contractAddress}/${tokenId}`,
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  )
                  .catch(error => {
                    console.error(
                      `Failed to load user rating for NFT ${tokenId}:`,
                      error
                    );

                    return {
                      data: {
                        userRating: null,
                      },
                    };
                  });
              }

              // ---------------------------------------------
              // Run ALL requests simultaneously
              // ---------------------------------------------

              const [
                ratingResponse,
                likeResponse,
                commentResponse,
                userRatingResponse,
              ] = await Promise.all([
                ratingPromise,
                likePromise,
                commentPromise,
                userRatingPromise,
              ]);

              return {
                key: `${contractAddress}-${tokenId}`,

                rating: {
                  ...ratingResponse.data,
                  userRating: userRatingResponse.data.userRating,
                },

                like: likeResponse.data,

                comments: commentResponse.data.comments || [],
              };
            } catch (error) {
              console.error(
                `Failed to load interaction data for NFT ${nft.tokenId}:`,
                error
              );

              return null;
            }
          })
        );

        const ratingMap = {};
        const likeMap = {};
        const commentMap = {};

        results.forEach(result => {
          if (result) {
            ratingMap[result.key] = result.rating;
            likeMap[result.key] = result.like;
            commentMap[result.key] = result.comments;
          }
        });

        setRatings(ratingMap);
        setLikes(likeMap);
        setComments(commentMap);
      } catch (error) {
        console.error('Failed to load Explore interaction data:', error);
      }
    };

    loadNFTData();
  }, [displayedNFTs]);

  // =====================================================
  // SUBMIT RATING
  // =====================================================

  const submitRating = async (nft, rating) => {
    try {
      const token = localStorage.getItem('chibink_auth_token');

      if (!token) {
        alert('Please connect and authenticate your wallet first.');
        return;
      }

      const collectionSlug = nft.collectionSlug;

      const contractAddress = nft.contractAddress;

      const tokenId = nft.tokenId;

      if (!collectionSlug || !contractAddress) {
        return;
      }

      const key = `${contractAddress}-${tokenId}`;

      const response = await axios.post(
        `${API_URL}/rating`,
        {
          collectionSlug,
          contractAddress,
          tokenId,
          rating,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRatings(prev => ({
        ...prev,

        [key]: {
          totalRating: response.data.totalRating,

          ratingCount: response.data.ratingCount,

          averageRating: response.data.averageRating,

          userRating: response.data.rating,
        },
      }));

      // Also update discovery data so the
      // displayed rating stays synchronized.

      const updateNFT = nftItem =>
        nftItem.contractAddress === contractAddress &&
        String(nftItem.tokenId) === String(tokenId);

      setMostLiked(prev =>
        prev.map(item =>
          updateNFT(item)
            ? {
                ...item,
                averageRating: response.data.averageRating,
                ratingCount: response.data.ratingCount,
              }
            : item
        )
      );

      setTopRated(prev =>
        prev.map(item =>
          updateNFT(item)
            ? {
                ...item,
                averageRating: response.data.averageRating,
                ratingCount: response.data.ratingCount,
              }
            : item
        )
      );

      console.log('Rating saved successfully');
    } catch (error) {
      console.error('Rating error:', error);

      if (error.response?.status === 401) {
        alert(
          'Your wallet authentication has expired. Please reconnect your wallet.'
        );

        return;
      }

      alert('Failed to save rating.');
    }
  };

  // =====================================================
  // SUBMIT COMMENT
  // =====================================================

  const submitComment = async nft => {
    try {
      const token = localStorage.getItem('chibink_auth_token');

      if (!token) {
        alert('Please connect and authenticate your wallet first.');
        return;
      }

      const commentText =
        commentInputs[`${nft.contractAddress}-${nft.tokenId}`]?.trim();

      if (!commentText) {
        return;
      }

      const collectionSlug = nft.collectionSlug;

      const contractAddress = nft.contractAddress;

      const tokenId = nft.tokenId;

      if (!collectionSlug || !contractAddress) {
        return;
      }

      const key = `${contractAddress}-${tokenId}`;

      const response = await axios.post(
        `${API_URL}/comment`,
        {
          collectionSlug,
          contractAddress,
          tokenId,
          comment: commentText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setComments(prev => ({
        ...prev,

        [key]: [response.data.comment, ...(prev[key] || [])],
      }));

      setCommentInputs(prev => ({
        ...prev,
        [key]: '',
      }));
    } catch (error) {
      console.error('Comment error:', error);

      if (error.response?.status === 401) {
        alert(
          'Your wallet authentication has expired. Please reconnect your wallet.'
        );

        return;
      }

      alert('Failed to add comment.');
    }
  };

  // =====================================================
  // DELETE COMMENT
  // =====================================================

  const deleteComment = async (commentId, key) => {
    try {
      const token = localStorage.getItem('chibink_auth_token');

      if (!token) {
        alert('Please connect and authenticate your wallet first.');
        return;
      }

      const response = await axios.delete(`${API_URL}/comment/${commentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setComments(prev => ({
        ...prev,

        [key]: (prev[key] || []).filter(comment => comment._id !== commentId),
      }));

      console.log(response.data.message);
    } catch (error) {
      console.error('Delete comment error:', error);

      if (error.response?.status === 401) {
        alert(
          'Your wallet authentication has expired. Please reconnect your wallet.'
        );

        return;
      }

      if (error.response?.status === 404) {
        alert('Comment not found or you are not allowed to delete it.');

        return;
      }

      alert('Failed to delete comment.');
    }
  };

  // =====================================================
  // FORMAT COMMENT TIME
  // =====================================================

  const formatCommentTime = createdAt => {
    const date = new Date(createdAt);
    const now = new Date();

    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);

    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }

    return date.toLocaleDateString();
  };

  // =====================================================
  // TOGGLE LIKE
  //
  // Fast / optimistic UI
  // =====================================================

  const toggleLike = async nft => {
    const token = localStorage.getItem('chibink_auth_token');

    if (!token) {
      alert('Please connect and authenticate your wallet first.');
      return;
    }

    const collectionSlug = nft.collectionSlug;

    const contractAddress = nft.contractAddress;

    const tokenId = nft.tokenId;

    if (!collectionSlug || !contractAddress) {
      return;
    }

    const key = `${contractAddress}-${tokenId}`;

    const currentLike = likes[key];

    // Prevent double clicks
    if (currentLike?.updating) {
      return;
    }

    const wasLiked = !!currentLike?.liked;

    const previousLike = currentLike || {
      liked: false,
      likeCount: 0,
    };

    // -------------------------------------------------
    // OPTIMISTIC UPDATE
    // -------------------------------------------------

    const optimisticLiked = !wasLiked;

    const optimisticLikeCount = Math.max(
      0,
      (previousLike.likeCount || 0) + (optimisticLiked ? 1 : -1)
    );

    setLikes(prev => ({
      ...prev,

      [key]: {
        ...previousLike,
        liked: optimisticLiked,
        likeCount: optimisticLikeCount,
        updating: true,
      },
    }));

    try {
      let response;

      // -------------------------------------------------
      // UNLIKE
      // -------------------------------------------------

      if (wasLiked) {
        response = await axios.delete(
          `${API_URL}/like/${collectionSlug}/${contractAddress}/${tokenId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // -------------------------------------------------
      // LIKE
      // -------------------------------------------------
      else {
        response = await axios.post(
          `${API_URL}/like`,
          {
            collectionSlug,
            contractAddress,
            tokenId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // -------------------------------------------------
      // SERVER CONFIRMED
      // -------------------------------------------------

      setLikes(prev => ({
        ...prev,

        [key]: {
          liked: response.data.liked,
          likeCount: response.data.likeCount,
          updating: false,
        },
      }));

      // -------------------------------------------------
      // Update discovery counts
      // -------------------------------------------------

      const updateLikeCount = nftItem =>
        nftItem.contractAddress === contractAddress &&
        String(nftItem.tokenId) === String(tokenId)
          ? {
              ...nftItem,
              likeCount: response.data.likeCount,
            }
          : nftItem;

      setMostLiked(prev => prev.map(updateLikeCount));

      setTopRated(prev => prev.map(updateLikeCount));

      // -------------------------------------------------
      // Notify Navbar about Chibi Points
      // -------------------------------------------------

      if (!wasLiked && response.data.pointEarned) {
        window.dispatchEvent(
          new CustomEvent('chibi-points-updated', {
            detail: {
              points: response.data.points,
            },
          })
        );
      }
    } catch (error) {
      console.error('Like error:', error);

      // -------------------------------------------------
      // ROLLBACK UI
      // -------------------------------------------------

      setLikes(prev => ({
        ...prev,

        [key]: {
          ...previousLike,
          updating: false,
        },
      }));

      if (error.response?.status === 401) {
        alert(
          'Your wallet authentication has expired. Please reconnect your wallet.'
        );

        return;
      }

      alert('Failed to update like.');
    }
  };

  // =====================================================
  // LOADING STATE
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

            {displayedNFTs.map(nft => {
              const key = `${nft.contractAddress}-${nft.tokenId}`;

              const nftRating = ratings[key];

              const nftLike = likes[key];

              const nftComments = comments[key] || [];

              const commentInput = commentInputs[key] || '';

              return (
                <article
                  className="nft-card discovery-card compact-nft-card"
                  key={key}
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
                    {/* TITLE */}

                    <div className="nft-title-row">
                      <div>
                        <h3>{nft.name || `#${nft.tokenId}`}</h3>

                        <p>{nft.collection || nft.collectionSlug}</p>
                      </div>
                    </div>

                    {/* =================================================
                          RATING
                      ================================================= */}

                    <div
                      className="explore-rating-section"
                      onClick={event => event.stopPropagation()}
                    >
                      <div className="explore-rating-top">
                        <div className="explore-rating-display">
                          <span className="discovery-stat-icon">★</span>

                          <strong>
                            {typeof nftRating?.averageRating === 'number'
                              ? nftRating.averageRating.toFixed(1)
                              : typeof nft.averageRating === 'number'
                                ? nft.averageRating.toFixed(1)
                                : '0.0'}
                          </strong>

                          <span className="rating-votes">
                            ({nftRating?.ratingCount ?? nft.ratingCount ?? 0})
                          </span>
                        </div>

                        <div className="explore-rating-buttons">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              className={
                                nftRating?.userRating >= star
                                  ? 'explore-rating-star active'
                                  : 'explore-rating-star'
                              }
                              onClick={() => submitRating(nft, star)}
                              title={`Rate ${star} out of 5`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* =================================================
                          LIKE
                      ================================================= */}

                    <div
                      className="explore-like-section"
                      onClick={event => event.stopPropagation()}
                    >
                      <button
                        type="button"
                        className={
                          nftLike?.liked
                            ? 'explore-like-button liked'
                            : 'explore-like-button'
                        }
                        onClick={() => toggleLike(nft)}
                        disabled={nftLike?.updating}
                        aria-label={nftLike?.liked ? 'Unlike NFT' : 'Like NFT'}
                      >
                        <span>♥</span>

                        <span>{nftLike?.likeCount ?? nft.likeCount ?? 0}</span>

                        <span className="explore-like-label">Likes</span>
                      </button>
                    </div>

                    {/* =================================================
                          COMMENTS
                      ================================================= */}

                    <div
                      className="explore-comments"
                      onClick={event => event.stopPropagation()}
                    >
                      <button
                        type="button"
                        className="explore-comments-toggle"
                        onClick={() =>
                          setExpandedComments(prev => ({
                            ...prev,
                            [key]: !prev[key],
                          }))
                        }
                      >
                        <span>
                          {expandedComments[key]
                            ? 'Hide comments'
                            : 'Show comments'}
                        </span>

                        <span className="explore-comments-count">
                          {nftComments.length}
                        </span>
                      </button>

                      {expandedComments[key] && (
                        <div className="explore-comments-panel">
                          {/* COMMENT INPUT */}

                          <div className="explore-comment-input-row">
                            <input
                              type="text"
                              placeholder="Write a comment..."
                              value={commentInput}
                              onChange={e =>
                                setCommentInputs(prev => ({
                                  ...prev,
                                  [key]: e.target.value,
                                }))
                              }
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  submitComment(nft);
                                }
                              }}
                              maxLength={500}
                            />

                            <button
                              type="button"
                              className="explore-comment-submit"
                              onClick={() => submitComment(nft)}
                              disabled={!commentInput.trim()}
                            >
                              Post
                            </button>
                          </div>

                          {/* COMMENTS LIST */}

                          <div className="explore-comments-list">
                            {nftComments.length === 0 && (
                              <div className="explore-no-comments">
                                No comments yet. Be the first to share your
                                thoughts.
                              </div>
                            )}

                            {nftComments.map(comment => (
                              <div
                                className="explore-comment-item"
                                key={comment._id}
                              >
                                <div className="explore-comment-meta">
                                  <div className="explore-comment-author">
                                    <span className="explore-comment-wallet">
                                      {comment.walletAddress.slice(0, 6)}
                                      ...
                                      {comment.walletAddress.slice(-4)}
                                    </span>

                                    <span className="explore-comment-time">
                                      {formatCommentTime(comment.createdAt)}
                                    </span>
                                  </div>

                                  {address &&
                                    comment.walletAddress.toLowerCase() ===
                                      address.toLowerCase() && (
                                      <button
                                        type="button"
                                        className="explore-comment-delete"
                                        onClick={() =>
                                          deleteComment(comment._id, key)
                                        }
                                      >
                                        Delete
                                      </button>
                                    )}
                                </div>

                                <div className="explore-comment-text">
                                  {comment.comment}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* =================================================
                          DISCOVERY STATS
                      ================================================= */}

                    <div className="discovery-stat-row">
                      <div className="discovery-stat like-stat">
                        <span className="discovery-stat-icon">♥</span>

                        <strong>
                          {nftLike?.likeCount ?? nft.likeCount ?? 0}
                        </strong>

                        <span className="discovery-stat-label">Likes</span>
                      </div>

                      <div className="discovery-stat rating-stat">
                        <span className="discovery-stat-icon">★</span>

                        <strong>
                          {typeof nftRating?.averageRating === 'number'
                            ? nftRating.averageRating.toFixed(1)
                            : typeof nft.averageRating === 'number'
                              ? nft.averageRating.toFixed(1)
                              : '0.0'}
                        </strong>

                        <span className="discovery-stat-label">Rating</span>
                      </div>
                    </div>

                    {/* =================================================
                          INTERACTION HINT
                      ================================================= */}

                    <div
                      className="interaction-hint"
                      onClick={event => event.stopPropagation()}
                    >
                      <span>Click to view & interact</span>

                      <span className="interaction-arrow">→</span>
                    </div>

                    {/* =================================================
                          OPENSEA
                      ================================================= */}

                    {nft.openseaUrl && (
                      <button
                        type="button"
                        className="opensea-btn"
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
              );
            })}

            {/* =================================================
                  VIEW ALL
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
