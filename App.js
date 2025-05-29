import React, { useEffect, useState } from "react";
import { View, Text, Image, SafeAreaView, TouchableOpacity } from "react-native";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import AuthScreen from "./AuthScreen";
import MapScreen from "./MapScreen";
import FriendScreen from "./FriendScreen";
import CafeDetailsScreen from "./CafeDetailsScreen";
import 'react-native-gesture-handler';
import { globalStyles, colors } from './globalStyles';

import { getDoc, doc, getFirestore } from "firebase/firestore";

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import * as Font from 'expo-font';
import { useFonts } from 'expo-font';

const Stack = createNativeStackNavigator();
const db = getFirestore();



export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fontsLoaded] = useFonts({
    Pixelify: require('./assets/fonts/pixelify.ttf'),
  });
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

  const logout = () => {
    signOut(auth).catch(console.error);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={globalStyles.title}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Map"
        screenOptions={{
          headerTitleStyle: {
            fontFamily: 'Pixelify',
            fontSize: 22,
            color: colors.rosyPink,
          },
          headerTintColor: colors.clayRed,
          headerStyle: {
            backgroundColor: colors.earthyGreen,
          },
        }}
      >
        <Stack.Screen
  name="Map"
  component={MapScreenWrapper}
  options={({ navigation }) => ({
    title: `Hi, ${user?.name || "User"}`,
    headerLeft: () => (
      <TouchableOpacity onPress={logout} style={{ marginRight: 50 }}>
        <Image
          source={require('./assets/sign_out.png')}
          style={{ width: 25, height: 25 }}
          resizeMode="contain"
        />
      </TouchableOpacity>
    ),
    headerRight: () => (
      <TouchableOpacity onPress={() => navigation.navigate("Friends")} style={{ marginLeft: 50 }}>
        <Image
          source={require('./assets/profile.png')}
          style={{ width: 30, height: 30 }}
          resizeMode="contain"
        />
      </TouchableOpacity>
    ),
  })}
/>

        <Stack.Screen
          name="CafeDetails"
          options={({ route }) => ({
            title: route.params.cafe.name,
          })}
        >
          {(props) => <CafeDetailsScreen {...props} currentUser={user} />}
        </Stack.Screen>

        <Stack.Screen
          name="Friends"
          component={FriendScreen}
          options={{ title: "Your Friends" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function MapScreenWrapper(props) {
  return <MapScreen {...props} />;
}
