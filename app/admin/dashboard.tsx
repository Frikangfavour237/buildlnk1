import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, CARD } from "../../constants/theme";
import { db } from "../../firebase";
import {
  approveJob,
  blockUser,
  deleteUserData,
  rejectJob,
  unblockUser,
} from "../../services/adminService";

const C = {
  orange: COLORS.primary,
  bg: COLORS.background,
  surface: COLORS.card,
  border: COLORS.border,
  text: COLORS.textPrimary,
  textSub: COLORS.textSecondary,
  textMuted: COLORS.textMuted,
  success: COLORS.success,
  danger: COLORS.error,
  warning: COLORS.busyText,
};

const TABS = [
  { key: "pending", label: "Pending Jobs" },
  { key: "users", label: "All Users" },
  { key: "contractors", label: "All Contractors" },
  { key: "blocked", label: "Blocked Users" },
];

const toDateValue = (value: any) => {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDate = (value: any) => {
  const date = toDateValue(value);
  return date
    ? date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Date not set";
};

const formatDateTime = (value: any) => {
  const date = toDateValue(value);
  return date
    ? date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Date not set";
};

const getInitials = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
};

export default function AdminDashboardScreen() {
  const params = useLocalSearchParams<{ adminUsername?: string }>();
  const [activeTab, setActiveTab] = useState("pending");
  const [adminUsername, setAdminUsername] = useState(
    params.adminUsername || "buildin_admin",
  );
  const [isReady, setIsReady] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobBusyId, setJobBusyId] = useState<string | null>(null);
  const [userBusyId, setUserBusyId] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await AsyncStorage.getItem("adminSession");
        if (!session) {
          router.replace("/admin/login");
          return;
        }

        const parsed = JSON.parse(session);
        if (!parsed.loggedIn || parsed.role !== "admin") {
          router.replace("/admin/login");
          return;
        }

        setAdminUsername(parsed.username || "buildin_admin");
        setIsReady(true);
      } catch {
        router.replace("/admin/login");
      }
    };

    void checkSession();
  }, []);

  useEffect(() => {
    if (params.adminUsername) {
      setAdminUsername(params.adminUsername);
    }
  }, [params.adminUsername]);

  useEffect(() => {
    if (!isReady) return;

    let active = true;

    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      if (!active) return;
      setUsers(
        snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        })),
      );
      setLoading(false);
    });

    const unsubscribeJobs = onSnapshot(collection(db, "jobs"), (snapshot) => {
      if (!active) return;
      setJobs(
        snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        })),
      );
      setLoading(false);
    });

    return () => {
      active = false;
      unsubscribeUsers();
      unsubscribeJobs();
    };
  }, [isReady]);

  const pendingJobs = useMemo(
    () => jobs.filter((job) => job.status === "pending"),
    [jobs],
  );

  const contractors = useMemo(
    () => users.filter((user) => user.role === "contractor"),
    [users],
  );

  const blockedUsers = useMemo(
    () => users.filter((user) => user.blocked),
    [users],
  );

  const stats = [
    { label: "Total Users", value: users.length },
    { label: "Total Jobs", value: jobs.length },
    { label: "Pending Approvals", value: pendingJobs.length },
    { label: "Blocked Users", value: blockedUsers.length },
  ];

  const usersById = useMemo(() => {
    const map = new Map<string, any>();
    users.forEach((user) => map.set(user.id, user));
    return map;
  }, [users]);

  const jobList =
    activeTab === "pending"
      ? pendingJobs
      : activeTab === "users"
        ? users
        : activeTab === "contractors"
          ? contractors
          : blockedUsers;

  const handleLogout = async () => {
    await AsyncStorage.removeItem("adminSession");
    router.replace("/admin/login");
  };

  const handleApprove = async (job: any) => {
    try {
      setJobBusyId(job.id);
      await approveJob(job);
    } catch {
      Alert.alert("Action failed", "Could not approve the job.");
    } finally {
      setJobBusyId(null);
    }
  };

  const handleReject = async (job: any) => {
    Alert.alert("Reject Job", "Are you sure you want to reject this job?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: () => {
          void (async () => {
            try {
              setJobBusyId(job.id);
              await rejectJob(job);
            } catch {
              Alert.alert("Action failed", "Could not reject the job.");
            } finally {
              setJobBusyId(null);
            }
          })();
        },
      },
    ]);
  };

  const handleBlock = async (user: any) => {
    try {
      setUserBusyId(user.id);
      await blockUser(user);
    } catch {
      Alert.alert("Action failed", "Could not block this user.");
    } finally {
      setUserBusyId(null);
    }
  };

  const handleUnblock = async (user: any) => {
    try {
      setUserBusyId(user.id);
      await unblockUser(user);
    } catch {
      Alert.alert("Action failed", "Could not unblock this user.");
    } finally {
      setUserBusyId(null);
    }
  };

  const handleDeleteUser = (user: any) => {
    Alert.alert(
      "Delete User",
      "Are you sure you want to delete this user and their related data?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                setUserBusyId(user.id);
                await deleteUserData(user);
              } catch {
                Alert.alert("Action failed", "Could not delete this user.");
              } finally {
                setUserBusyId(null);
              }
            })();
          },
        },
      ],
    );
  };

  const renderJobCard = (job: any) => {
    const contractorEmail =
      usersById.get(job.contractorUid || job.contractorId || "")?.email ||
      "Unknown";

    return (
      <View key={job.id} style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardIconWrap}>
            <Ionicons name="briefcase-outline" size={18} color={COLORS.primaryDark} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{job.title || "Untitled job"}</Text>
            <Text style={styles.cardSub}>{job.location || "Location not set"}</Text>
          </View>
          <View style={[styles.statusBadge, styles.pendingBadge]}>
            <Text style={styles.statusBadgeText}>
              {String(job.status || "pending").toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.jobDescription}>
          {job.description || "No description provided."}
        </Text>

        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Contractor Email</Text>
            <Text style={styles.metaValue}>{contractorEmail}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Salary Range</Text>
            <Text style={styles.metaValue}>{job.salaryRange || "Not set"}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Date Posted</Text>
            <Text style={styles.metaValue}>{formatDate(job.createdAt)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Application Deadline</Text>
            <Text style={styles.metaValue}>
              {job.applicationDeadline ? formatDate(job.applicationDeadline) : "Not set"}
            </Text>
          </View>
        </View>

        <View style={styles.skillWrap}>
          {(job.requiredSkills || []).length > 0 ? (
            job.requiredSkills.map((skill: string) => (
              <View key={skill} style={styles.skillChip}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))
          ) : (
            <View style={styles.skillChip}>
              <Text style={styles.skillText}>No skills listed</Text>
            </View>
          )}
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.approveBtn]}
            onPress={() => handleApprove(job)}
            disabled={jobBusyId === job.id}
          >
            <Ionicons name="checkmark" size={16} color="#fff" />
            <Text style={styles.actionText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={() => handleReject(job)}
            disabled={jobBusyId === job.id}
          >
            <Ionicons name="close" size={16} color="#fff" />
            <Text style={styles.actionText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderUserCard = (user: any) => {
    const isBlocked = !!user.blocked;
    const isBusy = userBusyId === user.id;

    return (
      <View key={user.id} style={styles.card}>
        <View style={styles.cardHeaderRow}>
          {user.profileImageUrl ? (
            <Image source={{ uri: user.profileImageUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>{getInitials(user.fullName || user.name || "User")}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{user.fullName || user.name || "Unnamed user"}</Text>
            <Text style={styles.cardSub}>{user.email || "No email"}</Text>
          </View>
          <View style={[styles.statusBadge, isBlocked ? styles.blockedBadge : styles.activeBadge]}>
            <Text style={styles.statusBadgeText}>
              {isBlocked ? "BLOCKED" : "ACTIVE"}
            </Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Role</Text>
            <Text style={styles.metaValue}>{user.role || "unknown"}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Date Joined</Text>
            <Text style={styles.metaValue}>{formatDateTime(user.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          {!isBlocked ? (
            <TouchableOpacity
              style={[styles.actionBtn, styles.blockBtn]}
              onPress={() => handleBlock(user)}
              disabled={isBusy}
            >
              <Ionicons name="close-circle-outline" size={16} color="#fff" />
              <Text style={styles.actionText}>Block</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionBtn, styles.approveBtn]}
              onPress={() => handleUnblock(user)}
              disabled={isBusy}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
              <Text style={styles.actionText}>Unblock</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={() => handleDeleteUser(user)}
            disabled={isBusy}
          >
            <Ionicons name="trash-outline" size={16} color="#fff" />
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!isReady) return null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerKicker}>Admin Dashboard</Text>
            <Text style={styles.headerTitle}>Hello, {adminUsername}</Text>
            <Text style={styles.headerSub}>
              Manage job approvals and user moderation from one place.
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[
                styles.tabChip,
                activeTab === tab.key && styles.tabChipActive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Loading admin data...</Text>
          </View>
        ) : jobList.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={28} color={C.textMuted} />
            <Text style={styles.emptyTitle}>
              {activeTab === "pending"
                ? "No pending jobs"
                : activeTab === "users"
                  ? "No users found"
                  : activeTab === "contractors"
                    ? "No contractors found"
                    : "No blocked users"}
            </Text>
          </View>
        ) : (
          <View style={styles.listWrap}>
            {activeTab === "pending"
              ? jobList.map(renderJobCard)
              : jobList.map(renderUserCard)}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 28 },
  headerCard: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1f2a44",
  },
  headerKicker: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.6,
    marginBottom: 6,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
  },
  headerSub: {
    marginTop: 6,
    color: "#cbd5e1",
    lineHeight: 20,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  logoutText: { color: "#fff", fontWeight: "800" },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 16,
  },
  statCard: {
    ...CARD,
    flex: 1,
    minWidth: "48%",
    borderRadius: 18,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  statValue: {
    color: C.text,
    fontSize: 22,
    fontWeight: "900",
  },
  statLabel: {
    marginTop: 6,
    color: C.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  tabRow: {
    gap: 10,
    paddingVertical: 16,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  tabChipActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  tabText: {
    color: C.textSub,
    fontWeight: "800",
    fontSize: 13,
  },
  tabTextActive: {
    color: "#fff",
  },
  listWrap: {
    gap: 12,
  },
  card: {
    ...CARD,
    marginBottom: 0,
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  cardIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#fef3e7",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primaryDark,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "900", fontSize: 12 },
  cardTitle: {
    color: C.text,
    fontSize: 16,
    fontWeight: "800",
  },
  cardSub: {
    marginTop: 2,
    color: C.textSub,
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  activeBadge: {
    backgroundColor: "#dcfce7",
  },
  blockedBadge: {
    backgroundColor: "#fee2e2",
  },
  pendingBadge: {
    backgroundColor: "#fef3c7",
  },
  statusBadgeText: {
    color: C.text,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  jobDescription: {
    marginTop: 12,
    color: C.textSub,
    lineHeight: 20,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 14,
  },
  metaItem: {
    width: "48%",
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: C.border,
  },
  metaLabel: {
    color: C.textMuted,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  metaValue: {
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
  },
  skillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  skillChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
  },
  skillText: {
    color: "#374151",
    fontSize: 11,
    fontWeight: "700",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  approveBtn: {
    backgroundColor: COLORS.success,
  },
  rejectBtn: {
    backgroundColor: COLORS.error,
  },
  blockBtn: {
    backgroundColor: COLORS.busyText,
  },
  actionText: {
    color: "#fff",
    fontWeight: "800",
  },
  emptyState: {
    padding: 28,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    color: C.text,
    fontSize: 15,
    fontWeight: "800",
  },
});
