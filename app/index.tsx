import { router } from "expo-router";
import { useEffect } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { currentUser, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!currentUser) {
      return;
    }

    if (currentUser.role === "worker") {
      router.replace("/(worker)/dashboard");
      return;
    }

    if (currentUser.role === "contractor") {
      router.replace("/(contractor)/dashboard");
      return;
    }

    router.replace("/(auth)/sign-in");
  }, [currentUser, loading]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E8620A" />
      </View>
    );
  }

  if (currentUser) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to BuildLnk</Text>
      <Text style={styles.subtitle}>
        Find contractors and workers faster with a simple, smart platform.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/(auth)/sign-in")}
      >
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => router.push("/(auth)/sign-up")}
      >
        <Text style={[styles.buttonText, styles.secondaryText]}>
          Create Account
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 12,
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  button: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: "#E8620A",
    alignItems: "center",
    marginBottom: 14,
  },
  secondaryButton: {
    backgroundColor: "#F3F4F6",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
  secondaryText: {
    color: "#111827",
  },
});
