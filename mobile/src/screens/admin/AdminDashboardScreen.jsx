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
import { adminAPI } from '../../services/api';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import StatCard from '../../components/common/StatCard';
import TicketCard from '../../components/ticket/TicketCard';
import EmptyState from '../../components/common/EmptyState';
import LoadingScreen from '../../components/common/LoadingScreen';

export const AdminDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetrics = async () => {
    try {
      const data = await adminAPI.getMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching admin metrics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMetrics();
  }, []);

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
            <Text style={styles.greeting}>Command Center</Text>
            <Text style={styles.userName}>{user?.name || 'Administrator'}</Text>
            <View style={styles.rolePill}>
              <Ionicons name="shield" size={12} color="#F87171" />
              <Text style={styles.rolePillText}>Super Administrator</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() => navigation.navigate('ProfileTab')}
          >
            <Text style={styles.avatarInitial}>
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Admin Actions Row */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('UsersTab', { screen: 'CreateUser' })}
            activeOpacity={0.8}
          >
            <Ionicons name="person-add" size={20} color={COLORS.white} />
            <Text style={styles.quickActionText}>Add Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionButton, styles.quickActionSecondary]}
            onPress={() => navigation.navigate('UsersTab')}
            activeOpacity={0.8}
          >
            <Ionicons name="people" size={20} color={COLORS.primaryLight} />
            <Text style={[styles.quickActionText, { color: COLORS.text }]}>Manage Users</Text>
          </TouchableOpacity>
        </View>

        {/* Statistics Grid */}
        <Text style={styles.sectionTitle}>System Analytics & Logs</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Tickets"
            value={metrics?.totalTickets}
            icon="albums-outline"
            iconColor={COLORS.primaryLight}
            onPress={() => navigation.navigate('TicketsTab')}
          />
          <StatCard
            title="Active Residents"
            value={metrics?.activeMembers}
            icon="people-outline"
            iconColor="#818CF8"
            onPress={() => navigation.navigate('UsersTab')}
          />
          <StatCard
            title="Managers"
            value={metrics?.totalManagers}
            icon="construct-outline"
            iconColor="#06B6D4"
            onPress={() => navigation.navigate('UsersTab')}
          />
          <StatCard
            title="Unresolved Issues"
            value={metrics?.unresolvedTickets}
            icon="alert-circle-outline"
            iconColor={COLORS.pending}
            onPress={() => navigation.navigate('TicketsTab')}
          />
        </View>

        {/* Category Breakdown Card */}
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

        {/* Recent Tickets Feed */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Society Tickets</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TicketsTab')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <LoadingScreen message="Loading command metrics..." />
        ) : metrics?.recentTickets && metrics.recentTickets.length > 0 ? (
          metrics.recentTickets.map((ticket) => (
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
        ) : (
          <EmptyState
            icon="document-text-outline"
            title="No tickets yet"
            description="Database is ready and awaiting tickets from residents."
          />
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
    marginBottom: SPACING.md,
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
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    alignSelf: 'flex-start',
    marginTop: 6,
    gap: 4,
  },
  rolePillText: {
    ...TYPOGRAPHY.small,
    color: '#F87171',
    fontWeight: '600',
  },
  avatarButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  quickActionSecondary: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickActionText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.white,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardSectionHeader: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  categoryStatsGrid: {
    gap: SPACING.sm,
  },
  categoryStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  categoryStatName: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  categoryStatCountPill: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceElevated,
  },
  categoryStatCount: {
    ...TYPOGRAPHY.small,
    color: COLORS.primaryLight,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  viewAllText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.primaryLight,
  },
});

export default AdminDashboardScreen;
