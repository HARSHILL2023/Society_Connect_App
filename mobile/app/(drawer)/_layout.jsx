import React from 'react';
import { Redirect, router } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS } from '../../src/constants/theme';
import LoadingScreen from '../../src/components/common/LoadingScreen';

import { DrawerContentScrollView } from 'expo-router/drawer';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../src/constants/theme';

function SocietyDrawerContent(props) {
  const { user, logout, role } = useAuth();
  const { state, navigation } = props;

  // For Member, tabs handle inner navigation - drawer just shows member items
  const getMemberItems = () => [
    { href: '/(drawer)/(tabs)/home', label: 'Home', icon: 'home-outline', iconActive: 'home' },
    { href: '/(drawer)/(tabs)/tickets', label: 'My Tickets', icon: 'file-tray-full-outline', iconActive: 'file-tray-full' },
    { href: '/(drawer)/(tabs)/raise-complaint', label: 'Raise Complaint', icon: 'add-circle-outline', iconActive: 'add-circle' },
    { href: '/(drawer)/(tabs)/profile', label: 'Profile', icon: 'person-outline', iconActive: 'person' },
  ];

  const getManagerItems = () => [
    { href: '/(drawer)/manager/dashboard', label: 'Dashboard', icon: 'grid-outline', iconActive: 'grid' },
    { href: '/(drawer)/manager/tickets', label: 'All Tickets', icon: 'list-outline', iconActive: 'list' },
    { href: '/(drawer)/manager/profile', label: 'Profile', icon: 'person-outline', iconActive: 'person' },
  ];

  const getAdminItems = () => [
    { href: '/(drawer)/admin/dashboard', label: 'Dashboard', icon: 'stats-chart-outline', iconActive: 'stats-chart' },
    { href: '/(drawer)/admin/users', label: 'Users', icon: 'people-outline', iconActive: 'people' },
    { href: '/(drawer)/admin/tickets', label: 'All Tickets', icon: 'layers-outline', iconActive: 'layers' },
    { href: '/(drawer)/admin/create-user', label: 'Create User', icon: 'person-add-outline', iconActive: 'person-add' },
    { href: '/(drawer)/admin/profile', label: 'Profile', icon: 'shield-outline', iconActive: 'shield' },
  ];

  let items = [];
  if (role === 'Member') items = getMemberItems();
  else if (role === 'Manager') items = getManagerItems();
  else items = getAdminItems();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <DrawerContentScrollView {...props} style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.brandSection}>
        <Text style={styles.appName}>Society Connect</Text>
        <Text style={styles.tagline}>Community Management</Text>
      </View>

      <View style={styles.userSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userRole}>{role}</Text>
        <View style={styles.flatPill}>
          <Ionicons name="home-outline" size={12} color={COLORS.primaryLight} />
          <Text style={styles.flatText}>{user?.flatNumber || 'No flat assigned'}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {items.map((item) => (
        <TouchableOpacity
          key={item.href}
          style={styles.item}
          onPress={() => {
            router.push(item.href);
            navigation.closeDrawer();
          }}
        >
          <Ionicons name={item.icon} size={22} color={COLORS.textSecondary} />
          <Text style={styles.itemLabel}>{item.label}</Text>
        </TouchableOpacity>
      ))}

      <View style={styles.divider} />

      <TouchableOpacity
        style={styles.logoutItem}
        onPress={async () => {
          navigation.closeDrawer();
          await logout();
        }}
      >
        <Ionicons name="log-out-outline" size={22} color={COLORS.danger} />
        <Text style={styles.logoutLabel}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.version}>v1.0.0</Text>
        <Text style={styles.copyright}>© 2025 Society Connect</Text>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: SPACING.xxxl },
  brandSection: { alignItems: 'center', marginBottom: SPACING.xl },
  appName: { ...TYPOGRAPHY.h2, color: COLORS.text, fontWeight: '700' },
  tagline: { ...TYPOGRAPHY.small, color: COLORS.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginTop: 3 },
  userSection: { alignItems: 'center', marginBottom: SPACING.lg },
  avatar: { width: 64, height: 64, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  avatarText: { fontSize: 22, fontWeight: '700', color: COLORS.white },
  userName: { ...TYPOGRAPHY.h3, color: COLORS.text },
  userRole: { ...TYPOGRAPHY.small, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 4 },
  flatPill: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, backgroundColor: COLORS.surfaceElevated, borderRadius: RADIUS.full, marginTop: SPACING.sm },
  flatText: { ...TYPOGRAPHY.small, color: COLORS.textSecondary, fontWeight: '600' },
  divider: { height: 0, marginVertical: SPACING.md },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, paddingHorizontal: SPACING.md, borderRadius: RADIUS.md, marginBottom: 2, gap: SPACING.md },
  itemLabel: { ...TYPOGRAPHY.bodyBold, color: COLORS.text, fontSize: 14.5 },
  logoutItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, paddingHorizontal: SPACING.md, gap: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.dangerBg },
  logoutLabel: { ...TYPOGRAPHY.bodyBold, color: COLORS.danger, fontSize: 15 },
  footer: { alignItems: 'center', marginTop: SPACING.xxxl },
  version: { ...TYPOGRAPHY.small, color: COLORS.textMuted },
  copyright: { ...TYPOGRAPHY.small, color: COLORS.textDisabled },
});

