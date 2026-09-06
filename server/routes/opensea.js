const express = require('express');

const router = express.Router();
router.get('/collections/:slug/nfts/:identifier', async (req, res) => {
  try {
    const { slug, identifier } = req.params;

    console.log('Searching NFT:', slug, identifier);

    // 1. Get collection details
    const collectionResponse = await fetch(
      `https://api.opensea.io/api/v2/collections/${slug}`,
      {
        headers: {
          'X-API-KEY': process.env.OPENSEA_API_KEY,
        },
      }
    );

    if (!collectionResponse.ok) {
      const errorText = await collectionResponse.text();

      console.error('OpenSea collection API error:', errorText);

      return res.status(collectionResponse.status).json({
        success: false,
        message: 'Failed to fetch collection details',
      });
    }

    const collectionData = await collectionResponse.json();

    // 2. Get the Ink contract address
    const contract = collectionData.contracts?.find(
      contract => contract.chain === 'ink'
    );

    if (!contract?.address) {
      return res.status(404).json({
        success: false,
        message: 'Ink contract address not found',
      });
    }

    const contractAddress = contract.address;

    console.log('Contract address:', contractAddress);

    // 3. Fetch the exact NFT from OpenSea
    const nftResponse = await fetch(
      `https://api.opensea.io/api/v2/chain/ink/contract/${contractAddress}/nfts/${identifier}`,
      {
        headers: {
          'X-API-KEY': process.env.OPENSEA_API_KEY,
        },
      }
    );

    if (!nftResponse.ok) {
      const errorText = await nftResponse.text();

      console.error('OpenSea NFT API error:', nftResponse.status, errorText);

      return res.status(nftResponse.status).json({
        success: false,
        message: 'NFT not found',
      });
    }

    const nftData = await nftResponse.json();

    console.log('NFT found:', nftData);

    // 4. Return the NFT
    res.json({
      success: true,
      nft: nftData.nft,
    });
  } catch (error) {
    console.error('NFT search error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to search NFT',
    });
  }
});
// Test OpenSea API connection
router.get('/test', async (req, res) => {
  try {
    const response = await fetch('https://api.opensea.io/api/v2/chains', {
      headers: {
        'X-API-KEY': process.env.OPENSEA_API_KEY,
      },
    });

    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'OpenSea API request failed',
    });
  }
});

// Get INK collections
router.get('/collections', async (req, res) => {
  try {
    const response = await fetch(
      'https://api.opensea.io/api/v2/collections?chain=ink&limit=10',
      {
        headers: {
          'X-API-KEY': process.env.OPENSEA_API_KEY,
        },
      }
    );

    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to fetch Ink collections',
    });
  }
});

// Get NFTs by INK contract address
router.get('/contract/nftmig/nfts', async (req, res) => {
  try {
    const response = await fetch(
      'https://api.opensea.io/api/v2/chain/ink/contract/0x94b10735d949de954b3c0cf2de859a351973c49d/nfts?limit=10',
      {
        headers: {
          'X-API-KEY': process.env.OPENSEA_API_KEY,
        },
      }
    );

    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to fetch NFTs by contract',
    });
  }
});
// Search INK NFTs and collections
// Search INK collections
// Get INK collections with minimum 0.05 ETH total volume
// Get INK collections with pagination
// =====================================================
// ACTIVE INK COLLECTIONS — LAST 30 DAYS
// =====================================================

