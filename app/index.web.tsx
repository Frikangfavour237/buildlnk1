import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { collection, getDocs, query, where } from "firebase/firestore";
import WebNavbar from "../components/WebNavbar";
import { db } from "../firebase";

const NAVY = "#0f172a";
const ORANGE = "#E8620A";
const WHITE = "#ffffff";
const LIGHT = "#f8fafc";
const TEXT = "#1e293b";
const MUTED = "#64748b";
const BORDER = "#e2e8f0";

const steps = [
  {
    icon: "person-add-outline",
    number: "01",
    title: "Create a profile",
    text: "Set up your work history, skills, and role in a few minutes.",
  },
  {
    icon: "search-outline",
    number: "02",
    title: "Find the right match",
    text: "Browse jobs or review skilled workers without the clutter.",
  },
  {
    icon: "hammer-outline",
    number: "03",
    title: "Get to work",
    text: "Hire, get hired, and keep every project moving forward.",
  },
];

const features = [
  {
    icon: "briefcase-outline",
    title: "Job listings",
    text: "Simple posting and browsing for construction work.",
  },
  {
    icon: "people-outline",
    title: "Worker profiles",
    text: "Clear profiles that make hiring decisions easier.",
  },
  {
    icon: "chatbubble-ellipses-outline",
    title: "Direct messaging",
    text: "Keep hiring conversations in one place.",
  },
  {
    icon: "shield-checkmark-outline",
    title: "Trusted workflows",
    text: "Built to support real jobs, real teams, and real sites.",
  },
];

function SectionInner({ children, style }) {
  return <View style={[styles.inner, style]}>{children}</View>;
}

