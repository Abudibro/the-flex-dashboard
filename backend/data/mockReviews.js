

// Property IDs from db.json for 13 properties
const propertyIds = [
  40161, 40162, 40163, 40164, 40165, 40166, 40167, 40168, 40169, 40170, 40171, 40172, 40173
];
const reviews = [];
for (let i = 0; i < 13; i++) {
  for (let j = 0; j < 100; j++) {
    const cleanliness = 6 + (j % 5); // 6-10
    const communication = 5 + (i % 6); // 5-10
    const location = 5 + (j % 6); // 5-10
    // Average rating (rounded to exactly 2dp)
    const avg = Number(((cleanliness + communication + location) / 3).toFixed(2));
    reviews.push({
      id: 10000 + i * 100 + j,
      listingId: propertyIds[i],
      type: j % 2 === 0 ? "guest-to-host" : "host-to-guest",
      status: "published",
      rating: avg,
      publicReview: `Review ${j + 1} for Property ${i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
      reviewCategory: [
        { category: "cleanliness", rating: cleanliness },
        { category: "communication", rating: communication },
        { category: "location", rating: location }
      ],
      submittedAt: `2024-${String((j % 12) + 1).padStart(2, '0')}-${String((j % 28) + 1).padStart(2, '0')} 12:00:00`,
      guestName: `Guest ${j + 1} of Property ${i + 1}`,
      listingName: `Property ${i + 1} - Test Address ${i + 1}`,
      channel: j % 3 === 0 ? "airbnb" : (j % 3 === 1 ? "booking.com" : "vrbo"),
      visibility: j % 3 === 0 ? "approved" : (j % 3 === 1 ? "pending" : "hidden")
    });
  }
}

export default {
  status: "success",
  result: reviews
};
