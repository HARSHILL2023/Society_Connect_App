import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ticketAPI } from '../../services/api';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import Header from '../../components/common/Header';
import StatusFilter from '../../components/ticket/StatusFilter';
import CategoryFilter from '../../components/ticket/CategoryFilter';
import Input from '../../components/common/Input';
import TicketCard from '../../components/ticket/TicketCard';
import EmptyState from '../../components/common/EmptyState';
import LoadingScreen from '../../components/common/LoadingScreen';

export const AllTicketsScreen = ({ navigation }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTickets = async () => {
    try {
      const data = await ticketAPI.getAllTickets({
        status: statusFilter !== 'All' ? statusFilter : undefined,
        category: categoryFilter !== 'All' ? categoryFilter : undefined,
        search: searchQuery.trim() || undefined,
      });
      setTickets(data);
    } catch (error) {
      console.error('Failed fetching all tickets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTickets();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTickets();
  }, [statusFilter, categoryFilter, searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header
        title="Society Complaints Desk"
        subtitle="Manage and resolve maintenance tickets"
      />

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search by title, resident, or flat number..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          icon="search-outline"
          rightIcon={searchQuery ? 'close-circle-outline' : null}
          onRightIconPress={() => setSearchQuery('')}
          style={styles.searchInput}
        />
      </View>

      {/* Status Filter */}
      <View style={styles.filterSection}>
        <StatusFilter
          selectedStatus={statusFilter}
          onSelectStatus={setStatusFilter}
        />
      </View>

      {/* Category Filter */}
      <View style={styles.categoryFilterSection}>
        <CategoryFilter
          selectedCategory={categoryFilter}
          onSelectCategory={setCategoryFilter}
        />
      </View>

      {/* Tickets List */}
      {loading && !refreshing ? (
        <LoadingScreen message="Loading complaints feed..." />
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id || item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primaryLight}
              colors={[COLORS.primaryLight]}
            />
          }
          renderItem={({ item }) => (
            <TicketCard
              ticket={item}
              showResident={true}
              onPress={() =>
                navigation.navigate('TicketDetail', {
                  ticketId: item.id || item._id,
                })
              }
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="document-text-outline"
              title="No tickets found"
              description="No complaints matched your search filter criteria."
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xs,
  },
  searchInput: {
    marginBottom: SPACING.xs,
  },
  filterSection: {
    marginBottom: SPACING.xs,
  },
  categoryFilterSection: {
    marginBottom: SPACING.sm,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
});

export default AllTicketsScreen;
