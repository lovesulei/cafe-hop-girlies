import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image, ScrollView } from 'react-native';
import ReviewForm from './ReviewForm';
import CafeDetailsTabs from './CafeDetailsTab';
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, doc } from 'firebase/firestore';
import { firebaseApp } from './firebase';
import { GOOGLE_MAPS_API_KEY } from '@env';
import { auth } from './firebase';
import { globalStyles, colors } from './globalStyles';
import { Dimensions } from 'react-native';

const screenHeight = Dimensions.get('window').height;
const db = getFirestore(firebaseApp);

const foodKeywords = [
    'matcha', 'sandwich', 'tiramisu'
];

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

export default function CafeDetailsScreen({ route, currentUser }) {
    const { cafe } = route.params;
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [googleReviews, setGoogleReviews] = useState([]);
    const [loadingGoogleReviews, setLoadingGoogleReviews] = useState(true);
    const [googleAvgRating, setGoogleAvgRating] = useState(null);
    const [googleTotalRatings, setGoogleTotalRatings] = useState(0);
    const [friendIds, setFriendIds] = useState([]);

    const photoUrl = cafe.photos?.[0]?.photo_reference
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${cafe.photos[0].photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
        : null;

    useEffect(() => {
        if (!currentUser?.uid) return;
        const userDocRef = doc(db, 'users', currentUser.uid);
        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setFriendIds(data.friends || []);
            } else {
                setFriendIds([]);
            }
        });
        return unsubscribe;
    }, [currentUser?.uid]);

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

    const menuKeywords = extractMenuKeywords(googleReviews);

    const handleReviewSubmit = async (review) => {
        try {
            await addDoc(collection(db, 'cafes', cafe.place_id, 'reviews'), {
                ...review,
                createdAt: new Date(),
                username: currentUser.name || currentUser.email || 'Anonymous',
                userId: currentUser.uid,
            });
        } catch (e) {
            alert('Failed to submit review: ' + e.message);
        }
    };

    const yourAvgRating =
        reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
            : null;

    const friendAndMyReviews = reviews.filter(
        r => r.userId === currentUser.uid || friendIds.includes(r.userId)
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>

            <View
  contentContainerStyle={{ flexGrow: 1 }}
  style={{ flex: 1, margin: 0, padding: 0 , backgroundColor: colors.rosyPink }}
>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15, height: screenHeight * 0.3, padding: 10 }}>
                    <View style={{ flex: 1 }}>
                        <Text style={globalStyles.title}>{cafe.name}</Text>
                        <Text style={globalStyles.address}>{cafe.vicinity || cafe.formatted_address || ''}</Text>


                    </View>

                    {photoUrl && (
                        <Image
                            source={{ uri: photoUrl }}
                            style={[globalStyles.cafeImage, { width: 150, height: 150, marginLeft: 15, borderRadius: 10 }]}
                            resizeMode="cover"
                        />
                    )}
                </View>
                <CafeDetailsTabs
  reviews={reviews}
  loadingReviews={loadingReviews}
  friendAndMyReviews={friendAndMyReviews}
  loadingGoogleReviews={loadingGoogleReviews}
  menuKeywords={menuKeywords}
  cafe={cafe}
  handleReviewSubmit={handleReviewSubmit}
  googleAvgRating={googleAvgRating}
  googleTotalRatings={googleTotalRatings}
  yourAvgRating={yourAvgRating}

/>
            </View>
        </View>
    );
}
