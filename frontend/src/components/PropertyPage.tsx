import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchLocations } from '../api/propertyReviews';
import type { Listing, Review, HostawayData } from '../types/hostaway';
import {
  People as PeopleIcon,
  KingBed as KingBedIcon,
  Bathtub as BathtubIcon,
  SingleBed as SingleBedIcon,
  Category as CategoryIcon,
  Wifi as WifiIcon,
  Kitchen as KitchenIcon,
  LocalLaundryService as LocalLaundryServiceIcon,
  Elevator as ElevatorIcon,
  SmokeFree as SmokeFreeIcon,
  DeviceThermostat as ThermostatIcon,
  Checkroom as CheckroomIcon,
  Construction as ConstructionIcon,
} from '@mui/icons-material';
import ReviewsGrid from './ReviewsGrid';

const PropertyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [properties, setProperties] = React.useState<Listing[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    fetchLocations().then((data: Listing[]) => {
      if (!mounted) return;
      setProperties(data);
      setLoading(false);
    }).catch(() => setLoading(false));
    return () => { mounted = false; };
  }, [id]);

  const property = React.useMemo<Listing | undefined>(() => properties.find(p => String(p.id) === String(id)), [properties, id]);
  const approvedReviews = React.useMemo<Review[]>(() => (property?.reviews || []).filter(r => r.visibility === 'approved'), [property]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property not found</h1>
          <Link to="/dashboard" className="text-blue-600">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  const images = property.listingImages && property.listingImages.length > 0 ? property.listingImages : [];
  const mainImg = images[0]?.url || '';
  const title = property.name || 'Property';
  const city = property.city || '';
  const country = property.country || '';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fbf9f3' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Photos block: large photo (left 2x2) and 4 small thumbnails (right 2x2) */}
        <div className="w-full">
          <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[600px]">
            {/* Large image: spans left 2 columns and 2 rows */}
            <div className="col-span-2 row-span-2 rounded-lg overflow-hidden shadow">
              {mainImg && (
                <img src={mainImg} alt={title} className="w-full h-full object-cover" />
              )}
            </div>

            {/* Four small images fill the remaining 2x2 grid cells on the right */}
            {images.slice(1, 5).map((img, idx) => (
              <div key={img.url} className="overflow-hidden rounded shadow">
                <img src={img.url} alt={`thumb-${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
            {/* If fewer than 5 images, fill with empty divs for layout consistency */}
            {Array.from({ length: Math.max(0, 4 - (images.length - 1)) }).map((_, idx) => (
              <div key={`empty-thumb-${idx}`} className="overflow-hidden rounded shadow bg-gray-100" />
            ))}
          </div>

          {/* Title + stats under images */}
          <div className="mt-6">
            <h1 className="text-3xl font-extrabold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-600 mt-2">{city}{city && country ? ', ' : ''}{country}</p>

            <div className="mt-4 flex items-center space-x-8 text-sm text-gray-700">
              <div className="flex items-center space-x-2">
                <PeopleIcon style={{ color: '#6b7280' }} />
                <div>
                  <div className="font-semibold">{(property as any).guests || 4}</div>
                  <div className="text-xs text-gray-500">guests</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <KingBedIcon style={{ color: '#6b7280' }} />
                <div>
                  <div className="font-semibold">{(property as any).bedrooms || 2}</div>
                  <div className="text-xs text-gray-500">bedrooms</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <BathtubIcon style={{ color: '#6b7280' }} />
                <div>
                  <div className="font-semibold">{(property as any).bathrooms || 1}</div>
                  <div className="text-xs text-gray-500">bathrooms</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <SingleBedIcon style={{ color: '#6b7280' }} />
                <div>
                  <div className="font-semibold">{(property as any).beds || 2}</div>
                  <div className="text-xs text-gray-500">beds</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two-column layout: left content, right sticky booking */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-2">About this property</h2>
                <p className="text-gray-700">{(property as any).description || 'This property is managed by Flex Living. It offers comfortable accommodation and modern amenities for short-term stays.'}</p>
                <button className="mt-3 text-sm text-emerald-700">Read more</button>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Amenities</h3>
                  <button className="text-sm text-gray-600">View all amenities</button>
                </div>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-gray-700">
                  {(((property as any).amenities) || ['Wireless','Kitchen','Washing Machine','Elevator','Hair Dryer','Heating','Smoke Detector','Essentials']).map((a: string) => {
                    const key = (a || '').toLowerCase();
                    const iconMap: Record<string, any> = {
                      'wireless': WifiIcon,
                      'wifi': WifiIcon,
                      'wireless internet': WifiIcon,
                      'kitchen': KitchenIcon,
                      'washing machine': LocalLaundryServiceIcon,
                      'washer': LocalLaundryServiceIcon,
                      'elevator': ElevatorIcon,
                      'smoke detector': SmokeFreeIcon,
                      'heating': ThermostatIcon,
                      'hair dryer': ConstructionIcon,
                      'essentials': CheckroomIcon
                    };

                    const IconComp = iconMap[key] || CategoryIcon;

                    return (
                      <div key={a} className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                          <IconComp style={{ color: '#6b7280' }} />
                        </div>
                        <div>{a}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Stay Policies</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="font-semibold">Check-in & Check-out</div>
                    <div className="text-sm text-gray-600 mt-2">Check-in: 3:00 PM • Check-out: 10:00 AM</div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded">
                    <div className="font-semibold">House Rules</div>
                    <div className="text-sm text-gray-600 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2 bg-white rounded shadow-sm">No smoking</div>
                      <div className="p-2 bg-white rounded shadow-sm">No pets</div>
                      <div className="p-2 bg-white rounded shadow-sm">No parties or events</div>
                      <div className="p-2 bg-white rounded shadow-sm">Security deposit required</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Cancellation Policy</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <div className="font-semibold">For stays less than 28 days</div>
                  <ul className="list-disc pl-5 text-sm text-gray-600 mt-2">
                    <li>Full refund up to 14 days before check-in</li>
                    <li>No refund for bookings less than 14 days before check-in</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Location</h3>
                <div className="w-full h-64 bg-white rounded border border-gray-200 shadow-sm overflow-hidden relative">
                  {property.latitude && property.longitude ? (
                    <>
                      <iframe
                        title="property-map"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        src={`https://maps.google.com/maps?q=${property.latitude},${property.longitude}&z=15&output=embed`}
                        loading="lazy"
                      />
                      {/* rely on Google Maps embed pin for the marker at the coordinates */}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">Map unavailable</div>
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-2">{(property as any).address || `${city}${city && country ? ', ' : ''}${country}`}</div>
              </div>

              {/* Approved Reviews (moved below columns) */}
              {/* reviews placeholder removed from left column intentionally */}
            </div>
          </div>

          {/* Right booking column (sticky, starts aligned with About) */}
          <aside className="lg:col-span-1 self-start sticky top-24">
            <div className="space-y-6">
              <div className="rounded-lg overflow-hidden shadow">
                <div className="bg-emerald-900 p-6 text-white">
                  <div className="text-sm">Book your stay</div>
                  <div className="text-2xl font-bold mt-2">${(property as any).price || 120} <span className="text-sm font-normal">/ night</span></div>
                  <div className="text-xs text-emerald-200 mt-1">Select dates to see the total price</div>
                </div>
                <div className="bg-white p-6">
                  <div className="grid grid-cols-1 gap-3">
                    <button className="w-full border border-gray-200 rounded py-2 text-left px-3">Select dates</button>
                    <div className="flex items-center justify-between">
                      <div className="w-2/3">
                        <button className="w-full border border-gray-200 rounded py-2 text-left px-3">Guests: 1</button>
                      </div>
                      <div className="w-1/3 pl-2">
                        <button className="w-full bg-emerald-100 text-emerald-900 rounded py-2">Check availability</button>
                      </div>
                    </div>
                    <button className="w-full border border-gray-200 rounded py-2">Send Inquiry</button>
                  </div>
                  <div className="text-xs text-gray-400 mt-4">Instant confirmation</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="font-semibold">Amenities</h4>
                <ul className="mt-2 text-sm text-gray-700">
                  {(((property as any).amenities) || ['WiFi','Kitchen','Washer']).slice(0,6).map((a: string) => (
                    <li key={a}>• {a}</li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>

        {/* Full-width Reviews section */}
        <div className="mt-10">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Guest Reviews (approved)</h3>
            {approvedReviews.length ? (
              <ReviewsGrid reviews={approvedReviews} />
            ) : (
              <p className="text-gray-600">No approved reviews for this property.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyPage;
