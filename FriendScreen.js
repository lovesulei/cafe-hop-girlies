import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, TextInput, SectionList, StyleSheet, TouchableOpacity
} from 'react-native';
import {
  getFirestore, doc, getDoc, updateDoc, collection, getDocs, query, where
} from 'firebase/firestore';
import { auth } from './firebase';
import { globalStyles, colors } from './globalStyles';

const db = getFirestore();

export default function FriendsScreen() {
  const currentUser = auth.currentUser;
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friendData, setFriendData] = useState({ friends: [], friendRequests: [], sentRequests: [] });
  const [friendRequestsWithNames, setFriendRequestsWithNames] = useState([]);
  const [friendsWithNames, setFriendsWithNames] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [searchDone, setSearchDone] = useState(false);

  const fetchUserData = async () => {
    const docRef = doc(db, 'users', currentUser.uid);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      setFriendData(data);
      fetchUsersByIds(data.friendRequests || [], setFriendRequestsWithNames);
      fetchUsersByIds(data.friends || [], setFriendsWithNames);
    }
  };

  const fetchUsersByIds = async (ids, setStateFn) => {
    if (ids.length === 0) return setStateFn([]);
    const users = await Promise.all(ids.map(async id => {
      const snap = await getDoc(doc(db, 'users', id));
      return snap.exists() ? { id, ...snap.data() } : null;
    }));
    setStateFn(users.filter(Boolean));
  };

  const searchUsers = async () => {
    if (!searchText) return;
    const q = query(collection(db, 'users'), where('email', '==', searchText));
    const results = await getDocs(q);
    const users = [];
    results.forEach(docSnap => {
      if (docSnap.id !== currentUser.uid) users.push({ id: docSnap.id, ...docSnap.data() });
    });
    setSearchResults(users);
    setSearchDone(true);
  };

  const updateFriendDocs = async (targetId, updater) => {
    const ref = doc(db, 'users', targetId);
    const snap = await getDoc(ref);
    const data = snap.data();
    await updateDoc(ref, updater(data));
  };

  const sendFriendRequest = async (targetUserId) => {
    await updateDoc(doc(db, 'users', currentUser.uid), {
      sentRequests: [...(friendData.sentRequests || []), targetUserId],
    });
    await updateFriendDocs(targetUserId, data => ({
      friendRequests: [...(data.friendRequests || []), currentUser.uid],
    }));
    setRefresh(!refresh);
  };

  const acceptFriendRequest = async (fromUserId) => {
    await updateFriendDocs(currentUser.uid, data => ({
      friendRequests: data.friendRequests.filter(id => id !== fromUserId),
      friends: [...(data.friends || []), fromUserId],
    }));
    await updateFriendDocs(fromUserId, data => ({
      sentRequests: data.sentRequests.filter(id => id !== currentUser.uid),
      friends: [...(data.friends || []), currentUser.uid],
    }));
    setRefresh(!refresh);
  };

  const declineFriendRequest = async (fromUserId) => {
    await updateFriendDocs(currentUser.uid, data => ({
      friendRequests: data.friendRequests.filter(id => id !== fromUserId),
    }));
    setRefresh(!refresh);
  };

  const removeFriend = async (friendId) => {
    await updateFriendDocs(currentUser.uid, data => ({
      friends: data.friends.filter(id => id !== friendId),
    }));
    await updateFriendDocs(friendId, data => ({
      friends: data.friends.filter(id => id !== currentUser.uid),
    }));
    setRefresh(!refresh);
  };

  const getProfileImage = (filename) => {
  switch (filename) {
    case 'profile_blue.png':
      return require('./assets/profile_blue.png');
    case 'profile_green.png':
      return require('./assets/profile_green.png');
    case 'profile_orange.png':
      return require('./assets/profile_orange.png');
    case 'profile_purple.png':
      return require('./assets/profile_purple.png');
    default:
      return require('./assets/profile_blue.png'); // fallback image
  }
};

  useEffect(() => {
    fetchUserData();
  }, [refresh]);

  const renderUserRow = (item, actions) => (
  <View style={styles.userBox}>
    <Image
      source={getProfileImage(item.profilePic)}
      style={styles.profilePic}
    />
    <Text style={[globalStyles.text, styles.userName]}>
      {item.name || item.email}
    </Text>
    <View style={styles.actions}>{actions}</View>
  </View>
);


  const CuteButton = ({ title, onPress, disabled }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: disabled ? '#ccc' : colors.earthyGreen,
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 20,
        alignSelf: 'center',
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <Text style={{
        color: '#fff',
        fontFamily: 'Pixelify',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
      }}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const sections = [];

  // 1. Search Results - always comes first if search was done
if (searchDone && searchResults.length > 0) {
  sections.push({
    data: searchResults,
    renderItem: ({ item }) => {
      const isFriend = friendData.friends?.includes(item.id);
      const isPending = friendData.sentRequests?.includes(item.id);
      return renderUserRow(item, isFriend
        ? <Text style={styles.statusText}>✓ Friends</Text>
        : isPending
          ? <CuteButton title="Pending" disabled />
          : <CuteButton title="Add" onPress={() => sendFriendRequest(item.id)} />
      );
    }
  });
}

  // 2. Friend Requests - optional (toggled)
  if (showRequests) {
    sections.push({
      data: friendRequestsWithNames,
      renderItem: ({ item }) =>
        renderUserRow(item, (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <CuteButton title="Accept" onPress={() => acceptFriendRequest(item.id)} />
            <CuteButton title="Decline" onPress={() => declineFriendRequest(item.id)} />
          </View>
        ))
    });
  }

  // 3. Your Friends - always visible
  sections.push({
    title: 'Your Friends',
    data: friendsWithNames,
    renderItem: ({ item }) =>
      renderUserRow(item, <CuteButton title="Remove" onPress={() => removeFriend(item.id)} />)
  });

  return (
  <View style={globalStyles.container}>
    <Text style={globalStyles.subtitle}>Find Friends</Text>
    <TextInput
      placeholder="Enter Email"
      value={searchText}
      onChangeText={setSearchText}
      autoCapitalize='none'
      style={globalStyles.input}
    />
    <CuteButton title="Search" onPress={searchUsers} />
      <View style={styles.underline} />

    {/* 🟣 Search Results Section */}
  <View style={{ marginTop: 20, paddingHorizontal: 10 }}>
  {searchDone && searchResults.length > 0 && (
    <>
      <Text style={globalStyles.subtitle}>Search Results</Text>
    </>
  )}
      {searchDone && searchResults.length === 0 && (
  <View style={{ alignItems: 'center', marginTop: 20 }}>
    <Text style={globalStyles.text}>No users found.</Text>

  </View>
)}
      {searchResults.map((item) => {
        const isFriend = friendData.friends?.includes(item.id);
        const isPending = friendData.sentRequests?.includes(item.id);
        return (
         <View key={item.id} style={styles.userBox}>
  <Image
    source={getProfileImage(item.profilePic)}
    style={styles.profilePic}
  />

  <Text style={[globalStyles.text, styles.userName]}>
    {item.name || item.email}
  </Text>

  <View style={styles.actions}>
    {isFriend ? (
      <Text style={styles.statusText}>✓ Friends</Text>
    ) : isPending ? (
      <CuteButton title="Pending" disabled />
    ) : (
      <CuteButton title="Add" onPress={() => sendFriendRequest(item.id)} />
    )}
  </View>
</View>
        );
      })}
    </View>

    {/* 🟠 Friend Requests Toggle */}
    <TouchableOpacity
      onPress={() => setShowRequests(!showRequests)}
      style={styles.dropdownHeader}
    >
      <Text style={globalStyles.subtitle}>Friend Requests</Text>
      <View style={styles.dropdownInfo}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{friendRequestsWithNames.length}</Text>
        </View>
        <Text style={styles.chevron}>{showRequests ? '▲' : '▼'}</Text>
      </View>
    </TouchableOpacity>

    {/* 🟢 Friends + Requests SectionList */}
    <SectionList
  sections={[
    ...(showRequests
      ? [{
          data: friendRequestsWithNames,
          renderItem: ({ item }) =>
            renderUserRow(item, (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <CuteButton title="Accept" onPress={() => acceptFriendRequest(item.id)} />
                <CuteButton title="Decline" onPress={() => declineFriendRequest(item.id)} />
              </View>
            ))
        }]
      : []),
    {
      title: 'Your Friends',
      data: friendsWithNames.length > 0 ? friendsWithNames : [{ id: 'placeholder', placeholder: true }],
      renderItem: ({ item }) => {
        if (item.placeholder) {
          return <Text style={[globalStyles.text, { fontStyle: 'italic', textAlign: 'center', marginTop: 10 }]}>You don’t have any friends yet 🥲</Text>;
        }
        return renderUserRow(item, <CuteButton title="Remove" onPress={() => removeFriend(item.id)} />);
      }
    }
  ]}
  keyExtractor={(item) => item.id}
  renderItem={({ section, item }) => section.renderItem({ item })}
  renderSectionHeader={({ section: { title } }) =>
    title ? <Text style={globalStyles.subtitle}>{title}</Text> : null
  }
  contentContainerStyle={{ paddingBottom: 40 }}
/>
  </View>
);

}

const styles = StyleSheet.create({
 userBox: {
  backgroundColor: colors.rosyPink,
  padding: 12,
  marginVertical: 6,
  borderRadius: 15,
  flexDirection: "row",
  alignItems: "center",
},
  actions: {
  alignItems: "flex-end",
  justifyContent: "center",
},
  statusText: {
    fontFamily: 'Pixelify',
    color: 'green',
    fontSize: 14,
    paddingVertical: 6,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  dropdownInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: colors.rosyPink,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Pixelify',
  },
  chevron: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
underline: {
  height: 1,
  backgroundColor: '#ccc', // light gray color
  marginTop: 4,
  marginBottom: 8,
  alignSelf: 'stretch',  // ensures full width inside flex container
},
profilePic: {
  width: 40,
  height: 40,
  borderRadius: 20,
  marginRight: 12,
},


userName: {
  flex: 1,
  fontFamily: 'Pixelify',
  fontSize: 16,
  color: colors.deepBrown,
},

});