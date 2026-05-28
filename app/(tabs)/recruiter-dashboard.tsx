import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const C = {
  orange: "#E8620A",
  orangePale: "#FEF0E6",
  bg: "#FFFFFF",
  surface: "#F3F1EE",
  border: "#E5E2DC",
  text: "#1A1712",
  textSub: "#5C5650",
  textMuted: "#9C958D",
};

const ACTIONS = [
  { label: "Post Job", icon: "briefcase-outline", href: "/(auth)/sign-up" },
  { label: "Review Applications", icon: "documents-outline", href: "/(tabs)/saved" },
  { label: "Find Talent", icon: "people-outline", href: "/(tabs)/explore" },
  { label: "Update Profile", icon: "person-outline", href: "/(tabs)/profile" },
];

export default function RecruiterDashboard() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}>
        <LinearGradient colors={["#E8620A", "#F97316"]} style={styles.hero}>
          <Text style={styles.eyebrow}>RECRUITER DASHBOARD</Text>
          <Text style={styles.title}>Manage hiring from one place</Text>
          <Text style={styles.subtitle}>
            Post roles, review applicants, and grow your construction team.
          </Text>
        </LinearGradient>

        <View style={styles.statsRow}>
          {[
            { value: "18", label: "Open Jobs" },
            { value: "42", label: "Applicants" },
            { value: "9", label: "Shortlisted" },
          ].map((item, index) => (
            <React.Fragment key={item.label}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
              {index < 2 && <View style={styles.statDivider} />}
            </React.Fragment>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.label}
                activeOpacity={0.85}
                style={styles.actionCard}
                onPress={() => router.push(action.href as any)}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name={action.icon as any} size={20} color={C.orange} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hiring Snapshot</Text>
          <View style={styles.snapshotCard}>
            <Text style={styles.snapshotTitle}>Your account is set up for recruiting</Text>
            <Text style={styles.snapshotText}>
              Use the Jobs tab to browse talent and keep your company profile up to date.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  hero: {
    margin: 16,
    borderRadius: 20,
    padding: 20,
  },
  eyebrow: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  title: { color: "#fff", fontSize: 26, fontWeight: "900", marginBottom: 8 },
  subtitle: { color: "rgba(255,255,255,0.9)", fontSize: 14, lineHeight: 20 },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    backgroundColor: C.bg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  statCard: { flex: 1, alignItems: "center", paddingVertical: 16 },
  statValue: { fontSize: 20, fontWeight: "900", color: C.text, marginBottom: 4 },
  statLabel: { fontSize: 11, color: C.textMuted, fontWeight: "600" },
  statDivider: { width: 1, backgroundColor: C.border },
  section: { marginTop: 22, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: C.text, marginBottom: 12 },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  actionCard: {
    width: "48%",
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.orangePale,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  actionLabel: { color: C.text, fontWeight: "700", fontSize: 13 },
  snapshotCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  snapshotTitle: { color: C.text, fontSize: 15, fontWeight: "800", marginBottom: 6 },
  snapshotText: { color: C.textSub, fontSize: 13, lineHeight: 19 },
});
