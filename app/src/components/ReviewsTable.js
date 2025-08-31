import React, { useEffect, useRef, useState } from 'react';
import { StarIcon, CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { normalizeCategoryName } from '../data/mockReviews';


const ReviewsTable = ({ reviews, onUpdateVisibility }) => {
  // Pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [sortConfig, setSortConfig] = useState({
    key: 'submittedAt',
    direction: 'desc'
  });

  const [selectedReview, setSelectedReview] = useState(null);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };


  const sortedReviews = [...reviews].sort((a, b) => {
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];
    if (sortConfig.key === 'listingName') {
      aValue = a.listingName;
      bValue = b.listingName;
    }
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Pagination logic
  const totalReviews = sortedReviews.length;
  const totalPages = Math.max(1, Math.ceil(totalReviews / rowsPerPage));
  const paginatedReviews = sortedReviews.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Reset to first page if reviews or rowsPerPage changes
  React.useEffect(() => { setPage(1); }, [reviews, rowsPerPage]);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Map 10-point ratings to 5-point color scale
  const getRatingColor = (rating) => {
    const scaled = rating / 2; // 10 -> 5
    if (scaled >= 4.5) return 'text-green-600'; // Excellent
    if (scaled >= 3.5) return 'text-blue-600'; // Good
    if (scaled >= 2.5) return 'text-amber-500'; // Average
    return 'text-gray-400'; // Low
  };

  const statusPill = (visibility) => {
    switch (visibility) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'hidden':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const typePill = (type) => {
    return type === 'guest-to-host'
      ? 'bg-purple-100 text-purple-800'
      : 'bg-indigo-100 text-indigo-800';
  };

  const isDisabled = (review) => review.type === 'host-to-guest';

  const isChecked = (review) => review.visibility === 'approved';
  const isCrossed = (review) => review.visibility === 'hidden';

  const handleApprove = (review) => {
    if (isDisabled(review)) return;
    onUpdateVisibility?.(review.id, 'approved');
    setSelectedReview(prev => (prev && prev.id === review.id ? { ...prev, visibility: 'approved' } : prev));
  };

  const handleHide = (review) => {
    if (isDisabled(review)) return;
    onUpdateVisibility?.(review.id, 'hidden');
    setSelectedReview(prev => (prev && prev.id === review.id ? { ...prev, visibility: 'hidden' } : prev));
  };

  // Modal close handlers
  const closeModal = () => setSelectedReview(null);

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, []);

  // Tooltip state
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div className="overflow-x-auto">
      {/* Rows per page selector */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <label className="mr-2 text-sm text-gray-700 font-medium">Rows per page:</label>
          <select
            value={rowsPerPage}
            onChange={e => setRowsPerPage(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none"
          >
            {[10, 25, 50, 100].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div className="text-sm text-gray-600">
          Showing {Math.min((page - 1) * rowsPerPage + 1, totalReviews)}-
          {Math.min(page * rowsPerPage, totalReviews)} of {totalReviews} reviews
        </div>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('guestName')}
            >
              Guest {getSortIcon('guestName')}
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('listingName')}
            >
              Property {getSortIcon('listingName')}
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('rating')}
            >
              Rating {getSortIcon('rating')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Review
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('channel')}
            >
              Channel {getSortIcon('channel')}
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('type')}
            >
              Type {getSortIcon('type')}
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('submittedAt')}
            >
              Date {getSortIcon('submittedAt')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Show Review
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginatedReviews.map((review) => (
            <tr
              key={review.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedReview(review)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {review.guestName}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {review.listingName}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <StarIcon className="h-4 w-4 text-yellow-400" />
                  <span className={`ml-1 text-sm font-medium ${getRatingColor(review.rating)}`}>
                    {typeof review.rating === 'number' ? review.rating.toFixed(2) : review.rating}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 align-top">
                <div
                  className="relative text-sm text-gray-900 max-w-xs truncate"
                  onMouseEnter={() => setHoveredId(review.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {review.publicReview}

                  {hoveredId === review.id && (
                    <div className="absolute z-20 mt-1 w-96 max-h-56 overflow-auto right-0 bg-white border border-gray-200 shadow-xl rounded-md p-3 text-gray-800">
                      {review.publicReview}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {review.reviewCategory.map(cat =>
                    `${normalizeCategoryName(cat.category)}: ${cat.rating}/10`
                  ).join(', ')}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {review.channel}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${typePill(review.type)}`}>
                  {review.type === 'guest-to-host' ? 'Guest → Host' : 'Host → Guest'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(review.submittedAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusPill(review.visibility)}`}>
                  {review.visibility.charAt(0).toUpperCase() + review.visibility.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApprove(review)}
                    className={`p-1 rounded ${isDisabled(review)
                      ? 'text-gray-300 cursor-not-allowed'
                      : isChecked(review)
                        ? 'text-green-600 hover:text-green-800'
                        : 'text-gray-400 hover:text-green-600'
                      }`}
                    title={isDisabled(review) ? 'Not applicable for host-to-guest' : 'Approve'}
                    disabled={isDisabled(review)}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleHide(review)}
                    className={`p-1 rounded ${isDisabled(review)
                      ? 'text-gray-300 cursor-not-allowed'
                      : isCrossed(review)
                        ? 'text-red-600 hover:text-red-800'
                        : 'text-gray-400 hover:text-red-600'
                      }`}
                    title={isDisabled(review) ? 'Not applicable for host-to-guest' : 'Hide'}
                    disabled={isDisabled(review)}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>


      {sortedReviews.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No reviews found matching the current filters.</p>
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-4">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="px-2 py-1 rounded border text-sm disabled:opacity-50"
          >First</button>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-2 py-1 rounded border text-sm disabled:opacity-50"
          >Prev</button>
          <span className="text-sm">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-2 py-1 rounded border text-sm disabled:opacity-50"
          >Next</button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            className="px-2 py-1 rounded border text-sm disabled:opacity-50"
          >Last</button>
        </div>
      )}

      {/* Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-30">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeModal}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl border border-gray-200">
              <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedReview.listingName}</h3>
                  <p className="text-sm text-gray-500">{selectedReview.guestName} • {formatDate(selectedReview.submittedAt)}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600" onClick={closeModal} aria-label="Close">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="px-6 py-4 space-y-3 max-h-[60vh] overflow-auto">
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{selectedReview.channel}</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusPill(selectedReview.visibility)}`}>
                    {selectedReview.visibility.charAt(0).toUpperCase() + selectedReview.visibility.slice(1)}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typePill(selectedReview.type)}`}>
                    {selectedReview.type === 'guest-to-host' ? 'Guest → Host' : 'Host → Guest'}
                  </span>
                </div>
                <div className="flex items-center text-gray-800">
                  <StarIcon className="h-5 w-5 text-yellow-400" />
                  <span className="ml-1 font-medium">{selectedReview.rating}</span>
                </div>
                <div className="text-gray-900 whitespace-pre-line">
                  {selectedReview.publicReview}
                </div>
                <div className="text-sm text-gray-600">
                  Categories: {selectedReview.reviewCategory.map(cat => `${cat.category.replace('_', ' ')}: ${cat.rating}/10`).join(', ')}
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3 bg-gray-50 rounded-b-lg">
                <button
                  onClick={() => handleHide(selectedReview)}
                  disabled={isDisabled(selectedReview)}
                  className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${isDisabled(selectedReview)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                >
                  <XMarkIcon className="h-4 w-4 mr-1" /> Hide
                </button>
                <button
                  onClick={() => handleApprove(selectedReview)}
                  disabled={isDisabled(selectedReview)}
                  className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${isDisabled(selectedReview)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                >
                  <CheckIcon className="h-4 w-4 mr-1" /> Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsTable;
