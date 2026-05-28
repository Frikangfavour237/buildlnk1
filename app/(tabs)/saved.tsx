import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const C = {
  orange: "#E8620A",
  orangePale: "#FEF0E6",
  yellow: "#CA8A04",
  yellowPale: "#FEFCE8",
  bg: "#FFFFFF",
  surface: "#F3F1EE",
  border: "#E5E2DC",
  text: "#1A1712",
  textSub: "#5C5650",
  textMuted: "#9C958D",
  textFaint: "#C4BDB4",
  shadow: "rgba(26,23,18,0.08)",
  textStrong: "#1a1a1a",
  textMedium: "#666666",
  textInert: "#999999",
};

const SAVED_JOBS = [
  {
    id: "1",
    title: "Site Manager",
    company: "Razel-BEC Cameroon",
    location: "Yaounde, CM",
    salary: "800k – 1.2M FCFA",
    type: "Management",
    icon: "construct-outline",
    color: "#E8620A",
    posted: "1h ago",
  },
  {
    id: "2",
    title: "Civil Engineer",
    company: "Sogea-Satom",
    location: "Douala, CM",
    salary: "900k – 1.4M FCFA",
    type: "Civil Eng.",
    icon: "calculator-outline",
    color: "#CA8A04",
    posted: "3h ago",
  },
  {
    id: "4",
    title: "HSE Officer",
    company: "Groupe Castel Cameroon",
    location: "Yaounde, CM",
    salary: "700k – 950k FCFA",
    type: "Safety",
    icon: "shield-checkmark-outline",
    color: "#CA8A04",
    posted: "1d ago",
  },
];

export default function SavedScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Jobs</Text>
        <Text style={styles.headerSub}>{SAVED_JOBS.length} jobs saved</Text>
      </View>

      {SAVED_JOBS.length === 0 ? (
        /* Empty State */
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="bookmark-outline" size={36} color={C.textMedium} />
          </View>
          <Text style={styles.emptyTitle}>No saved jobs yet</Text>
          <Text style={styles.emptySubText}>
            Tap the bookmark icon on any job to save it here
          </Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => router.push("/(tabs)/explore")}
            activeOpacity={0.85}
          >
            <Text style={styles.browseBtnText}>Browse Jobs</Text>
            <Ionicons
              name="arrow-forward"
              size={14}
              color="#fff"
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {/* Info banner */}
          <View style={styles.infoBanner}>
            <Ionicons
              name="information-circle-outline"
              size={15}
              color={C.textMedium}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.infoBannerText}>
              Sign in to sync your saved jobs across devices
            </Text>
          </View>

          {SAVED_JOBS.map((job) => (
            <TouchableOpacity
              key={job.id}
              activeOpacity={0.88}
              style={styles.jobCard}
            >
              <View style={styles.jobCardHeader}>
                <View
                  style={[
                    styles.companyLogo,
                    { backgroundColor: job.color + "18" },
                  ]}
                >
                  <Ionicons
                    name={job.icon as any}
                    size={20}
                    color={job.color}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.jobCompany}>{job.company}</Text>
                  <Text style={styles.jobTitle} numberOfLines={1}>
                    {job.title}
                  </Text>
                </View>
                <TouchableOpacity style={styles.removeBtn}>
                  <Ionicons name="bookmark" size={18} color={C.textInert} />
                </TouchableOpacity>
              </View>

              <View style={styles.jobMeta}>
                <Ionicons
                  name="location-outline"
                  size={12}
                  color={C.textMedium}
                />
                <Text style={styles.metaText}>{job.location}</Text>
                <View style={styles.metaDot} />
                <Ionicons
                  name="briefcase-outline"
                  size={12}
                  color={C.textMedium}
                />
                <Text style={styles.metaText}>{job.type}</Text>
              </View>

              <View style={styles.jobFooter}>
                <Text style={styles.salary}>{job.salary}</Text>
                <View style={styles.applyRow}>
                  <Text style={styles.postedTime}>{job.posted}</Text>
                  <TouchableOpacity
                    style={[styles.applyBtn, { backgroundColor: job.color }]}
                    onPress={() => router.push("/(auth)/sign-in")}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.applyText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Sign in CTA */}
          <View style={styles.signInCard}>
            <View style={styles.signInLeft}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={C.textMedium}
                style={{ marginBottom: 6 }}
              />
              <Text style={styles.signInTitle}>Save across devices</Text>
              <Text style={styles.signInSub}>
                Sign in to keep your saved jobs permanently
              </Text>
            </View>
            <TouchableOpacity
              style={styles.signInBtn}
              onPress={() => router.push("/(auth)/sign-in")}
              activeOpacity={0.85}
            >
              <Text style={styles.signInBtnText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: C.textStrong,
    letterSpacing: 0.3,
  },
  headerSub: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  list: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.orangePale,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.orange + "25",
  },
  infoBannerText: { flex: 1, fontSize: 12, color: C.textMedium, lineHeight: 18 },
  jobCard: {
    backgroundColor: C.bg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 12,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  jobCardHeader: { flexDirection: "row", alignItems: "flex-start" },
  companyLogo: {
    width: 42,
    height: 42,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  jobCompany: {
    fontSize: 11,
    color: C.textMuted,
    fontWeight: "500",
    marginBottom: 2,
  },
  jobTitle: { fontSize: 14, color: C.textStrong, fontWeight: "700" },
  removeBtn: { padding: 4 },
  jobMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
  },
  metaText: { fontSize: 12, color: C.textMedium },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: C.border,
    marginHorizontal: 2,
  },
  jobFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  salary: { fontSize: 14, color: C.textStrong, fontWeight: "800" },
  applyRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  postedTime: { fontSize: 11, color: C.textInert },
  applyBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 9 },
  applyText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  signInCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
    marginTop: 8,
  },
  signInLeft: { flex: 1, marginRight: 12 },
  signInTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: C.text,
    marginBottom: 4,
  },
  signInSub: { fontSize: 12, color: C.textMedium, lineHeight: 18 },
  signInBtn: {
    backgroundColor: C.orange,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  signInBtnText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: C.orangePale,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.orange + "30",
  },
  emptyTitle: { fontSize: 18, fontWeight: "900", color: C.textStrong },
  emptySubText: {
    fontSize: 13,
    color: C.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  browseBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.orange,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  browseBtnText: { color: "#fff", fontSize: 14, fontWeight: "800" },
});
