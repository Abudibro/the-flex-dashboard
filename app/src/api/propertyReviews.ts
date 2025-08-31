import type { Review, Listing } from '../types/hostaway';
const BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8080';

// Fetch all normalized data from backend (listings + reviews)
export async function fetchLocations(): Promise<Listing[]> {
  const res = await fetch(`${BASE}/api/locations/hostaway`);
  if (!res.ok) throw new Error('Failed to fetch hostaway data');
  const json = await res.json();
  return json.result as Listing[];
}

// Update a review (PATCH/PUT)
export async function updateReview(patch: Partial<Review> & { id: number }): Promise<Review> {
  const res = await fetch(`${BASE}/api/review/hostaway`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(patch)
  });
  if (!res.ok) throw new Error('Failed to update review');
  const json = await res.json();
  return json.result;
}

// Fetch a single listing (with reviews) by id or name
export async function fetchListingWithReviews(id: string | number): Promise<Listing> {
  const res = await fetch(`${BASE}/api/locations/hostaway/${id}`);
  if (!res.ok) throw new Error('Failed to fetch listing');
  const json = await res.json();
  return json.result as Listing;
}