// Drawer layout - role-based protected routes
export default function DrawerLayout() {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Drawer
      drawerContent={(props) => <SocietyDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: COLORS.surface, width: 288 },
        drawerType: 'front',
        overlayColor: COLORS.overlay,
      }}
    >
      {/* Tabs group - for Members */}
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: 'Home',
          title: 'Home',
          drawerItemStyle: role !== 'Member' ? { display: 'none' } : undefined,
        }}
      />

      {/* Manager routes */}
      <Drawer.Screen
        name="manager/dashboard"
        options={{
          drawerLabel: 'Dashboard',
          title: 'Dashboard',
          drawerItemStyle: role !== 'Manager' ? { display: 'none' } : undefined,
        }}
      />
      <Drawer.Screen
        name="manager/tickets"
        options={{
          drawerLabel: 'All Tickets',
          title: 'All Tickets',
          drawerItemStyle: role !== 'Manager' ? { display: 'none' } : undefined,
        }}
      />
      <Drawer.Screen
        name="manager/profile"
        options={{
          drawerLabel: 'Profile',
          title: 'Profile',
          drawerItemStyle: role !== 'Manager' ? { display: 'none' } : undefined,
        }}
      />

      {/* Admin routes */}
      <Drawer.Screen
        name="admin/dashboard"
        options={{
          drawerLabel: 'Dashboard',
          title: 'Dashboard',
          drawerItemStyle: role !== 'Admin' ? { display: 'none' } : undefined,
        }}
      />
      <Drawer.Screen
        name="admin/users"
        options={{
          drawerLabel: 'Users',
          title: 'Users',
          drawerItemStyle: role !== 'Admin' ? { display: 'none' } : undefined,
        }}
      />
      <Drawer.Screen
        name="admin/tickets"
        options={{
          drawerLabel: 'All Tickets',
          title: 'All Tickets',
          drawerItemStyle: role !== 'Admin' ? { display: 'none' } : undefined,
        }}
      />
      <Drawer.Screen
        name="admin/create-user"
        options={{
          drawerLabel: 'Create User',
          title: 'Create User',
          drawerItemStyle: role !== 'Admin' ? { display: 'none' } : undefined,
        }}
      />
      <Drawer.Screen
        name="admin/profile"
        options={{
          drawerLabel: 'Profile',
          title: 'Profile',
          drawerItemStyle: role !== 'Admin' ? { display: 'none' } : undefined,
        }}
      />
    </Drawer>
  );
}
