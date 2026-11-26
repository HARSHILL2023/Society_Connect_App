import { useOpenDrawer } from '../../../src/utils/navigation';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';
import { adminAPI } from '../../../src/services/api';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../../src/constants/theme';
import Header from '../../../src/components/common/Header';
import StatCard from '../../../src/components/common/StatCard';
import TicketCard from '../../../src/components/ticket/TicketCard';
import EmptyState from '../../../src/components/common/EmptyState';
import LoadingScreen from '../../../src/components/common/LoadingScreen';
import ScreenWrapper from '../../../src/components/common/ScreenWrapper';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMetrics = async () => {
    try {
      const data = await adminAPI.getMetrics();
      setMetrics(data);
    } catch (e) {
      console.log('Error loading metrics:', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadMetrics();
    }, [])
  );

  const openDrawer = useOpenDrawer();

  const header = <Header title="Command Center" subtitle={user?.name || 'Administrator'} showDrawer onDrawerPress={openDrawer} />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScreenWrapper header={header}>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push('/(drawer)/admin/create-user')} activeOpacity={0.8}>
            <Ionicons name="person-add" size={18} color={COLORS.white} />
            <Text style={styles.quickActionText}>Add Account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickActionButton, styles.quickActionSecondary]} onPress={() => router.push('/(drawer)/admin/users')} activeOpacity={0.8}>
            <Ionicons name="people" size={18} color={COLORS.text} />
            <Text style={[styles.quickActionText, { color: COLORS.text }]}>Manage Users</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>System Analytics & Logs</Text>
        <View style={styles.statsGrid}>
          <StatCard title="Total Tickets" value={metrics?.totalTickets} icon="albums-outline" iconColor={COLORS.primaryLight} onPress={() => router.push('/(drawer)/admin/tickets')} />
          <StatCard title="Active Residents" value={metrics?.activeMembers} icon="people-outline" iconColor={COLORS.primaryLight} onPress={() => router.push('/(drawer)/admin/users')} />
          <StatCard title="Managers" value={metrics?.totalManagers} icon="construct-outline" iconColor={COLORS.primaryLight} onPress={() => router.push('/(drawer)/admin/users')} />
          <StatCard title="Unresolved Issues" value={metrics?.unresolvedTickets} icon="alert-circle-outline" iconColor={COLORS.pending} onPress={() => router.push('/(drawer)/admin/tickets')} />
        </View>

        {metrics?.categoryStats && metrics.categoryStats.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardSectionHeader}>Complaints by Category</Text>
            <View style={styles.categoryStatsGrid}>
              {metrics.categoryStats.map((item) => (
                <View key={item._id} style={styles.categoryStatRow}>
                  <Text style={styles.categoryStatName}>{item._id}</Text>
                  <View style={styles.categoryStatCountPill}>
                    <Text style={styles.categoryStatCount}>{item.count} tickets</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Society Tickets</Text>
          <TouchableOpacity onPress={() => router.push('/(drawer)/admin/tickets')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <LoadingScreen message="Loading command metrics..." />
        ) : metrics?.recentTickets && metrics.recentTickets.length > 0 ? (
          metrics.recentTickets.map((ticket) => (
            <TicketCard key={ticket.id || ticket._id} ticket={ticket} showResident={true} onPress={() => router.push(`/ticket/${ticket.id || ticket._id}`)} />
          ))
        ) : (
          <EmptyState icon="document-text-outline" title="No tickets yet" description="Database is ready and awaiting tickets from residents." />
        )}
      </ScreenWrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  quickActionsRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg },
  quickActionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: RADIUS.md, gap: SPACING.sm },
  quickActionSecondary: { backgroundColor: COLORS.surface },
  quickActionText: { ...TYPOGRAPHY.captionBold, color: COLORS.white, fontSize: 13.5 },
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.text, fontSize: 17, marginBottom: SPACING.sm },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginTop: SPACING.xs, marginBottom: SPACING.md },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.lg, ...SHADOWS.card },
  cardSectionHeader: { ...TYPOGRAPHY.h3, color: COLORS.text, marginBottom: SPACING.md },
  categoryStatsGrid: { gap: SPACING.sm },
  categoryStatRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  categoryStatName: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, fontSize: 14 },
  categoryStatCountPill: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: RADIUS.sm, backgroundColor: COLORS.surfaceElevated },
  categoryStatCount: { ...TYPOGRAPHY.small, color: COLORS.textSecondary, fontWeight: '600' },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING.sm, marginBottom: SPACING.md },
  viewAllText: { ...TYPOGRAPHY.captionBold, color: COLORS.textSecondary },
});
