import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../src/context/AuthContext';
import { ticketAPI } from '../../../src/services/api';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../../src/constants/theme';
import Header from '../../../src/components/common/Header';
import StatCard from '../../../src/components/common/StatCard';
import TicketCard from '../../../src/components/ticket/TicketCard';
import EmptyState from '../../../src/components/common/EmptyState';
import LoadingScreen from '../../../src/components/common/LoadingScreen';
import ScreenWrapper from '../../../src/components/common/ScreenWrapper';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTickets = async () => {
    try {
      const data = await ticketAPI.getAllTickets();
      setTickets(data);
    } catch (error) {
      console.log('Error fetching manager dashboard tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTickets(); }, []);
  useFocusEffect(useCallback(() => { loadTickets(); }, []));

  const pendingCount = tickets.filter((t) => t.status === 'Pending').length;
  const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;
  const pendingTickets = tickets.filter((t) => t.status === 'Pending').slice(0, 4);

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  const header = (
    <Header title="Maintenance Desk" subtitle={user?.name || 'Property Manager'} showDrawer onDrawerPress={openDrawer} />
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScreenWrapper header={header}>
        <Text style={styles.sectionTitle}>Society Maintenance Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard title="Total Complaints" value={tickets.length} icon="albums-outline" iconColor={COLORS.primaryLight} onPress={() => router.push('/(drawer)/manager/tickets')} />
          <StatCard title="Awaiting Review" value={pendingCount} icon="alert-circle-outline" iconColor={COLORS.pending} onPress={() => router.push('/(drawer)/manager/tickets')} />
          <StatCard title="Active Work" value={inProgressCount} icon="construct-outline" iconColor={COLORS.inProgress} onPress={() => router.push('/(drawer)/manager/tickets')} />
          <StatCard title="Closed Issues" value={resolvedCount} icon="checkmark-done-circle-outline" iconColor={COLORS.resolved} onPress={() => router.push('/(drawer)/manager/tickets')} />
        </View>

        {pendingCount > 0 && (
          <TouchableOpacity style={styles.alertBanner} onPress={() => router.push('/(drawer)/manager/tickets')} activeOpacity={0.85}>
            <Ionicons name="notifications" size={24} color={COLORS.pending} />
            <View style={styles.alertBannerTextContainer}>
              <Text style={styles.alertBannerTitle}>{pendingCount} Pending Complaint{pendingCount > 1 ? 's' : ''} Require Attention</Text>
              <Text style={styles.alertBannerSubtitle}>Review new tickets and assign maintenance technicians</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Pending Review Feed</Text>
          <TouchableOpacity onPress={() => router.push('/(drawer)/manager/tickets')}>
            <Text style={styles.viewAllText}>View All Tickets</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <LoadingScreen message="Loading maintenance desk..." />
        ) : pendingTickets.length === 0 ? (
          <EmptyState icon="checkmark-circle-outline" title="All pending tickets resolved!" description="There are currently no new unassigned complaints in the society queue." />
        ) : (
          pendingTickets.map((ticket) => (
            <TicketCard key={ticket.id || ticket._id} ticket={ticket} showResident={true} onPress={() => router.push(`/ticket/${ticket.id || ticket._id}`)} />
          ))
        )}
      </ScreenWrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  sectionTitle: { ...TYPOGRAPHY.h2, color: COLORS.text, marginTop: SPACING.sm, marginBottom: SPACING.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginTop: SPACING.sm, marginBottom: SPACING.md },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING.lg, marginBottom: SPACING.md },
  viewAllText: { ...TYPOGRAPHY.captionBold, color: COLORS.primaryLight },
  alertBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.pendingBg, borderRadius: RADIUS.xl, padding: SPACING.md, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)', gap: SPACING.md, marginVertical: SPACING.sm },
  alertBannerTextContainer: { flex: 1 },
  alertBannerTitle: { ...TYPOGRAPHY.bodyBold, color: COLORS.pending },
  alertBannerSubtitle: { ...TYPOGRAPHY.small, color: COLORS.textSecondary, marginTop: 2 },
});
