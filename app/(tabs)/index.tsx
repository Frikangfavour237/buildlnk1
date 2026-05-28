import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const C = {
  orange: "#E8620A",
  orangeLight: "#F97316",
  orangeDark: "#C4520A",
  orangePale: "#FEF0E6",
  yellow: "#CA8A04",
  yellowPale: "#FEFCE8",
  bg: "#FFFFFF",
  bgOff: "#F9F7F5",
  surface: "#F3F1EE",
  border: "#E5E2DC",
  borderStrong: "#D4CFC7",
  text: "#1A1712",
  textSub: "#5C5650",
  textMuted: "#9C958D",
  textFaint: "#C4BDB4",
  shadow: "rgba(26,23,18,0.08)",
  textStrong: "#1a1a1a",
  textMedium: "#666666",
  textInert: "#999999",
};

const CATEGORIES = [
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
];

const COMPANIES = [
  {
    id: "1",
    name: "Razel-BEC",
    jobs: 18,
    icon: "business-outline",
    color: "#E8620A",
  },
  {
    id: "2",
    name: "Sogea-Satom",
    jobs: 24,
    icon: "globe-outline",
    color: "#CA8A04",
  },
  {
    id: "3",
    name: "MAGZI",
    jobs: 12,
    icon: "construct-outline",
    color: "#E8620A",
  },
  {
    id: "4",
    name: "AES-SONEL",
    jobs: 31,
    icon: "flash-outline",
    color: "#CA8A04",
  },
  {
    id: "5",
    name: "Camrail",
    jobs: 9,
    icon: "train-outline",
    color: "#E8620A",
  },
  {
    id: "6",
    name: "Castel CM",
    jobs: 15,
    icon: "shield-outline",
    color: "#CA8A04",
  },
];

const SORT_OPTIONS = ["Newest", "Salary: High", "Salary: Low", "Relevance"];

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
          <Ionicons name={job.icon as any} size={22} color={job.color} />
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
          <Ionicons name="bookmark-outline" size={18} color={C.textFaint} />
        </TouchableOpacity>
      </View>

      <View style={styles.jobMeta}>
        <View style={styles.metaChip}>
          <Ionicons name="location-outline" size={12} color={C.textMuted} />
          <Text style={styles.metaText}>{job.location}</Text>
        </View>
        <View style={styles.metaDot} />
        <View style={styles.metaChip}>
          <Ionicons name="briefcase-outline" size={12} color={C.textMuted} />
          <Text style={styles.metaText}>{job.type}</Text>
        </View>
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

