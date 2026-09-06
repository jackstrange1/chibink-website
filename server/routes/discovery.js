const express = require('express');
const router = express.Router();

const Like = require('../db/models/like');
const Rating = require('../db/models/rating');

// ==========================================
// MOST LIKED NFTs
// GET /api/discovery/most-liked
// ==========================================

router.get('/most-liked', async (req, res) => {
  try {
    const mostLiked = await Like.aggregate([
      {
        $group: {
          _id: {
            collectionSlug: '$collectionSlug',
            contractAddress: '$contractAddress',
            tokenId: '$tokenId',
          },
          likeCount: { $sum: 1 },
        },
      },
      {
        $sort: {
          likeCount: -1,
        },
      },
      {
        $limit: 100,
      },
      {
        $project: {
          _id: 0,
          collectionSlug: '$_id.collectionSlug',
          contractAddress: '$_id.contractAddress',
          tokenId: '$_id.tokenId',
          likeCount: 1,
        },
      },
    ]);

    const enrichedNFTs = await Promise.all(
      mostLiked.map(async nft => {
        try {
          const response = await fetch(
            `https://api.opensea.io/api/v2/chain/ink/contract/${nft.contractAddress}/nfts/${nft.tokenId}`,
            {
              headers: {
                'X-API-KEY': process.env.OPENSEA_API_KEY,
              },
            }
          );

          if (!response.ok) {
            return {
              ...nft,
              name: `#${nft.tokenId}`,
              image: null,
              openseaUrl: null,
            };
          }

          const data = await response.json();
          const item = data.nft;

          return {
            ...nft,
            name: item?.name || `#${nft.tokenId}`,
            image: item?.image_url || null,
            collection: item?.collection || nft.collectionSlug,
            openseaUrl: item?.opensea_url || null,
          };
        } catch (error) {
          console.error(
            `Failed to fetch NFT ${nft.contractAddress}/${nft.tokenId}:`,
            error
          );

          return {
            ...nft,
            name: `#${nft.tokenId}`,
            image: null,
            openseaUrl: null,
          };
        }
      })
    );

    res.json({
      success: true,
      nfts: enrichedNFTs,
    });
  } catch (error) {
    console.error('Most liked NFTs error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch most liked NFTs',
    });
  }
});

// ==========================================
// TOP RATED NFTs
// GET /api/discovery/top-rated
// ==========================================

router.get('/top-rated', async (req, res) => {
  try {
    const topRated = await Rating.aggregate([
      {
        $group: {
          _id: {
            collectionSlug: '$collectionSlug',
            contractAddress: '$contractAddress',
            tokenId: '$tokenId',
          },
          averageRating: {
            $avg: '$rating',
          },
          ratingCount: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          averageRating: -1,
          ratingCount: -1,
        },
      },
      {
        $limit: 100,
      },
      {
        $project: {
          _id: 0,
          collectionSlug: '$_id.collectionSlug',
          contractAddress: '$_id.contractAddress',
          tokenId: '$_id.tokenId',
          averageRating: {
            $round: ['$averageRating', 1],
          },
          ratingCount: 1,
        },
      },
    ]);

    const enrichedNFTs = await Promise.all(
      topRated.map(async nft => {
        try {
          const response = await fetch(
            `https://api.opensea.io/api/v2/chain/ink/contract/${nft.contractAddress}/nfts/${nft.tokenId}`,
            {
              headers: {
                'X-API-KEY': process.env.OPENSEA_API_KEY,
              },
            }
          );

          if (!response.ok) {
            return {
              ...nft,
              name: `#${nft.tokenId}`,
              image: null,
              openseaUrl: null,
            };
          }

          const data = await response.json();
          const item = data.nft;

          return {
            ...nft,
            name: item?.name || `#${nft.tokenId}`,
            image: item?.image_url || null,
            collection: item?.collection || nft.collectionSlug,
            openseaUrl: item?.opensea_url || null,
          };
        } catch (error) {
          console.error(
            `Failed to fetch rated NFT ${nft.contractAddress}/${nft.tokenId}:`,
            error
          );

          return {
            ...nft,
            name: `#${nft.tokenId}`,
            image: null,
            openseaUrl: null,
          };
        }
      })
    );

    res.json({
      success: true,
      nfts: enrichedNFTs,
    });
  } catch (error) {
    console.error('Top rated NFTs error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch top rated NFTs',
    });
  }
});

module.exports = router;
