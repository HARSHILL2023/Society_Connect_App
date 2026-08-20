import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { ticketAPI } from '../../services/api';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import StatCard from '../../components/common/StatCard';
import TicketCard from '../../components/ticket/TicketCard';
import EmptyState from '../../components/common/EmptyState';
import LoadingScreen from '../../components/common/LoadingScreen';

export const ManagerDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTickets = async () => {
    try {
      const data = await ticketAPI.getAllTickets();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching manager dashboard tickets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTickets();
  }, []);

  const pendingCount = tickets.filter((t) => t.status === 'Pending').length;
  const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;

  const pendingTickets = tickets.filter((t) => t.status === 'Pending').slice(0, 4);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primaryLight}
            colors={[COLORS.primaryLight]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Maintenance Desk</Text>
            <Text style={styles.userName}>{user?.name || 'Property Manager'}</Text>
            <View style={styles.rolePill}>
              <Ionicons name="shield-checkmark" size={12} color="#06B6D4" />
              <Text style={styles.rolePillText}>Operations Manager</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() => navigation.navigate('ProfileTab')}
          >
            <Text style={styles.avatarInitial}>
              {user?.name ? user.name[0].toUpperCase() : 'M'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Global Statistics Grid */}
        <Text style={styles.sectionTitle}>Society Maintenance Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Complaints"
            value={tickets.length}
            icon="albums-outline"
            iconColor={COLORS.primaryLight}
            onPress={() => navigation.navigate('TicketsTab')}
          />
          <StatCard
            title="Awaiting Review"
            value={pendingCount}
            icon="alert-circle-outline"
            iconColor={COLORS.pending}
            onPress={() => navigation.navigate('TicketsTab')}
          />
          <StatCard
            title="Active Work"
            value={inProgressCount}
            icon="construct-outline"
            iconColor={COLORS.inProgress}
            onPress={() => navigation.navigate('TicketsTab')}
          />
          <StatCard
            title="Closed Issues"
            value={resolvedCount}
            icon="checkmark-done-circle-outline"
            iconColor={COLORS.resolved}
            onPress={() => navigation.navigate('TicketsTab')}
          />
        </View>

        {/* Priority Action Banner */}
        {pendingCount > 0 && (
          <TouchableOpacity
            style={styles.alertBanner}
            onPress={() => navigation.navigate('TicketsTab')}
            activeOpacity={0.85}
          >
            <Ionicons name="notifications" size={24} color={COLORS.pending} />
            <View style={styles.alertBannerTextContainer}>
              <Text style={styles.alertBannerTitle}>
                {pendingCount} Pending Complaint{pendingCount > 1 ? 's' : ''} Require Attention
              </Text>
              <Text style={styles.alertBannerSubtitle}>
                Review new tickets and assign maintenance technicians
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}

        {/* Action Needed Feed */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Pending Review Feed</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TicketsTab')}>
            <Text style={styles.viewAllText}>View All Tickets</Text>
          </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <LoadingScreen message="Loading maintenance desk..." />
        ) : pendingTickets.length === 0 ? (
          <EmptyState
            icon="checkmark-circle-outline"
            title="All pending tickets resolved!"
            description="There are currently no new unassigned complaints in the society queue."
          />
        ) : (
          pendingTickets.map((ticket) => (
            <TicketCard
              key={ticket.id || ticket._id}
              ticket={ticket}
              showResident={true}
              onPress={() =>
                navigation.navigate('TicketsTab', {
                  screen: 'TicketDetail',
                  params: { ticketId: ticket.id || ticket._id },
                })
              }
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  greeting: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  userName: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    marginTop: 1,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    alignSelf: 'flex-start',
    marginTop: 6,
    gap: 4,
  },
  rolePillText: {
    ...TYPOGRAPHY.small,
    color: '#06B6D4',
    fontWeight: '600',
  },
  avatarButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0891B2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#22D3EE',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  viewAllText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.primaryLight,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    gap: SPACING.md,
    marginVertical: SPACING.sm,
  },
  alertBannerTextContainer: {
    flex: 1,
  },
  alertBannerTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.pending,
  },
  alertBannerSubtitle: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

export default ManagerDashboardScreen;
