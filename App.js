import React, { useEffect, useState } from "react";
import { View, Text, Button, SafeAreaView } from "react-native";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import AuthScreen from "./AuthScreen";
import MapScreen from "./MapScreen";

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
    // If no user signed in, show AuthScreen
    return <AuthScreen />;
  }

  // If user signed in, show welcome and sign out button (you can replace with your app's main screen)
  return (
    <SafeAreaView style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text>Welcome, {user.email}</Text>
      <MapScreen />
      <Button title="Sign Out" onPress={logout} />
    </SafeAreaView>
  );
}
