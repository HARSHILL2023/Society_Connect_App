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
import Button from '../../components/common/Button';

export const MemberHomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTickets = async () => {
    try {
      const data = await ticketAPI.getMyTickets();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching member tickets:', error);
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

  // Compute stats
  const pendingCount = tickets.filter((t) => t.status === 'Pending').length;
  const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;

  const recentTickets = tickets.slice(0, 4);

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
        {/* Welcome Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'Resident'}</Text>
            <View style={styles.flatPill}>
              <Ionicons name="home-outline" size={13} color={COLORS.primaryLight} />
              <Text style={styles.flatPillText}>{user?.flatNumber || 'Flat'}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() => navigation.navigate('ProfileTab')}
          >
            <Text style={styles.avatarInitial}>
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Action Banner */}
        <TouchableOpacity
          style={styles.actionBanner}
          onPress={() => navigation.navigate('NewTicketTab')}
          activeOpacity={0.85}
        >
          <View style={styles.bannerLeft}>
            <View style={styles.bannerIconCircle}>
              <Ionicons name="add-circle" size={26} color={COLORS.white} />
            </View>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>Raise a New Complaint</Text>
              <Text style={styles.bannerSubtitle}>
                Plumbing, electrical, cleaning, or security issues
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
        </TouchableOpacity>

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Tickets"
            value={tickets.length}
            icon="documents-outline"
            iconColor={COLORS.primaryLight}
            onPress={() => navigation.navigate('TicketsTab')}
          />
          <StatCard
            title="Pending Review"
            value={pendingCount}
            icon="time-outline"
            iconColor={COLORS.pending}
            onPress={() => navigation.navigate('TicketsTab')}
          />
          <StatCard
            title="In Progress"
            value={inProgressCount}
            icon="construct-outline"
            iconColor={COLORS.inProgress}
            onPress={() => navigation.navigate('TicketsTab')}
          />
          <StatCard
            title="Resolved"
            value={resolvedCount}
            icon="checkmark-circle-outline"
            iconColor={COLORS.resolved}
            onPress={() => navigation.navigate('TicketsTab')}
          />
        </View>

        {/* Recent Tickets Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Tickets</Text>
          {tickets.length > 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('TicketsTab')}>
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
            onActionPress={() => navigation.navigate('NewTicketTab')}
          />
        ) : (
          recentTickets.map((ticket) => (
            <TicketCard
              key={ticket.id || ticket._id}
              ticket={ticket}
              showResident={false}
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
  flatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    alignSelf: 'flex-start',
    marginTop: 6,
    gap: 4,
  },
  flatPillText: {
    ...TYPOGRAPHY.small,
    color: COLORS.primaryLight,
    fontWeight: '600',
  },
  avatarButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  actionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bannerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.white,
  },
  bannerSubtitle: {
    ...TYPOGRAPHY.small,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
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
});

export default MemberHomeScreen;
