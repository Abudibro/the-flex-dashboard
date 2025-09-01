import React, { useState, useMemo } from 'react';
import CategoryToggleChart from './CategoryToggleChart';
import { fetchLocations } from '../api/propertyReviews';
import type { Listing, Review } from '../types/hostaway';
import PropertyCard from './PropertyCard';
import ReviewsTable from './ReviewsTable';

const Dashboard: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minRating: 0,
    maxRating: 10,
    channel: '',
    type: 'all',
    visibility: '',
    propertyName: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });
  // All reviews from all listings
  const allReviews = useMemo(() => listings.flatMap((p: Listing) => p.reviews || []), [listings]);

  // --- Dashboard-wide stats and trends ---
  const allCategories = useMemo(() => {
    const categories = new Set<string>(['overall']);
    const guestToHostReviews = allReviews.filter((r: any) => r.type === 'guest-to-host');
    guestToHostReviews.forEach((review: any) => {
      (review.reviewCategory || []).forEach((cat: any) => categories.add(cat.category));
    });
    return Array.from(categories);
  }, [allReviews]);

  const dashboardStats = useMemo(() => {
    if (!allReviews.length) return null;
    const totalReviews = allReviews.length;
    const averageRating = (allReviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / totalReviews).toFixed(1);
    const approvedReviews = allReviews.filter((r: any) => r.visibility === 'approved').length;
    const pendingReviews = allReviews.filter((r: any) => r.visibility === 'pending').length;
    const hiddenReviews = allReviews.filter((r: any) => r.visibility === 'hidden').length;
    const categoryAverages: { [key: string]: string } = {};
    const guestToHostReviews = allReviews.filter((r: any) => r.type === 'guest-to-host');
    allCategories.forEach((category: string) => {
      if (category === 'overall') return;
      const categoryReviews = guestToHostReviews.filter((review: any) => (review.reviewCategory || []).some((cat: any) => cat.category === category));
      if (categoryReviews.length > 0) {
        const avg = categoryReviews.reduce((sum: number, review: any) => {
          const catRating = review.reviewCategory?.find((cat: any) => cat.category === category)?.rating || 0;
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
  }, [allReviews, allCategories]);

  const chartData = useMemo(() => {
    const guestToHostReviews = allReviews.filter((r: any) => r.type === 'guest-to-host');
    if (!guestToHostReviews.length) return [];
    const sorted = [...guestToHostReviews].sort((a: any, b: any) => new Date(a.submittedAt || '').getTime() - new Date(b.submittedAt || '').getTime());
    return sorted.map((review: any) => {
      const dataPoint: { [key: string]: any } = {
        date: new Date(review.submittedAt || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        reviewId: review.id,
        overall: review.rating
      };
      (review.reviewCategory || []).forEach((cat: any) => {
        dataPoint[cat.category] = cat.rating;
      });
      return dataPoint;
    });
  }, [allReviews]);

  // Color palette for trends
  const lineColors = {
    overall: '#3B82F6',
    cleanliness: '#10B981',
    communication: '#F59E0B',
    location: '#EF4444',
    value: '#8B5CF6',
    amenities: '#06B6D4',
    respect_house_rules: '#F97316'
  };



  // The rest of the component code remains unchanged

  // Unique property names for filter dropdown
  const availableProperties = useMemo(() => {
    const set = new Set<string>();
    listings.forEach(l => l.name && set.add(l.name));
    return Array.from(set);
  }, [listings]);

  // Filtering logic (same as before)
  const filteredReviews = useMemo(() => {
    let filtered: Review[] = allReviews.slice();
    filtered = filtered.filter(review => review.rating >= filters.minRating && review.rating <= filters.maxRating);
    if (filters.channel) filtered = filtered.filter(review => review.channel === filters.channel);
    if (filters.type !== 'all') filtered = filtered.filter(review => review.type === filters.type);
    if (filters.visibility) filtered = filtered.filter(review => review.visibility === filters.visibility);
    if (filters.propertyName) filtered = filtered.filter(review => review.listingName === filters.propertyName);
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
  }, [allReviews, filters]);

  const handleFilterChange = (key: string, value: any) => setFilters(prev => ({ ...prev, [key]: value }));

  React.useEffect(() => {
    let mounted = true;
    fetchLocations().then((data) => {
      if (!mounted) return;
      setListings(data);
      setLoading(false);
    }).catch(() => setLoading(false));
    return () => { mounted = false; };
  }, []);



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Flex Living Reviews Dashboard</h1>
          <p className="mt-2 text-gray-600">Monitor and manage guest reviews across all properties</p>
        </div>


        {/* Dashboard-wide stats */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">All Properties: Review Stats</h2>
          {dashboardStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <span className="inline-flex"><svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" /></svg></span>
                  <span className="ml-1 text-lg font-semibold">{dashboardStats.averageRating}</span>
                </div>
                <p className="text-sm text-gray-500">Average Rating</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-lg font-semibold">{dashboardStats.totalReviews}</div>
                <p className="text-sm text-gray-500">Total Reviews</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-lg font-semibold text-green-600">{dashboardStats.approvedReviews}</div>
                <p className="text-sm text-gray-500">Approved</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-lg font-semibold text-yellow-600">{dashboardStats.pendingReviews}</div>
                <p className="text-sm text-gray-500">Pending</p>
              </div>
            </div>
          )}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900">Review Trends (Guest Reviews Only)</h2>
            <p className="text-sm text-gray-600 mt-1">Track rating trends over time for all categories</p>
            {/* Single large chart with 4-way toggle */}
            <div className="p-6">
              <CategoryToggleChart
                chartData={chartData}
                lineColors={lineColors}
              />
            </div>
          </div>
        </div>

        {/* Property Overview Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((property, index) => {
              const ratings = (property.reviews || []).map(r => r.rating).filter(r => typeof r === 'number');
              const averageRating = ratings.length ? (Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 100) / 100) : null;
              const numberOfReviews = (property.reviews || []).length;
              return (
                <PropertyCard key={property.id || index} property={{ ...property, averageRating, numberOfReviews }} />
              );
            })}
          </div>
        </div>

        {/* Reviews Table Section */}
        <div className="bg-white rounded-lg shadow mt-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">All Reviews</h2>
            <p className="text-sm text-gray-600 mt-1">{filteredReviews.length} reviews across all properties</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                <select
                  value={filters.propertyName}
                  onChange={(e) => handleFilterChange('propertyName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  {availableProperties.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
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
                    maxRating: 5,
                    channel: '',
                    type: 'all',
                    visibility: '',
                    propertyName: '',
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
                // Optimistically update filteredReviews and listings
                setListings(prevListings => prevListings.map(listing => ({
                  ...listing,
                  reviews: (listing.reviews || []).map(r =>
                    r.id === id ? { ...r, visibility: nextVisibility } : r
                  )
                })));
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

export default Dashboard;
