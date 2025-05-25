import React, { useEffect, useState } from "react";
import { View, Text, Button, SafeAreaView } from "react-native";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import AuthScreen from "./AuthScreen";
import MapScreen from "./MapScreen";
import FriendScreen from "./FriendScreen";
import CafeDetailsScreen from "./CafeDetailsScreen";
import 'react-native-gesture-handler';

import { signInWithEmailAndPassword } from "firebase/auth";
import { getDoc, doc, getFirestore } from "firebase/firestore";

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();
const db = getFirestore();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ uid: firebaseUser.uid, ...userDoc.data() });
          } else {
            setUser(null);
          }
        } catch (e) {
          console.error("Error fetching user profile:", e);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    setErrorMsg("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const userDoc = await getDoc(doc(db, "users", uid));
      if (!userDoc.exists()) {
        setErrorMsg("No user profile found in database.");
      }

      // You don’t need to call setUser here — it will automatically happen in App.js from onAuthStateChanged

    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  const logout = () => {
    signOut(auth).catch(console.error);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    // If no user signed in, show AuthScreen without navigation (or you can include inside navigation if you want)
    return <AuthScreen />;
  }

  // If user is signed in, show navigation stack
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Map">
        <Stack.Screen
          name="Map"
          component={MapScreenWrapper}
          options={({ navigation }) => ({
            headerRight: () => (
              <Button title="Sign Out" onPress={logout} />
            ),
            headerLeft: () => (
              <Button title="Friends" onPress={() => navigation.navigate("Friends")} />
            ),
            title: `Welcome, ${user?.name || "User"}`,
          })}
        />
        <Stack.Screen
          name="CafeDetails"
          component={CafeDetailsScreen}
          options={({ route }) => ({ title: route.params.cafe.name })}
        />
        <Stack.Screen
          name="Friends"
          component={FriendScreen}
          options={{ title: "Your Friends" }}
        />
      </Stack.Navigator>

    </NavigationContainer>
  );
}

// Wrap MapScreen to pass navigation props, if you want to customize further
function MapScreenWrapper(props) {
  return <MapScreen {...props} />;
}
