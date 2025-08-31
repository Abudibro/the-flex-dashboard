export const mockListings = [
  {
    id: 40161,
    name: "2B N1 A - 29 Shoreditch Heights",
    externalListingName: "2B N1 A - 29 Shoreditch Heights",
    city: "London",
    country: "UK",
  listingImages: [
      {
        id: 1,
        caption: "Living room",
        url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/23248-212689-2MqEy4KKPrR9oWsrOrvoRxw6ROSyC6EMHrIM4GlfKlI-665073758447d",
        sortOrder: 1
      }
    ]
  ,
  address: 'Shoreditch Heights, London',
  latitude: 51.5265,
  longitude: -0.0787
  },
  {
    id: 40162,
    name: "3B N2 B - 45 Brick Lane",
    externalListingName: "3B N2 B - 45 Brick Lane",
    city: "London",
    country: "UK",
  listingImages: [
      {
        id: 2,
        caption: "Bedroom",
        url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        sortOrder: 1
      }
    ]
  ,
  address: 'Brick Lane, London',
  latitude: 51.5245,
  longitude: -0.0717
  },
  {
    id: 40163,
    name: "1B N3 C - 12 Spitalfields",
    externalListingName: "1B N3 C - 12 Spitalfields",
    city: "London",
    country: "UK",
  listingImages: [
      {
        id: 3,
        caption: "Exterior",
        url: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=60",
        sortOrder: 1
      }
    ]
  ,
  address: 'Spitalfields, London',
  latitude: 51.5194,
  longitude: -0.0754
  }
];

export const getMainImageByName = () => {
  const map = {};
  mockListings.forEach(listing => {
    const sorted = (listing.listingImages || []).slice().sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    const main = sorted[0]?.url || null;
    if (listing.name) map[listing.name] = main;
    if (listing.externalListingName) map[listing.externalListingName] = main;
  });
  return map;
};
