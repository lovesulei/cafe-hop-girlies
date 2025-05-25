import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';

export default function ReviewForm({ cafeId, onSubmit }) {
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    const r = Number(rating);
    if (!r || r < 1 || r > 5 || !comment.trim()) {
      Alert.alert('Invalid input', 'Please enter a rating from 1 to 5 and a comment.');
      return;
    }
    onSubmit({ rating: r, comment: comment.trim(), createdAt: new Date() });
    setRating('');
    setComment('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Your Rating (1-5):</Text>
      <TextInput
        keyboardType="numeric"
        maxLength={1}
        style={styles.input}
        value={rating}
        onChangeText={setRating}
        placeholder="Rating"
      />
      <Text style={styles.label}>Your Review:</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        multiline
        value={comment}
        onChangeText={setComment}
        placeholder="Write your review here"
      />
      <Button title="Submit Review" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20, marginBottom: 40 },
  label: { marginBottom: 5, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 10,
    borderRadius: 4,
  },
});
