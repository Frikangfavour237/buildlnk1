import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const NAVY = "#0f172a";
const ORANGE = "#E8620A";
const WHITE = "#ffffff";
const LIGHT = "#f8fafc";
const TEXT = "#1e293b";
const MUTED = "#64748b";
const BORDER = "#e2e8f0";

export default function ForgotPasswordWebPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!email) return;
    setSent(true);
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
            <Text style={styles.leftTitle}>Reset your password without the clutter.</Text>
            <Text style={styles.leftText}>
              Request a reset link and get back into your account quickly.
            </Text>
          </View>
        </View>

        <View style={styles.rightPanel}>
          <View style={styles.formWrap}>
            {!sent ? (
              <>
                <Text style={styles.eyebrow}>Forgot Password</Text>
                <Text style={styles.title}>Need a reset link?</Text>
                <Text style={styles.subtitle}>
                  Enter the email address tied to your account.
                </Text>

                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="mail-outline" size={18} color={MUTED} />
                  <TextInput
                    style={styles.input}
                    placeholder="hello@example.com"
                    placeholderTextColor={MUTED}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                <Pressable style={styles.button} onPress={handleSend}>
                  <Text style={styles.buttonText}>Send Reset Link</Text>
                </Pressable>

                <Pressable style={styles.backLink} onPress={() => router.push("/login")}>
                  <Text style={styles.backLinkText}>Back to Sign In</Text>
                </Pressable>
              </>
            ) : (
              <>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark" size={28} color={WHITE} />
                </View>
                <Text style={styles.title}>Check your email</Text>
                <Text style={styles.subtitle}>
                  We sent a password reset link to {email}.
                </Text>

                <Pressable style={styles.button} onPress={() => router.push("/login")}>
                  <Text style={styles.buttonText}>Back to Sign In</Text>
                </Pressable>
              </>
            )}
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
    marginBottom: 22,
  },
  input: {
    flex: 1,
    color: TEXT,
    fontSize: 15,
  },
  button: {
    height: 54,
    borderRadius: 12,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: "900",
  },
  backLink: {
    marginTop: 18,
    alignSelf: "center",
  },
  backLinkText: {
    color: NAVY,
    fontSize: 14,
    fontWeight: "800",
  },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
});
