import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { ticketAPI } from '../../../src/services/api';
import { COLORS, SPACING } from '../../../src/constants/theme';
import Header from '../../../src/components/common/Header';
import StatusFilter from '../../../src/components/ticket/StatusFilter';
import CategoryFilter from '../../../src/components/ticket/CategoryFilter';
import Input from '../../../src/components/common/Input';
import TicketCard from '../../../src/components/ticket/TicketCard';
import EmptyState from '../../../src/components/common/EmptyState';
import LoadingScreen from '../../../src/components/common/LoadingScreen';

export default function Tickets() {
  const navigation = useNavigation();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const loadTickets = async () => {
    try {
      const data = await ticketAPI.getMyTickets({
        status: statusFilter !== 'All' ? statusFilter : undefined,
        category: categoryFilter !== 'All' ? categoryFilter : undefined,
        search: searchQuery.trim() || undefined,
      });
      setTickets(data);
    } catch (error) {
      console.log('Failed fetching tickets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    const timer = setTimeout(() => loadTickets(), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useFocusEffect(useCallback(() => { loadTickets(); }, [statusFilter, categoryFilter, searchQuery]));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTickets();
  }, [statusFilter, categoryFilter, searchQuery]);

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header
        title="My Complaints"
        subtitle="Track tickets raised for your residence"
        showDrawer
        onDrawerPress={openDrawer}
        rightIcon="add-outline"
        onRightPress={() => router.push('/(drawer)/(tabs)/raise-complaint')}
      />

      <View style={styles.searchContainer}>
        <Input
          placeholder="Search by title or description..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          icon="search-outline"
          rightIcon={searchQuery ? 'close-circle-outline' : null}
          onRightIconPress={() => setSearchQuery('')}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.filterSection}>
        <StatusFilter selectedStatus={statusFilter} onSelectStatus={setStatusFilter} />
      </View>

      <View style={styles.categoryFilterSection}>
        <CategoryFilter selectedCategory={categoryFilter} onSelectCategory={setCategoryFilter} />
      </View>

      {loading && !refreshing ? (
        <LoadingScreen message="Loading complaints..." />
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id || item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primaryLight} colors={[COLORS.primaryLight]} />}
          renderItem={({ item }) => (
            <TicketCard ticket={item} showResident={false} onPress={() => router.push(`/ticket/${item.id || item._id}`)} />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="document-text-outline"
              title="No complaints match filters"
              description="Try adjusting your search query, status tab, or category filters."
              actionTitle="Raise New Complaint"
              onActionPress={() => router.push('/(drawer)/(tabs)/raise-complaint')}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  searchContainer: { paddingHorizontal: SPACING.lg, marginTop: SPACING.xs },
  searchInput: { marginBottom: SPACING.xs },
  filterSection: { marginBottom: SPACING.xs },
  categoryFilterSection: { marginBottom: SPACING.sm },
  listContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxxl },
});
