import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
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

const FILTERS = [
  "All",
  "Civil Eng.",
  "Building",
  "Management",
  "Safety",
  "Electrical",
  "Masonry",
];

const JOBS = [
  {
    id: "1",
    title: "Site Manager",
    company: "Razel-BEC Cameroon",
    location: "Yaounde, CM",
    salary: "800k – 1.2M FCFA",
    type: "Management",
    icon: "construct-outline",
    color: "#E8620A",
    tags: ["Site Management", "AutoCAD", "MS Project"],
    posted: "1h ago",
    featured: true,
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
    tags: ["Structural", "Foundations", "BIM"],
    posted: "3h ago",
    featured: true,
  },
  {
    id: "3",
    title: "Works Supervisor",
    company: "MAGZI",
    location: "Bafoussam, CM",
    salary: "650k – 900k FCFA",
    type: "Building",
    icon: "clipboard-outline",
    color: "#E8620A",
    tags: ["Site Supervision", "Planning", "Quality"],
    posted: "6h ago",
    featured: false,
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
    tags: ["NEBOSH", "OHSAS 18001", "PPE"],
    posted: "1d ago",
    featured: false,
  },
  {
    id: "5",
    title: "Industrial Electrician",
    company: "AES-SONEL",
    location: "Douala, CM",
    salary: "450k – 620k FCFA",
    type: "Electrical",
    icon: "flash-outline",
    color: "#E8620A",
    tags: ["HV/LV", "Wiring", "Commissioning"],
    posted: "2d ago",
    featured: false,
  },
  {
    id: "6",
    title: "Structural Engineer",
    company: "LBE Cameroon",
    location: "Kribi, CM",
    salary: "850k – 1.1M FCFA",
    type: "Civil Eng.",
    icon: "layers-outline",
    color: "#CA8A04",
    tags: ["Reinforced Concrete", "ROBOT", "Design"],
    posted: "2d ago",
    featured: false,
  },
  {
    id: "7",
    title: "Skilled Mason",
    company: "SOCATRAF",
    location: "Garoua, CM",
    salary: "280k – 400k FCFA",
    type: "Masonry",
    icon: "hammer-outline",
    color: "#E8620A",
    tags: ["Brickwork", "Plastering", "Screeding"],
    posted: "3d ago",
    featured: false,
  },
  {
    id: "8",
    title: "Land Surveyor",
    company: "Camrail",
    location: "Ngaoundere, CM",
    salary: "550k – 750k FCFA",
    type: "Civil Eng.",
    icon: "compass-outline",
    color: "#CA8A04",
    tags: ["GPS", "Total Station", "Levelling"],
    posted: "4d ago",
    featured: false,
  },
  {
    id: "9",
    title: "Project Engineer",
    company: "Bechtel Cameroon",
    location: "Douala, CM",
    salary: "1M – 1.6M FCFA",
    type: "Civil Eng.",
    icon: "layers-outline",
    color: "#E8620A",
    tags: ["Project Management", "Primavera", "EPC"],
    posted: "5d ago",
    featured: false,
  },
  {
    id: "10",
    title: "Safety Officer",
    company: "Julius Berger",
    location: "Yaounde, CM",
    salary: "600k – 800k FCFA",
    type: "Safety",
    icon: "shield-outline",
    color: "#CA8A04",
    tags: ["Safety Audits", "HSE", "ISO 45001"],
    posted: "6d ago",
    featured: false,
  },
];

