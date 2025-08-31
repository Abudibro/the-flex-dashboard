export default [
  ...[...Array(13)].map((_, i) => ({
    id: 40161 + i,
    name: `Property ${i + 1} - Test Address ${i + 1}`,
    externalListingName: `Property ${i + 1} - Test Address ${i + 1}`,
    city: "London",
    country: "UK",
    listingImages: [
      ...[...Array(5)].map((_, j) => ({
        id: i * 5 + j + 1,
        caption: `Image ${j + 1} for Property ${i + 1}`,
        url: `https://picsum.photos/seed/${i + 1}-${j + 1}/400/300`,
        sortOrder: j + 1
      }))
    ],
    address: `Test Address ${i + 1}, London`,
    latitude: 51.5 + (i * 0.01),
    longitude: -0.1 + (i * 0.01)
  }))
];
