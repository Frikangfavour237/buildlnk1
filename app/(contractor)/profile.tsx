import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, INPUT } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { auth, db } from "../../firebase";
import { logoutUser } from "../../services/authService";

const C = {
  orange: COLORS.primary,
  bg: COLORS.background,
  surface: COLORS.card,
  border: COLORS.border,
  textStrong: COLORS.textPrimary,
  textSub: COLORS.textSecondary,
  textMedium: COLORS.textSecondary,
};

export default function ContractorProfile() {
  const insets = useSafeAreaInsets();
  const { currentUser } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/(auth)/sign-in");
      }
    });

    if (!auth.currentUser) {
      return () => unsubscribe();
    }

    setContactEmail(auth.currentUser.email || "");
    setCompanyName(auth.currentUser.fullName || auth.currentUser.name || "");
    let active = true;
    (async () => {
      const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
      const data = snap.data();
      if (!active) return;
      setCompanyName(
        data?.companyName ||
          auth.currentUser.fullName ||
          auth.currentUser.name ||
          "",
      );
      setContactEmail(data?.email || auth.currentUser.email || "");
      setPhone(data?.phone || "");
      setLocation(data?.location || "");
    })();

    return () => {
      active = false;
      unsubscribe();
    };
  }, [currentUser]);

  const save = async () => {
    if (!currentUser) return;
    try {
      await setDoc(
        doc(db, "users", currentUser.uid),
        {
          companyName,
          fullName: companyName,
          name: companyName,
          email: contactEmail,
          phone,
          location,
          role: "contractor",
        },
        { merge: true },
      );
      Alert.alert("Saved", "Your contractor profile was updated.");
    } catch {
      Alert.alert("Error", "Could not save your profile.");
    }
  };

  const signOut = async () => {
    router.replace("/(auth)/sign-in");
    const result = await logoutUser();
    if (!result.success) {
      Alert.alert("Error", result.error || "Could not sign out.");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Contractor Profile</Text>
          <Text style={styles.sub}>Manage your company details.</Text>
        </View>

        <Text style={styles.label}>Company Name</Text>
        <TextInput
          style={styles.input}
          value={companyName}
          onChangeText={setCompanyName}
          placeholder="Company name"
        />

        <Text style={styles.label}>Contact Email</Text>
        <TextInput
          style={styles.input}
          value={contactEmail}
          onChangeText={setContactEmail}
          placeholder="Email"
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone number"
        />

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Location"
        />

        <TouchableOpacity style={styles.saveBtn} onPress={save}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
  },
  title: { color: "#fff", fontSize: 24, fontWeight: "900" },
  sub: { color: "#e5e7eb", marginTop: 4, lineHeight: 20 },
  label: {
    color: C.textMedium,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 8,
    fontSize: 13,
  },
  input: { ...INPUT },
  saveBtn: {
    marginTop: 18,
    backgroundColor: COLORS.primaryDark,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "900" },
  signOutBtn: {
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fff",
    paddingVertical: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  signOutText: { color: "#EF4444", fontWeight: "800" },
});
