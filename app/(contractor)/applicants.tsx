import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AppNavbar } from "../../components/AppNavbar";
import { COLORS } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { auth, db } from "../../firebase";
import { useUnreadNotifications } from "../../hooks/useUnreadNotifications";
import { createNotification } from "../../services/notificationService";
import { getOrCreateConversation } from "../../services/messageService";
import { getProjectById } from "../../services/projectService";

type Application = {
  id: string;
  projectId: string;
  workerId: string;
  workerName?: string;
  workerPhoto?: string;
  workerSkills?: string[];
  workerExperience?: number;
  status?: "pending" | "accepted" | "declined";
  appliedAt?: { toDate?: () => Date } | Date | null;
};

function getInitials(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function avatarColor(value: string) {
  const palette = ["#E8620A", "#1a2332", "#475569", "#0f766e", "#7c3aed"];
  const hash = value.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return palette[hash % palette.length];
}

function formatDate(value?: Application["appliedAt"]) {
  const date =
    typeof (value as any)?.toDate === "function"
      ? (value as any).toDate()
      : value instanceof Date
        ? value
        : null;
  return date
    ? date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
    : "Today";
}

export default function ApplicantsScreen() {
  const { currentUser } = useAuth();
  const unreadCount = useUnreadNotifications(currentUser?.uid);
  const params = useLocalSearchParams<{
    projectId?: string;
    projectTitle?: string;
  }>();
  const projectId = params.projectId || "";
  const [project, setProject] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/(auth)/sign-in");
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!projectId) return;
      const projectData = await getProjectById(projectId);
      if (!active) return;
      setProject(projectData);
    })();
    return () => {
      active = false;
    };
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    const applicationsRef = collection(db, "applications");
    const applicationsQuery = query(
      applicationsRef,
      where("projectId", "==", projectId),
    );
    return onSnapshot(applicationsQuery, (snapshot) => {
      setApplications(
        snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        })) as Application[],
      );
    });
  }, [projectId]);

  const sortedApplications = useMemo(
    () =>
      [...applications].sort((a, b) => {
        const aDate =
          typeof (a.appliedAt as any)?.toDate === "function"
            ? (a.appliedAt as any).toDate().getTime()
            : 0;
        const bDate =
          typeof (b.appliedAt as any)?.toDate === "function"
            ? (b.appliedAt as any).toDate().getTime()
            : 0;
        return bDate - aDate;
      }),
    [applications],
  );

  const updateStatus = async (
    application: Application,
    status: "accepted" | "declined",
  ) => {
    if (!currentUser || !project) return;
    await updateDoc(doc(db, "applications", application.id), { status });
    const jobTitle = project?.title || params.projectTitle || "this job";
    await createNotification(
      application.workerId,
      status === "accepted" ? "mobilisation_accepted" : "mobilisation_declined",
      status === "accepted"
        ? `Your application for "${jobTitle}" has been accepted!`
        : `Your application for "${jobTitle}" was not successful this time.`,
      application.id,
    );
  };

  const messageWorker = async (application: Application) => {
    if (!currentUser) return;
    const conversationId = await getOrCreateConversation(
      currentUser.uid,
      application.workerId,
      application.workerName || "Worker",
      application.workerPhoto || "",
      currentUser.fullName || currentUser.name || "Contractor",
      currentUser.profileImageUrl || "",
    );

    router.push({
      pathname: "/(contractor)/chat",
      params: {
        conversationId,
        otherName: application.workerName || "Worker",
        otherPhoto: application.workerPhoto || "",
        otherUid: application.workerId,
      },
    } as never);
  };

  const viewProfile = (application: Application) => {
    router.push({
      pathname: "/(contractor)/worker-profile",
      params: {
        workerId: application.workerId,
        workerName: application.workerName || "Worker",
      },
    } as never);
  };

  return (
    <View style={styles.container}>
      <AppNavbar
        userRole="contractor"
        userName={currentUser?.fullName || currentUser?.name || "Contractor"}
        profileImageUrl={currentUser?.profileImageUrl || null}
        unreadCount={unreadCount}
      />

      <View style={styles.pageHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={COLORS.primaryDark} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Applicants</Text>
          <Text style={styles.subtitle}>
            {project?.title || params.projectTitle || "Project applications"}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {sortedApplications.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="people-outline" size={32} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No applicants yet</Text>
            <Text style={styles.emptyText}>
              Applications for this project will appear here.
            </Text>
          </View>
        ) : (
          sortedApplications.map((application) => {
            const name = application.workerName || "Worker";
            const status = application.status || "pending";
            const canAct = status === "pending";
            return (
              <View key={application.id} style={styles.card}>
                <View style={styles.cardTop}>
                  {application.workerPhoto ? (
                    <Image
                      source={{ uri: application.workerPhoto }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View
                      style={[
                        styles.avatar,
                        { backgroundColor: avatarColor(name) },
                      ]}
                    >
                      <Text style={styles.avatarText}>
                        {getInitials(name)}
                      </Text>
                    </View>
                  )}

                  <View style={styles.cardInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.workerName}>{name}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          status === "accepted" && styles.statusAccepted,
                          status === "declined" && styles.statusDeclined,
                        ]}
                      >
                        <Text style={styles.statusText}>{status}</Text>
                      </View>
                    </View>
                    <Text style={styles.meta}>
                      {application.workerExperience || 0} years experience
                    </Text>
                    <Text style={styles.meta}>
                      Applied {formatDate(application.appliedAt)}
                    </Text>
                  </View>
                </View>

                <View style={styles.tags}>
                  {(application.workerSkills || []).length > 0 ? (
                    application.workerSkills?.map((skill) => (
                      <View key={skill} style={styles.tag}>
                        <Text style={styles.tagText}>{skill}</Text>
                      </View>
                    ))
                  ) : (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>No skills listed</Text>
                    </View>
                  )}
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.profileBtn}
                    onPress={() => viewProfile(application)}
                  >
                    <Text style={styles.profileBtnText}>View Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.messageBtn}
                    onPress={() => messageWorker(application)}
                  >
                    <Text style={styles.messageBtnText}>Message</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[
                      styles.acceptBtn,
                      !canAct && styles.disabledBtn,
                    ]}
                    disabled={!canAct}
                    onPress={() => updateStatus(application, "accepted")}
                  >
                    <Text style={styles.actionText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.declineBtn,
                      !canAct && styles.disabledBtn,
                    ]}
                    disabled={!canAct}
                    onPress={() => updateStatus(application, "declined")}
                  >
                    <Text style={styles.actionText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: "900",
  },
  subtitle: {
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 10,
  },
  emptyTitle: {
    marginTop: 10,
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  emptyText: {
    marginTop: 6,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTop: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarText: {
    color: "#ffffff",
    fontWeight: "900",
  },
  cardInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    justifyContent: "space-between",
  },
  workerName: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: COLORS.tagBg,
  },
  statusAccepted: {
    backgroundColor: COLORS.availableBg,
  },
  statusDeclined: {
    backgroundColor: COLORS.unavailableBg,
  },
  statusText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  meta: {
    color: COLORS.textSecondary,
    marginTop: 6,
    fontSize: 13,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  tag: {
    backgroundColor: "#f3f4f6",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "700",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  profileBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#ffffff",
  },
  profileBtnText: {
    color: COLORS.textPrimary,
    fontWeight: "800",
  },
  messageBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: COLORS.primaryDark,
  },
  messageBtnText: {
    color: "#ffffff",
    fontWeight: "800",
  },
  acceptBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: COLORS.success,
  },
  declineBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: COLORS.error,
  },
  actionText: {
    color: "#ffffff",
    fontWeight: "800",
  },
  disabledBtn: {
    opacity: 0.6,
  },
});
