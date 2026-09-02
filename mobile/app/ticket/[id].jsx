import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { ticketAPI, getErrorMessage } from '../../src/services/api';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../src/constants/theme';
import Header from '../../src/components/common/Header';
import LoadingScreen from '../../src/components/common/LoadingScreen';
import ModalDialog from '../../src/components/common/ModalDialog';
import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import TicketHeader from '../../src/components/ticket/TicketHeader';
import TicketContactInfo from '../../src/components/ticket/TicketContactInfo';
import TicketTimeline from '../../src/components/ticket/TicketTimeline';
import TicketStaffActions from '../../src/components/ticket/TicketStaffActions';
import TicketEvidence from '../../src/components/ticket/TicketEvidence';

export default function TicketDetail() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [nextStatus, setNextStatus] = useState('');
  const [note, setNote] = useState('');

  const isStaff = user?.role === 'Manager' || user?.role === 'Admin';

  const loadTicket = async () => {
    try {
      const data = await ticketAPI.getTicketById(id);
      setTicket(data);
      setNote(data.statusNote || '');
    } catch (e) {
      Alert.alert('Error', 'Could not load ticket.', [{ text: 'Go Back', onPress: () => router.back() }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadTicket();
  }, [id]);

  const openStatusModal = (status) => {
    setNextStatus(status);
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!nextStatus) return;
    setUpdating(true);
    try {
      const updated = await ticketAPI.updateTicketStatus(id, {
        status: nextStatus,
        statusNote: note.trim(),
      });
      setTicket(updated);
      setShowStatusModal(false);
      Alert.alert('Success', `Ticket marked as ${nextStatus}.`);
    } catch (e) {
      Alert.alert('Update Failed', getErrorMessage(e));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingScreen message="Loading ticket..." />;
  if (!ticket) return null;

  const header = (
    <Header
      title="Ticket Details"
      subtitle={`ID: #${(ticket.id || ticket._id || '').slice(-6).toUpperCase()}`}
      showBack
      onBackPress={() => router.back()}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScreenWrapper header={header}>
        <TicketHeader ticket={ticket} />
        <TicketEvidence ticket={ticket} />
        <TicketContactInfo ticket={ticket} />
        <TicketTimeline ticket={ticket} />
        <TicketStaffActions ticket={ticket} isStaff={isStaff} onOpenStatusModal={openStatusModal} />
      </ScreenWrapper>

      <ModalDialog
        visible={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title={`Set Status: ${nextStatus}`}
        confirmText="Update Status"
        loading={updating}
        onConfirm={handleUpdateStatus}
      >
        <View style={styles.modalGroup}>
          <Text style={styles.modalLabel}>Maintenance Note (Optional)</Text>
          <TextInput
            placeholder="e.g. Electrician scheduled tomorrow 10am"
            placeholderTextColor={COLORS.textMuted}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            style={styles.modalInput}
          />
        </View>
      </ModalDialog>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  modalGroup: { marginVertical: SPACING.sm },
  modalLabel: { ...TYPOGRAPHY.captionBold, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  modalInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    color: COLORS.text,
    padding: SPACING.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
