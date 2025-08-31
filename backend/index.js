
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
import getDb from './db/db.js';



// Global Hostaway API config
const HOSTAWAY_API_KEY = process.env.HOSTAWAY_API_KEY;
const HOSTAWAY_ACCOUNT_ID = process.env.HOSTAWAY_ACCOUNT_ID;
const HOSTAWAY_BASE_URL = 'https://api.hostaway.com/v1';

const app = express();
app.use(cors());
app.use(bodyParser.json());


function pickMainImage(listing) {
  const imgs = (listing.listingImages || []).slice().sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  return imgs[0]?.url || null;
}

function normalize(listings, reviews) {
  // Build a map of reviews by listingId
  const reviewsByListingId = {};
  (reviews || []).forEach(review => {
    const key = String(review.listingId);
    if (!key) return;
    if (!reviewsByListingId[key]) reviewsByListingId[key] = [];
    reviewsByListingId[key].push(review);
  });

  return (listings || []).map(listing => {
    const matched = reviewsByListingId[String(listing.id)] || [];
    // sanitize guest-to-host respect_house_rules
    const sanitized = matched.map(r => {
      if (r.type === 'guest-to-host' && Array.isArray(r.reviewCategory)) {
        return { ...r, reviewCategory: r.reviewCategory.filter(c => (c.category || '').toLowerCase() !== 'respect_house_rules') };
      }
      return r;
    });
    return {
      ...listing,
      imageUrl: pickMainImage(listing),
      reviews: sanitized
    };
  });
}

// GET /api/locations/hostaway/:id -> returns one normalized listing (with reviews) by id or name, integrates with Hostaway
app.get('/api/locations/hostaway/:id', async (req, res) => {
  const { id } = req.params;
  try {
    let listing = null;
    let reviews = [];
    // Try Hostaway API first
    if (HOSTAWAY_API_KEY && HOSTAWAY_ACCOUNT_ID) {
      try {
        // Get listing
        const lres = await fetch(`${HOSTAWAY_BASE_URL}/listings/${id}`, {
          headers: { 'Authorization': `Bearer ${HOSTAWAY_API_KEY}` }
        });
        if (lres.ok) {
          const ljson = await lres.json();
          listing = ljson.result || ljson;
        }
        // Get reviews for this listing
        const rres = await fetch(`${HOSTAWAY_BASE_URL}/reviews?listingId=${id}`, {
          headers: { 'Authorization': `Bearer ${HOSTAWAY_API_KEY}` }
        });
        if (rres.ok) {
          const rjson = await rres.json();
          reviews = rjson.result || rjson;
        }
      } catch (e) {
        throw e;
      }
    }
    // Fallback to mock DB if Hostaway fails
    if (!listing) {
      const db = await getDb();
      await db.read();
      const listings = db.data.listings || [];
      listing = listings.find(l => String(l.id) === String(id) || (l.name && String(l.name) === String(id)));
    }
    if (!reviews.length) {
      const db = await getDb();
      await db.read();
      reviews = (db.data.reviews || []).filter(r => String(r.listingId) === String(listing?.id));
    }
    if (!listing) return res.status(404).json({ error: 'listing not found' });
    // Attach reviews to listing
    const sanitized = (reviews || []).map(r => {
      if (r.type === 'guest-to-host' && Array.isArray(r.reviewCategory)) {
        return { ...r, reviewCategory: r.reviewCategory.filter(c => (c.category || '').toLowerCase() !== 'respect_house_rules') };
      }
      return r;
    });
    res.json({ status: 'ok', result: { ...listing, reviews: sanitized } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch listing' });
  }
});

// GET /api/locations/hostaway -> returns all normalized listings and reviews, integrates with Hostaway
app.get('/api/locations/hostaway', async (req, res) => {
  try {
    let listings = null;
    let reviews = [];
    // Try Hostaway API first
    if (HOSTAWAY_API_KEY && HOSTAWAY_ACCOUNT_ID) {
      try {
        // Get all listings
        const lres = await fetch(`${HOSTAWAY_BASE_URL}/listings`, {
          headers: { 'Authorization': `Bearer ${HOSTAWAY_API_KEY}` }
        });
        if (lres.ok) {
          const ljson = await lres.json();
          listings = ljson.result || ljson;
        }
        // Get all reviews
        const rres = await fetch(`${HOSTAWAY_BASE_URL}/reviews`, {
          headers: { 'Authorization': `Bearer ${HOSTAWAY_API_KEY}` }
        });
        if (rres.ok) {
          const rjson = await rres.json();
          reviews = rjson.result || rjson;
        }
      } catch (e) {}
    }
    // Fallback to mock DB if Hostaway fails
    if (!listings) {
      const db = await getDb();
      await db.read();
      listings = db.data.listings || [];
    }
    if (!reviews.length) {
      const db = await getDb();
      await db.read();
      reviews = db.data.reviews || [];
    }
    // sanitize reviews (remove respect_house_rules for guest-to-host)
    const sanitized = (reviews || []).map(r => {
      if (r.type === 'guest-to-host' && Array.isArray(r.reviewCategory)) {
        return { ...r, reviewCategory: r.reviewCategory.filter(c => (c.category || '').toLowerCase() !== 'respect_house_rules') };
      }
      return r;
    });
    const listingsNormalized = normalize(listings, sanitized);
    res.json({ status: 'ok', result: listingsNormalized });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch hostaway data' });
  }
});

// PUT /api/review/hostaway -> update a review (e.g., change visibility), integrates with Hostaway
app.put('/api/review/hostaway', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || !payload.id) return res.status(400).json({ error: 'missing id' });

    // Try Hostaway API first
    let updated = null;
    if (HOSTAWAY_API_KEY && payload.listingId) {
      try {
  const putRes = await fetch(`${HOSTAWAY_BASE_URL}/listings/${payload.listingId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${HOSTAWAY_API_KEY}`,
            'Content-Type': 'application/json',
            'Cache-control': 'no-cache'
          },
          body: JSON.stringify(payload)
        });
        if (putRes.ok) {
          const putJson = await putRes.json();
          updated = putJson.result || putJson;
        }
      } catch (e) {}
    }
    // Fallback to mock DB if Hostaway fails
    if (!updated) {
      const db = await getDb();
      await db.read();
      const rows = db.data.reviews || [];
      const idx = rows.findIndex(r => r.id === payload.id);
      if (idx === -1) return res.status(404).json({ error: 'review not found' });
      rows[idx] = { ...rows[idx], ...payload };
  await db.write();
    }
    res.json({ status: 'ok', result: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to update review' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
