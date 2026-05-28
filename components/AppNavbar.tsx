import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { type ComponentProps, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { auth } from "../firebase";
import { logoutUser } from "../services/authService";
import {
  markAllNotificationsRead,
  markNotificationRead,
  subscribeToNotifications,
  timeAgo,
} from "../services/notificationService";

type NavbarProps = {
  userRole: "worker" | "contractor";
  userName: string;
  profileImageUrl: string | null;
  unreadCount: number;
};

type NotificationItem = {
  id: string;
  type?: string;
  message?: string;
  read?: boolean;
  relatedId?: string | null;
  createdAt?: { toDate?: () => Date } | Date | null;
};

const NAV_HEIGHT = 56;
const NAV_COLOR = "#1a2332";

type IconName = ComponentProps<typeof Ionicons>["name"];
type MenuItem = {
  label: string;
  icon: IconName;
  route: string;
};

function getInitials(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getNotificationVisual(type?: string) {
  switch (type) {
    case "mobilisation_request":
      return {
        icon: "people-outline" as IconName,
        iconColor: "#3b82f6",
        backgroundColor: "#dbeafe",
      };
    case "mobilisation_accepted":
      return {
        icon: "checkmark-circle-outline" as IconName,
        iconColor: "#10b981",
        backgroundColor: "#d1fae5",
      };
    case "mobilisation_declined":
      return {
        icon: "close-circle-outline" as IconName,
        iconColor: "#ef4444",
        backgroundColor: "#fee2e2",
      };
    case "job_application":
    case "application":
      return {
        icon: "document-text-outline" as IconName,
        iconColor: "#f59e0b",
        backgroundColor: "#fef3c7",
      };
    case "message":
      return {
        icon: "chatbubble-outline" as IconName,
        iconColor: "#7c3aed",
        backgroundColor: "#ede9fe",
      };
    default:
      return {
        icon: "notifications-outline" as IconName,
        iconColor: "#6b7280",
        backgroundColor: "#f3f4f6",
      };
  }
}

export function AppNavbar({
  userRole,
  userName,
  profileImageUrl,
  unreadCount,
}: NavbarProps) {
  const insets = useSafeAreaInsets();
  const [menuMounted, setMenuMounted] = useState(false);
  const [notificationsMounted, setNotificationsMounted] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;
  const notificationsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let unsubscribeNotifications = () => {};
    let unsubscribeAuth = () => {};

    if (auth.currentUser) {
      unsubscribeNotifications = subscribeToNotifications(
        auth.currentUser.uid,
        setNotifications,
      );
    } else {
      unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        if (!user) {
          setNotifications([]);
          return;
        }
        unsubscribeNotifications = subscribeToNotifications(user.uid, setNotifications);
        unsubscribeAuth();
      });
    }

    return () => {
      unsubscribeNotifications();
      unsubscribeAuth();
    };
  }, []);

  const menuItems = useMemo(() => {
    const workerItems: MenuItem[] = [
      { label: "Home", icon: "home-outline", route: "/(worker)/dashboard" },
      { label: "Browse Jobs", icon: "briefcase-outline", route: "/(worker)/jobs" },
      { label: "My Portfolio", icon: "images-outline", route: "/(worker)/portfolio" },
      { label: "Mobilisation Requests", icon: "people-outline", route: "/(worker)/dashboard" },
      { label: "Messages", icon: "chatbubble-outline", route: "/(worker)/messages" },
      { label: "Profile & Settings", icon: "person-outline", route: "/(worker)/profile" },
    ];

    const contractorItems: MenuItem[] = [
      { label: "Home", icon: "home-outline", route: "/(contractor)/dashboard" },
      { label: "Post a Job", icon: "briefcase-outline", route: "/(contractor)/post-job" },
      { label: "Find Workers", icon: "people-outline", route: "/(contractor)/find-workers" },
      { label: "Messages", icon: "chatbubble-outline", route: "/(contractor)/messages" },
      { label: "My Projects", icon: "folder-outline", route: "/(contractor)/dashboard" },
      { label: "Profile & Settings", icon: "settings-outline", route: "/(contractor)/profile" },
    ];

    return userRole === "worker" ? workerItems : contractorItems;
  }, [userRole]);

  const avatarLabel = getInitials(userName);
  const unreadItems = notifications.filter((item) => !item.read);
  const actualUnreadCount = unreadItems.length || unreadCount || 0;
  const visibleNotifications = showAllNotifications
    ? notifications
    : notifications.slice(0, 5);

  const openMenu = () => {
    closeNotifications(true);
    setMenuMounted(true);
    Animated.timing(menuAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = (instant = false) => {
    if (instant) {
      menuAnim.setValue(0);
      setMenuMounted(false);
      return;
    }

    Animated.timing(menuAnim, {
      toValue: 0,
      duration: 160,
      useNativeDriver: true,
    }).start(() => setMenuMounted(false));
  };

  const openNotifications = () => {
    closeMenu(true);
    setNotificationsMounted(true);
    Animated.timing(notificationsAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  };

  const closeNotifications = (instant = false) => {
    if (instant) {
      notificationsAnim.setValue(0);
      setNotificationsMounted(false);
      setShowAllNotifications(false);
      return;
    }

    Animated.timing(notificationsAnim, {
      toValue: 0,
      duration: 160,
      useNativeDriver: true,
    }).start(() => {
      setNotificationsMounted(false);
      setShowAllNotifications(false);
    });
  };

  const navigateTo = (route: string) => {
    closeMenu();
    router.push(route as never);
  };

  const handleMarkAllRead = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await markAllNotificationsRead(uid);
    closeNotifications();
  };

  const handleNotificationPress = async (notification: NotificationItem) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    if (!notification.read) {
      await markNotificationRead(uid, notification.id);
    }

    closeNotifications();

    switch (notification.type) {
      case "mobilisation_request":
        router.push("/(worker)/dashboard");
        break;
      case "mobilisation_accepted":
      case "mobilisation_declined":
        router.push(
          userRole === "worker"
            ? "/(worker)/dashboard"
            : "/(contractor)/dashboard",
        );
        break;
      case "job_application":
      case "application":
        router.push("/(contractor)/applicants");
        break;
      case "message":
        router.push(
          userRole === "worker"
            ? "/(worker)/messages"
            : "/(contractor)/messages",
        );
        break;
      default:
        router.push(
          userRole === "worker"
            ? "/(worker)/dashboard"
            : "/(contractor)/dashboard",
        );
        break;
    }
  };

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.row}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              router.push(
                userRole === "worker"
                  ? "/(worker)/profile"
                  : "/(contractor)/profile",
              )
            }
            style={styles.avatarButton}
          >
            {profileImageUrl ? (
              <Image
                source={{ uri: profileImageUrl }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : avatarLabel ? (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>{avatarLabel}</Text>
              </View>
            ) : (
              <View style={styles.avatarFallback}>
                <Ionicons name="person-outline" size={18} color="#9ca3af" />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={openNotifications}
              style={styles.iconButton}
            >
              <Ionicons name="notifications-outline" size={24} color={NAV_COLOR} />
              {actualUnreadCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {actualUnreadCount > 9 ? "9+" : actualUnreadCount}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={openMenu}
              style={styles.iconButton}
            >
              <Ionicons name="menu" size={24} color={NAV_COLOR} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal
        visible={notificationsMounted}
        transparent
        animationType="none"
        onRequestClose={() => closeNotifications()}
      >
        <Pressable style={styles.backdrop} onPress={() => closeNotifications()}>
          <Animated.View
            style={[
              styles.notificationPanel,
              {
                paddingTop: insets.top + NAV_HEIGHT,
                opacity: notificationsAnim,
                transform: [
                  {
                    translateY: notificationsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-18, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Pressable style={styles.notificationCard} onPress={() => {}}>
              <View style={styles.notificationHeader}>
                <Text style={styles.notificationTitle}>Notifications</Text>
                <TouchableOpacity onPress={handleMarkAllRead}>
                  <Text style={styles.notificationAction}>Mark all read</Text>
                </TouchableOpacity>
              </View>

              {notifications.length === 0 ? (
                <View style={styles.notificationEmptyState}>
                  <Ionicons
                    name="notifications-outline"
                    size={32}
                    color="#9ca3af"
                  />
                  <Text style={styles.notificationEmptyText}>
                    No notifications yet
                  </Text>
                </View>
              ) : (
                <>
                  <ScrollView
                    style={styles.notificationList}
                    contentContainerStyle={styles.notificationListContent}
                    showsVerticalScrollIndicator={false}
                  >
                    {visibleNotifications.map((item) => {
                      const visual = getNotificationVisual(item.type);
                      return (
                        <TouchableOpacity
                          key={item.id}
                          activeOpacity={0.85}
                          onPress={() => handleNotificationPress(item)}
                          style={[
                            styles.notificationRow,
                            !item.read && styles.notificationRowUnread,
                          ]}
                        >
                          <View
                            style={[
                              styles.notificationIconCircle,
                              { backgroundColor: visual.backgroundColor },
                            ]}
                          >
                            <Ionicons
                              name={visual.icon}
                              size={20}
                              color={visual.iconColor}
                            />
                          </View>
                          <View style={styles.notificationContent}>
                            <Text
                              style={[
                                styles.notificationMessage,
                                !item.read && styles.notificationMessageUnread,
                              ]}
                            >
                              {item.message || "Notification"}
                            </Text>
                            <Text style={styles.notificationTime}>
                              {timeAgo(item.createdAt)}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {notifications.length > 5 ? (
                    <TouchableOpacity
                      style={styles.seeAllRow}
                      onPress={() => setShowAllNotifications((prev) => !prev)}
                    >
                      <Text style={styles.seeAllText}>
                        {showAllNotifications ? "Show less" : "See all"}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </>
              )}
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>

      <Modal
        visible={menuMounted}
        transparent
        animationType="none"
        onRequestClose={() => closeMenu()}
      >
        <Pressable style={styles.backdrop} onPress={() => closeMenu()}>
          <Animated.View
            style={[
              styles.menuPanel,
              {
                paddingTop: insets.top + NAV_HEIGHT,
                opacity: menuAnim,
                transform: [
                  {
                    translateY: menuAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-18, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Pressable style={styles.menuCard} onPress={() => {}}>
              <View style={styles.menuHeader}>
                <View style={styles.menuHeaderAvatar}>
                  {profileImageUrl ? (
                    <Image
                      source={{ uri: profileImageUrl }}
                      style={styles.menuHeaderAvatarImage}
                    />
                  ) : avatarLabel ? (
                    <Text style={styles.menuHeaderAvatarText}>
                      {avatarLabel}
                    </Text>
                  ) : (
                    <Ionicons name="person-outline" size={18} color="#ffffff" />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuHeaderName}>{userName}</Text>
                  <Text style={styles.menuHeaderRole}>
                    {userRole === "worker" ? "Worker" : "Contractor"}
                  </Text>
                </View>
              </View>

              <View style={styles.menuDivider} />

              <View style={styles.menuList}>
                {menuItems.map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    activeOpacity={0.85}
                    onPress={() => navigateTo(item.route)}
                    style={styles.menuItem}
                  >
                    <Ionicons name={item.icon} size={18} color="#ffffff" />
                    <Text style={styles.menuItemText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={async () => {
                  closeMenu();
                  const result = await logoutUser();
                  if (!result.success) {
                    return;
                  }
                  router.replace("/(auth)/sign-in");
                }}
                style={styles.signOutRow}
              >
                <Ionicons name="log-out-outline" size={18} color="#ffffff" />
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    zIndex: 10,
  },
  row: {
    height: NAV_HEIGHT,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#d1d5db",
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackText: {
    color: "#1f2937",
    fontSize: 12,
    fontWeight: "800",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(8, 15, 26, 0.18)",
  },
  notificationPanel: {
    flex: 1,
    paddingHorizontal: 0,
  },
  notificationCard: {
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  notificationHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#eef2f7",
  },
  notificationTitle: {
    color: "#0f172a",
    fontSize: 17,
    fontWeight: "800",
  },
  notificationAction: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "600",
  },
  notificationList: {
    maxHeight: 360,
  },
  notificationListContent: {
    padding: 12,
    gap: 8,
  },
  notificationRow: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderLeftWidth: 0,
  },
  notificationRowUnread: {
    backgroundColor: "#fffbf7",
    borderLeftWidth: 3,
    borderLeftColor: "#E8620A",
  },
  notificationIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  notificationMessageUnread: {
    fontWeight: "800",
  },
  notificationTime: {
    marginTop: 4,
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "600",
  },
  notificationEmptyState: {
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  notificationEmptyText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "600",
  },
  seeAllRow: {
    borderTopWidth: 1,
    borderTopColor: "#eef2f7",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  seeAllText: {
    color: "#6b7280",
    fontSize: 13,
    fontWeight: "700",
  },
  menuPanel: {
    flex: 1,
    paddingHorizontal: 16,
  },
  menuCard: {
    backgroundColor: NAV_COLOR,
    borderRadius: 22,
    overflow: "hidden",
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuHeaderAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  menuHeaderAvatarImage: {
    width: "100%",
    height: "100%",
  },
  menuHeaderAvatarText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
  },
  menuHeaderName: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  menuHeaderRole: {
    color: "#cbd5e1",
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginVertical: 14,
  },
  menuList: {
    gap: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  menuItemText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  signOutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 2,
  },
  signOutText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
});
