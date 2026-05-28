import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { logoutUser, registerUser } from "@/services/authService";

const NAVY = "#0f172a";
const ORANGE = "#E8620A";
const WHITE = "#ffffff";
const LIGHT = "#f8fafc";
const TEXT = "#1e293b";
const MUTED = "#64748b";
const BORDER = "#e2e8f0";

const ROLES = [
  {
    label: "Contractor",
    value: "contractor",
    helper: "Post jobs and manage your projects.",
  },
  {
    label: "Worker",
    value: "worker",
    helper: "Create a profile and apply for work.",
  },
];

export default function SignUpWebPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const strength = useMemo(() => {
    if (!password) return null;
    if (password.length < 6) return { label: "Weak", color: "#ef4444" };
    if (password.length < 10) return { label: "Medium", color: "#ca8a04" };
    return { label: "Strong", color: "#16a34a" };
  }, [password]);

  const handleCreate = async () => {
    if (!name || !email || !password || !selectedRole) {
      Alert.alert(
        "Missing details",
        "Add your name, email, password, and choose a role.",
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
      router.replace("/login");
    } else {
      Alert.alert("Sign up failed", result.error || "Unable to create your account.");
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
            <Text style={styles.leftTitle}>Create your account and get moving.</Text>
            <Text style={styles.leftText}>
              Join as a worker or contractor and keep your next job search or hiring
              process simple.
            </Text>
          </View>
        </View>

        <View style={styles.rightPanel}>
          <View style={styles.formWrap}>
            <Text style={styles.eyebrow}>Sign Up</Text>
            <Text style={styles.title}>Create your account.</Text>
            <Text style={styles.subtitle}>
              A clean, fast signup flow built for the web.
            </Text>

            <Text style={styles.label}>I am a</Text>
            <View style={styles.roleGrid}>
              {ROLES.map((role) => {
                const active = selectedRole === role.value;
                return (
                  <Pressable
                    key={role.value}
                    onPress={() => setSelectedRole(role.value)}
                    style={[styles.roleCard, active && styles.roleCardActive]}
                  >
                    <View style={[styles.roleIcon, active && styles.roleIconActive]}>
                      <Ionicons
                        name={role.value === "contractor" ? "business-outline" : "person-outline"}
                        size={18}
                        color={active ? WHITE : MUTED}
                      />
                    </View>
                    <Text style={[styles.roleTitle, active && styles.roleTitleActive]}>
                      {role.label}
                    </Text>
                    <Text style={styles.roleText}>{role.helper}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={18} color={MUTED} />
                <TextInput
                  style={styles.input}
                  placeholder="Jean Mbarga"
                  placeholderTextColor={MUTED}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>

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
                  placeholder="Min. 8 characters"
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
              {strength ? (
                <Text style={[styles.strength, { color: strength.color }]}>
                  {strength.label}
                </Text>
              ) : null}
            </View>

            <Text style={styles.note}>
              By signing up you agree to our Terms of Service and Privacy Policy.
            </Text>

            <Pressable
              style={[styles.button, submitting && styles.buttonDisabled]}
              onPress={handleCreate}
              disabled={submitting}
            >
              <Text style={styles.buttonText}>
                {submitting ? "Creating..." : "Create Account"}
              </Text>
            </Pressable>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <Pressable onPress={() => router.push("/login")}>
                <Text style={styles.footerLink}>Sign In</Text>
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
    maxWidth: 500,
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
    maxWidth: 480,
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
    marginBottom: 28,
  },
  label: {
    color: TEXT,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  roleGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  roleCard: {
    flex: 1,
    minWidth: 180,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: LIGHT,
  },
  roleCardActive: {
    backgroundColor: WHITE,
    borderColor: ORANGE,
  },
  roleIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 14,
  },
  roleIconActive: {
    backgroundColor: ORANGE,
    borderColor: ORANGE,
  },
  roleTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },
  roleTitleActive: {
    color: ORANGE,
  },
  roleText: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
  },
  field: {
    marginBottom: 18,
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
  strength: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "700",
  },
  note: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 2,
    marginBottom: 22,
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
