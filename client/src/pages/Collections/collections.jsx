import './collections.css';
import Navbar from '../../components/Navbar/navbar';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Collections = () => {
  const navigate = useNavigate();

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // =====================================================
  // SEARCH
  // =====================================================

  const [search, setSearch] = useState('');

  // =====================================================
  // PAGINATION
  // =====================================================

  const [page, setPage] = useState(1);
  const [nextCursor, setNextCursor] = useState(null);

  // Cursor used to load the current page
  const [currentCursor, setCurrentCursor] = useState(null);

  // Store cursors for previous pages
  const [cursorHistory, setCursorHistory] = useState([]);

  // =====================================================
  // FETCH COLLECTIONS
  // =====================================================

  const fetchCollections = async (cursor = null, pageNumber = 1) => {
    try {
      setLoading(true);
      setError('');

      const params = {};

      if (cursor) {
        params.next = cursor;
      }

      const response = await axios.get(
        'http://localhost:3000/api/opensea/search',
        {
          params,
        }
      );

      const data = response.data;

      setCollections(data.collections || []);

      setNextCursor(data.next || null);

      setCurrentCursor(cursor);

      setPage(pageNumber);

      // Reset search whenever changing page
      setSearch('');
    } catch (error) {
      console.error('Failed to fetch INK collections:', error);

      setError('Failed to load INK collections');
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchCollections();
  }, []);

  // =====================================================
  // NEXT PAGE
  // =====================================================

  const goToNextPage = () => {
    if (!nextCursor || loading) return;

    setCursorHistory(prev => [...prev, currentCursor]);

    fetchCollections(nextCursor, page + 1);
  };

  // =====================================================
  // PREVIOUS PAGE
  // =====================================================

  const goToPreviousPage = () => {
    if (page <= 1 || loading) return;

    const history = [...cursorHistory];

    const previousCursor = history.pop() || null;

    setCursorHistory(history);

    fetchCollections(previousCursor, page - 1);
  };

  // =====================================================
  // SEARCH FILTER
  // =====================================================

  const filteredCollections = collections.filter(collection =>
    collection.name?.toLowerCase().includes(search.toLowerCase())
  );

  // =====================================================
  // OPEN COLLECTION
  // =====================================================

  const openCollection = slug => {
    navigate(`/collections/${slug}`);
  };

  // =====================================================
  // OPEN OPENSEA
  // =====================================================

  const openOpenSea = (event, url) => {
    event.stopPropagation();

    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <main className="collections-page">
      <Navbar />

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <section className="collections-hero">
        <div className="collections-hero-content">
          <p className="collections-eyebrow">DISCOVER • EXPLORE • COLLECT</p>

          <h1 className="collections-title">
            INK <span>Collections</span>
          </h1>

          <p className="collections-description">
            Discover collections building on the INK ecosystem.
          </p>
        </div>
      </section>

      {/* =====================================================
          COLLECTIONS CONTENT
      ===================================================== */}

      <section className="collections-content">
        {/* ===================================================
            SECTION HEADER
        =================================================== */}

        <div className="collections-section-header">
          <div className="collections-section-heading">
            <h2>INK Collections</h2>

            <p>Explore NFT collections from the INK ecosystem.</p>
          </div>

          {!loading && !error && (
            <span className="collections-count">
              {filteredCollections.length} Collections
            </span>
          )}
        </div>

        {/* ===================================================
            SEARCH
        =================================================== */}

        {!loading && !error && collections.length > 0 && (
          <div className="collections-search">
            <span className="collections-search-icon">⌕</span>

            <input
              type="text"
              placeholder="Search collections..."
              value={search}
              onChange={event => setSearch(event.target.value)}
            />

            {search && (
              <button
                type="button"
                className="collections-search-clear"
                onClick={() => setSearch('')}
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* ===================================================
            LOADING
        =================================================== */}

        {loading && (
          <div className="collections-state collections-loading">
            <div className="collections-state-icon">
              <span></span>
            </div>

            <p>Loading INK collections...</p>
          </div>
        )}

        {/* ===================================================
            ERROR
        =================================================== */}

        {!loading && error && (
          <div className="collections-state collections-error">
            <div className="collections-state-icon">!</div>

            <p>{error}</p>

            <button type="button" onClick={() => fetchCollections()}>
              Try Again
            </button>
          </div>
        )}

        {/* ===================================================
            COLLECTION GRID
        =================================================== */}

        {!loading && !error && filteredCollections.length > 0 && (
          <>
            <div className="collections-grid">
              {filteredCollections.map(collection => (
                <article
                  className="collection-card"
                  key={collection.slug}
                  onClick={() => openCollection(collection.slug)}
                >
                  {/* Collection Image */}

                  <div className="collection-card-image">
                    {collection.image ? (
                      <img
                        src={collection.image}
                        alt={collection.name}
                        className="collection-image"
                      />
                    ) : (
                      <div className="collection-image-placeholder">
                        <span>INK</span>
                      </div>
                    )}

                    {/* Hover Overlay */}

                    <div className="collection-card-overlay">
                      <span>View Collection</span>

                      <strong>→</strong>
                    </div>
                  </div>

                  {/* Collection Information */}

                  <div className="collection-card-body">
                    <div className="collection-card-heading">
                      <h3>{collection.name}</h3>

                      <span className="collection-card-badge">INK</span>
                    </div>

                    <p className="collection-card-subtitle">INK Collection</p>

                    {/* Floor Price */}

                    {collection.floorPrice !== undefined &&
                      collection.floorPrice !== null && (
                        <div className="collection-floor-price">
                          <span>Floor</span>

                          <strong>
                            {Number(collection.floorPrice).toFixed(4)} ETH
                          </strong>
                        </div>
                      )}

                    {/* OpenSea */}

                    <button
                      className="collection-opensea-button"
                      type="button"
                      onClick={event =>
                        openOpenSea(event, collection.openseaUrl)
                      }
                    >
                      <span>View on OpenSea</span>

                      <span className="collection-opensea-arrow">↗</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* =================================================
                  NO SEARCH RESULTS
              ================================================= */}

            {filteredCollections.length === 0 && (
              <div className="collections-state collections-empty">
                <div className="collections-state-icon">⌕</div>

                <h3>No collections found</h3>

                <p>Try searching for another collection.</p>
              </div>
            )}

            {/* =================================================
                  PAGINATION
              ================================================= */}

            <div className="collections-pagination">
              <button
                type="button"
                className="collections-pagination-button"
                onClick={goToPreviousPage}
                disabled={page === 1 || loading}
              >
                ← Previous
              </button>

              <div className="collections-pagination-page">
                Page <strong>{page}</strong>
              </div>

              <button
                type="button"
                className="collections-pagination-button"
                onClick={goToNextPage}
                disabled={!nextCursor || loading}
              >
                Next →
              </button>
            </div>
          </>
        )}

        {/* ===================================================
            EMPTY STATE
        =================================================== */}

        {!loading && !error && collections.length === 0 && (
          <div className="collections-state collections-empty">
            <div className="collections-state-icon">∅</div>

            <h3>No INK collections found</h3>

            <p>There are currently no collections available to display.</p>
          </div>
        )}
      </section>
    </main>
  );
};

export default Collections;
