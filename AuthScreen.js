import React, { useState } from "react";
import { View, TextInput, Button, Text, SafeAreaView } from "react-native";
import { auth } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const db = getFirestore();

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // NEW
  const [errorMsg, setErrorMsg] = useState("");

 const signup = async () => {
  setErrorMsg("");
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Create Firestore user document
    await setDoc(doc(db, "users", uid), {
      name: username,             // set from username input
      email,
      friends: [],
      friendRequests: [],
      sentRequests: [],
      createdAt: new Date()
    });

    alert("Sign up successful!");
  } catch (error) {
    setErrorMsg(error.message);
  }
};


  const login = () => {
    setErrorMsg("");
    signInWithEmailAndPassword(auth, email, password)
      .catch((error) => {
        setErrorMsg(error.message);
      });
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <View>
        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          style={{ marginBottom: 10, borderWidth: 1, padding: 8 }}
        />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={{ marginBottom: 10, borderWidth: 1, padding: 8 }}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{ marginBottom: 10, borderWidth: 1, padding: 8 }}
        />
        {errorMsg ? <Text style={{ color: "red", marginBottom: 10 }}>{errorMsg}</Text> : null}
        <Button title="Sign Up" onPress={signup} />
        <View style={{ height: 10 }} />
        <Button title="Log In" onPress={login} />
      </View>
    </SafeAreaView>
  );
}
