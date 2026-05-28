import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [sent, setSent] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSend = () => {
    if (!email) return;
    setSent(true);
    Animated.timing(successAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  return (
    <LinearGradient
      colors={["#0D0D1A", "#131328", "#1a1a3e"]}
      style={styles.container}
    >
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, width: "100%" }}
      >
        <View
          style={[
            styles.inner,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 },
          ]}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="rgba(255,255,255,0.7)"
            />
          </TouchableOpacity>

          {!sent ? (
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                flex: 1,
              }}
            >
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={["#6C63FF", "#A78BFA"]}
                  style={styles.iconGradient}
                >
                  <Ionicons name="key-outline" size={32} color="#fff" />
                </LinearGradient>
              </View>

              <Text style={styles.title}>Forgot password?</Text>
              <Text style={styles.subtitle}>
                No worries! Enter your email and we&apos;ll send you a reset link.
              </Text>

              <Text style={styles.label}>Email address</Text>
              <View
                style={[
                  styles.inputWrapper,
                  emailFocused && styles.inputFocused,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={emailFocused ? "#6C63FF" : "rgba(255,255,255,0.3)"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="hello@example.com"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>

              <TouchableOpacity activeOpacity={0.85} onPress={handleSend}>
                <LinearGradient
                  colors={["#6C63FF", "#A78BFA"]}
                  style={styles.primaryButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.primaryButtonText}>Send Reset Link</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backToLogin}
                onPress={() => router.push("/(auth)/sign-in")}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="arrow-back"
                  size={14}
                  color="#A78BFA"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.backToLoginText}>Back to Sign In</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <Animated.View
              style={[styles.successContainer, { opacity: successAnim }]}
            >
              <View style={styles.successIconContainer}>
                <LinearGradient
                  colors={["#10B981", "#34D399"]}
                  style={styles.successIconGradient}
                >
                  <Ionicons name="checkmark" size={40} color="#fff" />
                </LinearGradient>
              </View>
              <Text style={styles.successTitle}>Check your email</Text>
              <Text style={styles.successSubtitle}>
                We sent a password reset link to{"\n"}
                <Text style={styles.successEmail}>{email}</Text>
              </Text>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push("/(auth)/sign-in")}
                style={{ width: "100%" }}
              >
                <LinearGradient
                  colors={["#6C63FF", "#A78BFA"]}
                  style={styles.primaryButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.primaryButtonText}>Back to Sign In</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendRow}
                activeOpacity={0.7}
                onPress={handleSend}
              >
                <Text style={styles.resendText}>
                  Didn&apos;t receive the email?{" "}
                  <Text style={styles.resendLink}>Resend</Text>
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  circle1: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(108,99,255,0.07)",
    top: -60,
    right: -60,
  },
  circle2: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(167,139,250,0.05)",
    bottom: 80,
    left: -50,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 28,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.07)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  iconContainer: { marginBottom: 24 },
  iconGradient: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.45)",
    lineHeight: 24,
    marginBottom: 36,
  },
  label: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 24,
    paddingHorizontal: 14,
    height: 52,
  },
  inputFocused: {
    borderColor: "#6C63FF",
    backgroundColor: "rgba(108,99,255,0.1)",
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
  },
  primaryButton: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  backToLogin: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  backToLoginText: {
    color: "#A78BFA",
    fontSize: 14,
    fontWeight: "600",
  },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40,
  },
  successIconContainer: {
    marginBottom: 28,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  successIconGradient: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 36,
  },
  successEmail: {
    color: "#A78BFA",
    fontWeight: "600",
  },
  resendRow: { marginTop: 20 },
  resendText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 14,
    textAlign: "center",
  },
  resendLink: {
    color: "#A78BFA",
    fontWeight: "700",
  },
});
