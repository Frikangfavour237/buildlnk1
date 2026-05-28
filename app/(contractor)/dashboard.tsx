import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
    Alert,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { AppNavbar } from "../../components/AppNavbar";
import { CARD, COLORS } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { auth } from "../../firebase";
import { useUnreadNotifications } from "../../hooks/useUnreadNotifications";
import { deleteProject, getProjects } from "../../services/projectService";

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

export default function ContractorDashboard() {
  const { currentUser } = useAuth();
  const unreadCount = useUnreadNotifications(currentUser?.uid);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/(auth)/sign-in");
      }
    });

    let active = true;
    const fetchProjectsForUser = async () => {
      if (!auth.currentUser) return;
      const projectsData = await getProjects(auth.currentUser.uid);
      if (!active) return;
      setProjects(projectsData);
    };

    fetchProjectsForUser();
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const confirmDeleteProject = (project: any) => {
    Alert.alert(
      "Delete Job",
      "Are you sure you want to delete this job?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await deleteProject(project.id);
                setProjects((prev) =>
                  prev.filter((item) => item.id !== project.id),
                );
              } catch {
                Alert.alert("Delete failed", "Could not delete this job.");
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <AppNavbar
        userRole="contractor"
        userName={currentUser?.fullName || currentUser?.name || "Contractor"}
        profileImageUrl={currentUser?.profileImageUrl || null}
        unreadCount={unreadCount}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Jobs</Text>
            <TouchableOpacity
              onPress={() => router.push("/(contractor)/find-workers")}
            >
              <Text style={styles.link}>Find Workers</Text>
            </TouchableOpacity>
          </View>

          {projects.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons
                name="briefcase-outline"
                size={32}
                color={C.textInert}
              />
              <Text style={styles.emptyTitle}>No jobs yet</Text>
              <Text style={styles.emptyText}>
                Start by posting your first job.
              </Text>
            </View>
          ) : (
            projects.map((project) => (
              <View key={project.id} style={styles.card}>
                {project.siteImage ? (
                  <ImageBackground
                    source={{ uri: project.siteImage }}
                    style={styles.cardHeader}
                    imageStyle={styles.cardHeaderImage}
                  >
                    <LinearGradient
                      colors={["transparent", "rgba(0,0,0,0.8)"]}
                      style={styles.cardHeaderGradient}
                    />
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {project.requiredSkills?.[0] || "Project"}
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
                  <View style={styles.cardTitleRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardSub}>{project.location}</Text>
                      <Text style={styles.cardTitle}>{project.title}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => confirmDeleteProject(project)}
                    >
                      <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                  {isDeadlinePassed(project.applicationDeadline) ? (
                    <View style={styles.deadlineBadge}>
                      <Text style={styles.deadlineBadgeText}>
                        Deadline Passed
                      </Text>
                    </View>
                  ) : null}
                  <Text style={styles.meta}>
                    Workers needed: {project.workersNeeded || 0}
                  </Text>
                  <Text style={styles.meta}>Status: {project.status}</Text>
                  <View style={styles.tags}>
                    {(project.requiredSkills || [])
                      .slice(0, 4)
                      .map((skill: string) => (
                        <View key={skill} style={styles.tag}>
                          <Text style={styles.tagText}>{skill}</Text>
                        </View>
                      ))}
                  </View>
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => router.push("/(contractor)/find-workers")}
                  >
                    <Text style={styles.secondaryBtnText}>Find Workers</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() =>
                      router.push({
                        pathname: "/(contractor)/applicants",
                        params: {
                          projectId: project.id,
                          projectTitle: project.title,
                        },
                      } as never)
                    }
                  >
                    <Text style={styles.primaryBtnText}>View Applicants</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingBottom: 24 },
  section: { marginHorizontal: 16, marginTop: 8 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { color: C.textStrong, fontSize: 18, fontWeight: "700" },
  link: { color: C.textMedium, fontWeight: "700" },
  emptyCard: { ...CARD, padding: 20, alignItems: "center", gap: 8 },
  emptyTitle: { color: C.textStrong, fontWeight: "800" },
  emptyText: { color: C.textSub, textAlign: "center" },
  card: {
    marginTop: 12,
    ...CARD,
    padding: 0,
    overflow: "hidden",
  },
  cardHeader: {
    height: 120,
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
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  cardTitle: { color: C.textStrong, fontSize: 16, fontWeight: "700" },
  cardSub: { color: C.textSub, fontSize: 13, marginBottom: 2 },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  deadlineBadge: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#fee2e2",
  },
  deadlineBadgeText: {
    color: COLORS.error,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  meta: { color: COLORS.textMuted, marginTop: 6, fontSize: 13 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  tag: {
    backgroundColor: "#f3f4f6",
    borderWidth: 0,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: { color: "#374151", fontSize: 11, fontWeight: "600" },
  secondaryBtn: {
    marginTop: 14,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: "#fff",
  },
  secondaryBtnText: { color: C.textStrong, fontWeight: "800" },
  primaryBtn: {
    marginTop: 10,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: COLORS.primaryDark,
  },
  primaryBtnText: { color: "#fff", fontWeight: "800" },
});
