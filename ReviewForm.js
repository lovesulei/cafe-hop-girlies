import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import { globalStyles, colors } from './globalStyles';
import { TouchableOpacity } from 'react-native';

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
        <View style={globalStyles.reviewFormContainer}>
            <Text style={globalStyles.reviewFormLabel}>Your Rating (1–5):</Text>
            <TextInput
                keyboardType="numeric"
                maxLength={1}
                style={globalStyles.reviewFormInput}
                value={rating}
                onChangeText={setRating}
                placeholder="Rating"
            />
            <Text style={globalStyles.reviewFormLabel}>Your Review:</Text>
            <TextInput
                style={[globalStyles.reviewFormInput, { height: 80 }]}
                multiline
                value={comment}
                onChangeText={setComment}
                placeholder="Write your review here"
            />
            <TouchableOpacity style={globalStyles.pinkButton} onPress={handleSubmit}>
                <Text style={globalStyles.pinkButtonText}>Submit Review</Text>
            </TouchableOpacity>
        </View>
    );
}
