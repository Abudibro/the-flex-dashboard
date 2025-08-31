// Types for Hostaway API data

export type Review = {
  id: number;
  type?: string;
  status?: string;
  rating: number;
  publicReview?: string;
  reviewCategory?: Array<{ category: string; rating: number }>;
  submittedAt?: string;
  guestName?: string;
  listingName?: string;
  channel?: string;
  visibility?: string;
};

export type Listing = {
  id?: number;
  name?: string;
  externalListingName?: string;
  city?: string;
  country?: string;
  listingImages?: Array<{ id?: number; caption?: string; url?: string; sortOrder?: number }>;
  imageUrl?: string | null;
  reviews?: Review[];
  address?: string;
  latitude?: number;
  longitude?: number;
};

export type HostawayData = {
  listings: Listing[];
};
