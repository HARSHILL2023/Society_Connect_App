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

// Dynamic route: app/ticket/[id].jsx
// Access via router.push(`/ticket/${ticketId}`)
// Params available via useLocalSearchParams()
export default function TicketDetail() {
  const { id } = useLocalSearchParams();
  const ticketId = id;
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedNextStatus, setSelectedNextStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  const isStaff = user?.role === 'Manager' || user?.role === 'Admin';

  const loadTicket = async () => {
    try {
      const data = await ticketAPI.getTicketById(ticketId);
      setTicket(data);
      setStatusNote(data.statusNote || '');
    } catch (error) {
      console.log('Error fetching ticket details:', error);
      Alert.alert('Error', 'Unable to retrieve ticket details.', [
        { text: 'Go Back', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) loadTicket();
  }, [ticketId]);

  const handleOpenStatusModal = (nextStatus) => {
    setSelectedNextStatus(nextStatus);
    setStatusModalVisible(true);
  };

  const handleConfirmStatusUpdate = async () => {
    if (!selectedNextStatus) return;
    setUpdating(true);
    try {
      const updated = await ticketAPI.updateTicketStatus(ticketId, {
        status: selectedNextStatus,
        statusNote: statusNote.trim(),
      });
      setTicket(updated);
      setStatusModalVisible(false);
      Alert.alert('Success', `Ticket marked as ${selectedNextStatus}.`);
    } catch (error) {
      Alert.alert('Update Failed', getErrorMessage(error));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading ticket details..." />;
  }

  if (!ticket) {
    return null;
  }

  const header = (
    <Header
      title="Ticket Details"
      subtitle={`ID: #${ticket.id ? ticket.id.substring(ticket.id.length - 6).toUpperCase() : 'TICKET'}`}
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
        <TicketStaffActions ticket={ticket} isStaff={isStaff} onOpenStatusModal={handleOpenStatusModal} />
      </ScreenWrapper>

      <ModalDialog
        visible={statusModalVisible}
        onClose={() => setStatusModalVisible(false)}
        title={`Set Status: ${selectedNextStatus}`}
        confirmText="Update Status"
        confirmVariant="primary"
        loading={updating}
        onConfirm={handleConfirmStatusUpdate}
      >
        <View style={styles.modalInputGroup}>
          <Text style={styles.modalInputLabel}>Maintenance Note (Optional)</Text>
          <TextInput
            placeholder="e.g. Electrician scheduled for tomorrow 10am / Replaced pipe washer"
            placeholderTextColor={COLORS.textMuted}
            value={statusNote}
            onChangeText={setStatusNote}
            multiline
            numberOfLines={3}
            style={styles.modalTextInput}
          />
        </View>
      </ModalDialog>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  modalInputGroup: { marginVertical: SPACING.sm },
  modalInputLabel: { ...TYPOGRAPHY.captionBold, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  modalTextInput: {
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
