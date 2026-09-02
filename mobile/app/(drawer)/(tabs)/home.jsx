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
import ScreenWrapper from '../../../src/components/common/ScreenWrapper';

export default function Home() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTickets = async () => {
    try {
      const data = await ticketAPI.getMyTickets();
      setTickets(data);
    } catch (error) {
      console.log('Error fetching member tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTickets();
    }, [])
  );

  const pendingCount = tickets.filter((t) => t.status === 'Pending').length;
  const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;
  const recentTickets = tickets.slice(0, 4);

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  const header = (
    <Header
      title="Welcome back,"
      subtitle={user?.name || 'Resident'}
      showDrawer
      onDrawerPress={openDrawer}
      rightAction={
        <TouchableOpacity style={styles.avatarButton} onPress={() => router.push('/(drawer)/(tabs)/profile')}>
          <Text style={styles.avatarInitial}>{user?.name ? user.name[0].toUpperCase() : 'U'}</Text>
        </TouchableOpacity>
      }
    />
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScreenWrapper header={header}>
        <TouchableOpacity style={styles.actionBanner} onPress={() => router.push('/(drawer)/(tabs)/raise-complaint')} activeOpacity={0.85}>
          <View style={styles.bannerLeft}>
            <View style={styles.bannerIconCircle}>
              <Ionicons name="add-circle" size={26} color={COLORS.white} />
            </View>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>Raise a New Complaint</Text>
              <Text style={styles.bannerSubtitle}>Plumbing, electrical, cleaning, or security issues</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
        </TouchableOpacity>

        <View style={styles.flatInfo}>
          <Ionicons name="home-outline" size={16} color={COLORS.primaryLight} />
          <Text style={styles.flatInfoText}>{user?.flatNumber || 'Flat not set'}</Text>
        </View>

        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard title="Total Tickets" value={tickets.length} icon="documents-outline" iconColor={COLORS.primaryLight} onPress={() => router.push('/(drawer)/(tabs)/tickets')} />
          <StatCard title="Pending Review" value={pendingCount} icon="time-outline" iconColor={COLORS.pending} onPress={() => router.push('/(drawer)/(tabs)/tickets')} />
          <StatCard title="In Progress" value={inProgressCount} icon="construct-outline" iconColor={COLORS.inProgress} onPress={() => router.push('/(drawer)/(tabs)/tickets')} />
          <StatCard title="Resolved" value={resolvedCount} icon="checkmark-circle-outline" iconColor={COLORS.resolved} onPress={() => router.push('/(drawer)/(tabs)/tickets')} />
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Tickets</Text>
          {tickets.length > 0 && (
            <TouchableOpacity onPress={() => router.push('/(drawer)/(tabs)/tickets')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>

        {recentTickets.length === 0 && !loading ? (
          <EmptyState
            icon="checkmark-done-circle-outline"
            title="No tickets raised yet"
            description="Everything looks peaceful in your flat! Raise a ticket whenever you need maintenance assistance."
            actionTitle="Raise Complaint"
            onActionPress={() => router.push('/(drawer)/(tabs)/raise-complaint')}
          />
        ) : (
          recentTickets.map((ticket) => (
            <TicketCard
              key={ticket.id || ticket._id}
              ticket={ticket}
              showResident={false}
              onPress={() => router.push(`/ticket/${ticket.id || ticket._id}`)}
            />
          ))
        )}
      </ScreenWrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  avatarButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: COLORS.primaryLight },
  avatarInitial: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  actionBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.primary, borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.xl, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6 },
  bannerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  bannerIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  bannerTextContainer: { flex: 1 },
  bannerTitle: { ...TYPOGRAPHY.h3, color: COLORS.white },
  bannerSubtitle: { ...TYPOGRAPHY.small, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  flatInfo: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, backgroundColor: COLORS.primaryGlow, borderRadius: RADIUS.full, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)', marginBottom: SPACING.lg, alignSelf: 'flex-start' },
  flatInfoText: { ...TYPOGRAPHY.small, color: COLORS.primaryLight, fontWeight: '600' },
  sectionTitle: { ...TYPOGRAPHY.h2, color: COLORS.text },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginTop: SPACING.sm, marginBottom: SPACING.md },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING.md, marginBottom: SPACING.md },
  viewAllText: { ...TYPOGRAPHY.captionBold, color: COLORS.primaryLight },
});