function CompanyCard({ company }: { company: (typeof COMPANIES)[0] }) {
  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.companyCard}>
      <View
        style={[styles.companyIcon, { backgroundColor: company.color + "15" }]}
      >
        <Ionicons name={company.icon as any} size={22} color={company.color} />
      </View>
      <Text style={styles.companyName} numberOfLines={1}>
        {company.name}
      </Text>
      <Text style={styles.companyJobs}>{company.jobs} open roles</Text>
      <View
        style={[styles.companyFollowBtn, { borderColor: company.color + "40" }]}
      >
        <Text style={[styles.companyFollowText, { color: company.color }]}>
          Follow
        </Text>
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

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSort, setActiveSort] = useState("Newest");
  const [searchFocused, setSearchFocused] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

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

  const filteredJobs = JOBS.filter((job) => {
    const matchSearch =
      search === "" ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchCategory =
      activeCategory === "All" || job.type === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        style={{ backgroundColor: C.bg }}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.headerLeft}>
            <Image
              source={require("../../assets/images/build logo1.png")}
              style={{ width: 50, height: 50, borderRadius: 8 }}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.brandTag}>Workforce Mobilization</Text>
              <Text style={styles.headerSub}>Construction Jobs Cameroon</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(auth)/sign-in")}
            activeOpacity={0.85}
          >
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Ionicons name="person-outline" size={17} color={C.textMedium} />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Hero Banner */}
        <Animated.View
          style={[
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <LinearGradient
            colors={["#E8620A", "#F97316"]}
            style={styles.heroBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroEyebrow}>NOW HIRING — BTP CAMEROON</Text>
              <Text style={styles.heroTitle}>
                Find your next construction role
              </Text>
              <View style={styles.heroBadge}>
                <View style={styles.heroDot} />
                <Text style={styles.heroBadgeText}>
                  1,200+ active jobs in Cameroon
                </Text>
              </View>
            </View>
            <View style={styles.heroIconStack}>
              <View style={styles.heroIcon1}>
                <Ionicons name="construct" size={26} color="#fff" />
              </View>
              <View style={styles.heroIcon2}>
                <Ionicons
                  name="layers-outline"
                  size={18}
                  color="rgba(255,255,255,0.8)"
                />
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Search + Filter */}
        <Animated.View
          style={[
            styles.searchSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View
            style={[styles.searchBar, searchFocused && styles.searchBarFocused]}
          >
            <Ionicons
              name="search-outline"
              size={18}
              color={searchFocused ? C.textMedium : C.textMuted}
              style={{ marginRight: 10 }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Job title, company, skill..."
              placeholderTextColor={C.textFaint}
              value={search}
              onChangeText={setSearch}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color={C.textMuted} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowSort(!showSort)}
          >
            <View
              style={[
                styles.filterBtn,
                showSort && { backgroundColor: C.orange },
              ]}
            >
              <Ionicons
                name="options-outline"
                size={20}
                color={showSort ? "#fff" : C.textMedium}
              />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Sort Dropdown */}
        {showSort && (
          <View style={styles.sortDropdown}>
            <Text style={styles.sortLabel}>SORT BY</Text>
            <View style={styles.sortOptions}>
              {SORT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.sortOption,
                    activeSort === opt && styles.sortOptionActive,
                  ]}
                  onPress={() => {
                    setActiveSort(opt);
                    setShowSort(false);
                  }}
                  activeOpacity={0.8}
                >
                  {activeSort === opt && (
                    <Ionicons
                      name="checkmark"
                      size={12}
                      color={C.textMedium}
                      style={{ marginRight: 4 }}
                    />
                  )}
                  <Text
                    style={[
                      styles.sortOptionText,
                      activeSort === opt && styles.sortOptionTextActive,
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Stats */}
        <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
          {[
            { label: "Live Jobs", value: "1,240", icon: "hammer-outline" },
            { label: "Companies", value: "340", icon: "business-outline" },
            {
              label: "Hired/Month",
              value: "280",
              icon: "checkmark-done-outline",
            },
          ].map((stat, i) => (
            <React.Fragment key={stat.label}>
              <View style={styles.statItem}>
                <Ionicons
                  name={stat.icon as any}
                  size={15}
                  color={C.textMedium}
                  style={{ marginBottom: 5 }}
                />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
              {i < 2 && <View style={styles.statDivider} />}
            </React.Fragment>
          ))}
        </Animated.View>

        {/* Categories */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveCategory(cat)}
                activeOpacity={0.8}
              >
                {activeCategory === cat ? (
                  <View style={styles.categoryActive}>
                    <Text style={styles.categoryActiveText}>{cat}</Text>
                  </View>
                ) : (
                  <View style={styles.categoryInactive}>
                    <Text style={styles.categoryInactiveText}>{cat}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Job Listings */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {activeCategory === "All" ? "Latest Jobs" : activeCategory}
            </Text>
            <TouchableOpacity
              style={styles.sortIndicator}
              onPress={() => setShowSort(!showSort)}
            >
              <Ionicons
                name="swap-vertical-outline"
                size={13}
                color={C.orange}
              />
              <Text style={styles.sectionSort}>{activeSort}</Text>
            </TouchableOpacity>
          </View>

          {filteredJobs.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={44} color={C.textFaint} />
              <Text style={styles.emptyText}>No jobs found</Text>
              <Text style={styles.emptySubText}>
                Try different keywords or filters
              </Text>
            </View>
          ) : (
            filteredJobs.map((job) => <JobCard key={job.id} job={job} />)
          )}
        </Animated.View>

        {/* Top Companies */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Employers</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/explore")}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.companiesScroll}
          >
            {COMPANIES.map((c) => (
              <CompanyCard key={c.id} company={c} />
            ))}
          </ScrollView>
        </Animated.View>

        {/* CTA Banner */}
        <Animated.View
          style={[
            { paddingHorizontal: 20, marginTop: 28 },
            { opacity: fadeAnim },
          ]}
        >
          <View style={styles.ctaBanner}>
            <LinearGradient
              colors={["#E8620A", "#F97316"]}
              style={styles.ctaAccentBar}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
            <View style={styles.ctaContent}>
              <Text style={styles.ctaEyebrow}>FOR EMPLOYERS</Text>
              <Text style={styles.ctaTitle}>Post a job for free</Text>
              <Text style={styles.ctaSubtitle}>
                Reach 1,200+ skilled construction professionals across Cameroon
              </Text>
              <TouchableOpacity
                style={styles.ctaBtn}
                activeOpacity={0.85}
                onPress={() => router.push("/(auth)/sign-up")}
              >
                <Text style={styles.ctaBtnText}>Post a Job</Text>
                <Ionicons
                  name="arrow-forward"
                  size={14}
                  color="#fff"
                  style={{ marginLeft: 6 }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: C.bg,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandTag: {
    fontSize: 14,
    fontWeight: "900",
    color: C.text,
    letterSpacing: 1.5,
  },
  headerSub: { fontSize: 10, color: C.textMuted },
  avatarRing: {
    borderWidth: 1.5,
    borderColor: C.orange + "40",
    borderRadius: 22,
    padding: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.orangePale,
    alignItems: "center",
    justifyContent: "center",
  },
  heroBanner: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 18,
    flexDirection: "row",
    padding: 22,
    overflow: "hidden",
  },
  heroContent: { flex: 1 },
  heroEyebrow: {
    fontSize: 9,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#fff",
    lineHeight: 27,
    marginBottom: 14,
  },
  heroBadge: { flexDirection: "row", alignItems: "center", gap: 6 },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  heroBadgeText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  heroIconStack: { width: 72, alignItems: "center", justifyContent: "center" },
  heroIcon1: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  heroIcon2: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchSection: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 14,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    height: 48,
  },
  searchBarFocused: { borderColor: C.border, backgroundColor: C.bg },
  searchInput: { flex: 1, color: C.text, fontSize: 14 },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: C.orangePale,
    borderWidth: 1,
    borderColor: C.orange + "30",
    alignItems: "center",
    justifyContent: "center",
  },
  sortDropdown: {
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: C.bg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  sortLabel: {
    color: C.textMuted,
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 10,
    letterSpacing: 1,
  },
  sortOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  sortOptionActive: {
    borderColor: C.orange + "50",
    backgroundColor: C.orangePale,
  },
  sortOptionText: { color: C.textMedium, fontSize: 13, fontWeight: "500" },
  sortOptionTextActive: { color: C.textStrong, fontWeight: "700" },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: C.bg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 16,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: C.textStrong,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: C.textMuted,
    fontWeight: "500",
    textAlign: "center",
  },
  statDivider: { width: 1, backgroundColor: C.border, marginVertical: 8 },
  categoriesScroll: { paddingHorizontal: 20, gap: 8, paddingBottom: 4 },
  categoryActive: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.orange,
  },
  categoryActiveText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  categoryInactive: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  categoryInactiveText: { color: C.textSub, fontSize: 13, fontWeight: "500" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: C.textStrong },
  seeAll: { fontSize: 13, color: C.textMedium, fontWeight: "600" },
  sortIndicator: { flexDirection: "row", alignItems: "center", gap: 4 },
  sectionSort: { fontSize: 12, color: C.textMedium, fontWeight: "600" },
  jobCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: C.bg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
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
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  jobCompany: {
    fontSize: 11,
    color: C.textMuted,
    fontWeight: "500",
    marginBottom: 2,
  },
  jobTitle: { fontSize: 15, color: C.textStrong, fontWeight: "700" },
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
    gap: 6,
    marginTop: 10,
  },
  metaChip: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: C.textMedium },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: C.border },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
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
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  salary: { fontSize: 14, color: C.textStrong, fontWeight: "800" },
  applyRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  postedTime: { fontSize: 11, color: C.textInert },
  applyBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 9 },
  applyText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  companiesScroll: { paddingHorizontal: 20, gap: 12, paddingBottom: 4 },
  companyCard: {
    width: 116,
    backgroundColor: C.bg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    alignItems: "center",
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  companyIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  companyName: {
    fontSize: 12,
    color: C.text,
    fontWeight: "700",
    marginBottom: 3,
  },
  companyJobs: { fontSize: 10, color: C.textMuted, marginBottom: 10 },
  companyFollowBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 7,
    borderWidth: 1,
  },
  companyFollowText: { fontSize: 11, fontWeight: "700" },
  emptyState: { alignItems: "center", paddingVertical: 48, gap: 8 },
  emptyText: { color: C.textStrong, fontSize: 15, fontWeight: "600" },
  emptySubText: { color: C.textMuted, fontSize: 13 },
  ctaBanner: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  ctaAccentBar: { width: 5 },
  ctaContent: { flex: 1, padding: 20 },
  ctaEyebrow: {
    fontSize: 9,
    color: C.orange,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  ctaTitle: { fontSize: 18, fontWeight: "900", color: C.text, marginBottom: 6 },
  ctaSubtitle: {
    fontSize: 13,
    color: C.textSub,
    lineHeight: 20,
    marginBottom: 16,
  },
  ctaBtn: {
    flexDirection: "row",
    alignSelf: "flex-start",
    alignItems: "center",
    backgroundColor: C.orange,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 9,
  },
  ctaBtnText: { color: "#fff", fontSize: 13, fontWeight: "800" },
});
