import React, { useState, useEffect } from 'react';
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

export default function ManagerTickets() {
  const navigation = useNavigation();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState('All');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  const loadTickets = async () => {
    try {
      const data = await ticketAPI.getAllTickets({
        status: status !== 'All' ? status : undefined,
        category: category !== 'All' ? category : undefined,
        search: search.trim() || undefined,
      });
      setTickets(data);
    } catch (e) {
      console.log('Failed to load tickets:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [status, category]);

  useEffect(() => {
    const timer = setTimeout(() => loadTickets(), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useFocusEffect(
    React.useCallback(() => {
      loadTickets();
    }, [status, category, search])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadTickets();
  };

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header title="Society Complaints Desk" subtitle="Manage and resolve maintenance tickets" showDrawer onDrawerPress={openDrawer} />

      <View style={styles.searchContainer}>
        <Input placeholder="Search by title, resident, or flat number..." value={search} onChangeText={setSearch} icon="search-outline" rightIcon={search ? 'close-circle-outline' : null} onRightIconPress={() => setSearch('')} style={styles.searchInput} />
      </View>

      <View style={styles.filterSection}>
        <StatusFilter selectedStatus={status} onSelectStatus={setStatus} />
      </View>

      <View style={styles.categoryFilterSection}>
        <CategoryFilter selectedCategory={category} onSelectCategory={setCategory} />
      </View>

      {loading && !refreshing ? (
        <LoadingScreen message="Loading complaints feed..." />
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id || item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primaryLight} colors={[COLORS.primaryLight]} />}
          renderItem={({ item }) => <TicketCard ticket={item} showResident={true} onPress={() => router.push(`/ticket/${item.id || item._id}`)} />}
          ListEmptyComponent={<EmptyState icon="document-text-outline" title="No tickets found" description="No complaints matched your search filter criteria." />}
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