router.get('/search', async (req, res) => {
  try {
    const { cursor } = req.query;

    const params = new URLSearchParams({
      chains: 'ink',
      limit: '100',
      sort_by: 'total_volume',
      sort_direction: 'desc',
    });

    if (cursor) {
      params.append('cursor', cursor);
    }

    const response = await fetch(
      `https://api.opensea.io/api/v2/collections/top?${params.toString()}`,
      {
        headers: {
          'X-API-KEY': process.env.OPENSEA_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error('OpenSea top collections API error:', errorText);

      return res.status(response.status).json({
        success: false,
        message: 'Failed to fetch top INK collections',
      });
    }

    const data = await response.json();

    const collections = (data.collections || [])
      .map(collection => ({
        slug: collection.collection,
        name: collection.name,
        image: collection.image_url,
        description: collection.description,
        openseaUrl: collection.opensea_url,

        floorPrice: collection.floor_price ?? null,
        totalVolume: collection.total_volume ?? null,
        sales: collection.sales ?? null,
      }))
      .filter(collection => collection.slug);

    res.json({
      success: true,
      count: collections.length,
      collections,
      next: data.next || null,
    });
  } catch (error) {
    console.error('INK top collections error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch top INK collections',
    });
  }
});
// Get details for a single INK collection
router.get('/collections/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const response = await fetch(
      `https://api.opensea.io/api/v2/collections/${slug}`,
      {
        headers: {
          'X-API-KEY': process.env.OPENSEA_API_KEY,
        },
      }
    );

    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to fetch collection details',
    });
  }
});
// Get NFTs from any INK collection
router.get('/collections/:slug/nfts', async (req, res) => {
  try {
    const { slug } = req.params;
    const { next } = req.query;

    const params = new URLSearchParams({
      limit: '100',
    });

    // OpenSea pagination cursor
    if (next) {
      params.append('next', next);
    }

    const response = await fetch(
      `https://api.opensea.io/api/v2/collection/${slug}/nfts?${params.toString()}`,
      {
        headers: {
          'X-API-KEY': process.env.OPENSEA_API_KEY,
          Accept: 'application/json',
        },
      }
    );

    // Handle OpenSea API errors
    if (!response.ok) {
      const errorText = await response.text();

      console.error('OpenSea NFT API error:', response.status, errorText);

      return res.status(response.status).json({
        success: false,
        message: 'Failed to fetch collection NFTs',
      });
    }

    const data = await response.json();

    // Sort the NFTs returned by OpenSea by token ID
    const nfts = (data.nfts || []).sort((a, b) => {
      const idA = Number(a.identifier);
      const idB = Number(b.identifier);

      if (Number.isNaN(idA)) return 1;
      if (Number.isNaN(idB)) return -1;

      return idA - idB;
    });

    res.json({
      success: true,
      nfts,
      next: data.next || null,
    });
  } catch (error) {
    console.error('Collection NFTs error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch collection NFTs',
    });
  }
});
// ==========================================
// BIGGEST SALES — LAST 24H
// GET /api/opensea/sales-24h
// ==========================================

