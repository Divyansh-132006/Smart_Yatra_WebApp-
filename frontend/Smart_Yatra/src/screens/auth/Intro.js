import { Text, View, StatusBar, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import LottieView from "lottie-react-native";
import AppIntroSlider from "react-native-app-intro-slider";
import { Ionicons } from "@expo/vector-icons";

const Intro = ({ navigation }) => {
  // --- Font Loading ---
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require("../../../assets/fonts/Poppins-Bold.ttf"),
    'Lato-Regular': require("../../../assets/fonts/Lato-Regular.ttf"),
    'Lato-Bold': require("../../../assets/fonts/Lato-Bold.ttf"),
  });

  // Array of intro slides
  const slides = [
    {
      key: "1",
      title: "Welcome to SmartYatra",
      tagline: "Your trusted companion for every journey.",
      bodyText:
        "Travel with confidence knowing that your safety is our priority. Explore new destinations with peace of mind.",
      animation: require("../../../assets/animation/Traveler.json"),
      backgroundColor: "white",
    },
    {
      key: "2",
      title: "Stay Aware, Stay Safe",
      bodyText:
        "Receive AI-driven real-time safety monitoring and get instant geo-fencing alerts if you approach dangerous or restricted zones.",
      animation: require("../../../assets/animation/map navigation.json"),
      backgroundColor: "#febe29",
    },
    {
      key: "3",
      title: "Help is Just a Tap Away",
      bodyText:
        "In an emergency, use the one-tap SOS to instantly connect with the nearest police, hospitals, and tourism authorities.",
      animation: require("../../../assets/animation/Sos Notification.json"),
      backgroundColor: "#22bcb5",
    },
    {
      key: "4",
      title: "Your Secure Digital Travel ID",
      bodyText:
        "Create a secure, tamper-proof digital identity using our blockchain technology for frictionless and private check-ins.",
      animation: require("../../../assets/animation/Login Leady.json"),
      backgroundColor: "#3395ff",
    },
  ];

  const handleDone = () => {
    navigation.replace("UserTypeSelection");
  };

  // --- Button and Slide Rendering Functions ---
  const _renderNextButton = () => (
    <View style={styles.buttonCircle}>
      <Ionicons
        name="arrow-forward-outline"
        color="rgba(255, 255, 255, .9)"
        size={24}
      />
    </View>
  );

  const _renderDoneButton = () => (
    <View style={styles.buttonCircle}>
      <Ionicons
        name="checkmark-outline"
        color="rgba(255, 255, 255, .9)"
        size={24}
      />
    </View>
  );

  const _renderSkipButton = () => (
    <View style={styles.skipButton}>
      <Text style={styles.skipButtonText}>Skip</Text>
    </View>
  );

  const _renderItem = ({ item }) => {
    const isLightBg = item.backgroundColor === "white";
    const textColor = isLightBg ? "#333" : "white";

    return (
      <SafeAreaView
        style={[styles.slide, { backgroundColor: item.backgroundColor }]}
      >
        <StatusBar
          barStyle={isLightBg ? "dark-content" : "light-content"}
          backgroundColor={item.backgroundColor}
        />
        <LottieView
          source={item.animation}
          autoPlay
          loop
          style={styles.animation}
        />
        <Text style={[styles.title, { color: textColor }]}>{item.title}</Text>
        {item.tagline && (
          <Text style={[styles.tagline, { color: textColor }]}>
            {item.tagline}
          </Text>
        )}
        <Text style={[styles.bodyText, { color: textColor }]}>
          {item.bodyText}
        </Text>
        {item.finalTagline && (
          <Text style={[styles.finalTagline, { color: textColor }]}>
            {item.finalTagline}
          </Text>
        )}
        {item.key === "4" && (
        <View style={styles.lastSlideContainer}>
          <TouchableOpacity style={styles.getStartedButton} onPress={handleDone}>
            <Text style={styles.getStartedButtonText}>Get Started</Text>
          </TouchableOpacity>
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login here</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      </SafeAreaView>
    );
  };

  // --- Main Component Return ---
  if (!fontsLoaded) {
    return null;
  }
  return (
    <SafeAreaProvider>
      <AppIntroSlider
        renderItem={_renderItem}
        data={slides}
        onDone={handleDone}
        onSkip={handleDone}
        showSkipButton={true}
        activeDotStyle={styles.activeDotStyle}
        renderNextButton={_renderNextButton}
        renderDoneButton={_renderDoneButton}
        renderSkipButton={_renderSkipButton}
      />
    </SafeAreaProvider>
  );
};

export default Intro;

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  animation: {
    width: 300,
    height: 300,
    marginBottom: 10,
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 26,
    textAlign: "center",
    marginBottom: 10,
  },
  tagline: {
    fontFamily: "Lato-Regular",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 15,
    opacity: 0.9,
  },
  bodyText: {
    fontFamily: "Lato-Regular",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 10,
    opacity: 0.8,
    lineHeight: 24,
  },
  finalTagline: {
    fontFamily: "Lato-Bold",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  activeDotStyle: {
    backgroundColor: "#3395ff",
  },
  buttonCircle: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(0, 0, 0, .2)",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, .2)",
  },
  skipButtonText: {
    fontFamily: "Lato-Regular",
    color: "rgba(255, 255, 255, .9)",
    fontSize: 16,
  },
  lastSlideContainer: {
    position: "absolute",
    bottom: 60,
    width: "100%",
    alignItems: "center",
  },
  getStartedButton: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 30,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  getStartedButtonText: {
    color: "#3395ff",
    fontSize: 18,
    fontFamily: "Poppins-Bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Lato-Regular",
  },
  loginLink: {
    color: "white",
    fontSize: 16,
    fontFamily: "Lato-Bold",
    textDecorationLine: "underline",
  },
});