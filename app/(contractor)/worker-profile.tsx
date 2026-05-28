import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { auth } from "../../firebase";
import { getOrCreateConversation } from "../../services/messageService";
import {
  getWorkerProfile,
  incrementWorkerProfileViews,
} from "../../services/workerService";
import { getWorkerPortfolio } from "../../services/storageService";

export default function WorkerProfilePublic() {
  const { currentUser } = useAuth();
  const params = useLocalSearchParams<{
    workerId?: string;
    workerName?: string;
  }>();
  const [profile, setProfile] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const lastViewedWorkerId = useRef<string | null>(null);

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
      if (!params.workerId) return;
      const workerProfile = await getWorkerProfile(params.workerId);
      if (!active) return;
      setProfile(workerProfile);
      const portfolioItems = await getWorkerPortfolio(params.workerId);
      if (!active) return;
      setPortfolio(portfolioItems);
    })();
    return () => {
      active = false;
    };
  }, [params.workerId]);

  useEffect(() => {
    if (!currentUser?.uid || !params.workerId) return;
    if (currentUser.uid === params.workerId) return;
    if (lastViewedWorkerId.current === params.workerId) return;

    lastViewedWorkerId.current = params.workerId;
    void incrementWorkerProfileViews(params.workerId);
  }, [currentUser?.uid, params.workerId]);

  const messageWorker = async () => {
    if (!currentUser?.uid || !params.workerId) return;
    const conversationId = await getOrCreateConversation(
      currentUser.uid,
      params.workerId,
      profile?.fullName || params.workerName || "Worker",
      profile?.profileImageUrl || "",
      currentUser.fullName || currentUser.name || "Contractor",
      currentUser.profileImageUrl || "",
    );

    router.push({
      pathname: "/(contractor)/chat",
      params: {
        conversationId,
        otherName: profile?.fullName || params.workerName || "Worker",
        otherPhoto: profile?.profileImageUrl || "",
        otherUid: params.workerId,
      },
    } as never);
  };

  const skills = profile?.skills || [];
  const certifications = profile?.certifications || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={COLORS.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Worker Profile</Text>
        <TouchableOpacity onPress={messageWorker} style={styles.messageBtn}>
          <Ionicons name="chatbubble-outline" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          {profile?.profileImageUrl ? (
            <Image source={{ uri: profile.profileImageUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Ionicons name="person-outline" size={36} color="#ffffff" />
            </View>
          )}
          <Text style={styles.name}>
            {profile?.fullName || params.workerName || "Worker"}
          </Text>
          <Text style={styles.sub}>
            {profile?.availability || "available"} • {profile?.location || "Location not set"}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Bio</Text>
          <Text style={styles.body}>
            {profile?.bio || "No bio provided."}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.tags}>
            {skills.length > 0 ? (
              skills.map((skill: string) => (
                <View key={skill} style={styles.tag}>
                  <Text style={styles.tagText}>{skill}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.body}>No skills listed.</Text>
            )}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Experience</Text>
          <Text style={styles.body}>
            {profile?.experience || 0} years of experience
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          <View style={styles.tags}>
            {certifications.length > 0 ? (
              certifications.map((item: string) => (
                <View key={item} style={styles.tag}>
                  <Text style={styles.tagText}>{item}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.body}>No certifications listed.</Text>
            )}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Portfolio</Text>
          {portfolio.length > 0 ? (
            <View style={styles.portfolioGrid}>
              {portfolio.map((item) => (
                <View key={item.id} style={styles.portfolioItem}>
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.portfolioImage}
                    />
                  ) : (
                    <View style={styles.portfolioPlaceholder}>
                      <Ionicons name="images-outline" size={24} color="#fff" />
                    </View>
                  )}
                  <Text style={styles.portfolioTitle} numberOfLines={1}>
                    {item.projectName || "Untitled project"}
                  </Text>
                  <Text style={styles.portfolioSub} numberOfLines={2}>
                    {item.description || "No description provided."}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.body}>No portfolio items yet.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "900",
  },
  messageBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    marginBottom: 12,
  },
  avatarFallback: {
    width: 92,
    height: 92,
    borderRadius: 46,
    marginBottom: 12,
    backgroundColor: COLORS.primaryDark,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
  },
  sub: {
    marginTop: 6,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  sectionTitle: {
    alignSelf: "flex-start",
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 10,
  },
  body: {
    alignSelf: "flex-start",
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  tags: {
    alignSelf: "stretch",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
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
  portfolioGrid: {
    alignSelf: "stretch",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  portfolioItem: {
    width: "48%",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  portfolioImage: {
    width: "100%",
    height: 130,
    backgroundColor: "#e5e7eb",
  },
  portfolioPlaceholder: {
    width: "100%",
    height: 130,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryDark,
  },
  portfolioTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: "800",
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  portfolioSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    paddingHorizontal: 10,
    paddingTop: 4,
    paddingBottom: 10,
  },
});
