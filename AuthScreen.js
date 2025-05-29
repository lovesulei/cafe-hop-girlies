import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { globalStyles, colors } from "./globalStyles";

// Firestore reference
const db = getFirestore();

// Example profile colors (ensure you have corresponding images like profile_red.png, etc.)
const profileColors = ["blue", "green", "yellow", "purple"];

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const signup = async () => {
    setErrorMsg("");

    if (!email || !password || !username) {
      setErrorMsg("Please fill out all fields.");
      return;
    }

    // Pick a random profile color
    const randomIndex = Math.floor(Math.random() * profileColors.length);
const randomColor = profileColors[randomIndex];
const profilePic = `profile_${randomColor}.png`;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        name: username,
        email,
        profilePic,
        friends: [],
        friendRequests: [],
        sentRequests: [],
        createdAt: new Date(),
      });

    } catch (error) {
      console.error("Sign up error:", error);
      setErrorMsg(error.message);
    }
  };

  const login = async () => {
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please enter your email and password.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // You can navigate to the main app screen here
    } catch (error) {
      console.error("Login error:", error);
      setErrorMsg(error.message);
    }
  };

  return (
    <SafeAreaView style={[globalStyles.container, styles.authContainer]}>
      <Image source={require("./assets/profile.png")} style={styles.logo} />

      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Text style={globalStyles.title}>Cafe Hop Girlies</Text>
      </View>

      {!isLogin && (
        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          style={[globalStyles.input, styles.input]}
          placeholderTextColor="#666"
        />
      )}

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={[globalStyles.input, styles.input]}
        placeholderTextColor="#666"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={[globalStyles.input, styles.input]}
        placeholderTextColor="#666"
      />

      {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            globalStyles.button,
            isLogin ? styles.loginButton : styles.signUpButton,
          ]}
          onPress={isLogin ? login : signup}
        >
          <Text style={globalStyles.buttonText}>
            {isLogin ? "Log In" : "Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.toggleText}>
          {isLogin
            ? "Don’t have an account? Sign Up"
            : "Have an account? Log In"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  authContainer: {
    justifyContent: "center",
    paddingHorizontal: 25,
    backgroundColor: colors.earthyGreen,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#fff",
    borderColor: colors.rosyPink,
    borderWidth: 2,
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  error: {
    color: "#FF4C4C",
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "bold",
    fontFamily: "Pixelify",
  },
  signUpButton: {
    backgroundColor: colors.rosyPink,
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: colors.rosyPink,
    marginBottom: 15,
  },
  buttonContainer: {
    alignItems: "center",
  },
  toggleText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: "Pixelify",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
