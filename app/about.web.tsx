import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const NAVY = "#0f172a";
const ORANGE = "#E8620A";
const WHITE = "#ffffff";
const LIGHT = "#f8fafc";
const TEXT = "#1e293b";
const MUTED = "#64748b";
const BORDER = "#e2e8f0";

const stats = [
  { value: "92%", label: "Successful hire rate" },
  { value: "500+", label: "Registered workers" },
  { value: "340+", label: "Active contractors" },
];

function SectionInner({ children, style }) {
  return <View style={[styles.inner, style]}>{children}</View>;
}

function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export default function AboutWebPage() {
  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.pageContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroSection}>
        <SectionInner style={styles.heroInner}>
          <Text style={styles.heroTitle}>About BuildIn</Text>
          <Text style={styles.heroSubtitle}>
            A simple marketplace for Cameroon&apos;s construction workforce,
            designed to make hiring clearer, faster, and easier to trust.
          </Text>
        </SectionInner>
      </View>

      <View style={styles.whiteSection}>
        <SectionInner style={styles.contentSpacing}>
          <View style={styles.twoColumn}>
            <View style={styles.storyColumn}>
              <Text style={styles.sectionLabel}>Our story</Text>
              <Text style={styles.storyTitle}>
                From local connections to a digital hiring marketplace.
              </Text>
              <Text style={styles.storyText}>
                BuildIn was created to solve a familiar problem. Skilled workers
                often struggle to find reliable work, while contractors spend too
                much time searching for the right people. By keeping profiles,
                jobs, and communication in one place, the platform helps projects
                move faster with less friction.
              </Text>
              <Text style={styles.storyText}>
                The experience is intentionally minimal. The focus stays on the
                work itself, not on distractions or heavy interface patterns.
              </Text>
            </View>

            <Card style={styles.missionCard}>
              <Text style={styles.sectionLabel}>Mission</Text>
              <Text style={styles.missionTitle}>
                Modernize construction hiring in Cameroon.
              </Text>
              <Text style={styles.missionText}>
                BuildIn gives workers and contractors a clean, trustworthy place
                to connect, communicate, and keep work moving.
              </Text>
            </Card>
          </View>
        </SectionInner>
      </View>

      <View style={styles.lightSection}>
        <SectionInner style={styles.contentSpacing}>
          <View style={styles.statRow}>
            {stats.map((stat) => (
              <Card key={stat.label} style={styles.statCard}>
                <Text style={styles.statNumber}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </Card>
            ))}
          </View>
        </SectionInner>
      </View>

      <View style={styles.whiteSection}>
        <SectionInner style={styles.contentSpacing}>
          <View style={styles.footerCTA}>
            <View>
              <Text style={styles.ctaTitle}>Ready to build better?</Text>
              <Text style={styles.ctaText}>
                Whether you are hiring or looking for work, BuildIn gives you a
                simple way to move the next project forward.
              </Text>
            </View>
            <Pressable onPress={() => router.push("/login")} style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Get started</Text>
            </Pressable>
          </View>
        </SectionInner>
      </View>

      <View style={styles.footerSection}>
        <SectionInner style={styles.footerInner}>
          <View style={styles.footerTop}>
            <View>
              <Text style={styles.footerBrand}>BuildIn</Text>
              <Text style={styles.footerTagline}>
                Cameroon&apos;s construction workforce marketplace.
              </Text>
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
          <Text style={styles.footerMeta}>© 2026 BuildIn. All rights reserved.</Text>
        </SectionInner>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    width: "100%",
    minHeight: "100vh",
    backgroundColor: WHITE,
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
    paddingTop: 120,
    paddingBottom: 80,
  },
  heroTitle: {
    color: WHITE,
    fontSize: 48,
    lineHeight: 56,
    fontWeight: "900",
    maxWidth: 720,
  },
  heroSubtitle: {
    marginTop: 18,
    color: "#cbd5e1",
    fontSize: 20,
    lineHeight: 30,
    maxWidth: 760,
  },
  whiteSection: {
    width: "100%",
    backgroundColor: WHITE,
  },
  lightSection: {
    width: "100%",
    backgroundColor: LIGHT,
  },
  contentSpacing: {
    paddingVertical: 80,
  },
  twoColumn: {
    flexDirection: "row",
    gap: 32,
    flexWrap: "wrap",
    alignItems: "stretch",
  },
  storyColumn: {
    flex: 1,
    minWidth: 320,
  },
  sectionLabel: {
    color: ORANGE,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  storyTitle: {
    color: TEXT,
    fontSize: 40,
    lineHeight: 48,
    fontWeight: "900",
    marginBottom: 18,
  },
  storyText: {
    color: MUTED,
    fontSize: 18,
    lineHeight: 30,
    marginBottom: 16,
  },
  card: {
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 32,
  },
  missionCard: {
    flex: 1,
    minWidth: 320,
    borderLeftWidth: 4,
    borderLeftColor: ORANGE,
  },
  missionTitle: {
    color: TEXT,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "900",
    marginBottom: 16,
  },
  missionText: {
    color: MUTED,
    fontSize: 16,
    lineHeight: 26,
  },
  statRow: {
    flexDirection: "row",
    gap: 24,
    flexWrap: "wrap",
  },
  statCard: {
    flex: 1,
    minWidth: 220,
  },
  statNumber: {
    color: ORANGE,
    fontSize: 42,
    fontWeight: "900",
    lineHeight: 50,
    marginBottom: 10,
  },
  statLabel: {
    color: TEXT,
    fontSize: 16,
    fontWeight: "700",
  },
  footerCTA: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    padding: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 24,
    alignItems: "center",
    flexWrap: "wrap",
  },
  ctaTitle: {
    color: TEXT,
    fontSize: 30,
    lineHeight: 38,
    fontWeight: "900",
    marginBottom: 10,
  },
  ctaText: {
    color: MUTED,
    fontSize: 16,
    lineHeight: 26,
    maxWidth: 720,
  },
  ctaButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: ORANGE,
  },
  ctaButtonText: {
    color: WHITE,
    fontSize: 15,
    fontWeight: "800",
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
    justifyContent: "space-between",
    gap: 24,
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  footerBrand: {
    color: WHITE,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 6,
  },
  footerTagline: {
    color: "#cbd5e1",
    fontSize: 14,
    lineHeight: 22,
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
  footerMeta: {
    marginTop: 22,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    color: "#94a3b8",
    fontSize: 13,
  },
});