router.get('/sales-24h', async (req, res) => {
  try {
    const now = Math.floor(Date.now() / 1000);
    const yesterday = now - 24 * 60 * 60;

    // =====================================================
    // 1. GET TOP INK COLLECTIONS
    // =====================================================

    const collectionsResponse = await fetch(
      'https://api.opensea.io/api/v2/collections/top?chains=ink&limit=100&sort_by=total_volume',
      {
        headers: {
          'X-API-KEY': process.env.OPENSEA_API_KEY,
          Accept: 'application/json',
        },
      }
    );

    if (!collectionsResponse.ok) {
      const errorText = await collectionsResponse.text();

      console.error('OpenSea top collections API error:', errorText);

      return res.status(collectionsResponse.status).json({
        success: false,
        message: 'Failed to fetch INK collections',
      });
    }

    const collectionsData = await collectionsResponse.json();

    const collections = (collectionsData.collections || [])
      .map(collection => ({
        slug: collection.collection,
        name: collection.name,
      }))
      .filter(collection => collection.slug);

    console.log(`Found ${collections.length} INK collections`);

    // =====================================================
    // 2. FETCH 24H SALES FOR EACH COLLECTION
    // =====================================================

    const saleRequests = collections.map(async collection => {
      try {
        const params = new URLSearchParams({
          event_type: 'sale',
          after: String(yesterday),
          before: String(now),
          limit: '200',
        });

        const response = await fetch(
          `https://api.opensea.io/api/v2/events/collection/${collection.slug}?${params.toString()}`,
          {
            headers: {
              'X-API-KEY': process.env.OPENSEA_API_KEY,
              Accept: 'application/json',
            },
          }
        );

        if (!response.ok) {
          console.error(`Failed to fetch sales for ${collection.slug}`);

          return [];
        }

        const data = await response.json();

        return (data.asset_events || []).map(event => ({
          ...event,

          collectionSlug: collection.slug,

          collectionName: collection.name,
        }));
      } catch (error) {
        console.error(`Error fetching ${collection.slug} sales:`, error);

        return [];
      }
    });

    const saleResults = await Promise.all(saleRequests);

    // =====================================================
    // 3. COMBINE ALL SALES
    // =====================================================

    let events = saleResults.flat();

    // =====================================================
    // 4. REMOVE DUPLICATES
    // =====================================================

    const uniqueEvents = new Map();

    events.forEach(event => {
      const key = [
        event.transaction,
        event.nft?.contract,
        event.nft?.identifier,
        event.payment?.quantity,
      ].join('-');

      if (!uniqueEvents.has(key)) {
        uniqueEvents.set(key, event);
      }
    });

    events = Array.from(uniqueEvents.values());

    // =====================================================
    // 5. CALCULATE SALE VALUE
    // =====================================================

    const sales = events
      .map(event => {
        const payment = event.payment;

        if (!payment) {
          return null;
        }

        const symbol = payment.symbol?.toUpperCase();

        // Only ETH / WETH
        if (symbol !== 'ETH' && symbol !== 'WETH') {
          return null;
        }

        const quantity = Number(payment.quantity);

        const decimals = payment.decimals ?? 18;

        if (!Number.isFinite(quantity)) {
          return null;
        }

        const ethValue = quantity / Math.pow(10, decimals);

        if (!Number.isFinite(ethValue) || ethValue <= 0) {
          return null;
        }

        return {
          ...event,

          saleValue: ethValue,

          saleCurrency: symbol,
        };
      })
      .filter(Boolean);

    // =====================================================
    // 6. SORT BIGGEST SALES
    // =====================================================

    sales.sort((a, b) => b.saleValue - a.saleValue);

    // =====================================================
    // 7. RETURN TOP 8
    // =====================================================

    const biggestSales = sales.slice(0, 8);

    res.json({
      success: true,

      collectionCount: collections.length,

      totalSalesFound: sales.length,

      eventCount: biggestSales.length,

      events: biggestSales,
    });
  } catch (error) {
    console.error('Biggest sales 24h error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch biggest sales',
    });
  }
});
// Get INK collections with floor price movement in the last 24h
router.get('/floor-up-24h', async (req, res) => {
  try {
    // First get INK collections
    const collectionsResponse = await fetch(
      'https://api.opensea.io/api/v2/search?query=ink&chains=ink&asset_types=collection&limit=50',
      {
        headers: {
          'X-API-KEY': process.env.OPENSEA_API_KEY,
        },
      }
    );

    if (!collectionsResponse.ok) {
      const errorText = await collectionsResponse.text();

      console.error('OpenSea collections API error:', errorText);

      return res.status(collectionsResponse.status).json({
        success: false,
        message: 'Failed to fetch INK collections',
      });
    }

    const collectionsData = await collectionsResponse.json();

    const collections = (collectionsData.results || [])
      .filter(item => item.type === 'collection')
      .map(item => ({
        slug: item.collection.collection,
        name: item.collection.name,
      }))
      .filter(collection => collection.slug);

    // Get floor price history for every collection
    const floorRequests = collections.map(async collection => {
      try {
        const response = await fetch(
          `https://api.opensea.io/api/v2/collections/${collection.slug}/floor_prices?timeframe=one_day`,
          {
            headers: {
              'X-API-KEY': process.env.OPENSEA_API_KEY,
            },
          }
        );

        if (!response.ok) {
          return null;
        }

        const data = await response.json();

        return {
          slug: collection.slug,
          name: collection.name,
          history: data.floor_prices || [],
        };
      } catch (error) {
        console.error(
          `Failed to fetch floor history for ${collection.slug}:`,
          error
        );

        return null;
      }
    });

    const floorResults = (await Promise.all(floorRequests)).filter(Boolean);

    const floorUpCollections = floorResults
      .map(collection => {
        const history = collection.history;

        if (history.length < 2) {
          return null;
        }

        const previousFloor = history[0].token_unit;
        const currentFloor = history[history.length - 1].token_unit;

        if (
          typeof previousFloor !== 'number' ||
          typeof currentFloor !== 'number' ||
          previousFloor <= 0
        ) {
          return null;
        }

        const changePercent =
          ((currentFloor - previousFloor) / previousFloor) * 100;

        return {
          slug: collection.slug,
          name: collection.name,
          previousFloor,
          currentFloor,
          changePercent,
          currency: 'ETH',
        };
      })
      .filter(collection => collection && collection.changePercent > 0)
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 8);

    res.json({
      success: true,
      collectionCount: floorUpCollections.length,
      collections: floorUpCollections,
    });
  } catch (error) {
    console.error('Floor up 24h error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch floor price movement',
    });
  }
});
module.exports = router;
