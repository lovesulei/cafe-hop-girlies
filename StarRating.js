import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const StarRating = ({ rating, total = 5 }) => {
  const stars = [];

  for (let i = 1; i <= total; i++) {
    stars.push(
      <Image
        key={i}
        source={require('./assets/star.png')}
        style={[
          styles.star,
          { tintColor: i <= rating ? '#FFD700' : '#C0C0C0' } // gold or gray
        ]}
      />
    );
  }

  return <View style={styles.starContainer}>{stars}</View>;
};

const styles = StyleSheet.create({
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4
  },
  star: {
    width: 20,
    height: 20,
    marginHorizontal: 2,
    resizeMode: 'contain'
  }
});

export default StarRating;