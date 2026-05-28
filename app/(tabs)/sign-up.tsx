import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Alert,
  Image,
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
import { logoutUser, registerUser } from "@/services/authService";
import { COLORS } from "../../constants/theme";

const C = {
  orange: COLORS.primary,
  orangeLight: COLORS.secondaryDark,
  orangeDark: COLORS.primaryDark,
  orangePale: "#EEF2F7",
  yellow: "#CA8A04",
  bg: COLORS.background,
  surface: COLORS.card,
  border: COLORS.border,
  text: COLORS.textPrimary,
  textSub: COLORS.textSecondary,
  textMuted: COLORS.textMuted,
  textFaint: "#cbd5e1",
  textStrong: COLORS.textPrimary,
  textMedium: COLORS.textSecondary,
  textInert: COLORS.textMuted,
};

const ROLES = [
  {
    label: "Contractor",
    value: "contractor",
    icon: "business-outline",
    helper: "Post jobs and review workers",
  },
  {
    label: "Worker",
    value: "worker",
    icon: "person-outline",
    helper: "Build your profile and apply for jobs",
  },
];

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const getPasswordStrength = (): {
    label: string;
    color: string;
    pct: string;
  } | null => {
    if (password.length === 0) return null;
    if (password.length < 6)
      return { label: "Weak", color: "#EF4444", pct: "28%" };
    if (password.length < 10)
      return { label: "Medium", color: C.yellow, pct: "62%" };
    return { label: "Strong", color: "#16A34A", pct: "100%" };
  };

  const strength = getPasswordStrength();

  const handleCreateAccount = async () => {
    if (!name || !email || !password || !selectedRole) {
      Alert.alert(
        "Missing details",
        "Add your name, email, password, and choose a role."
      );
      return;
    }

    setSubmitting(true);

    const result = await registerUser(
      email.trim(),
      password,
      name.trim(),
      "",
      selectedRole,
    );
    if (result.success) {
      await logoutUser();
      Alert.alert("Account Created", "Please sign in with your new account.");
      router.replace("/(auth)/sign-in");
    } else {
      const message = result.error || "Unable to create your account.";
      Alert.alert("Sign up failed", message);
    }
    setSubmitting(false);
  };

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
            <Image
              source={require("../../assets/images/build logo1.png")}
              style={{ width: 32, height: 32, borderRadius: 8 }}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.brandName}>BUILDIn</Text>
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
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join free in under 2 minutes</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.dividerRow, { opacity: fadeAnim }]}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or fill in your details</Text>
            <View style={styles.dividerLine} />
          </Animated.View>

          {/* Form */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* Role Selector */}
            <Text style={styles.label}>I am a...</Text>
            <View style={styles.roleGrid}>
              {ROLES.map((role) => {
                const active = selectedRole === role.value;
                return (
                  <TouchableOpacity
                    key={role.value}
                    style={[styles.roleCard, active && styles.roleCardActive]}
                    onPress={() => setSelectedRole(role.value)}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.roleIconWrap, active && styles.roleIconWrapActive]}>
                      <Ionicons
                        name={role.icon as any}
                        size={20}
                        color={active ? "#fff" : C.textMedium}
                      />
                    </View>
                    <Text style={[styles.roleCardTitle, active && styles.roleCardTitleActive]}>
                      {role.label}
                    </Text>
                    <Text style={styles.roleCardHelper}>{role.helper}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Full Name */}
            <Text style={styles.label}>Full Name</Text>
            <View
              style={[styles.inputWrapper, nameFocused && styles.inputFocused]}
            >
              <Ionicons
                name="person-outline"
                size={17}
                        color={nameFocused ? C.textMedium : C.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Jean Mbarga"
                placeholderTextColor={C.textFaint}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
              />
            </View>

            {/* Email */}
            <Text style={styles.label}>Email Address</Text>
            <View
              style={[styles.inputWrapper, emailFocused && styles.inputFocused]}
            >
              <Ionicons
                name="mail-outline"
                size={17}
                        color={emailFocused ? C.textMedium : C.textMuted}
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

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <View
              style={[styles.inputWrapper, passFocused && styles.inputFocused]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={17}
                        color={passFocused ? C.textMedium : C.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Min. 8 characters"
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

            {strength && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBar}>
                  <View
                    style={[
                      styles.strengthFill,
                      {
                        width: strength.pct as any,
                        backgroundColor: strength.color,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.strengthLabel, { color: strength.color }]}>
                  {strength.label}
                </Text>
              </View>
            )}

            <Text style={styles.terms}>
              By signing up you agree to our{" "}
              <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
              onPress={handleCreateAccount}
              disabled={submitting}
            >
              <LinearGradient
                colors={[COLORS.primaryDark, COLORS.secondaryDark]}
                style={styles.primaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.primaryButtonText}>
                  {submitting ? "Creating..." : "Create Account"}
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={17}
                  color="#fff"
                  style={{ marginLeft: 8 }}
                />
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/sign-in")}
                activeOpacity={0.7}
              >
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
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
    marginBottom: 28,
  },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.primaryDark,
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
    marginBottom: 24,
  },
  titleAccent: {
    width: 4,
    height: 52,
    backgroundColor: COLORS.primaryDark,
    borderRadius: 2,
    marginTop: 4,
  },
  title: { fontSize: 28, fontWeight: "900", color: C.textStrong, marginBottom: 6 },
  subtitle: { fontSize: 13, color: C.textSub, lineHeight: 20 },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
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
  roleGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  roleCard: {
    flex: 1,
    minHeight: 124,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    padding: 14,
  },
  roleCardActive: {
    borderColor: COLORS.primaryDark,
    backgroundColor: "#fff",
  },
  roleCardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: C.textStrong,
    marginTop: 12,
    marginBottom: 6,
  },
  roleCardTitleActive: {
    color: COLORS.primaryDark,
  },
  roleCardHelper: {
    color: C.textSub,
    fontSize: 12,
    lineHeight: 18,
  },
  roleSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 18,
  },
  roleSelectorOpen: { borderColor: C.border, backgroundColor: C.bg },
  roleSelectorText: { flex: 1, color: C.textFaint, fontSize: 15 },
  roleSelectorTextActive: { color: C.textStrong },
  roleDropdown: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: -12,
    marginBottom: 18,
    overflow: "hidden",
    shadowColor: "rgba(26,23,18,0.1)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  roleOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F1EE",
  },
  roleOptionActive: { backgroundColor: C.bgOff },
  roleIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F3F1EE",
    alignItems: "center",
    justifyContent: "center",
  },
  roleIconWrapActive: { backgroundColor: "#E2E8F0" },
  roleOptionText: {
    color: C.textSub,
    fontSize: 14,
    fontWeight: "500",
  },
  roleOptionTextActive: { color: C.textStrong, fontWeight: "700" },
  roleOptionHelper: {
    marginTop: 2,
    color: C.textInert,
    fontSize: 11,
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
  inputFocused: { borderColor: C.border, backgroundColor: C.bg },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: C.text, fontSize: 15 },
  eyeBtn: { padding: 4 },
  strengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: -8,
    marginBottom: 16,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    overflow: "hidden",
  },
  strengthFill: { height: "100%", borderRadius: 2 },
  strengthLabel: { fontSize: 12, fontWeight: "700", width: 48 },
  terms: {
    color: C.textMuted,
    fontSize: 12,
    lineHeight: 20,
    marginBottom: 22,
    textAlign: "center",
  },
  termsLink: { color: C.textStrong, fontWeight: "600" },
  primaryButton: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonDisabled: { opacity: 0.7 },
  primaryGradient: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryDark,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  loginRow: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  loginText: { color: C.textMuted, fontSize: 14 },
  loginLink: { color: COLORS.primaryDark, fontSize: 14, fontWeight: "700" },
});
