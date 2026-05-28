import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

const C = {
  orange: "#E8620A",
  orangePale: "#FEF0E6",
  yellow: "#CA8A04",
  bg: "#FFFFFF",
  surface: "#F3F1EE",
  border: "#E5E2DC",
  text: "#1A1712",
  textSub: "#5C5650",
  textMuted: "#9C958D",
  textFaint: "#C4BDB4",
  textStrong: "#1a1a1a",
  textMedium: "#666666",
  textInert: "#999999",
  shadow: "rgba(26,23,18,0.08)",
};

const MENU_ITEMS = [
  { icon: "person-outline", label: "Edit Profile", sub: "Update your personal info" },
  { icon: "document-text-outline", label: "My CV", sub: "Upload or update your resume" },
  { icon: "briefcase-outline", label: "My Applications", sub: "Track your job applications" },
  { icon: "notifications-outline", label: "Job Alerts", sub: "Manage your notifications" },
  { icon: "settings-outline", label: "Settings", sub: "App preferences" },
  { icon: "help-circle-outline", label: "Help & Support", sub: "Get help or contact us" },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const isLoggedIn = false; // toggle this once auth is connected

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {isLoggedIn ? (
          /* Logged In State */
          <>
            <View style={styles.profileCard}>
              <View style={styles.avatarWrap}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={32} color={C.textMedium} />
                </View>
                <TouchableOpacity style={styles.avatarEditBtn}>
                  <Ionicons name="camera-outline" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
              <Text style={styles.profileName}>Jean Mbarga</Text>
              <Text style={styles.profileRole}>Civil Engineer</Text>
              <Text style={styles.profileLocation}>Yaounde, Cameroon</Text>

              <View style={styles.statsRow}>
                {[
                  { label: "Applied", value: "12" },
                  { label: "Saved", value: "8" },
                  { label: "Views", value: "34" },
                ].map((s, i) => (
                  <React.Fragment key={s.label}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{s.value}</Text>
                      <Text style={styles.statLabel}>{s.label}</Text>
                    </View>
                    {i < 2 && <View style={styles.statDivider} />}
                  </React.Fragment>
                ))}
              </View>
            </View>

            {/* Skills */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills</Text>
              <View style={styles.skillsRow}>
                {["AutoCAD", "BIM", "Primavera", "NEBOSH", "Site Management"].map((skill) => (
                  <View key={skill} style={styles.skillChip}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : (
          /* Guest State */
          <View style={styles.guestCard}>
            <View style={styles.guestIconWrap}>
              <Ionicons name="person-outline" size={36} color={C.textMedium} />
            </View>
            <Text style={styles.guestTitle}>You are not signed in</Text>
            <Text style={styles.guestSub}>
              Sign in to access your profile, track applications, and save jobs across devices
            </Text>
            <TouchableOpacity
              style={styles.signInBtn}
              onPress={() => router.push("/(auth)/sign-in")}
              activeOpacity={0.85}
            >
              <Text style={styles.signInBtnText}>Sign In</Text>
              <Ionicons name="arrow-forward" size={15} color="#fff" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.signUpBtn}
              onPress={() => router.push("/(auth)/sign-up")}
              activeOpacity={0.85}
            >
              <Text style={styles.signUpBtnText}>Create an Account</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Menu */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, index < MENU_ITEMS.length - 1 && styles.menuItemBorder]}
              activeOpacity={0.7}
              onPress={() => !isLoggedIn && router.push("/(auth)/sign-in")}
            >
              <View style={styles.menuIconWrap}>
                <Ionicons name={item.icon as any} size={18} color={C.textMedium} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSub}>{item.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.textFaint} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign out (only if logged in) */}
        {isLoggedIn && (
          <TouchableOpacity style={styles.signOutBtn} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color="#EF4444" style={{ marginRight: 8 }} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.version}>BUILDLNK v1.0.0 · Construction Jobs Cameroon</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  headerTitle: { fontSize: 22, fontWeight: "900", color: C.text, letterSpacing: 0.3 },
  scroll: { paddingBottom: 40 },

  // Profile card
  profileCard: { margin: 16, backgroundColor: C.bg, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 24, alignItems: "center", shadowColor: C.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 3 },
  avatarWrap: { position: "relative", marginBottom: 14 },
  avatar: { width: 80, height: 80, borderRadius: 24, backgroundColor: C.orangePale, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: C.orange + "30" },
  avatarEditBtn: { position: "absolute", bottom: -4, right: -4, width: 26, height: 26, borderRadius: 8, backgroundColor: C.orange, alignItems: "center", justifyContent: "center" },
  profileName: { fontSize: 20, fontWeight: "900", color: C.textStrong, marginBottom: 4 },
  profileRole: { fontSize: 13, color: C.textMedium, fontWeight: "600", marginBottom: 4 },
  profileLocation: { fontSize: 12, color: C.textMuted, marginBottom: 20 },
  statsRow: { flexDirection: "row", width: "100%", backgroundColor: C.surface, borderRadius: 14, paddingVertical: 14 },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "900", color: C.textStrong, marginBottom: 2 },
  statLabel: { fontSize: 10, color: C.textMuted, fontWeight: "500" },
  statDivider: { width: 1, backgroundColor: C.border, marginVertical: 4 },

  // Skills
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: C.textStrong, marginBottom: 10 },
  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: C.orangePale, borderWidth: 1, borderColor: C.orange + "30" },
  skillText: { fontSize: 12, color: C.textMedium, fontWeight: "600" },

  // Guest
  guestCard: { margin: 16, backgroundColor: C.bg, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 28, alignItems: "center", shadowColor: C.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 3 },
  guestIconWrap: { width: 72, height: 72, borderRadius: 20, backgroundColor: C.orangePale, alignItems: "center", justifyContent: "center", marginBottom: 16, borderWidth: 1, borderColor: C.orange + "25" },
  guestTitle: { fontSize: 18, fontWeight: "900", color: C.textStrong, marginBottom: 8 },
  guestSub: { fontSize: 13, color: C.textMedium, textAlign: "center", lineHeight: 20, marginBottom: 24 },
  signInBtn: { flexDirection: "row", alignItems: "center", backgroundColor: C.orange, paddingHorizontal: 28, paddingVertical: 13, borderRadius: 12, marginBottom: 10, width: "100%", justifyContent: "center" },
  signInBtnText: { color: "#fff", fontSize: 15, fontWeight: "900" },
  signUpBtn: { paddingVertical: 13, width: "100%", alignItems: "center", borderRadius: 12, borderWidth: 1, borderColor: C.border },
  signUpBtnText: { color: C.textSub, fontSize: 14, fontWeight: "700" },

  // Menu
  menuCard: { marginHorizontal: 16, marginBottom: 16, backgroundColor: C.bg, borderRadius: 18, borderWidth: 1, borderColor: C.border, overflow: "hidden", shadowColor: C.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  menuItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  menuIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.orangePale, alignItems: "center", justifyContent: "center" },
  menuLabel: { fontSize: 14, fontWeight: "700", color: C.textStrong, marginBottom: 1 },
  menuSub: { fontSize: 11, color: C.textMuted },

  // Sign out
  signOutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginHorizontal: 16, marginBottom: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: "#FCA5A5", backgroundColor: "#FEF2F2" },
  signOutText: { color: "#EF4444", fontSize: 14, fontWeight: "700" },

  version: { textAlign: "center", fontSize: 11, color: C.textInert, marginBottom: 8 },
});
