import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { auth } from "../../firebase";
import { ADMIN_EMAIL, verifyAdminCredentials } from "../../services/adminService";

const NAVY = "#0f172a";
const ORANGE = "#E8620A";
const WHITE = "#ffffff";
const LIGHT = "#f8fafc";
const TEXT = "#1e293b";
const MUTED = "#64748b";
const BORDER = "#e2e8f0";

export default function AdminLoginWebPage() {
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
      const message = "Enter both username and password.";
      setError(message);
      Alert.alert("Missing details", message);
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
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.pageContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.shell}>
        <View style={styles.leftPanel}>
          <View style={styles.leftInner}>
            <Text style={styles.brand}>BuildIn</Text>
            <Text style={styles.leftTitle}>Admin Portal</Text>
            <Text style={styles.leftText}>
              Review jobs, manage users, and keep the platform clean from one simple
              dashboard.
            </Text>
          </View>
        </View>

        <View style={styles.rightPanel}>
          <View style={styles.formWrap}>
            <Text style={styles.eyebrow}>Admin Access</Text>
            <Text style={styles.title}>Sign in securely.</Text>
            <Text style={styles.subtitle}>
              Use your admin credentials to continue.
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={18} color={MUTED} />
                <TextInput
                  style={styles.input}
                  placeholder="buildin_admin"
                  placeholderTextColor={MUTED}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={MUTED} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={MUTED}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              style={[styles.button, submitting && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={submitting}
            >
              <Text style={styles.buttonText}>
                {submitting ? "Signing In..." : "Login"}
              </Text>
            </Pressable>

            <Text style={styles.note}>
              First admin record: `buildin_admin` / `BuildIn@2026`
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    width: "100%",
    minHeight: "100vh",
    backgroundColor: NAVY,
  },
  pageContent: {
    width: "100%",
    minHeight: "100vh",
  },
  shell: {
    width: "100%",
    minHeight: "100vh",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  leftPanel: {
    flex: 1,
    minWidth: 320,
    backgroundColor: NAVY,
    paddingHorizontal: 60,
    paddingVertical: 60,
    justifyContent: "center",
  },
  leftInner: {
    maxWidth: 520,
  },
  brand: {
    color: WHITE,
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 28,
  },
  leftTitle: {
    color: WHITE,
    fontSize: 48,
    lineHeight: 56,
    fontWeight: "900",
  },
  leftText: {
    marginTop: 18,
    color: "#94a3b8",
    fontSize: 18,
    lineHeight: 30,
    maxWidth: 500,
  },
  rightPanel: {
    flex: 1,
    minWidth: 360,
    backgroundColor: WHITE,
    paddingHorizontal: 60,
    paddingVertical: 60,
    justifyContent: "center",
  },
  formWrap: {
    width: "100%",
    maxWidth: 460,
  },
  eyebrow: {
    color: ORANGE,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  title: {
    color: TEXT,
    fontSize: 42,
    lineHeight: 50,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 12,
    color: MUTED,
    fontSize: 17,
    lineHeight: 26,
    marginBottom: 30,
  },
  field: {
    marginBottom: 18,
  },
  label: {
    color: TEXT,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  inputWrap: {
    height: 54,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: LIGHT,
  },
  input: {
    flex: 1,
    color: TEXT,
    fontSize: 15,
  },
  error: {
    color: "#b91c1c",
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 18,
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    height: 54,
    borderRadius: 12,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  buttonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: "900",
  },
  note: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 16,
    textAlign: "center",
  },
});
