import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
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

const C = {
  orange: "#E8620A",
  orangeLight: "#F97316",
  orangeDark: "#C4520A",
  orangePale: "#FEF0E6",
  yellow: "#CA8A04",
  bg: "#FFFFFF",
  surface: "#F3F1EE",
  border: "#E5E2DC",
  text: "#1A1712",
  textSub: "#5C5650",
  textMuted: "#9C958D",
  textFaint: "#C4BDB4",
};

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

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

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, width: "100%" }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 32 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={C.textSub} />
          </TouchableOpacity>

          {/* Brand */}
          <Animated.View
            style={[
              styles.brandRow,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.logoMark}>
              <Ionicons name="hammer" size={18} color="#fff" />
            </View>
            <View>
              <Text style={styles.brandName}>BUILDLNK</Text>
              <Text style={styles.brandSub}>Construction Jobs Cameroon</Text>
            </View>
          </Animated.View>

          {/* Title */}
          <Animated.View
            style={[
              styles.titleBlock,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.titleAccent} />
            <View>
              <Text style={styles.title}>Sign In</Text>
              <Text style={styles.subtitle}>
                Access your professional construction account
              </Text>
            </View>
          </Animated.View>

          {/* Social */}
          <Animated.View
            style={[
              styles.socialRow,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.75}>
              <Ionicons name="logo-google" size={18} color={C.text} />
              <Text style={styles.socialBtnText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.75}>
              <Ionicons name="logo-linkedin" size={18} color={C.text} />
              <Text style={styles.socialBtnText}>LinkedIn</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[styles.dividerRow, { opacity: fadeAnim }]}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or sign in with email</Text>
            <View style={styles.dividerLine} />
          </Animated.View>

          {/* Form */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Text style={styles.label}>Email Address</Text>
            <View
              style={[styles.inputWrapper, emailFocused && styles.inputFocused]}
            >
              <Ionicons
                name="mail-outline"
                size={17}
                color={emailFocused ? C.orange : C.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="you@company.cm"
                placeholderTextColor={C.textFaint}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View
              style={[styles.inputWrapper, passFocused && styles.inputFocused]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={17}
                color={passFocused ? C.orange : C.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Your password"
                placeholderTextColor={C.textFaint}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={17}
                  color={C.textMuted}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotRow}
              onPress={() => router.push("/forgot-password")}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.85} style={styles.primaryButton}>
              <LinearGradient
                colors={[C.orangeDark, C.orange]}
                style={styles.primaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.primaryButtonText}>Sign In</Text>
                <Ionicons
                  name="arrow-forward"
                  size={17}
                  color="#fff"
                  style={{ marginLeft: 8 }}
                />
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push("/sign-up")}
                activeOpacity={0.7}
              >
                <Text style={styles.registerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Trust */}
          <Animated.View style={[styles.trustRow, { opacity: fadeAnim }]}>
            {["1,200+ Jobs", "340+ Employers", "Verified Listings"].map((t) => (
              <View key={t} style={styles.trustBadge}>
                <View style={styles.trustDot} />
                <Text style={styles.trustText}>{t}</Text>
              </View>
            ))}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scroll: { paddingHorizontal: 24 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3F1EE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E2DC",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 32,
  },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: C.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: 15,
    fontWeight: "900",
    color: C.text,
    letterSpacing: 1.5,
  },
  brandSub: { fontSize: 10, color: C.textMuted },
  titleBlock: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 28,
  },
  titleAccent: {
    width: 4,
    height: 52,
    backgroundColor: C.orange,
    borderRadius: 2,
    marginTop: 4,
  },
  title: { fontSize: 28, fontWeight: "900", color: C.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: C.textSub, lineHeight: 20 },
  socialRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  socialBtnText: { color: C.text, fontSize: 14, fontWeight: "600" },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
  dividerText: { color: C.textFaint, fontSize: 11 },
  label: {
    color: C.textSub,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 16,
    paddingHorizontal: 14,
    height: 52,
  },
  inputFocused: { borderColor: C.orange, backgroundColor: C.orangePale },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: C.text, fontSize: 15 },
  eyeBtn: { padding: 4 },
  forgotRow: { alignSelf: "flex-end", marginBottom: 24, marginTop: -4 },
  forgotText: { color: C.orange, fontSize: 13, fontWeight: "600" },
  primaryButton: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: C.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryGradient: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  registerText: { color: C.textMuted, fontSize: 14 },
  registerLink: { color: C.orange, fontSize: 14, fontWeight: "700" },
  trustRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  trustBadge: { flexDirection: "row", alignItems: "center", gap: 5 },
  trustDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.orange },
  trustText: { color: C.textMuted, fontSize: 11, fontWeight: "500" },
});
