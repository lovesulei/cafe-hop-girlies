import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image } from 'react-native';
import ReviewForm from './ReviewForm';
import { getFirestore, collection, doc, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { firebaseApp } from './firebase';
import { GOOGLE_MAPS_API_KEY } from '@env';

const db = getFirestore(firebaseApp);

export default function CafeDetailsScreen({ route }) {
    const { cafe } = route.params;
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const photoUrl = cafe.photos?.[0]?.photo_reference
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${cafe.photos[0].photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
        : null;

    useEffect(() => {
        let timeoutId;
        let unsubscribed = false;

        const q = query(
            collection(db, 'cafes', cafe.place_id, 'reviews'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            if (unsubscribed) return;
            clearTimeout(timeoutId);

            const revs = [];
            querySnapshot.forEach(doc => {
                revs.push({ id: doc.id, ...doc.data() });
            });
            setReviews(revs);
            setLoading(false);
        });

        timeoutId = setTimeout(() => {
            if (!unsubscribed) {
                setLoading(false);
            }
        }, 5000);

        return () => {
            unsubscribed = true;
            clearTimeout(timeoutId);
            unsubscribe();
        };
    }, [cafe.place_id]);

    const handleReviewSubmit = async (review) => {
        try {
            const reviewsRef = collection(db, 'cafes', cafe.place_id, 'reviews');
            await addDoc(reviewsRef, {
                ...review,
                createdAt: new Date(),
            });
        } catch (e) {
            alert('Failed to submit review: ' + e.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{cafe.name}</Text>
            <Text style={styles.address}>{cafe.vicinity || cafe.formatted_address || ''}</Text>

            {photoUrl && (
                <Image source={{ uri: photoUrl }} style={styles.cafeImage} resizeMode="cover" />
            )}

            <Text style={styles.sectionTitle}>Reviews</Text>
            {loading ? (
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
                            <Text style={styles.reviewDate}>
                                {item.createdAt?.toDate?.().toLocaleString() || item.createdAt}
                            </Text>
                        </View>
                    )}
                />
            )}

            <ReviewForm cafeId={cafe.place_id} onSubmit={handleReviewSubmit} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 15 },
    title: { fontSize: 24, fontWeight: 'bold' },
    address: { marginBottom: 15 },
    cafeImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 15 },
    sectionTitle: { fontSize: 18, marginVertical: 10, fontWeight: '600' },
    review: { marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
    reviewRating: { fontWeight: 'bold' },
    reviewDate: { fontSize: 10, color: 'gray', marginTop: 4 },
});
