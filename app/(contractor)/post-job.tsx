import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ImageBackground,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { AppNavbar } from "../../components/AppNavbar";
import DatePicker from "../../components/DatePicker";
import { WORKER_SKILLS } from "../../constants/skills";
import { COLORS, INPUT } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { auth } from "../../firebase";
import { useUnreadNotifications } from "../../hooks/useUnreadNotifications";
import { createProject } from "../../services/projectService";

const C = {
  orange: COLORS.primary,
  bg: COLORS.background,
  surface: COLORS.card,
  border: COLORS.border,
  textStrong: COLORS.textPrimary,
  textSub: COLORS.textSecondary,
  textMedium: COLORS.textSecondary,
};

export default function PostJob() {
  const { currentUser } = useAuth();
  const unreadCount = useUnreadNotifications(currentUser?.uid);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [workersNeeded, setWorkersNeeded] = useState("");
  const [duration, setDuration] = useState("");
  const [startDate, setStartDate] = useState("");
  const [applicationDeadline, setApplicationDeadline] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [siteImageUri, setSiteImageUri] = useState<string | null>(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleSkill = (skill: string) => {
    setRequiredSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  const convertToBase64 = async (uri: string): Promise<string | null> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return await new Promise<string | null>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () =>
          resolve(typeof reader.result === "string" ? reader.result : null);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Image conversion error:", error);
      return null;
    }
  };

  const formatDateLabel = (date: string) => {
    const parsed = new Date(date);
    return !date || Number.isNaN(parsed.getTime())
      ? ""
      : parsed.toLocaleDateString([], {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
  };

  const submitJob = async (siteImageBase64: string | null) => {
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      await createProject(auth.currentUser.uid, {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        requiredSkills,
        workersNeeded: parseInt(workersNeeded, 10) || 1,
        duration: duration.trim(),
        startDate,
        applicationDeadline,
        salaryRange: salaryRange.trim(),
        siteImage: siteImageBase64,
        contractorName:
          currentUser?.fullName ||
          currentUser?.name ||
          auth.currentUser.displayName ||
          "",
        contractorPhoto: currentUser?.profileImageUrl || "",
      });
      Alert.alert("Success", "Job posted successfully!");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to post job. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const pickSiteImage = async (source: "camera" | "library") => {
    try {
      let result;

      if (source === "camera") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission needed",
            "Camera access is required to take photos.",
          );
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [16, 9],
          quality: 0.7,
        });
      } else {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission needed",
            "Photo library access is required.",
          );
          return;
        }

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [16, 9],
          quality: 0.7,
        });
      }

      if (!result.canceled) {
        setSiteImageUri(result.assets[0].uri);
      }
    } finally {
      setShowImageOptions(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/(auth)/sign-in");
      }
    });
    return unsubscribe;
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !location.trim()) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    if (!auth.currentUser) {
      router.replace("/(auth)/sign-in");
      return;
    }

    let siteImageBase64 = null;
    if (siteImageUri) {
      siteImageBase64 = await convertToBase64(siteImageUri);
      if (!siteImageBase64) {
        Alert.alert(
          "Image Upload Notice",
          "Could not upload the site image. The job can still be posted without it.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Post Without Image",
              onPress: () => {
                void submitJob(null);
              },
            },
          ],
        );
        return;
      }
    }

    await submitJob(siteImageBase64);
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#E8620A" />
            <Text style={styles.loadingText}>Posting...</Text>
          </View>
        </View>
      )}
      <AppNavbar
        userRole="contractor"
        userName={currentUser?.fullName || currentUser?.name || "Contractor"}
        profileImageUrl={currentUser?.profileImageUrl || null}
        unreadCount={unreadCount}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {siteImageUri ? (
          <View style={styles.imagePicker}>
            <ImageBackground
              source={{ uri: siteImageUri }}
              style={styles.imagePreview}
              imageStyle={styles.imagePreviewImage}
            >
              <TouchableOpacity
                style={[styles.imageAction, styles.imageCloseAction]}
                onPress={() => setSiteImageUri(null)}
              >
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.imageAction, styles.imageCameraAction]}
                onPress={() => setShowImageOptions(true)}
              >
                <Ionicons name="camera-outline" size={16} color="#fff" />
              </TouchableOpacity>
            </ImageBackground>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.imagePicker}
            activeOpacity={0.85}
            onPress={() => setShowImageOptions(true)}
          >
            <View style={styles.imageEmptyState}>
              <Ionicons name="image-outline" size={40} color="#9ca3af" />
              <Text style={styles.imageEmptyTitle}>Add Site Photo</Text>
              <Text style={styles.imageEmptySubtitle}>Tap to upload</Text>
            </View>
          </TouchableOpacity>
        )}

        <Text style={styles.label}>Project Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Project title"
        />

        <Text style={styles.label}>Project Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the job"
        />

        <Text style={styles.label}>Project Location</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Location"
        />

        <Text style={styles.label}>Required Skills</Text>
        <View style={styles.skillsWrap}>
          {WORKER_SKILLS.map((skill) => (
            <TouchableOpacity key={skill} onPress={() => toggleSkill(skill)}>
              <View
                style={[
                  styles.skillChip,
                  requiredSkills.includes(skill) && styles.skillChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.skillText,
                    requiredSkills.includes(skill) && styles.skillTextActive,
                  ]}
                >
                  {skill}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Workers Needed</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={workersNeeded}
          onChangeText={setWorkersNeeded}
          placeholder="5"
        />

        <Text style={styles.label}>Duration</Text>
        <TextInput
          style={styles.input}
          value={duration}
          onChangeText={setDuration}
          placeholder="3 months"
        />

        <Text style={styles.label}>Start Date</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowStartPicker(true)}
        >
          <Text style={startDate ? styles.dateText : styles.datePlaceholder}>
            {startDate ? formatDateLabel(startDate) : "Select start date"}
          </Text>
          <Ionicons name="calendar-outline" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        {showStartPicker ? (
          <DatePicker
            value={startDate}
            onChange={(event, date) =>
              setStartDate(date ? date.toISOString().split("T")[0] : "")
            }
          />
        ) : null}

        <Text style={styles.label}>Latest Application Date</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowDeadlinePicker(true)}
        >
          <Text
            style={
              applicationDeadline
                ? styles.dateText
                : styles.datePlaceholder
            }
          >
            {applicationDeadline
              ? formatDateLabel(applicationDeadline)
              : "Select application deadline"}
          </Text>
          <Ionicons name="calendar-outline" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        {showDeadlinePicker ? (
          <DatePicker
            value={applicationDeadline}
            onChange={(event, date) =>
              setApplicationDeadline(date ? date.toISOString().split("T")[0] : "")
            }
            minimumDate={new Date()}
          />
        ) : null}

        <Text style={styles.label}>Salary Range</Text>
        <TextInput
          style={styles.input}
          value={salaryRange}
          onChangeText={setSalaryRange}
          placeholder="800k - 1.2M FCFA"
        />

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitText}>
            {loading ? "Posting..." : "Submit"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showImageOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowImageOptions(false)}
        >
          <View style={styles.modalPanel}>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => pickSiteImage("library")}
            >
              <Ionicons name="images-outline" size={20} color="#1a2332" />
              <Text style={styles.modalOptionText}>Choose from Library</Text>
            </TouchableOpacity>
            <View style={styles.modalDivider} />
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => pickSiteImage("camera")}
            >
              <Ionicons name="camera-outline" size={20} color="#1a2332" />
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.modalCancelWrap}
            onPress={() => setShowImageOptions(false)}
          >
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  loadingCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#1a1a1a",
    fontWeight: "600",
  },
  content: { padding: 16, paddingBottom: 24 },
  imagePicker: {
    height: 200,
    width: "100%",
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    overflow: "hidden",
    marginBottom: 8,
  },
  imagePreview: {
    flex: 1,
    justifyContent: "flex-end",
  },
  imagePreviewImage: {
    borderRadius: 12,
  },
  imageEmptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  imageEmptyTitle: {
    color: "#9ca3af",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 2,
  },
  imageEmptySubtitle: {
    color: "#d1d5db",
    fontSize: 13,
  },
  imageAction: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(17, 24, 39, 0.92)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  imageCloseAction: {
    top: 12,
    right: 12,
  },
  imageCameraAction: {
    right: 12,
    bottom: 12,
  },
  label: {
    color: C.textMedium,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 8,
    fontSize: 13,
  },
  input: { ...INPUT },
  dateInput: {
    ...INPUT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: {
    color: C.textStrong,
    fontSize: 15,
  },
  datePlaceholder: {
    color: COLORS.textMuted,
    fontSize: 15,
  },
  textArea: { minHeight: 110, textAlignVertical: "top" },
  skillsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: COLORS.tagBg,
    borderWidth: 0,
  },
  skillChipActive: { backgroundColor: COLORS.primaryDark },
  skillText: { color: COLORS.tagText, fontWeight: "700" },
  skillTextActive: { color: "#fff" },
  submitBtn: {
    marginTop: 18,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitText: { color: "#fff", fontWeight: "900" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    justifyContent: "center",
    padding: 24,
  },
  modalPanel: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: "#fff",
  },
  modalOptionText: {
    color: "#1a1a1a",
    fontSize: 15,
    fontWeight: "600",
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  modalCancelWrap: {
    alignItems: "center",
    paddingVertical: 16,
  },
  modalCancelText: {
    color: "#ef4444",
    fontSize: 15,
    fontWeight: "700",
  },
});
