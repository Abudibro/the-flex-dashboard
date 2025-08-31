import React from 'react';
import type { Review } from '../types/hostaway';

type Props = { reviews: Review[] };

const ReviewsGrid: React.FC<Props> = ({ reviews }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {reviews.map(r => {
        const author = r.guestName || 'Guest';
        const date = r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : '';
        const text = r.publicReview || '';
        const rating = typeof r.rating === 'number' ? r.rating.toFixed(2) : '-';
        const formatLabel = (s: string) => s.replace(/_/g, ' ').replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.substr(1));
        const categories = (r.reviewCategory || []).map(c => `${formatLabel(c.category)}: ${c.rating}`);

        return (
          <div key={r.id} className="bg-gray-50 rounded-lg shadow p-4">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-sm font-semibold text-gray-700">{author.charAt(0).toUpperCase()}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-800">{author}</div>
                  <div className="text-sm text-gray-500">{date}</div>
                </div>
                <div className="mt-2 text-gray-700 text-sm">{text}</div>
                <div className="mt-3 flex items-center flex-wrap gap-2 text-xs text-gray-500">
                  <div className="px-2 py-1 bg-white rounded">Rating: {rating}</div>
                  {categories.slice(0,3).map(cat => (
                    <div key={cat} className="px-2 py-1 bg-white rounded">{cat}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReviewsGrid;
