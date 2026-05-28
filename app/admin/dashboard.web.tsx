import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Platform,
  View,
} from "react-native";
import WebNavbar from "../../components/WebNavbar";
import { COLORS } from "../../constants/theme";
import { db } from "../../firebase";
import {
  approveJob,
  blockUser,
  deleteUserData,
  rejectJob,
  unblockUser,
} from "../../services/adminService";

const NAVY = "#0f172a";
const ORANGE = "#E8620A";
const WHITE = "#ffffff";
const LIGHT = "#f8fafc";
const TEXT = "#1e293b";
const MUTED = "#64748b";
const BORDER = "#e2e8f0";

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
    ? date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
    : "Date not set";
};

const formatDateTime = (value: any) => formatDate(value);

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "?";

function StatCard({ label, value }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function AdminDashboardWebPage() {
  const isWeb = Platform.OS === "web";
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

    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() })));
      setLoading(false);
    });

    const unsubscribeJobs = onSnapshot(collection(db, "jobs"), (snapshot) => {
      setJobs(snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() })));
      setLoading(false);
    });

    return () => {
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
  const blockedUsers = useMemo(() => users.filter((user) => user.blocked), [users]);

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
      usersById.get(job.contractorUid || job.contractorId || "")?.email || "Unknown";

    return (
      <View key={job.id} style={styles.listCard}>
        <View style={styles.cardHeader}>
          <View style={styles.iconWrap}>
            <Ionicons name="briefcase-outline" size={18} color={ORANGE} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{job.title || "Untitled job"}</Text>
            <Text style={styles.cardSub}>{job.location || "Location not set"}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {String(job.status || "pending").toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.cardBody}>{job.description || "No description provided."}</Text>

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

        <View style={styles.actionRow}>
          <Pressable
            style={[styles.actionBtn, styles.approveBtn]}
            onPress={() => handleApprove(job)}
            disabled={jobBusyId === job.id}
          >
            <Text style={styles.actionText}>Approve</Text>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={() => handleReject(job)}
            disabled={jobBusyId === job.id}
          >
            <Text style={styles.actionText}>Reject</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderUserCard = (user: any) => {
    const isBlocked = !!user.blocked;
    const isBusy = userBusyId === user.id;

    return (
      <View key={user.id} style={styles.listCard}>
        <View style={styles.cardHeader}>
          {user.profileImageUrl ? (
            <Image source={{ uri: user.profileImageUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>
                {getInitials(user.fullName || user.name || "User")}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{user.fullName || user.name || "Unnamed user"}</Text>
            <Text style={styles.cardSub}>{user.email || "No email"}</Text>
          </View>
          <View style={[styles.statusBadge, isBlocked ? styles.blockedBadge : styles.activeBadge]}>
            <Text style={styles.statusText}>{isBlocked ? "BLOCKED" : "ACTIVE"}</Text>
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
            <Pressable
              style={[styles.actionBtn, styles.blockBtn]}
              onPress={() => handleBlock(user)}
              disabled={isBusy}
            >
              <Text style={styles.actionText}>Block</Text>
            </Pressable>
          ) : (
            <Pressable
              style={[styles.actionBtn, styles.approveBtn]}
              onPress={() => handleUnblock(user)}
              disabled={isBusy}
            >
              <Text style={styles.actionText}>Unblock</Text>
            </Pressable>
          )}
          <Pressable
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={() => handleDeleteUser(user)}
            disabled={isBusy}
          >
            <Text style={styles.actionText}>Delete</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  if (!isReady) return null;

  return (
    <View
      style={[
        styles.page,
        { minHeight: isWeb ? "100vh" : "100%" },
      ]}
    >
      <WebNavbar />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: isWeb ? 80 : 20, paddingBottom: 60 },
        ]}
        showsVerticalScrollIndicator
      >
        <View style={styles.centerWrap}>
          <View style={styles.contentWrap}>
            <View style={styles.heroSection}>
              <View style={styles.heroCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.heroKicker}>Admin Dashboard</Text>
                  <Text style={styles.heroTitle}>Hello, {adminUsername}</Text>
                  <Text style={styles.heroSub}>
                    Manage job approvals and user moderation from one clean workspace.
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.statsBand}>
              <View style={styles.statsInner}>
                {stats.map((stat) => (
                  <StatCard key={stat.label} label={stat.label} value={stat.value} />
                ))}
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 24 }}
              contentContainerStyle={styles.tabScrollContent}
            >
              <View style={styles.tabRow}>
                {TABS.map((tab) => (
                  <Pressable
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
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {loading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Loading admin data...</Text>
              </View>
            ) : jobList.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={28} color={MUTED} />
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
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    width: "100%",
    flex: 1,
    backgroundColor: LIGHT,
  },
  scrollContent: {
    width: "100%",
  },
  centerWrap: {
    width: "100%",
  },
  contentWrap: {
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: Platform.OS === "web" ? 40 : 16,
  },
  heroSection: {
    paddingTop: 32,
  },
  heroCard: {
    flexDirection: "row",
    gap: 18,
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: 24,
    borderRadius: 16,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },
  heroKicker: {
    color: ORANGE,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  heroTitle: {
    color: TEXT,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "900",
  },
  heroSub: {
    marginTop: 10,
    color: MUTED,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 720,
  },
  statsBand: {
    width: "100%",
    marginTop: 24,
  },
  statsInner: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  statCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 18,
  },
  statValue: {
    color: ORANGE,
    fontSize: 28,
    fontWeight: "900",
  },
  statLabel: {
    marginTop: 6,
    color: MUTED,
    fontSize: 13,
    fontWeight: "700",
  },
  tabScrollContent: {
    paddingBottom: 4,
  },
  tabRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 20,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },
  tabChipActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  tabText: {
    color: MUTED,
    fontSize: 13,
    fontWeight: "800",
  },
  tabTextActive: {
    color: WHITE,
  },
  listWrap: {
    gap: 14,
  },
  listCard: {
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#fff7ed",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: "900",
  },
  cardTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: "800",
  },
  cardSub: {
    marginTop: 2,
    color: MUTED,
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: LIGHT,
  },
  activeBadge: {
    backgroundColor: "#dcfce7",
  },
  blockedBadge: {
    backgroundColor: "#fee2e2",
  },
  statusText: {
    color: TEXT,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  cardBody: {
    marginTop: 12,
    color: MUTED,
    lineHeight: 22,
  },
  metaGrid: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 14,
  },
  metaItem: {
    flex: 1,
    minWidth: 220,
    padding: 12,
    borderRadius: 12,
    backgroundColor: LIGHT,
    borderWidth: 1,
    borderColor: BORDER,
  },
  metaLabel: {
    color: MUTED,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  metaValue: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "700",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
    color: WHITE,
    fontWeight: "800",
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
  },
});
