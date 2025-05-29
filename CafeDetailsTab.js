import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Image,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReviewForm from './ReviewForm';
import StarRating from './StarRating';
import { globalStyles, colors } from './globalStyles';

const screenHeight = Dimensions.get('window').height;

export default function CafeDetailsTabs({
  reviews,
  loadingReviews,
  friendAndMyReviews,
  loadingGoogleReviews,
  menuKeywords,
  cafe,
  handleReviewSubmit,
  googleAvgRating,
  googleTotalRatings,
  yourAvgRating
}) {
  const [selectedTab, setSelectedTab] = useState('reviews');

 const tabIcons = {
  reviews: require('./assets/reviews.png'),
  menu: require('./assets/menu.png'),
  form: require('./assets/write_review.png'),
};

const renderTabs = () => (
  <View style={{ flexDirection: 'row', margin: 15 }}>
    {['reviews', 'menu', 'form'].map(tab => (
      <TouchableOpacity
        key={tab}
        onPress={() => setSelectedTab(tab)}
        style={{
          flex: 1,
          paddingVertical: 10,
          backgroundColor: selectedTab === tab ? colors.earthyGreen : '#fff',
          borderColor: selectedTab === tab ? '#fff' : colors.earthyGreen,
          borderWidth: 2,
          borderRadius: 15,
          marginHorizontal: 5,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <Image
            source={tabIcons[tab]}
            style={{ width: 30, height: 30, marginBottom: 5 }}
            resizeMode="contain"
          />
          <Text style={{
            textAlign: 'center',
            color: selectedTab === tab ? '#fff' : '#333',
            fontWeight: '800',
            fontFamily: 'Pixelify',
            fontSize: 16,
          }}>
            {tab === 'reviews' ? 'Reviews' : tab === 'menu' ? 'Popular Menu' : 'Write a Review'}
          </Text>
        </View>
      </TouchableOpacity>
    ))}
  </View>
);

  const foodImages = {
    matcha: require('./assets/matcha.png'),
    sandwich: require('./assets/sandwich.png'),
    tiramisu: require('./assets/tiramisu.png'),
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'reviews':
        return (
          <View style={{ flex: 1, padding: 15 }}>
            <View style={{ marginBottom: 10 }}>
              {googleAvgRating && (
                <View style={styles.inlineRow}>
                  <Text style={globalStyles.ratingText}>
                    Google: {googleAvgRating}
                  </Text>
                  <StarRating rating={Math.round(googleAvgRating)} style={{ marginLeft: 6 }} />
                  <Text style={globalStyles.ratingText}>({googleTotalRatings})</Text>
                </View>
              )}
              {yourAvgRating && (
                <View style={styles.inlineRow}>
                  <Text style={globalStyles.ratingText}>
                    Your Reviews: {yourAvgRating}
                  </Text>
                  <StarRating rating={Math.round(yourAvgRating)} style={{ marginLeft: 6 }} />
                  <Text style={globalStyles.ratingText}>({friendAndMyReviews.length})</Text>

                </View>
              )}
            </View>

            {loadingReviews ? (
              <ActivityIndicator size="small" />
            ) : reviews.length === 0 ? (
              <Text style={globalStyles.text}>No reviews from your friends yet.</Text>
            ) : (
              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
  {friendAndMyReviews.map(item => (
    <View
      key={item.id}
      style={{
        backgroundColor: colors.rosyPink,
        padding: 12,
        marginBottom: 12,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <Text style={globalStyles.reviewUsername}>{item.username}</Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <StarRating rating={Math.round(item.rating)} />

        <Text style={[globalStyles.reviewRating, { marginLeft: 6 }]}>

          {item.rating.toFixed(1)}
        </Text>

      </View>

      <Text style={globalStyles.subtitle}>{item.comment}</Text>
      <Text style={globalStyles.reviewDate}>
        {item.createdAt?.toDate?.().toLocaleString() || item.createdAt}
      </Text>
    </View>

  ))}
</ScrollView>

            )}
          </View>
        );

      case 'menu':
        return (
          <View style={{ padding: 10 }}>
            {loadingGoogleReviews ? (
              <ActivityIndicator size="small" />
            ) : menuKeywords.length === 0 ? (
              <Text style={globalStyles.text}>No popular items mentioned yet.</Text>
            ) : (
              <View>
                {menuKeywords.map(word => (
                  <View
                    key={word}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: colors.rosyPink,
                      borderRadius: 15,
                      padding: 10,
                      marginBottom: 10,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                      elevation: 2,
                    }}
                  >
                    <Image
                      source={foodImages[word.toLowerCase()]}
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 10,
                        marginRight: 15,
                      }}
                      resizeMode="cover"
                    />
                    <Text
                      style={{
                        fontFamily: 'Pixelify',
                        fontSize: 16,
                        color: '#333',
                        textAlignVertical: 'center',
                      }}
                    >
                      {word.charAt(0).toUpperCase() + word.slice(1)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        );

      case 'form':
        return (
          <View style={{ padding: 10 }}>
            <ReviewForm cafeId={cafe.place_id} onSubmit={handleReviewSubmit} />
          </View>
        );
    }
  };

  return (
    <View style={{
      backgroundColor: 'rgb(255, 255, 255)',
      padding: 0,
      margin: 0,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      height: screenHeight * 0.59
    }}>
      {renderTabs()}
      {renderTabContent()}
    </View>
  );
}

const styles = {
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
};
