import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, ScrollView } from 'react-native';
import ReviewForm from './ReviewForm';
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { firebaseApp } from './firebase';
import { GOOGLE_MAPS_API_KEY } from '@env';

const db = getFirestore(firebaseApp);

// Define some food keywords to search for in Google reviews
const foodKeywords = [
  'matcha', 'latte', 'croissant', 'espresso', 'banana bread',
  'muffin', 'cappuccino', 'sandwich', 'mocha', 'cookie', 'tiramisu'
];

// Extract keywords from reviews text
function extractMenuKeywords(reviews) {
  const counts = {};
  reviews.forEach(({ text }) => {
    if (!text) return;
    const comment = text.toLowerCase();
    foodKeywords.forEach(keyword => {
      if (comment.includes(keyword)) {
        counts[keyword] = (counts[keyword] || 0) + 1;
      }
    });
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);
}

export default function CafeDetailsScreen({ route }) {
  const { cafe } = route.params;
  const [reviews, setReviews] = useState([]); // Your Firestore reviews
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [googleReviews, setGoogleReviews] = useState([]); // Google reviews for parsing menu keywords
  const [loadingGoogleReviews, setLoadingGoogleReviews] = useState(true);

  const photoUrl = cafe.photos?.[0]?.photo_reference
    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${cafe.photos[0].photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
    : null;

    const [googleAvgRating, setGoogleAvgRating] = useState(null);
const [googleTotalRatings, setGoogleTotalRatings] = useState(0);
  // Fetch your Firestore reviews
  useEffect(() => {
    const q = query(
      collection(db, 'cafes', cafe.place_id, 'reviews'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const revs = [];
      querySnapshot.forEach(doc => {
        revs.push({ id: doc.id, ...doc.data() });
      });
      setReviews(revs);
      setLoadingReviews(false);
    });

    return unsubscribe;
  }, [cafe.place_id]);

  // Fetch Google reviews once for parsing menu keywords
  useEffect(() => {
    async function fetchGoogleReviews() {
      setLoadingGoogleReviews(true);
      try {
        const res = await fetch(
  `https://maps.googleapis.com/maps/api/place/details/json?place_id=${cafe.place_id}&fields=reviews,rating,user_ratings_total&key=${GOOGLE_MAPS_API_KEY}`
);
        const data = await res.json();
        if (data.result?.reviews) {
          setGoogleReviews(data.result.reviews);

        } else {
          setGoogleReviews([]);
        }
        setGoogleAvgRating(data.result?.rating || null);
setGoogleTotalRatings(data.result?.user_ratings_total || 0);

      } catch (error) {
        console.error('Google reviews fetch error:', error);
        setGoogleReviews([]);
      } finally {
        setLoadingGoogleReviews(false);
      }
    }
    fetchGoogleReviews();
  }, [cafe.place_id]);

  // Extract menu keywords from Google reviews
  const menuKeywords = extractMenuKeywords(googleReviews);

  // Handle submitting your review (to Firestore)
  const handleReviewSubmit = async (review) => {
    try {
      await addDoc(collection(db, 'cafes', cafe.place_id, 'reviews'), {
        ...review,
        createdAt: new Date(),
      });
    } catch (e) {
      alert('Failed to submit review: ' + e.message);
    }
  };

  const yourAvgRating =
  reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{cafe.name}</Text>
      <Text style={styles.address}>{cafe.vicinity || cafe.formatted_address || ''}</Text>

      <View style={{ marginBottom: 10 }}>
  {googleAvgRating && (
    <Text style={styles.ratingText}>
      ⭐ Google: {googleAvgRating} ({googleTotalRatings} ratings)
    </Text>
  )}
  {yourAvgRating && (
    <Text style={styles.ratingText}>
      ⭐ Your Reviews: {yourAvgRating} ({reviews.length})
    </Text>
  )}
</View>

      {photoUrl && (
        <Image source={{ uri: photoUrl }} style={styles.cafeImage} resizeMode="cover" />
      )}

      <Text style={styles.sectionTitle}>Reviews</Text>
      {loadingReviews ? (
        <ActivityIndicator size="small" />
      ) : reviews.length === 0 ? (
        <Text>No reviews yet.</Text>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.review}>
              <Text style={styles.reviewRating}>⭐ {item.rating}</Text>
              <Text>{item.comment}</Text>
              <Text style={styles.reviewDate}>{item.createdAt?.toDate?.().toLocaleString() || item.createdAt}</Text>
            </View>
          )}
          scrollEnabled={false}
        />
      )}

      {/* Menu keyword cloud from Google reviews */}
      {!loadingGoogleReviews && menuKeywords.length > 0 && (
        <View style={styles.keywordCloud}>
          <Text style={{ fontWeight: '600', marginBottom: 6 }}>Popular menu mentions from Google reviews:</Text>
          <View style={styles.keywordList}>
            {menuKeywords.map(word => (
              <Text key={word} style={styles.keyword}>☕ {word}</Text>
            ))}
          </View>
        </View>
      )}

      {/* Your review form */}
      <ReviewForm cafeId={cafe.place_id} onSubmit={handleReviewSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold' },
  address: { marginBottom: 15, color: '#555' },
  cafeImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 15 },
  sectionTitle: { fontSize: 18, marginVertical: 10, fontWeight: '600' },
  review: { marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  reviewRating: { fontWeight: 'bold' },
  reviewDate: { fontSize: 10, color: 'gray', marginTop: 4 },

  keywordCloud: { marginVertical: 15 },
  keywordList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  keyword: {
    backgroundColor: '#eee',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    fontSize: 14,
  },
  ratingText: {
  fontSize: 14,
  color: '#333',
  marginTop: 2,
},
});
