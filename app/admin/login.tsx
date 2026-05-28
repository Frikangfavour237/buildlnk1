import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { auth } from "../../firebase";
import {
  ADMIN_EMAIL,
  verifyAdminCredentials,
} from "../../services/adminService";

const C = {
  orange: "#E8620A",
  bg: "#0f172a",
  surface: "#111827",
  card: "#121a2b",
  border: "#223049",
  text: "#f8fafc",
  textSub: "#cbd5e1",
  textMuted: "#94a3b8",
  orangePale: "#F97316",
};

export default function AdminLoginScreen() {
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleLogin = async () => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setError("Enter both username and password.");
      Alert.alert("Missing details", "Enter both username and password.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const adminRecord = await verifyAdminCredentials(
        trimmedUsername,
        trimmedPassword,
      );

      if (!adminRecord) {
        throw new Error("Invalid credentials");
      }

      const credential = await signInWithEmailAndPassword(
        auth,
        ADMIN_EMAIL,
        trimmedPassword,
      );

      if (credential.user.email !== ADMIN_EMAIL) {
        await signOut(auth);
        throw new Error("Invalid credentials");
      }

      await AsyncStorage.setItem(
        "adminSession",
        JSON.stringify({
          username: trimmedUsername,
          role: "admin",
          loggedIn: true,
        }),
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      router.replace("/admin/dashboard");
    } catch (err: any) {
      const message =
        err?.message === "Invalid credentials"
          ? "Invalid credentials"
          : err?.message || "Invalid credentials";
      setError(message);
      Alert.alert("Login failed", message);
    } finally {
      if (mountedRef.current) {
        setSubmitting(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 32,
            paddingHorizontal: 20,
            flexGrow: 1,
            justifyContent: "center",
          }}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={C.textSub} />
          </TouchableOpacity>

          <View style={styles.hero}>
            <View style={styles.iconWrap}>
              <Ionicons
                name="shield-checkmark-outline"
                size={28}
                color="#fff"
              />
            </View>
            <Text style={styles.kicker}>ADMIN ACCESS</Text>
            <Text style={styles.title}>BuildIn Admin</Text>
            <Text style={styles.sub}>
              Manage jobs, users, and approvals from one secure dashboard.
            </Text>
          </View>

          <Text style={styles.label}>Username</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={18} color={C.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="buildin_admin"
              placeholderTextColor={C.textMuted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrap}>
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color={C.textMuted}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={C.textMuted}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, submitting && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={submitting}
          >
            <Text style={styles.buttonText}>
              {submitting ? "Signing In..." : "Login"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  hero: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 20,
  },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.orange,
    marginBottom: 14,
  },
  kicker: {
    color: C.orangePale,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.6,
    marginBottom: 6,
  },
  title: {
    color: C.text,
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 8,
  },
  sub: {
    color: C.textSub,
    lineHeight: 20,
  },
  label: {
    color: C.textSub,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    color: C.text,
    fontSize: 15,
  },
  error: {
    color: "#fca5a5",
    fontWeight: "700",
    marginTop: -4,
    marginBottom: 14,
  },
  button: {
    height: 54,
    borderRadius: 14,
    backgroundColor: C.orange,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.orange,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
  note: {
    color: C.textMuted,
    fontSize: 12,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 18,
  },
});
