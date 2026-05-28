import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, usePathname } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../services/authService';

const NAV_COLOR = '#0f172a';
const ORANGE = '#E8620A';
const logoSource = require('../assets/images/build logo1.png');

function normalizeRoute(route) {
  return route.replace(/\/\([^)]*\)/g, '');
}

function NavLink({ label, active, onPress }) {
  const [hovered, setHovered] = useState(false);
  const isHighlighted = active || hovered;

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={styles.linkPressable}
    >
      <Text style={[styles.link, isHighlighted && styles.linkActive]}>{label}</Text>
    </Pressable>
  );
}

export default function WebNavbar() {
  const pathname = usePathname() || '/';
  const normalizedPathname = normalizeRoute(pathname);
  const { currentUser, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadAdminSession = async () => {
      try {
        const raw = await AsyncStorage.getItem('adminSession');
        if (!mounted) return;

        if (!raw) {
          setIsAdmin(false);
          setAdminChecked(true);
          return;
        }

        const parsed = JSON.parse(raw);
        const valid = Boolean(parsed?.loggedIn && parsed?.role === 'admin');
        setIsAdmin(valid);
        setAdminChecked(true);
      } catch {
        if (!mounted) return;
        setIsAdmin(false);
        setAdminChecked(true);
      }
    };

    loadAdminSession();

    return () => {
      mounted = false;
    };
  }, []);

  const role = currentUser?.role;
  const isWorker = role === 'worker';
  const isContractor = role === 'contractor';
  const isMarketingRoute =
    normalizedPathname === '/' || normalizedPathname.startsWith('/about');

  const links = useMemo(() => {
    if (isMarketingRoute) {
      return [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
        { label: 'Login', href: '/login' },
        { label: 'Sign Up', href: '/sign-up' },
      ];
    }

    if (isAdmin && adminChecked) {
      return [
        { label: 'Admin Dashboard', href: '/admin/dashboard' },
        { label: 'Logout', href: null },
      ];
    }

    if (loading && !currentUser) {
      return [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
        { label: 'Login', href: '/login' },
        { label: 'Sign Up', href: '/sign-up' },
      ];
    }

    if (isWorker) {
      return [
        { label: 'Dashboard', href: '/(worker)/dashboard' },
        { label: 'Browse Jobs', href: '/(worker)/jobs' },
        { label: 'Portfolio', href: '/(worker)/portfolio' },
        { label: 'Messages', href: '/(worker)/messages' },
        { label: 'Notifications', href: '/notifications' },
        { label: 'Profile', href: '/(worker)/profile' },
        { label: 'Logout', href: null },
      ];
    }

    if (isContractor) {
      return [
        { label: 'Dashboard', href: '/(contractor)/dashboard' },
        { label: 'Post a Job', href: '/(contractor)/post-job' },
        { label: 'My Jobs', href: '/(contractor)/dashboard' },
        { label: 'Find Workers', href: '/(contractor)/find-workers' },
        { label: 'Messages', href: '/(contractor)/messages' },
        { label: 'Notifications', href: '/notifications' },
        { label: 'Profile', href: '/(contractor)/profile' },
        { label: 'Logout', href: null },
      ];
    }

    return [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about' },
      { label: 'Login', href: '/login' },
      { label: 'Sign Up', href: '/sign-up' },
    ];
  }, [adminChecked, currentUser, isAdmin, isMarketingRoute, isWorker, isContractor, loading]);

  if (Platform.OS !== 'web') return null;

  const handleLogout = async () => {
    if (isAdmin) {
      await AsyncStorage.removeItem('adminSession');
      setIsAdmin(false);
      router.replace('/login');
      return;
    }

    await logoutUser();
    router.replace('/login');
  };

  const activeMatches = (href) => {
    if (!href) return false;
    const route = normalizeRoute(href);
    if (route === '/') return normalizedPathname === '/';
    if (route === '/about') return normalizedPathname.startsWith('/about');
    if (route === '/login') return normalizedPathname.startsWith('/login');
    if (route === '/sign-up') return normalizedPathname.startsWith('/sign-up');
    if (route === '/notifications') return normalizedPathname.startsWith('/notifications');
    if (route === '/admin/dashboard') return normalizedPathname.startsWith('/admin/dashboard');
    return normalizedPathname.startsWith(route);
  };

  return (
    <View style={styles.navbar}>
      <View style={styles.inner}>
        <Pressable onPress={() => router.push('/')} style={styles.brand}>
          <Image source={logoSource} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brandText}>BuildIn</Text>
        </Pressable>

        <View style={styles.links}>
          {links.map((item) => {
            if (item.label === 'Logout') {
              return (
                <Pressable key={item.label} onPress={handleLogout} style={styles.linkPressable}>
                  <Text style={[styles.link, styles.logoutLink]}>{item.label}</Text>
                </Pressable>
              );
            }

            return (
              <NavLink
                key={item.label}
                label={item.label}
                href={item.href}
                active={activeMatches(item.href)}
                onPress={() => router.push(item.href)}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: NAV_COLOR,
    zIndex: 1000,
  },
  inner: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 32,
    height: 32,
  },
  brandText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  links: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  linkPressable: {
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  link: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  linkActive: {
    color: ORANGE,
  },
  logoutLink: {
    color: '#fda4af',
  },
});