function JobCard({ job }: { job: (typeof JOBS)[0] }) {
  return (
    <TouchableOpacity activeOpacity={0.88} style={styles.jobCard}>
      {job.featured && (
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredText}>FEATURED</Text>
        </View>
      )}
      <View style={styles.jobCardHeader}>
        <View
          style={[styles.companyLogo, { backgroundColor: job.color + "18" }]}
        >
          <Ionicons name={job.icon as any} size={20} color={job.color} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.jobCompany}>{job.company}</Text>
          <View style={styles.titleRow}>
            <Text style={styles.jobTitle} numberOfLines={1}>
              {job.title}
            </Text>
            {isDeadlinePassed(job.applicationDeadline) ? (
              <View style={styles.deadlineBadge}>
                <Text style={styles.deadlineBadgeText}>Deadline Passed</Text>
              </View>
            ) : null}
          </View>
        </View>
        <TouchableOpacity style={styles.bookmarkBtn}>
        <Ionicons name="bookmark-outline" size={18} color={C.textInert} />
        </TouchableOpacity>
      </View>

      <View style={styles.jobMeta}>
        <Ionicons name="location-outline" size={12} color={C.textMedium} />
        <Text style={styles.metaText}>{job.location}</Text>
        <View style={styles.metaDot} />
        <Ionicons name="briefcase-outline" size={12} color={C.textMedium} />
        <Text style={styles.metaText}>{job.type}</Text>
      </View>

      <View style={styles.tagRow}>
        {job.tags.map((tag) => (
          <View
            key={tag}
            style={[
              styles.tag,
              {
                borderColor: job.color + "35",
                backgroundColor: job.color + "10",
              },
            ]}
          >
            <Text style={[styles.tagText, { color: job.color }]}>{tag}</Text>
          </View>
        ))}
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
  );
}

const toDateValue = (value: any) => {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate();
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isDeadlinePassed = (deadline: any) => {
  const date = toDateValue(deadline);
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() < today.getTime();
};

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchFocused, setSearchFocused] = useState(false);

  const filtered = JOBS.filter((job) => {
    const matchSearch =
      search === "" ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === "All" || job.type === activeFilter;
    return matchSearch && matchFilter;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Browse Jobs</Text>
        <Text style={styles.headerSub}>
          {filtered.length} positions available
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <View style={[styles.searchBar, searchFocused && styles.searchFocused]}>
          <Ionicons
            name="search-outline"
            size={17}
            color={searchFocused ? C.textMedium : C.textMuted}
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs, companies..."
            placeholderTextColor={C.textFaint}
            value={search}
            onChangeText={setSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
          <Ionicons name="close-circle" size={17} color={C.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersScroll}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setActiveFilter(f)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.filterChip,
                activeFilter === f && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === f && styles.filterChipTextActive,
                ]}
              >
                {f}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Job List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={44} color={C.textFaint} />
            <Text style={styles.emptyText}>No jobs found</Text>
            <Text style={styles.emptySubText}>
              Try different keywords or filters
            </Text>
          </View>
        ) : (
          filtered.map((job) => <JobCard key={job.id} job={job} />)
        )}
      </ScrollView>
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
  searchWrapper: { paddingHorizontal: 16, paddingVertical: 12 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    height: 46,
  },
  searchFocused: { borderColor: C.border, backgroundColor: C.bg },
  searchInput: { flex: 1, color: C.text, fontSize: 14 },
  filtersScroll: { paddingHorizontal: 16, gap: 8, paddingBottom: 12 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  filterChipActive: { backgroundColor: C.orange, borderColor: C.orange },
  filterChipText: { fontSize: 12, color: C.textMedium, fontWeight: "500" },
  filterChipTextActive: { color: "#fff", fontWeight: "700" },
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
  featuredBadge: {
    alignSelf: "flex-start",
    backgroundColor: C.yellowPale,
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.yellow + "40",
  },
  featuredText: {
    color: C.yellow,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  jobCardHeader: { flexDirection: "row", alignItems: "flex-start" },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
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
  deadlineBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#fee2e2",
  },
  deadlineBadgeText: {
    color: "#dc2626",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  bookmarkBtn: { padding: 4 },
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
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  tag: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  tagText: { fontSize: 11, fontWeight: "600" },
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
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyText: { color: C.textStrong, fontSize: 15, fontWeight: "600" },
  emptySubText: { color: C.textMuted, fontSize: 13 },
});
