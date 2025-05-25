import React, { useEffect, useState } from "react";
import { View, Text, Button, SafeAreaView } from "react-native";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import AuthScreen from "./AuthScreen";
import MapScreen from "./MapScreen";
import CafeDetailsScreen from "./CafeDetailsScreen";
import 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
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
          options={{
            headerRight: () => (
              <Button title="Sign Out" onPress={logout} />
            ),
            title: `Welcome, ${user.email}`,
          }}
        />
        <Stack.Screen
          name="CafeDetails"
          component={CafeDetailsScreen}
          options={({ route }) => ({ title: route.params.cafe.name })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Wrap MapScreen to pass navigation props, if you want to customize further
function MapScreenWrapper(props) {
  return <MapScreen {...props} />;
}
