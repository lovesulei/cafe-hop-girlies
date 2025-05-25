import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { getFirestore, doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth } from './firebase';

const db = getFirestore();

export default function FriendsScreen() {
  const currentUser = auth.currentUser;
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friendData, setFriendData] = useState({ friends: [], friendRequests: [], sentRequests: [] });

  // New states to store detailed user info
  const [friendRequestsWithNames, setFriendRequestsWithNames] = useState([]);
  const [friendsWithNames, setFriendsWithNames] = useState([]);

  const [refresh, setRefresh] = useState(false);

  const fetchUserData = async () => {
    const docRef = doc(db, 'users', currentUser.uid);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      setFriendData(data);

      // Fetch full user data for friend requests and friends
      fetchUsersByIds(data.friendRequests || [], setFriendRequestsWithNames);
      fetchUsersByIds(data.friends || [], setFriendsWithNames);
    }
  };

  // Helper: fetch user info by array of IDs
  const fetchUsersByIds = async (ids, setStateFn) => {
    if (ids.length === 0) {
      setStateFn([]);
      return;
    }
    const usersPromises = ids.map(async (id) => {
      const userSnap = await getDoc(doc(db, 'users', id));
      if (userSnap.exists()) {
        return { id, ...userSnap.data() };
      }
      return null;
    });
    const users = await Promise.all(usersPromises);
    setStateFn(users.filter(Boolean));
  };

  const searchUsers = async () => {
    if (!searchText) return;
    const q = query(collection(db, 'users'), where('email', '==', searchText));
    const results = await getDocs(q);
    const users = [];
    results.forEach(docSnap => {
      if (docSnap.id !== currentUser.uid) {
        users.push({ id: docSnap.id, ...docSnap.data() });
      }
    });
    setSearchResults(users);
  };

  const sendFriendRequest = async (targetUserId) => {
    const currentRef = doc(db, 'users', currentUser.uid);
    const targetRef = doc(db, 'users', targetUserId);

    await updateDoc(currentRef, {
      sentRequests: [...(friendData.sentRequests || []), targetUserId],
    });

    const targetSnap = await getDoc(targetRef);
    const targetData = targetSnap.data();
    await updateDoc(targetRef, {
      friendRequests: [...(targetData.friendRequests || []), currentUser.uid],
    });

    setRefresh(!refresh);
  };

  const acceptFriendRequest = async (fromUserId) => {
    const currentRef = doc(db, 'users', currentUser.uid);
    const fromRef = doc(db, 'users', fromUserId);

    const currentSnap = await getDoc(currentRef);
    const current = currentSnap.data();
    const updatedRequests = (current.friendRequests || []).filter(id => id !== fromUserId);
    const updatedFriends = [...(current.friends || []), fromUserId];

    await updateDoc(currentRef, {
      friendRequests: updatedRequests,
      friends: updatedFriends,
    });

    const fromSnap = await getDoc(fromRef);
    const from = fromSnap.data();
    const fromSentRequests = (from.sentRequests || []).filter(id => id !== currentUser.uid);
    const fromFriends = [...(from.friends || []), currentUser.uid];

    await updateDoc(fromRef, {
      sentRequests: fromSentRequests,
      friends: fromFriends,
    });

    setRefresh(!refresh);
  };

  const declineFriendRequest = async (fromUserId) => {
    const currentRef = doc(db, 'users', currentUser.uid);
    const currentSnap = await getDoc(currentRef);
    const updated = (currentSnap.data().friendRequests || []).filter(id => id !== fromUserId);
    await updateDoc(currentRef, { friendRequests: updated });
    setRefresh(!refresh);
  };

  const removeFriend = async (friendId) => {
    const currentRef = doc(db, 'users', currentUser.uid);
    const friendRef = doc(db, 'users', friendId);

    const currentSnap = await getDoc(currentRef);
    const updatedFriends = (currentSnap.data().friends || []).filter(id => id !== friendId);
    await updateDoc(currentRef, { friends: updatedFriends });

    const friendSnap = await getDoc(friendRef);
    const updatedFriendFriends = (friendSnap.data().friends || []).filter(id => id !== currentUser.uid);
    await updateDoc(friendRef, { friends: updatedFriendFriends });

    setRefresh(!refresh);
  };

  useEffect(() => {
    fetchUserData();
  }, [refresh]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find Friends</Text>
      <TextInput
        placeholder="Enter email"
        value={searchText}
        onChangeText={setSearchText}
        style={styles.input}
      />
      <Button title="Search" onPress={searchUsers} />

      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isFriend = friendData.friends?.includes(item.id);
          const isPending = friendData.sentRequests?.includes(item.id);

          return (
            <View style={styles.userRow}>
              <Text>{item.name || item.email}</Text>
              {isFriend ? (
                <Text style={{ color: 'green' }}>Friends</Text>
              ) : isPending ? (
                <Button title="Pending" disabled />
              ) : (
                <Button title="Add Friend" onPress={() => sendFriendRequest(item.id)} />
              )}
            </View>
          );
        }}
      />

      <Text style={styles.sectionTitle}>Friend Requests</Text>
      <FlatList
        data={friendRequestsWithNames}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userRow}>
            <Text>{item.name || item.email}</Text>
            <Button title="Accept" onPress={() => acceptFriendRequest(item.id)} />
            <Button title="Decline" onPress={() => declineFriendRequest(item.id)} />
          </View>
        )}
      />

      <Text style={styles.sectionTitle}>Your Friends</Text>
      <FlatList
        data={friendsWithNames}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userRow}>
            <Text>{item.name || item.email}</Text>
            <Button title="Remove" onPress={() => removeFriend(item.id)} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  sectionTitle: { marginTop: 20, fontSize: 18, fontWeight: '600' },
  input: { borderWidth: 1, padding: 8, marginVertical: 10 },
  userRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 6 },
});
