import React, { useState, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
// Recharts primitives are not used directly in this file anymore (series graph lives in /trend)
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer
// } from 'recharts';
import { StarIcon, ArrowLeftIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import ReviewsTable from './ReviewsTable';
import { fetchListingWithReviews } from '../api/propertyReviews';
import type { Listing, Review, HostawayData } from '../types/hostaway';
import SeriesGraph from './trend/SeriesGraph';

const lineColors: Record<string, string> = {
  overall: '#3B82F6', // blue
  cleanliness: '#10B981', // green
  communication: '#F59E0B', // yellow
  location: '#EF4444', // red
  value: '#8B5CF6', // purple
  amenities: '#06B6D4', // cyan
  respect_house_rules: '#F97316' // orange
};

const PropertyReviews: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // all categories are visible by default; we no longer track visibility state

  const location = useLocation();
  const passed = (location.state as any)?.property as Listing | undefined;

  const [propertyData, setPropertyData] = React.useState<Listing | null>(passed || null);
  const [loading, setLoading] = React.useState(!passed);

  React.useEffect(() => {
    if (passed) return;
    let mounted = true;
    if (!id) return;
    fetchListingWithReviews(id).then((listing) => {
      console.log(listing)
      if (!mounted) return;
      setPropertyData(listing);
      setLoading(false);
    }).catch(() => setLoading(false));
    return () => { mounted = false; };
  }, [id, passed]);


  // Filtering state for this property's reviews
  const [filters, setFilters] = useState({
  minRating: 0,
  maxRating: 10,
    channel: '',
    type: 'all',
    visibility: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  // Reviews already attached to the normalized listing
  const propertyReviews = React.useMemo<Review[]>(() => (propertyData?.reviews || []).slice(), [propertyData]);

  // Filtering logic (same as Dashboard, but only for this property)
  const filteredReviews = useMemo(() => {
    let filtered: Review[] = propertyReviews.slice();
    filtered = filtered.filter(review => review.rating >= filters.minRating && review.rating <= filters.maxRating);
    if (filters.channel) filtered = filtered.filter(review => review.channel === filters.channel);
    if (filters.type !== 'all') filtered = filtered.filter(review => review.type === filters.type);
    if (filters.visibility) filtered = filtered.filter(review => review.visibility === filters.visibility);
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom).getTime();
      filtered = filtered.filter(review => new Date(review.submittedAt || '').getTime() >= from);
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo).getTime();
      filtered = filtered.filter(review => new Date(review.submittedAt || '').getTime() <= to);
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(review =>
        (review.guestName || '').toLowerCase().includes(s) ||
        (review.publicReview || '').toLowerCase().includes(s) ||
        (review.listingName || '').toLowerCase().includes(s)
      );
    }
    return filtered;
  }, [propertyReviews, filters]);

  const handleFilterChange = (key: string, value: any) => setFilters(prev => ({ ...prev, [key]: value }));

  // Prepare chart data (only guest-to-host reviews)
  const chartData = useMemo(() => {
    const guestToHostReviews = propertyReviews.filter(r => r.type === 'guest-to-host');
    if (!guestToHostReviews.length) return [];

    const sorted = [...guestToHostReviews].sort((a, b) => new Date(a.submittedAt || '').getTime() - new Date(b.submittedAt || '').getTime());

    return sorted.map(review => {
      const dataPoint: Record<string, any> = {
        date: new Date(review.submittedAt || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        reviewId: review.id,
        overall: review.rating
      };

      (review.reviewCategory || []).forEach(cat => {
        dataPoint[cat.category] = cat.rating;
      });

      return dataPoint;
    });
  }, [propertyReviews]);

  // Get all unique categories from guest-to-host reviews
  const allCategories = useMemo(() => {
    const categories = new Set<string>(['overall']);
    const guestToHostReviews = propertyReviews.filter(r => r.type === 'guest-to-host');
    guestToHostReviews.forEach(review => {
      (review.reviewCategory || []).forEach(cat => categories.add(cat.category));
    });
    return Array.from(categories);
  }, [propertyReviews]);

  // visibility toggles removed

  // Calculate property stats
  const propertyStats = useMemo(() => {
    if (!propertyReviews.length) return null;

    const totalReviews = propertyReviews.length;
    const averageRating = (propertyReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews).toFixed(1);
    const approvedReviews = propertyReviews.filter(r => r.visibility === 'approved').length;
    const pendingReviews = propertyReviews.filter(r => r.visibility === 'pending').length;
    const hiddenReviews = propertyReviews.filter(r => r.visibility === 'hidden').length;

    const categoryAverages: Record<string, string> = {};
    const guestToHostReviews = propertyReviews.filter(r => r.type === 'guest-to-host');

    allCategories.forEach(category => {
      if (category === 'overall') return;
      const categoryReviews = guestToHostReviews.filter(review => (review.reviewCategory || []).some(cat => cat.category === category));
      if (categoryReviews.length > 0) {
        const avg = categoryReviews.reduce((sum, review) => {
          const catRating = review.reviewCategory?.find(cat => cat.category === category)?.rating || 0;
          return sum + catRating;
        }, 0) / categoryReviews.length;
        categoryAverages[category] = avg.toFixed(1);
      }
    });

    return {
      totalReviews,
      averageRating,
      approvedReviews,
      pendingReviews,
      hiddenReviews,
      categoryAverages
    };
  }, [propertyReviews, allCategories]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!propertyData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-800">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>

          <div className="flex items-start space-x-6">
            {propertyData.imageUrl && (
              <div className="w-32 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                <img src={propertyData.imageUrl} alt={propertyData.name} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{propertyData.name}</h1>
              <div className="text-gray-600 mb-4 flex items-center gap-3">
                <span>{propertyData.city}, {propertyData.country}</span>
                <a
                  href={`/property/${propertyData.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:underline"
                >
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1" />
                  <span>Preview page</span>
                </a>
              </div>

              {propertyStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center">
                      <StarIcon className="h-5 w-5 text-yellow-400" />
                      <span className="ml-1 text-lg font-semibold">{propertyStats.averageRating}</span>
                    </div>
                    <p className="text-sm text-gray-500">Average Rating</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-lg font-semibold">{propertyStats.totalReviews}</div>
                    <p className="text-sm text-gray-500">Total Reviews</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-lg font-semibold text-green-600">{propertyStats.approvedReviews}</div>
                    <p className="text-sm text-gray-500">Approved</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-lg font-semibold text-yellow-600">{propertyStats.pendingReviews}</div>
                    <p className="text-sm text-gray-500">Pending</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

          {/* Chart Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Review Trends (Guest Reviews Only)</h2>
            <p className="text-sm text-gray-600 mt-1">Track rating trends over time for all categories</p>
          </div>

          <div className="p-6">
            {/* Chart: small-multiples per-category */}

            {/* category toggles removed — all categories shown */}

            <div>
              <SeriesGraph data={chartData} allCategories={allCategories} lineColors={lineColors} />
            </div>

          </div>

        </div>

        {/* Reviews Table Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Property Reviews</h2>
            <p className="text-sm text-gray-600 mt-1">{filteredReviews.length} reviews for this property</p>
          </div>
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating Range</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.1}
                    value={filters.minRating}
                    onChange={(e) => handleFilterChange('minRating', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-sm text-gray-700 w-10 text-center">{(filters.minRating as number).toFixed(1)}</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="range"
                    min={filters.minRating}
                    max={10}
                    step={0.1}
                    value={filters.maxRating}
                    onChange={(e) => handleFilterChange('maxRating', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-sm text-gray-700 w-10 text-center">{(filters.maxRating as number).toFixed(1)}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
                <select
                  value={filters.channel}
                  onChange={(e) => handleFilterChange('channel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Channels</option>
                  {['airbnb', 'booking.com', 'vrbo'].map(channel => (
                    <option key={channel} value={channel}>{channel.charAt(0).toUpperCase() + channel.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="guest-to-host">Guest to Host</option>
                  <option value="host-to-guest">Host to Guest</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.visibility}
                  onChange={(e) => handleFilterChange('visibility', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({
                    minRating: 0,
                    maxRating: 10,
                    channel: '',
                    type: 'all',
                    visibility: '',
                    dateFrom: '',
                    dateTo: '',
                    search: ''
                  })}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
          <div className="px-6 py-4">
            <ReviewsTable
              reviews={filteredReviews}
              onUpdateVisibility={async (id: number, nextVisibility: string) => {
                // Optimistically update propertyData
                setPropertyData(prev => prev && ({
                  ...prev,
                  reviews: (prev.reviews || []).map(r =>
                    r.id === id ? { ...r, visibility: nextVisibility } : r
                  )
                }));
                // Force filteredReviews to recalculate by updating filters with a dummy value
                setFilters(prev => ({ ...prev, _refresh: Math.random() }));
                try {
                  await import('../api/propertyReviews').then(mod => mod.updateReview({ id, visibility: nextVisibility }));
                } catch (e) {
                  // Optionally show error or revert
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyReviews;
