import React from 'react';
import { StarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/20/solid';

const PropertyCard = ({ property }) => {
  console.log(property);

  // Calculate trend (mock data - in real app this would be based on historical data)
  const getTrend = () => {
    const recentReviews = property.reviews.slice(-3);
    const olderReviews = property.reviews.slice(-6, -3);

    if (recentReviews.length === 0 || olderReviews.length === 0) return 'neutral';

    const recentAvg = recentReviews.reduce((sum, r) => sum + r.rating, 0) / recentReviews.length;
    const olderAvg = olderReviews.reduce((sum, r) => sum + r.rating, 0) / olderReviews.length;

    if (recentAvg > olderAvg + 0.2) return 'up';
    if (recentAvg < olderAvg - 0.2) return 'down';
    return 'neutral';
  };

  const trend = getTrend();

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 overflow-hidden">
      {property.imageUrl && (
        <div className="h-40 w-full bg-gray-100 overflow-hidden">
          <img
            src={property.imageUrl}
            alt={property.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {property.name}
          </h3>
          <div className="flex items-center">
            {trend === 'up' && (
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
            )}
            {trend === 'down' && (
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
            )}
          </div>
        </div>

        <div className="space-y-3">
          {/* Rating */}
          <div className="flex items-center">
            <div className="flex items-center">
              <StarIcon className="h-5 w-5 text-yellow-400" />
              <span className="ml-1 text-lg font-semibold text-gray-900">
                {property.averageRating}
              </span>
            </div>
            <span className="ml-2 text-sm text-gray-500">
              ({property.numberOfReviews} reviews)
            </span>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Approved:</span>
              <span className="ml-1 font-medium text-gray-900">
                {property.reviews.filter(r => r.visibility === 'approved').length}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Hidden:</span>
              <span className="ml-1 font-medium text-gray-900">
                {property.reviews.filter(r => r.visibility === 'hidden').length}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Pending:</span>
              <span className="ml-1 font-medium text-gray-900">
                {property.reviews.filter(r => r.visibility === 'pending').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Separate Links to Property Details and Dashboard */}
      <div className="px-6 pb-4 pt-4 flex items-center justify-between space-x-4">
        <a
          href={`/property/${property.id}`}
          className="flex items-center text-sm text-blue-600 font-medium hover:underline"
        >
          {/* Page icon (using Heroicons DocumentDuplicateIcon) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 17v1a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h1m8 4V5a2 2 0 0 0-2-2h-4m6 6h-6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2z"
            />
          </svg>
          View Listing
        </a>
        <a
          href={`/dashboard/property/${property.id}`}
          className="flex items-center text-sm text-purple-600 font-medium hover:underline"
        >
          {/* Dashboard icon (using Heroicons DocumentDuplicateIcon for consistency) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1 text-purple-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 17v1a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h1m8 4V5a2 2 0 0 0-2-2h-4m6 6h-6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2z"
            />
          </svg>
          View Insights
        </a>
      </div>
    </div>
  );
};

export default PropertyCard;
