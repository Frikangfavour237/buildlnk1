import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { AppNavbar } from "../../components/AppNavbar";
import { WORKER_SKILLS } from "../../constants/skills";
import { CARD, COLORS } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { useUnreadNotifications } from "../../hooks/useUnreadNotifications";
import {
    createApplication,
    getOpenProjects,
} from "../../services/projectService";
import { getOrCreateConversation } from "../../services/messageService";
import { getWorkerProfile } from "../../services/workerService";

const C = {
  orange: COLORS.primary,
  bg: COLORS.background,
  surface: COLORS.card,
  border: COLORS.border,
  textStrong: COLORS.textPrimary,
  textSub: COLORS.textSecondary,
  textMedium: COLORS.textSecondary,
  textInert: COLORS.textMuted,
};

const formatRelativeTime = (value: any) => {
  if (!value) return "Just now";

  const date =
    typeof value?.toDate === "function"
      ? value.toDate()
      : value?.seconds
        ? new Date(value.seconds * 1000)
        : new Date(value);

  if (Number.isNaN(date.getTime())) return "Just now";

  const diffMs = Math.max(0, Date.now() - date.getTime());
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    return `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;
  }

  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
};

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

export default function WorkerJobs() {
  const { currentUser } = useAuth();
  const unreadCount = useUnreadNotifications(currentUser?.uid);
  const [jobs, setJobs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [activeSkill, setActiveSkill] = useState("All");
  const [workerProfile, setWorkerProfile] = useState<any>(null);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const fetchJobs = async () => {
      setJobs(await getOpenProjects());
    };

    const fetchProfile = async () => {
      setWorkerProfile(await getWorkerProfile(currentUser.uid));
    };

    fetchJobs();
    fetchProfile();
  }, [currentUser?.uid]);

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      const jobSkills = job.requiredSkills || [];
      const matchSearch =
        search === "" ||
        job.title?.toLowerCase().includes(search.toLowerCase()) ||
        job.contractorName?.toLowerCase().includes(search.toLowerCase()) ||
        job.location?.toLowerCase().includes(search.toLowerCase());
      const matchSkill =
        activeSkill === "All" || jobSkills.includes(activeSkill);
      return matchSearch && matchSkill;
    });
  }, [jobs, search, activeSkill]);

  const apply = async (job: any) => {
    if (!currentUser) return;
    try {
      await createApplication({
        projectId: job.id,
        workerId: currentUser.uid,
        workerName: currentUser.fullName || currentUser.name || "Worker",
        workerPhoto: workerProfile?.profileImageUrl || currentUser.profileImageUrl || "",
        workerSkills: workerProfile?.skills || [],
        workerExperience: workerProfile?.experience || 0,
        contractorUid: job.contractorUid || "",
      });
      Alert.alert("Application sent", "Your application has been submitted.");
    } catch {
      Alert.alert("Error", "Could not submit application.");
    }
  };

  const messageContractor = async (job: any) => {
    if (!currentUser) return;
    if (!job.contractorUid) {
      Alert.alert("Unavailable", "This job does not have contractor details yet.");
      return;
    }

    const conversationId = await getOrCreateConversation(
      currentUser.uid,
      job.contractorUid,
      job.contractorName || "Contractor",
      job.contractorPhoto || "",
      currentUser.fullName || currentUser.name || "Worker",
      workerProfile?.profileImageUrl || currentUser.profileImageUrl || "",
    );

    router.push({
      pathname: "/(worker)/chat",
      params: {
        conversationId,
        otherName: job.contractorName || "Contractor",
        otherPhoto: job.contractorPhoto || "",
        otherUid: job.contractorUid,
      },
    } as never);
  };

  return (
    <View style={styles.container}>
      <AppNavbar
        userRole="worker"
        userName={currentUser?.fullName || currentUser?.name || "Worker"}
        profileImageUrl={currentUser?.profileImageUrl || null}
        unreadCount={unreadCount}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={C.textInert} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs..."
            placeholderTextColor={C.textInert}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.skillsRow}
        >
          {["All", ...WORKER_SKILLS].map((skill) => (
            <TouchableOpacity
              key={skill}
              onPress={() => setActiveSkill(skill)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.pill,
                  activeSkill === skill && styles.pillActive,
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    activeSkill === skill && styles.pillTextActive,
                  ]}
                >
                  {skill}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filtered.map((job) => (
          <View key={job.id} style={styles.card}>
            {job.siteImage ? (
              <ImageBackground
                source={{ uri: job.siteImage }}
                style={styles.cardHeader}
                imageStyle={styles.cardHeaderImage}
              >
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.8)"]}
                  style={styles.cardHeaderGradient}
                />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {job.category || job.requiredSkills?.[0] || "Job"}
                  </Text>
                </View>
              </ImageBackground>
            ) : (
              <View style={styles.placeholderHeader}>
                <Ionicons
                  name="construct-outline"
                  size={32}
                  color="rgba(255,255,255,0.3)"
                />
              </View>
            )}

            <View style={styles.cardBody}>
              <Text style={styles.cardSub}>
                {job.contractorName || job.company || "Contractor"}
              </Text>
              <View style={styles.titleRow}>
                <Text style={styles.cardTitle}>{job.title}</Text>
                {isDeadlinePassed(job.applicationDeadline) ? (
                  <View style={styles.deadlineBadge}>
                    <Text style={styles.deadlineBadgeText}>
                      Deadline Passed
                    </Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color={C.textSub} />
                <Text style={styles.meta}>{job.location}</Text>
              </View>
              <View style={styles.tags}>
                {(job.requiredSkills || []).slice(0, 4).map((skill: string) => (
                  <View key={skill} style={styles.tag}>
                    <Text style={styles.tagText}>{skill}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.salary}>{job.salaryRange || job.salary}</Text>
              <View style={styles.footerRow}>
                <Text style={styles.timeText}>
                  {formatRelativeTime(job.createdAt)}
                </Text>
                <View style={styles.footerActions}>
                  <TouchableOpacity
                    style={styles.applyBtn}
                    onPress={() => apply(job)}
                  >
                    <Text style={styles.applyText}>Apply</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.messageBtn}
                    onPress={() => messageContractor(job)}
                  >
                    <Text style={styles.messageText}>Message</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingBottom: 24 },
  searchWrap: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    height: 48,
  },
  searchInput: { flex: 1, color: C.textStrong, fontSize: 15 },
  skillsRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 12 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  pillActive: { backgroundColor: C.surface, borderColor: COLORS.primaryDark },
  pillText: { color: "#374151", fontWeight: "700" },
  pillTextActive: { color: "#fff" },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    ...CARD,
    padding: 0,
    overflow: "hidden",
  },
  cardHeader: {
    height: 150,
    width: "100%",
    justifyContent: "flex-end",
  },
  cardHeaderImage: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardHeaderGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  placeholderHeader: {
    height: 80,
    width: "100%",
    backgroundColor: "#1a2332",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: {
    padding: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  cardTitle: { color: C.textStrong, fontSize: 16, fontWeight: "700" },
  cardSub: { color: C.textSub, fontSize: 13, marginBottom: 2 },
  deadlineBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#fee2e2",
  },
  deadlineBadgeText: {
    color: COLORS.error,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  locationRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  meta: { color: COLORS.textMuted, fontSize: 13, flexShrink: 1 },
  salary: {
    color: COLORS.primaryDark,
    marginTop: 10,
    fontWeight: "800",
    fontSize: 15,
  },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  tag: {
    backgroundColor: COLORS.tagBg,
    borderWidth: 0,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: { color: COLORS.tagText, fontSize: 11, fontWeight: "600" },
  footerRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  timeText: {
    color: C.textSub,
    fontSize: 12,
    fontWeight: "600",
    flexShrink: 1,
  },
  footerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
  applyText: { color: "#fff", fontWeight: "900", fontSize: 13 },
  messageBtn: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primaryDark,
    backgroundColor: "#fff",
  },
  messageText: {
    color: COLORS.primaryDark,
    fontWeight: "800",
    textAlign: "center",
    fontSize: 13,
  },
});
