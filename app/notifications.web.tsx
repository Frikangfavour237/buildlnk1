import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import {
  markAllNotificationsRead,
  markNotificationRead,
  subscribeToNotifications,
  timeAgo,
} from '../services/notificationService';

const NAVY = '#0f172a';
const ORANGE = '#E8620A';

export default function NotificationsWebPage() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    return subscribeToNotifications(currentUser.uid, setNotifications);
  }, [currentUser?.uid]);

  const handleMarkAllRead = async () => {
    if (!currentUser?.uid) return;
    await markAllNotificationsRead(currentUser.uid);
  };

  const handleOpen = async (notification) => {
    if (!currentUser?.uid) return;
    if (!notification.read) {
      await markNotificationRead(currentUser.uid, notification.id);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Notifications</Text>
          <Text style={styles.title}>Stay on top of new work and messages.</Text>
          <Text style={styles.subtitle}>
            Read the latest updates from workers, contractors and mobilisation activity in one place.
          </Text>
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Inbox</Text>
            <Pressable onPress={handleMarkAllRead} style={styles.markAllButton}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </Pressable>
          </View>

          {!currentUser?.uid ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-outline" size={34} color="#94a3b8" />
              <Text style={styles.emptyTitle}>Sign in to see notifications</Text>
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={34} color="#94a3b8" />
              <Text style={styles.emptyTitle}>No notifications yet</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {notifications.map((notification) => (
                <Pressable
                  key={notification.id}
                  onPress={() => handleOpen(notification)}
                  style={[styles.item, !notification.read && styles.itemUnread]}
                >
                  <View style={styles.iconCircle}>
                    <Ionicons name="notifications-outline" size={18} color={ORANGE} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.message, !notification.read && styles.messageUnread]}>
                      {notification.message || 'Notification'}
                    </Text>
                    <Text style={styles.time}>{timeAgo(notification.createdAt)}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingBottom: 24,
  },
  hero: {
    marginTop: 18,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  eyebrow: {
    color: ORANGE,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    color: NAVY,
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '900',
    maxWidth: 760,
  },
  subtitle: {
    marginTop: 16,
    color: '#475569',
    fontSize: 17,
    lineHeight: 28,
    maxWidth: 820,
  },
  panel: {
    marginTop: 22,
    backgroundColor: '#ffffff',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  panelHeader: {
    paddingHorizontal: 22,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  panelTitle: {
    color: NAVY,
    fontSize: 20,
    fontWeight: '800',
  },
  markAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#fff7ed',
  },
  markAllText: {
    color: ORANGE,
    fontSize: 13,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 42,
    gap: 10,
  },
  emptyTitle: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '700',
  },
  list: {
    padding: 18,
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemUnread: {
    borderColor: 'rgba(232, 98, 10, 0.4)',
    backgroundColor: '#fff7ed',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    color: NAVY,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  messageUnread: {
    fontWeight: '800',
  },
  time: {
    marginTop: 4,
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
});