function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function ActionButton({ label, variant = "primary", onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, variant === "secondary" && styles.buttonSecondary]}
    >
      <Text
        style={[
          styles.buttonText,
          variant === "secondary" && styles.buttonTextSecondary,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function WebLandingPage() {
  const [stats, setStats] = useState({
    jobs: 0,
    workers: 0,
    contractors: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const jobsSnap = await getDocs(
          query(collection(db, "jobs"), where("status", "==", "active")),
        );

        const usersSnap = await getDocs(collection(db, "users"));
        const allUsers = usersSnap.docs.map((d) => d.data());

        const workers = allUsers.filter((u) => u.role === "worker").length;
        const contractors = allUsers.filter((u) => u.role === "contractor").length;

        setStats({
          jobs: jobsSnap.size,
          workers,
          contractors,
        });
      } catch (e) {
        console.log("Stats fetch error:", e.message);
      }
    };

    void fetchStats();
  }, []);

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.pageContent}
      showsVerticalScrollIndicator={false}
    >
      <WebNavbar />

      <View style={styles.heroSection}>
        <SectionInner style={styles.heroInner}>
          <Image
            source={require("../assets/images/build logo1.png")}
            style={styles.heroLogo}
            resizeMode="contain"
          />
          <Text style={styles.heroTitle}>Connect. Build. Grow.</Text>
          <Text style={styles.heroSubtitle}>
            Cameroon&apos;s construction workforce marketplace. Find skilled workers
            or get hired today.
          </Text>
          <View style={styles.heroActions}>
            <ActionButton label="Find Work" onPress={() => router.push("/login")} />
            <ActionButton
              label="Post a Job"
              variant="secondary"
              onPress={() => router.push("/login")}
            />
          </View>
          <View style={styles.scrollHint}>
            <Ionicons name="chevron-down" size={26} color="#ffffff" />
          </View>
        </SectionInner>
      </View>

      <View style={styles.whiteSection}>
        <SectionInner style={styles.sectionSpacing}>
          <Text style={styles.eyebrow}>How It Works</Text>
          <Text style={styles.sectionTitle}>Simple. Fast. Effective.</Text>
          <View style={styles.threeGrid}>
            {steps.map((step) => (
              <Card key={step.title}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>{step.number}</Text>
                </View>
                <View style={styles.cardIcon}>
                  <Ionicons name={step.icon as any} size={20} color={ORANGE} />
                </View>
                <Text style={styles.cardTitle}>{step.title}</Text>
                <Text style={styles.cardText}>{step.text}</Text>
              </Card>
            ))}
          </View>
        </SectionInner>
      </View>

      <View style={styles.lightSection}>
        <SectionInner style={styles.sectionSpacing}>
          <Text style={styles.eyebrow}>Features</Text>
          <Text style={styles.sectionTitle}>Everything in one clean place.</Text>
          <View style={styles.featureGrid}>
            {features.map((feature) => (
              <Card key={feature.title}>
                <View style={styles.featureIcon}>
                  <Ionicons name={feature.icon as any} size={20} color={WHITE} />
                </View>
                <Text style={styles.cardTitle}>{feature.title}</Text>
                <Text style={styles.cardText}>{feature.text}</Text>
              </Card>
            ))}
          </View>
        </SectionInner>
      </View>

      <View style={styles.statsSection}>
        <SectionInner style={styles.statsInner}>
          {[
            { value: `${stats.jobs}+`, label: "Jobs posted" },
            { value: `${stats.workers}+`, label: "Workers on the platform" },
            { value: `${stats.contractors}+`, label: "Contractors using BuildIn" },
          ].map((stat) => (
            <View key={stat.label} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </SectionInner>
      </View>

      <View style={styles.whiteSection}>
        <SectionInner style={styles.sectionSpacing}>
          <View style={styles.aboutGrid}>
            <View style={styles.aboutTextColumn}>
              <Text style={styles.eyebrow}>About</Text>
              <Text style={styles.aboutTitle}>Built for Cameroon&apos;s construction workforce.</Text>
              <Text style={styles.aboutText}>
                BuildIn connects skilled construction workers with contractors and
                project managers across the country. The platform keeps the focus on
                useful work, clear communication, and a simple path from posting to
                hiring.
              </Text>
            </View>

            <Card style={styles.aboutCard}>
              <Text style={styles.aboutCardTitle}>Our mission</Text>
              <Text style={styles.aboutCardText}>
                Modernize construction hiring in Cameroon with a marketplace that
                feels straightforward, trustworthy, and easy to use.
              </Text>
              <View style={styles.aboutDivider} />
              <Text style={styles.aboutCardMeta}>
                Built for workers, contractors, and the teams that keep sites moving.
              </Text>
            </Card>
          </View>
        </SectionInner>
      </View>

      <View style={styles.footerSection}>
        <SectionInner style={styles.footerInner}>
          <View style={styles.footerTop}>
            <View style={styles.footerBrand}>
              <Image
                source={require("../assets/images/build logo1.png")}
                style={styles.footerLogo}
                resizeMode="contain"
              />
              <View>
                <Text style={styles.footerBrandText}>BuildIn</Text>
                <Text style={styles.footerTagline}>
                  Cameroon&apos;s construction workforce marketplace.
                </Text>
              </View>
            </View>

            <View style={styles.footerLinks}>
              <Text style={styles.footerLink} onPress={() => router.push("/")}>
                Home
              </Text>
              <Text style={styles.footerLink} onPress={() => router.push("/about")}>
                About
              </Text>
              <Text style={styles.footerLink} onPress={() => router.push("/login")}>
                Login
              </Text>
              <Text style={styles.footerLink} onPress={() => router.push("/sign-up")}>
                Sign Up
              </Text>
            </View>
          </View>

          <View style={styles.footerBottom}>
            <Text style={styles.footerMeta}>© 2026 BuildIn. All rights reserved.</Text>
            <Text style={styles.footerMeta}>Designed for a cleaner web experience.</Text>
          </View>
        </SectionInner>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    width: "100%",
    minHeight: "100vh",
    backgroundColor: NAVY,
  },
  pageContent: {
    width: "100%",
  },
  inner: {
    width: "100%",
    maxWidth: 1200,
    marginHorizontal: "auto",
    paddingHorizontal: 60,
  },
  heroSection: {
    width: "100%",
    backgroundColor: NAVY,
  },
  heroInner: {
    minHeight: "100vh",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 64,
    paddingBottom: 80,
  },
  heroLogo: {
    width: 80,
    height: 80,
    marginBottom: 28,
  },
  heroTitle: {
    color: WHITE,
    fontSize: 64,
    lineHeight: 70,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -1,
  },
  heroSubtitle: {
    marginTop: 18,
    maxWidth: 560,
    color: "#94a3b8",
    fontSize: 20,
    lineHeight: 30,
    textAlign: "center",
  },
  heroActions: {
    flexDirection: "row",
    gap: 16,
    marginTop: 36,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  button: {
    minWidth: 180,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 8,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: WHITE,
  },
  buttonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: "800",
  },
  buttonTextSecondary: {
    color: WHITE,
  },
  scrollHint: {
    position: "absolute",
    bottom: 28,
    alignSelf: "center",
  },
  whiteSection: {
    width: "100%",
    backgroundColor: WHITE,
  },
  lightSection: {
    width: "100%",
    backgroundColor: LIGHT,
  },
  sectionSpacing: {
    paddingVertical: 100,
  },
  eyebrow: {
    color: ORANGE,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  sectionTitle: {
    color: TEXT,
    fontSize: 40,
    lineHeight: 48,
    fontWeight: "900",
    marginBottom: 28,
    maxWidth: 780,
  },
  threeGrid: {
    flexDirection: "row",
    gap: 24,
    flexWrap: "wrap",
  },
  featureGrid: {
    flexDirection: "row",
    gap: 24,
    flexWrap: "wrap",
  },
  card: {
    flex: 1,
    minWidth: 240,
    padding: 32,
    borderRadius: 12,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  stepBadgeText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: "900",
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#fff7ed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  cardTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
  },
  cardText: {
    color: MUTED,
    fontSize: 15,
    lineHeight: 24,
  },
  statsSection: {
    width: "100%",
    backgroundColor: ORANGE,
  },
  statsInner: {
    paddingVertical: 60,
    flexDirection: "row",
    gap: 24,
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
    minWidth: 220,
  },
  statValue: {
    color: WHITE,
    fontSize: 48,
    fontWeight: "900",
    lineHeight: 56,
  },
  statLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    marginTop: 6,
  },
  aboutGrid: {
    flexDirection: "row",
    gap: 32,
    flexWrap: "wrap",
    alignItems: "stretch",
  },
  aboutTextColumn: {
    flex: 1,
    minWidth: 300,
  },
  aboutTitle: {
    color: TEXT,
    fontSize: 38,
    lineHeight: 46,
    fontWeight: "900",
    marginBottom: 18,
  },
  aboutText: {
    color: MUTED,
    fontSize: 18,
    lineHeight: 30,
    maxWidth: 720,
  },
  aboutCard: {
    flex: 1,
    minWidth: 300,
    borderLeftWidth: 4,
    borderLeftColor: ORANGE,
  },
  aboutCardTitle: {
    color: TEXT,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 12,
  },
  aboutCardText: {
    color: MUTED,
    fontSize: 16,
    lineHeight: 26,
  },
  aboutDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 20,
  },
  aboutCardMeta: {
    color: TEXT,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "600",
  },
  footerSection: {
    width: "100%",
    backgroundColor: NAVY,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  footerInner: {
    paddingVertical: 40,
  },
  footerTop: {
    flexDirection: "row",
    gap: 24,
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  footerBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  footerLogo: {
    width: 40,
    height: 40,
  },
  footerBrandText: {
    color: WHITE,
    fontSize: 20,
    fontWeight: "900",
  },
  footerTagline: {
    color: "#cbd5e1",
    fontSize: 14,
    marginTop: 4,
    maxWidth: 360,
  },
  footerLinks: {
    flexDirection: "row",
    gap: 18,
    flexWrap: "wrap",
  },
  footerLink: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "600",
  },
  footerBottom: {
    marginTop: 24,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
  },
  footerMeta: {
    color: "#94a3b8",
    fontSize: 13,
  },
});
