import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AVAILABILITY_OPTIONS, WORKER_SKILLS } from "../../constants/skills";
import { COLORS, INPUT } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import { logoutUser } from "../../services/authService";
import { uploadProfilePicture } from "../../services/storageService";
import {
    createWorkerProfile,
    getWorkerProfile,
} from "../../services/workerService";

const C = {
  orange: COLORS.primary,
  bg: COLORS.background,
  surface: COLORS.card,
  border: COLORS.border,
  textStrong: COLORS.textPrimary,
  textSub: COLORS.textSecondary,
  textMedium: COLORS.textSecondary,
  textSecondary: COLORS.textSecondary,
};

export default function WorkerProfile() {
  const insets = useSafeAreaInsets();
  const { currentUser } = useAuth();
  const [fullName, setFullName] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    WORKER_SKILLS[0],
  ]);
  const [experience, setExperience] = useState("");
  const [certificationsInput, setCertificationsInput] = useState("");
  const [certifications, setCertifications] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("available");
  const [profileViews, setProfileViews] = useState(0);
  const [uploading, setUploading] = useState(false);

  const profileCompletion = useMemo(() => {
    const filled = [
      fullName,
      bio,
      selectedSkills.length > 0,
      experience,
      location,
      profileImageUrl,
    ].filter(Boolean).length;
    return Math.round((filled / 6) * 100);
  }, [fullName, bio, selectedSkills, experience, location, profileImageUrl]);

  useEffect(() => {
    if (!currentUser?.uid) return;

    setFullName(currentUser.fullName || currentUser.name || "");
    setProfileImageUrl(currentUser.profileImageUrl || null);

    let active = true;
    const workerRef = doc(db, "workers", currentUser.uid);
    const unsubscribeWorker = onSnapshot(workerRef, (snapshot) => {
      if (!active) return;
      setProfileViews(snapshot.data()?.profileViews || 0);
    });

    (async () => {
      const workerProfile: any = await getWorkerProfile(currentUser.uid);
      if (!active || !workerProfile) return;
      setFullName(
        workerProfile.fullName ||
          currentUser.fullName ||
          currentUser.name ||
          "",
      );
      setBio(workerProfile.bio || "");
      setSelectedSkills(
        workerProfile.skills?.length
          ? workerProfile.skills
          : [WORKER_SKILLS[0]],
      );
      setExperience(String(workerProfile.experience || ""));
      setCertifications(workerProfile.certifications || []);
      setLocation(workerProfile.location || "");
      setAvailability(workerProfile.availability || "available");
      setProfileViews(workerProfile.profileViews || 0);
      setProfileImageUrl(
        workerProfile.profileImageUrl ||
          currentUser.profileImageUrl ||
          null,
      );
    })();

    return () => {
      active = false;
      unsubscribeWorker();
    };
  }, [currentUser?.uid]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((item) => item !== skill)
        : [...prev, skill],
    );
  };

  const addCertification = () => {
    const trimmed = certificationsInput.trim();
    if (!trimmed) return;
    setCertifications((prev) => [...prev, trimmed]);
    setCertificationsInput("");
  };

  const removeCertification = (value: string) => {
    setCertifications((prev) => prev.filter((item) => item !== value));
  };

  const pickProfilePicture = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Please allow photo access to upload a profile image.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    const uri = result.assets[0].uri;
    if (!currentUser) return;
    try {
      setUploading(true);
      const url = await uploadProfilePicture(uri);
      if (!url) {
        throw new Error("Upload failed");
      }
      setProfileImageUrl(url);
      Alert.alert("Success", "Profile picture updated!");
    } catch {
      Alert.alert(
        "Upload Failed",
        "Unable to upload image at the moment. Please check your internet connection and try again.",
        [{ text: "OK" }],
      );
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!currentUser) return;
    try {
      await createWorkerProfile(currentUser.uid, {
        fullName,
        bio,
        skills: selectedSkills,
        experience: Number(experience || 0),
        certifications,
        location,
        availability,
        profileImageUrl,
      });
      await setDoc(
        doc(db, "users", currentUser.uid),
        {
          fullName,
          role: "worker",
          profileImageUrl,
        },
        { merge: true },
      );
      Alert.alert("Saved", "Your worker profile has been updated.");
    } catch {
      Alert.alert("Error", "Could not save your profile.");
    }
  };

  const signOut = async () => {
    router.replace("/(auth)/sign-in");
    const result = await logoutUser();
    if (!result.success) {
      Alert.alert("Error", result.error || "Could not sign out.");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {uploading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#E8620A" />
            <Text style={styles.loadingText}>Uploading...</Text>
          </View>
        </View>
      )}
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View style={styles.headerCard}>
          <View style={styles.profileImageWrapper}>
            {profileImageUrl ? (
              <Image
                source={{ uri: profileImageUrl }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Ionicons name="person-outline" size={44} color="#fff" />
              </View>
            )}
            <TouchableOpacity
              style={styles.avatarButton}
              onPress={pickProfilePicture}
            >
              <Ionicons name="camera-outline" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Worker Profile</Text>
            <Text style={styles.sub}>Build a stronger contractor profile.</Text>
            <Text style={styles.completionText}>
              {profileCompletion}% complete
            </Text>
            <Text style={styles.viewsText}>
              Profile views: {profileViews}
            </Text>
          </View>
        </View>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Full name"
        />

        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={bio}
          onChangeText={setBio}
          placeholder="Tell contractors what makes you the right choice."
          multiline
        />

        <Text style={styles.label}>Skills</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {WORKER_SKILLS.map((skill) => (
            <TouchableOpacity key={skill} onPress={() => toggleSkill(skill)}>
              <View
                style={[
                  styles.chip,
                  selectedSkills.includes(skill) && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedSkills.includes(skill) && styles.chipTextActive,
                  ]}
                >
                  {skill}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Years of Experience</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={experience}
          onChangeText={setExperience}
          placeholder="3"
        />

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="City, Country"
        />

        <Text style={styles.label}>Certifications</Text>
        <View style={styles.certRow}>
          <TextInput
            style={[styles.input, styles.certInput]}
            value={certificationsInput}
            onChangeText={setCertificationsInput}
            placeholder="Add certification"
          />
          <TouchableOpacity
            style={styles.certAddBtn}
            onPress={addCertification}
          >
            <Text style={styles.certAddText}>Add</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.certList}>
          {certifications.map((item) => (
            <View key={item} style={styles.certTag}>
              <Text style={styles.certText}>{item}</Text>
              <TouchableOpacity onPress={() => removeCertification(item)}>
                <Ionicons name="close-circle" size={18} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <Text style={styles.label}>Availability</Text>
        <View style={styles.row}>
          {AVAILABILITY_OPTIONS.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setAvailability(item)}
              style={[
                styles.option,
                availability === item && styles.optionActive,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  availability === item && styles.optionTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={save}
          disabled={uploading}
        >
          <Text style={styles.saveText}>
            {uploading ? "Saving..." : "Save Profile"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
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
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 18,
    padding: 18,
    borderRadius: 18,
    backgroundColor: COLORS.primaryDark,
  },
  profileImageWrapper: { position: "relative" },
  profileImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: "#fff",
  },
  profilePlaceholder: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: C.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarButton: {
    position: "absolute",
    right: -6,
    bottom: -6,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  headerText: { flex: 1 },
  title: { color: "#fff", fontSize: 24, fontWeight: "900" },
  sub: { color: "#e5e7eb", marginTop: 4, lineHeight: 20 },
  completionText: { color: "#d1d5db", marginTop: 8, fontWeight: "700" },
  viewsText: { color: "#cbd5e1", marginTop: 4, fontWeight: "600" },
  label: {
    color: C.textMedium,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 8,
    fontSize: 13,
  },
  input: { ...INPUT },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  chips: { gap: 8, paddingBottom: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  chipText: { color: "#374151", fontWeight: "700" },
  chipTextActive: { color: "#fff" },
  row: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
  },
  optionActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  optionText: { color: "#374151", fontWeight: "700" },
  optionTextActive: { color: "#fff" },
  certRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  certInput: { flex: 1 },
  certAddBtn: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  certAddText: { color: "#fff", fontWeight: "800" },
  certList: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  certTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  certText: { color: C.textStrong, fontWeight: "700" },
  saveBtn: {
    marginTop: 18,
    backgroundColor: COLORS.primaryDark,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "900" },
  signOutBtn: {
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fff",
    paddingVertical: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  signOutText: { color: "#EF4444", fontWeight: "800" },
});
