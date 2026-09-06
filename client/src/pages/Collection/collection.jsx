import './collection.css';
import Navbar from '../../components/Navbar/navbar';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const Collection = () => {
  const { slug } = useParams();
  const { address } = useAccount();

  const [collectionDetails, setCollectionDetails] = useState(null);

  // Initial collection NFTs
  const [initialNfts, setInitialNfts] = useState([]);
  const [nfts, setNfts] = useState([]);

  const [ratings, setRatings] = useState({});
  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});

  const [loading, setLoading] = useState(true);
  const [nftLoading, setNftLoading] = useState(true);

  const [detailsError, setDetailsError] = useState('');
  const [nftError, setNftError] = useState('');

  // =====================================================
  // SEARCH
  // =====================================================

  const [search, setSearch] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // =====================================================
  // FETCH COLLECTION DETAILS
  // =====================================================

  useEffect(() => {
    const fetchCollectionDetails = async () => {
      try {
        setLoading(true);
        setDetailsError('');

        const response = await axios.get(
          `${API_URL}/opensea/collections/${slug}`
        );

        setCollectionDetails(response.data);
      } catch (error) {
        console.error('Failed to fetch collection details:', error);

        setDetailsError('Failed to load collection details');
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionDetails();
  }, [slug]);

  // =====================================================
  // FETCH INITIAL 100 NFTs
  // =====================================================

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        setNftLoading(true);
        setNftError('');
        setSearchError('');

        const response = await axios.get(
          `${API_URL}/opensea/collections/${slug}/nfts`
        );

        const fetchedNfts = response.data.nfts || [];

        // Store the original 100 separately
        setInitialNfts(fetchedNfts);

        // Display the original 100
        setNfts(fetchedNfts);
      } catch (error) {
        console.error('Failed to fetch NFTs:', error);

        setNftError('Failed to load NFTs');
      } finally {
        setNftLoading(false);
      }
    };

    fetchNFTs();
  }, [slug]);

  // =====================================================
  // SEARCH EXACT NFT BY TOKEN ID
  // =====================================================

  useEffect(() => {
    const query = search.trim();

    // No search
    if (!query) {
      setSearchError('');
      setSearchLoading(false);
      setNfts(initialNfts);

      return;
    }

    const searchNFT = async () => {
      // Remove # from the beginning
      const normalizedQuery = query.replace(/^#/, '').trim();

      // Only allow token IDs
      if (!/^\d+$/.test(normalizedQuery)) {
        setNfts([]);
        setSearchError('Please enter a valid NFT token ID, for example #222.');
        setSearchLoading(false);

        return;
      }

      try {
        setSearchLoading(true);
        setSearchError('');

        // Directly request the exact NFT
        const response = await axios.get(
          `${API_URL}/opensea/collections/${slug}/nfts/${normalizedQuery}`
        );

        const foundNFT = response.data.nft;

        if (!foundNFT) {
          setNfts([]);
          setSearchError(`No NFT found for "#${normalizedQuery}".`);

          return;
        }

        // Display only the exact NFT
        setNfts([foundNFT]);
      } catch (error) {
        console.error('NFT search error:', error);

        if (error.response?.status === 404) {
          setNfts([]);
          setSearchError(`No NFT found for "#${normalizedQuery}".`);

          return;
        }

        setNfts([]);
        setSearchError('Failed to search NFT.');
      } finally {
        setSearchLoading(false);
      }
    };

    // Small debounce so we don't request on every keystroke
    const timeout = setTimeout(() => {
      searchNFT();
    }, 400);

    return () => clearTimeout(timeout);
  }, [search, slug, initialNfts]);

  // =====================================================
  // RESET SEARCH
  // =====================================================

  const clearSearch = () => {
    setSearch('');
    setSearchError('');
    setSearchLoading(false);
    setNftError('');

    // Restore the original 100 NFTs
    setNfts(initialNfts);
  };

  // =====================================================
  // FETCH RATINGS, LIKES AND COMMENTS
  // =====================================================

  useEffect(() => {
    const loadNFTData = async () => {
      if (!collectionDetails || nfts.length === 0) {
        return;
      }

      const token = localStorage.getItem('chibink_auth_token');

      try {
        const results = await Promise.all(
          nfts.map(async nft => {
            try {
              const contractAddress =
                nft.contract || collectionDetails.contracts?.[0]?.address;

              if (!contractAddress) {
                return null;
              }

              // Community rating
              const ratingResponse = await axios.get(
                `${API_URL}/rating/${slug}/${contractAddress}/${nft.identifier}`
              );

              // Like status + count
              const likeResponse = await axios.get(
                `${API_URL}/like/${slug}/${contractAddress}/${nft.identifier}`,
                token
                  ? {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  : undefined
              );

              // Comments
              const commentResponse = await axios.get(
                `${API_URL}/comment/${slug}/${contractAddress}/${nft.identifier}`
              );

              // Current user's rating
              let userRating = null;

              if (token) {
                try {
                  const userRatingResponse = await axios.get(
                    `${API_URL}/rating/user/${slug}/${contractAddress}/${nft.identifier}`,
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );

                  userRating = userRatingResponse.data.userRating;
                } catch (error) {
                  console.error(
                    `Failed to load user rating for NFT ${nft.identifier}:`,
                    error
                  );
                }
              }

              return {
                tokenId: nft.identifier,

                rating: {
                  ...ratingResponse.data,
                  userRating,
                },

                like: likeResponse.data,

                comments: commentResponse.data.comments || [],
              };
            } catch (error) {
              console.error(
                `Failed to load data for NFT ${nft.identifier}:`,
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
            ratingMap[result.tokenId] = result.rating;

            likeMap[result.tokenId] = result.like;

            commentMap[result.tokenId] = result.comments;
          }
        });

        setRatings(ratingMap);
        setLikes(likeMap);
        setComments(commentMap);
      } catch (error) {
        console.error('Failed to load NFT data:', error);
      }
    };

    loadNFTData();
  }, [collectionDetails, nfts, slug]);

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

      const contractAddress =
        nft.contract || collectionDetails?.contracts?.[0]?.address;

      if (!contractAddress) {
        return;
      }

      const response = await axios.post(
        `${API_URL}/rating`,
        {
          collectionSlug: slug,
          contractAddress,
          tokenId: nft.identifier,
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

        [nft.identifier]: {
          totalRating: response.data.totalRating,

          ratingCount: response.data.ratingCount,

          averageRating: response.data.averageRating,

          userRating: response.data.rating,
        },
      }));

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

      const commentText = commentInputs[nft.identifier]?.trim();

      if (!commentText) {
        return;
      }

      const contractAddress =
        nft.contract || collectionDetails?.contracts?.[0]?.address;

      if (!contractAddress) {
        return;
      }

      const response = await axios.post(
        `${API_URL}/comment`,
        {
          collectionSlug: slug,
          contractAddress,
          tokenId: nft.identifier,
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

        [nft.identifier]: [
          response.data.comment,
          ...(prev[nft.identifier] || []),
        ],
      }));

      setCommentInputs(prev => ({
        ...prev,

        [nft.identifier]: '',
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

  const deleteComment = async (commentId, tokenId) => {
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

        [tokenId]: (prev[tokenId] || []).filter(
          comment => comment._id !== commentId
        ),
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
  // =====================================================

  const toggleLike = async nft => {
    try {
      const token = localStorage.getItem('chibink_auth_token');

      if (!token) {
        alert('Please connect and authenticate your wallet first.');
        return;
      }

      const contractAddress =
        nft.contract || collectionDetails?.contracts?.[0]?.address;

      if (!contractAddress) {
        return;
      }

      const currentLike = likes[nft.identifier];

      // Unlike
      if (currentLike?.liked) {
        const response = await axios.delete(
          `${API_URL}/like/${slug}/${contractAddress}/${nft.identifier}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setLikes(prev => ({
          ...prev,

          [nft.identifier]: {
            liked: response.data.liked,

            likeCount: response.data.likeCount,
          },
        }));

        return;
      }

      // Like
      const response = await axios.post(
        `${API_URL}/like`,
        {
          collectionSlug: slug,
          contractAddress,
          tokenId: nft.identifier,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLikes(prev => ({
        ...prev,

        [nft.identifier]: {
          liked: response.data.liked,

          likeCount: response.data.likeCount,
        },
      }));
    } catch (error) {
      console.error('Like error:', error);

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

  if (loading) {
    return (
      <main className="collection-page">
        <Navbar />

        <div className="collection-state">Loading collection...</div>
      </main>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="collection-page">
      <Navbar />

      {/* =================================================
          COLLECTION HEADER
      ================================================= */}

      {!detailsError && collectionDetails && (
        <section className="collection-hero-section">
          <div className="collection-header">
            {collectionDetails.banner_image_url && (
              <div className="collection-banner">
                <img
                  src={collectionDetails.banner_image_url}
                  alt={collectionDetails.name}
                />
              </div>
            )}

            <div className="collection-header-content">
              <div className="collection-logo-wrapper">
                {collectionDetails.image_url ? (
                  <img
                    src={collectionDetails.image_url}
                    alt={collectionDetails.name}
                    className="collection-logo"
                  />
                ) : (
                  <div className="collection-image-placeholder">INK</div>
                )}
              </div>

              <div className="collection-info">
                <div className="collection-title-row">
                  <div>
                    <div className="collection-name-row">
                      <h1>{collectionDetails.name}</h1>

                      {collectionDetails.safelist_status === 'verified' && (
                        <span className="collection-verified-badge">
                          ✓ Verified
                        </span>
                      )}
                    </div>

                    <p className="collection-category">
                      {collectionDetails.category || 'INK Collection'}
                    </p>
                  </div>
                </div>

                {collectionDetails.description && (
                  <p className="collection-description">
                    {collectionDetails.description}
                  </p>
                )}

                <div className="collection-stats">
                  <div className="collection-stat">
                    <strong>{collectionDetails.total_supply || 0}</strong>

                    <span>Items</span>
                  </div>

                  <div className="collection-stat">
                    <strong>{collectionDetails.unique_item_count || 0}</strong>

                    <span>Unique</span>
                  </div>

                  <div className="collection-stat">
                    <strong>{collectionDetails.contracts?.length || 0}</strong>

                    <span>Contract</span>
                  </div>
                </div>

                <div className="collection-actions">
                  {collectionDetails.opensea_url && (
                    <button
                      className="collection-opensea-button"
                      onClick={() =>
                        window.open(collectionDetails.opensea_url, '_blank')
                      }
                    >
                      View Collection on OpenSea
                      <span>↗</span>
                    </button>
                  )}

                  {collectionDetails.project_url && (
                    <button
                      className="collection-project-button"
                      onClick={() =>
                        window.open(collectionDetails.project_url, '_blank')
                      }
                    >
                      Project Website
                      <span>↗</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =================================================
          COLLECTION ERROR
      ================================================= */}

      {detailsError && (
        <div className="collection-state collection-error">{detailsError}</div>
      )}

      {/* =================================================
          NFT SECTION
      ================================================= */}

      <section className="collection-nfts-section">
        <div className="collection-nfts-header">
          <div>
            <h2>{collectionDetails?.name || slug} NFTs</h2>

            <p>Explore and rate the NFTs from this collection.</p>
          </div>

          <span className="collection-nft-count">
            {search ? nfts.length : nfts.length} NFTs
          </span>
        </div>

        {/* =================================================
            SEARCH BAR
        ================================================= */}

        {!nftLoading && !nftError && (
          <div className="collection-nft-search">
            <span className="collection-nft-search-icon">⌕</span>

            <input
              type="text"
              placeholder="Search NFT by #token..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            {search && (
              <button
                type="button"
                className="collection-nft-search-clear"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* =================================================
            INITIAL NFT LOADING
        ================================================= */}

        {nftLoading && <div className="collection-state">Loading NFTs...</div>}

        {/* =================================================
            SEARCH LOADING
        ================================================= */}

        {!nftLoading && searchLoading && (
          <div className="collection-state">Searching NFT...</div>
        )}

        {/* =================================================
            NFT ERROR
        ================================================= */}

        {!nftLoading && !searchLoading && nftError && (
          <div className="collection-state collection-error">{nftError}</div>
        )}

        {/* =================================================
            SEARCH ERROR
        ================================================= */}

        {!nftLoading && !searchLoading && !nftError && searchError && (
          <div className="collection-state">{searchError}</div>
        )}

        {/* =================================================
            NFT GRID
        ================================================= */}

        {!nftLoading && !searchLoading && !nftError && !searchError && (
          <div className="collection-nft-grid">
            {nfts.map(nft => {
              const nftRating = ratings[nft.identifier];

              return (
                <article
                  className="collection-nft-card"
                  key={`${nft.identifier}-${nft.name}`}
                >
                  {/* NFT IMAGE */}

                  <div className="collection-nft-image-wrapper">
                    {nft.image_url || nft.display_image_url ? (
                      <img
                        src={nft.display_image_url || nft.image_url}
                        alt={nft.name || `NFT #${nft.identifier}`}
                        className="collection-nft-image"
                      />
                    ) : (
                      <div className="collection-nft-placeholder">INK</div>
                    )}
                  </div>

                  <div className="collection-nft-info">
                    {/* NFT TITLE */}

                    <div className="collection-nft-title">
                      <div>
                        <h3>{nft.name || `#${nft.identifier}`}</h3>

                        <p>{collectionDetails?.name || slug}</p>
                      </div>
                    </div>

                    {/* RATING */}

                    <div className="collection-nft-rating">
                      <div className="collection-rating-display">
                        <span className="collection-rating-star">★</span>

                        <strong>
                          {nftRating?.averageRating
                            ? nftRating.averageRating.toFixed(1)
                            : '0.0'}
                        </strong>

                        <span className="collection-rating-count">
                          ({nftRating?.ratingCount || 0})
                        </span>
                      </div>

                      <div className="collection-rating-buttons">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            className={
                              nftRating?.userRating >= star
                                ? 'collection-rating-star-button active'
                                : 'collection-rating-star-button'
                            }
                            onClick={() => submitRating(nft, star)}
                            title={`Rate ${star} out of 5`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* LIKE */}

                    <button
                      className={
                        likes[nft.identifier]?.liked
                          ? 'collection-like-button liked'
                          : 'collection-like-button'
                      }
                      onClick={() => toggleLike(nft)}
                    >
                      ♥<span>{likes[nft.identifier]?.likeCount || 0}</span>
                    </button>

                    {/* COMMENTS */}

                    <div className="collection-comments">
                      <button
                        className="collection-comments-toggle"
                        onClick={() =>
                          setExpandedComments(prev => ({
                            ...prev,

                            [nft.identifier]: !prev[nft.identifier],
                          }))
                        }
                      >
                        <span>
                          {expandedComments[nft.identifier]
                            ? 'Hide comments'
                            : 'Show comments'}
                        </span>

                        <span className="collection-comments-count">
                          {comments[nft.identifier]?.length || 0}
                        </span>
                      </button>

                      <div className="collection-comments-header">
                        <span>Comments</span>

                        <span>{comments[nft.identifier]?.length || 0}</span>
                      </div>

                      {expandedComments[nft.identifier] && (
                        <>
                          {/* COMMENT INPUT */}

                          <div className="collection-comment-input-row">
                            <input
                              type="text"
                              placeholder="Write a comment..."
                              value={commentInputs[nft.identifier] || ''}
                              onChange={e =>
                                setCommentInputs(prev => ({
                                  ...prev,

                                  [nft.identifier]: e.target.value,
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
                              className="collection-comment-submit"
                              onClick={() => submitComment(nft)}
                              disabled={!commentInputs[nft.identifier]?.trim()}
                            >
                              Post
                            </button>
                          </div>

                          {/* COMMENTS LIST */}

                          <div className="collection-comments-list">
                            {(comments[nft.identifier] || []).map(comment => (
                              <div
                                className="collection-comment-item"
                                key={comment._id}
                              >
                                <div className="collection-comment-meta">
                                  <div className="collection-comment-author">
                                    <span className="collection-comment-wallet">
                                      {comment.walletAddress.slice(0, 6)}
                                      ...
                                      {comment.walletAddress.slice(-4)}
                                    </span>

                                    <span className="collection-comment-time">
                                      {formatCommentTime(comment.createdAt)}
                                    </span>
                                  </div>

                                  {address &&
                                    comment.walletAddress.toLowerCase() ===
                                      address.toLowerCase() && (
                                      <button
                                        className="collection-comment-delete"
                                        onClick={() =>
                                          deleteComment(
                                            comment._id,
                                            nft.identifier
                                          )
                                        }
                                      >
                                        Delete
                                      </button>
                                    )}
                                </div>

                                <div className="collection-comment-text">
                                  {comment.comment}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* OPENSEA */}

                    {nft.opensea_url && (
                      <button
                        className="collection-nft-opensea-button"
                        onClick={() => window.open(nft.opensea_url, '_blank')}
                      >
                        View on OpenSea
                        <span>↗</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* =================================================
            NO NFT
        ================================================= */}

        {!nftLoading &&
          !searchLoading &&
          !nftError &&
          !searchError &&
          nfts.length === 0 && (
            <div className="collection-state">
              No NFTs found in this collection.
            </div>
          )}
      </section>
    </main>
  );
};

export default Collection;
