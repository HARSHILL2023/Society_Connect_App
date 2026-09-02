import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { userAPI, getErrorMessage } from '../../../src/services/api';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../../src/constants/theme';
import Header from '../../../src/components/common/Header';
import Input from '../../../src/components/common/Input';
import UserCard from '../../../src/components/user/UserCard';
import EmptyState from '../../../src/components/common/EmptyState';
import LoadingScreen from '../../../src/components/common/LoadingScreen';
import ModalDialog from '../../../src/components/common/ModalDialog';

export default function AdminUsers() {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [roleFilter, setRoleFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadUsers = async () => {
    try {
      const data = await userAPI.getAllUsers({
        role: roleFilter !== 'All' ? roleFilter : undefined,
        search: searchQuery.trim() || undefined,
      });
      setUsers(data);
    } catch (error) {
      console.log('Error fetching users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadUsers(); }, [roleFilter]);
  useEffect(() => { const t = setTimeout(() => loadUsers(), 300); return () => clearTimeout(t); }, [searchQuery]);
  useFocusEffect(useCallback(() => { loadUsers(); }, [roleFilter, searchQuery]));

  const onRefresh = useCallback(() => { setRefreshing(true); loadUsers(); }, [roleFilter, searchQuery]);

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await userAPI.deleteUser(userToDelete.id || userToDelete._id);
      setUsers((prev) => prev.filter((u) => (u.id || u._id) !== (userToDelete.id || userToDelete._id)));
      setUserToDelete(null);
      Alert.alert('Success', `User account for ${userToDelete.name} has been removed.`);
    } catch (error) {
      Alert.alert('Delete Failed', getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header title="User Management" subtitle="Manage resident and manager accounts" showDrawer onDrawerPress={openDrawer} rightIcon="person-add-outline" onRightPress={() => router.push('/(drawer)/admin/create-user')} />

      <View style={styles.searchContainer}>
        <Input placeholder="Search by name, email, or flat number..." value={searchQuery} onChangeText={setSearchQuery} icon="search-outline" rightIcon={searchQuery ? 'close-circle-outline' : null} onRightIconPress={() => setSearchQuery('')} style={styles.searchInput} />
      </View>

      <View style={styles.roleTabsRow}>
        {['All', 'Member', 'Manager', 'Admin'].map((role) => {
          const isSelected = roleFilter === role;
          return (
            <TouchableOpacity key={role} onPress={() => setRoleFilter(role)} style={[styles.roleTab, isSelected && styles.selectedRoleTab]} activeOpacity={0.75}>
              <Text style={[styles.roleTabText, isSelected && styles.selectedRoleTabText]}>{role === 'All' ? 'All Roles' : `${role}s`}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading && !refreshing ? (
        <LoadingScreen message="Loading user directory..." />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id || item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primaryLight} colors={[COLORS.primaryLight]} />}
          renderItem={({ item }) => <UserCard user={item} onEdit={() => router.push({ pathname: '/(drawer)/admin/create-user', params: { editUserId: item.id || item._id } })} onDelete={() => setUserToDelete(item)} />}
          ListEmptyComponent={<EmptyState icon="people-outline" title="No users found" description="No registered accounts match your selected search and role filters." actionTitle="Add New User" onActionPress={() => router.push('/(drawer)/admin/create-user')} />}
        />
      )}

      <ModalDialog visible={!!userToDelete} onClose={() => setUserToDelete(null)} title="Confirm User Deletion" message={`Are you sure you want to permanently delete the account for ${userToDelete?.name} (${userToDelete?.email})?`} confirmText="Delete Account" confirmVariant="danger" loading={deleting} onConfirm={handleDeleteUser} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  searchContainer: { paddingHorizontal: SPACING.lg, marginTop: SPACING.xs },
  searchInput: { marginBottom: SPACING.xs },
  roleTabsRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, gap: SPACING.xs, marginBottom: SPACING.md },
  roleTab: { flex: 1, paddingVertical: 7, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.md, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  selectedRoleTab: { backgroundColor: COLORS.primary, borderColor: COLORS.primaryLight },
  roleTabText: { ...TYPOGRAPHY.small, color: COLORS.textSecondary, fontWeight: '600' },
  selectedRoleTabText: { color: COLORS.white },
  listContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxxl },
});
