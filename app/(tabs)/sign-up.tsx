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

const ROLES = [
  { label: "Worker / Labourer", icon: "hammer-outline" },
  { label: "Tradesperson / Artisan", icon: "construct-outline" },
  { label: "Site Supervisor", icon: "clipboard-outline" },
  { label: "Engineer / Architect", icon: "calculator-outline" },
  { label: "Employer / Recruiter", icon: "business-outline" },
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
  const [showRoles, setShowRoles] = useState(false);

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
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join free in under 2 minutes</Text>
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
            <TouchableOpacity
              style={[
                styles.roleSelector,
                showRoles && styles.roleSelectorOpen,
              ]}
              onPress={() => setShowRoles(!showRoles)}
              activeOpacity={0.8}
            >
              <Ionicons
                name="construct-outline"
                size={17}
                color={selectedRole ? C.orange : C.textMuted}
                style={{ marginRight: 10 }}
              />
              <Text
                style={[
                  styles.roleSelectorText,
                  selectedRole && styles.roleSelectorTextActive,
                ]}
              >
                {selectedRole || "Select your role"}
              </Text>
              <Ionicons
                name={showRoles ? "chevron-up" : "chevron-down"}
                size={16}
                color={C.textMuted}
              />
            </TouchableOpacity>

            {showRoles && (
              <View style={styles.roleDropdown}>
                {ROLES.map((role) => (
                  <TouchableOpacity
                    key={role.label}
                    style={[
                      styles.roleOption,
                      selectedRole === role.label && styles.roleOptionActive,
                    ]}
                    onPress={() => {
                      setSelectedRole(role.label);
                      setShowRoles(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.roleIconWrap,
                        selectedRole === role.label &&
                          styles.roleIconWrapActive,
                      ]}
                    >
                      <Ionicons
                        name={role.icon as any}
                        size={16}
                        color={
                          selectedRole === role.label ? C.orange : C.textMuted
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.roleOptionText,
                        selectedRole === role.label &&
                          styles.roleOptionTextActive,
                      ]}
                    >
                      {role.label}
                    </Text>
                    {selectedRole === role.label && (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={C.orange}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Full Name */}
            <Text style={styles.label}>Full Name</Text>
            <View
              style={[styles.inputWrapper, nameFocused && styles.inputFocused]}
            >
              <Ionicons
                name="person-outline"
                size={17}
                color={nameFocused ? C.orange : C.textMuted}
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

            {/* Password */}
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

            <TouchableOpacity activeOpacity={0.85} style={styles.primaryButton}>
              <LinearGradient
                colors={[C.orangeDark, C.orange]}
                style={styles.primaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.primaryButtonText}>Create Account</Text>
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
                onPress={() => router.push("/sign-in")}
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
    marginBottom: 24,
  },
  titleAccent: {
    width: 4,
    height: 52,
    backgroundColor: C.orange,
    borderRadius: 2,
    marginTop: 4,
  },
  title: { fontSize: 28, fontWeight: "900", color: C.text, marginBottom: 6 },
  subtitle: { fontSize: 13, color: C.textSub, lineHeight: 20 },
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
  roleSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 18,
  },
  roleSelectorOpen: { borderColor: C.orange, backgroundColor: C.orangePale },
  roleSelectorText: { flex: 1, color: C.textFaint, fontSize: 15 },
  roleSelectorTextActive: { color: C.text },
  roleDropdown: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.orange + "35",
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
  roleOptionActive: { backgroundColor: C.orangePale },
  roleIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F3F1EE",
    alignItems: "center",
    justifyContent: "center",
  },
  roleIconWrapActive: { backgroundColor: C.orange + "20" },
  roleOptionText: {
    flex: 1,
    color: C.textSub,
    fontSize: 14,
    fontWeight: "500",
  },
  roleOptionTextActive: { color: C.orange, fontWeight: "700" },
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
  termsLink: { color: C.orange, fontWeight: "600" },
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
  loginRow: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  loginText: { color: C.textMuted, fontSize: 14 },
  loginLink: { color: C.orange, fontSize: 14, fontWeight: "700" },
});
