import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { loginUser } from "@/services/authService";

const NAVY = "#0f172a";
const ORANGE = "#E8620A";
const WHITE = "#ffffff";
const LIGHT = "#f8fafc";
const TEXT = "#1e293b";
const MUTED = "#64748b";
const BORDER = "#e2e8f0";

export default function LoginWebPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const routeForRole = (role?: string | null) => {
    if (role === "worker") return "/(worker)/dashboard";
    if (role === "contractor") return "/(contractor)/dashboard";
    if (role === "admin") return "/admin/dashboard";
    return "/";
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      const message = "Enter both your email and password.";
      setErrorMessage(message);
      Alert.alert("Missing details", message);
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    const result = await loginUser(email.trim(), password);
    if (result.success) {
      router.replace(routeForRole(result.profile?.role));
    } else {
      const message = result.error || "Unable to sign in right now.";
      setErrorMessage(message);
      Alert.alert("Sign in failed", message);
    }
    setSubmitting(false);
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
            <Text style={styles.leftTitle}>Construction jobs, simplified.</Text>
            <Text style={styles.leftText}>
              Sign in to manage work, connect with the other side, and keep projects
              moving without the clutter.
            </Text>

            <View style={styles.leftPills}>
              <View style={styles.pill}>
                <Text style={styles.pillText}>Jobs</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillText}>Workers</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillText}>Contractors</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.rightPanel}>
          <View style={styles.formWrap}>
            <Text style={styles.eyebrow}>Login</Text>
            <Text style={styles.title}>Welcome back.</Text>
            <Text style={styles.subtitle}>
              Sign in with your account to continue.
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color={MUTED} />
                <TextInput
                  style={styles.input}
                  placeholder="you@company.cm"
                  placeholderTextColor={MUTED}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
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
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <Pressable onPress={() => setShowPassword((value) => !value)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color={MUTED}
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              style={styles.forgot}
              onPress={() => router.push("/(auth)/forgot-password")}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>

            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

            <Pressable
              style={[styles.button, submitting && styles.buttonDisabled]}
              onPress={handleSignIn}
              disabled={submitting}
            >
              <Text style={styles.buttonText}>
                {submitting ? "Signing In..." : "Sign In"}
              </Text>
            </Pressable>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Need an account?</Text>
              <Pressable onPress={() => router.push("/sign-up")}>
                <Text style={styles.footerLink}>Sign Up</Text>
              </Pressable>
            </View>
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
    maxWidth: 480,
  },
  leftText: {
    marginTop: 18,
    color: "#94a3b8",
    fontSize: 18,
    lineHeight: 30,
    maxWidth: 500,
  },
  leftPills: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 28,
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  pillText: {
    color: WHITE,
    fontSize: 13,
    fontWeight: "700",
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
    marginBottom: 32,
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
  forgot: {
    alignSelf: "flex-end",
    marginTop: -2,
    marginBottom: 22,
  },
  forgotText: {
    color: ORANGE,
    fontSize: 13,
    fontWeight: "700",
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
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 22,
    flexWrap: "wrap",
  },
  footerText: {
    color: MUTED,
    fontSize: 14,
  },
  footerLink: {
    color: NAVY,
    fontSize: 14,
    fontWeight: "800",
  },
});
