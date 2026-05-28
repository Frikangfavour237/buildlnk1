import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { AppNavbar } from "../../components/AppNavbar";
import { AVAILABILITY_OPTIONS } from "../../constants/skills";
import { CARD, COLORS } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { auth } from "../../firebase";
import { useUnreadNotifications } from "../../hooks/useUnreadNotifications";
import { sendMobilisationRequest } from "../../services/mobilisationService";
import { createNotification } from "../../services/notificationService";
import { getProjects } from "../../services/projectService";
import { getWorkers } from "../../services/workerService";

const C = {
  orange: COLORS.primary,
  bg: COLORS.background,
  surface: COLORS.card,
  border: COLORS.border,
  textStrong: COLORS.textPrimary,
  textSub: COLORS.textSecondary,
  textMedium: COLORS.textSecondary,
  textInert: COLORS.textMuted,
  green: COLORS.success,
  yellow: COLORS.busyText,
  red: COLORS.error,
};

export default function FindWorkers() {
  const { currentUser } = useAuth();
  const unreadCount = useUnreadNotifications(currentUser?.uid);
  const [workers, setWorkers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [skill, setSkill] = useState("");
  const [availability, setAvailability] = useState("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/(auth)/sign-in");
        return;
      }

      if (!auth.currentUser) return;
      const workersData = await getWorkers();
      if (!auth.currentUser) return;
      const projectsData = await getProjects(auth.currentUser.uid);
      setWorkers(workersData);
      setProjects(projectsData);
    });

    return unsubscribe;
  }, []);

  const filtered = useMemo(() => {
    return workers.filter((worker) => {
      const workerSkill = String(
        worker.skillCategory || worker.skills?.[0] || "",
      ).toLowerCase();
      const workerName = String(
        worker.fullName || worker.name || "",
      ).toLowerCase();
      const workerLocation = String(worker.location || "").toLowerCase();
      const searchValue = skill.toLowerCase();
      const matchSkill =
        searchValue === "" ||
        workerSkill.includes(searchValue) ||
        workerName.includes(searchValue) ||
        workerLocation.includes(searchValue);
      const matchAvailability =
        availability === "all" || worker.availability === availability;
      return matchSkill && matchAvailability;
    });
  }, [workers, skill, availability]);

  const mobilise = async () => {
    if (!currentUser || !selectedWorker || !selectedProjectId) return;
    const project = projects.find((item) => item.id === selectedProjectId);
    if (!project) {
      Alert.alert("Select a project", "Please choose a project first.");
      return;
    }
    try {
      const mobilisation = await sendMobilisationRequest(
        project.id,
        selectedWorker.id,
        currentUser.uid,
        project.title,
        selectedWorker.fullName || selectedWorker.name,
        currentUser.fullName || currentUser.name || "",
      );
      await createNotification(
        selectedWorker.id,
        "mobilisation_request",
        `${currentUser.fullName || currentUser.name || "A contractor"} sent you a mobilisation request for "${project.title || "Untitled project"}"`,
        mobilisation?.id || null,
      );
      setModalVisible(false);
      Alert.alert("Sent", "Mobilisation request sent successfully.");
    } catch {
      Alert.alert("Error", "Could not send mobilisation request.");
    }
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
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={C.textInert} />
          <TextInput
            style={styles.searchInput}
            value={skill}
            onChangeText={setSkill}
            placeholder="Enter skill"
            placeholderTextColor={C.textInert}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          <TouchableOpacity onPress={() => setAvailability("all")}>
            <View
              style={[styles.pill, availability === "all" && styles.pillActive]}
            >
              <Text
                style={[
                  styles.pillText,
                  availability === "all" && styles.pillTextActive,
                ]}
              >
                All
              </Text>
            </View>
          </TouchableOpacity>
          {AVAILABILITY_OPTIONS.map((item) => (
            <TouchableOpacity key={item} onPress={() => setAvailability(item)}>
              <View
                style={[
                  styles.pill,
                  availability === item && styles.pillActive,
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    availability === item && styles.pillTextActive,
                  ]}
                >
                  {item}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filtered.map((worker) => (
          <View key={worker.id} style={styles.card}>
            <Text style={styles.cardTitle}>
              {worker.fullName || worker.name}
            </Text>
            <Text style={styles.meta}>
              {worker.skillCategory || worker.skills?.[0] || "General Laborer"}
            </Text>
            <Text style={styles.meta}>
              Experience: {worker.experience || 0} years
            </Text>
            <Text style={styles.meta}>
              Location: {worker.location || "Not set"}
            </Text>
            <View
              style={[
                styles.badge,
                worker.availability === "available" && styles.badgeGreen,
                worker.availability === "busy" && styles.badgeYellow,
                worker.availability === "unavailable" && styles.badgeRed,
              ]}
            >
              <Text style={styles.badgeText}>
                {worker.availability || "available"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.mobiliseBtn}
              onPress={() => {
                setSelectedWorker(worker);
                setSelectedProjectId(projects[0]?.id || "");
                setModalVisible(true);
              }}
            >
              <Text style={styles.mobiliseText}>Mobilise</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Project</Text>
            {projects.map((project) => (
              <TouchableOpacity
                key={project.id}
                onPress={() => setSelectedProjectId(project.id)}
                style={[
                  styles.projectOption,
                  selectedProjectId === project.id &&
                    styles.projectOptionActive,
                ]}
              >
                <Text style={styles.projectText}>{project.title}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.modalRow}>
              <TouchableOpacity
                style={styles.modalBtnOutline}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalBtnOutlineText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtn} onPress={mobilise}>
                <Text style={styles.modalBtnText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 24 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    height: 48,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
  },
  searchInput: { flex: 1, color: C.textStrong, fontSize: 15 },
  row: { gap: 8, paddingVertical: 12 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: COLORS.tagBg,
    borderWidth: 0,
  },
  pillActive: { backgroundColor: COLORS.primaryDark },
  pillText: { color: COLORS.tagText, fontWeight: "700" },
  pillTextActive: { color: "#fff" },
  card: { marginTop: 12, ...CARD },
  cardTitle: { color: C.textStrong, fontSize: 16, fontWeight: "600" },
  meta: { color: C.textMuted, marginTop: 4, fontSize: 13 },
  badge: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.availableBg,
    borderWidth: 0,
  },
  badgeGreen: { backgroundColor: COLORS.availableBg },
  badgeYellow: { backgroundColor: COLORS.busyBg },
  badgeRed: { backgroundColor: COLORS.unavailableBg },
  badgeText: {
    color: C.textStrong,
    fontWeight: "800",
    fontSize: 11,
    textTransform: "capitalize",
  },
  mobiliseBtn: {
    marginTop: 14,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  mobiliseText: { color: "#fff", fontWeight: "900" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: C.bg,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    ...CARD,
  },
  modalTitle: {
    color: C.textStrong,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12,
  },
  projectOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
    marginBottom: 8,
  },
  projectOptionActive: {
    borderColor: COLORS.primaryDark,
    backgroundColor: "#fff",
  },
  projectText: { color: C.textStrong, fontWeight: "700" },
  modalRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  modalBtnOutline: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  modalBtnOutlineText: { color: C.textStrong, fontWeight: "800" },
  modalBtn: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalBtnText: { color: "#fff", fontWeight: "900" },
});
