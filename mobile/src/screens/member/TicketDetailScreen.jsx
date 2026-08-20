import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { ticketAPI, getErrorMessage } from '../../services/api';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, STATUSES } from '../../constants/theme';
import Header from '../../components/common/Header';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingScreen from '../../components/common/LoadingScreen';
import ModalDialog from '../../components/common/ModalDialog';

export const TicketDetailScreen = ({ route, navigation }) => {
  const { ticketId } = route.params;
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Status update modal state
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedNextStatus, setSelectedNextStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  const isStaff = user?.role === 'Manager' || user?.role === 'Admin';

  const fetchTicket = async () => {
    try {
      const data = await ticketAPI.getTicketById(ticketId);
      setTicket(data);
      setStatusNote(data.statusNote || '');
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      Alert.alert('Error', 'Unable to retrieve ticket details.', [
        { text: 'Go Back', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <LoadingScreen message="Loading ticket details..." />;
  }

  if (!ticket) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header
        title="Ticket Details"
        subtitle={`ID: #${ticket.id ? ticket.id.substring(ticket.id.length - 6).toUpperCase() : 'TICKET'}`}
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Info Card */}
        <View style={styles.card}>
          {/* Status & Category row */}
          <View style={styles.topRow}>
            <Badge label={ticket.category} size="md" />
            <Badge label={ticket.status} variant={ticket.status} size="md" />
          </View>

          {/* Title */}
          <Text style={styles.title}>{ticket.title}</Text>

          {/* Description */}
          <Text style={styles.sectionLabel}>Complaint Description</Text>
          <Text style={styles.description}>{ticket.description}</Text>

          {/* Resolution / Manager Note if available */}
          {ticket.statusNote ? (
            <View style={styles.noteBox}>
              <View style={styles.noteHeader}>
                <Ionicons name="clipboard-outline" size={16} color={COLORS.primaryLight} />
                <Text style={styles.noteTitle}>Staff Maintenance Note</Text>
              </View>
              <Text style={styles.noteText}>{ticket.statusNote}</Text>
            </View>
          ) : null}
        </View>

        {/* Location & Resident Details */}
        <View style={styles.card}>
          <Text style={styles.cardSectionHeader}>Residence & Contact</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Ionicons name="business-outline" size={18} color={COLORS.primaryLight} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Flat / Unit</Text>
              <Text style={styles.infoValue}>
                {ticket.flatNumber || ticket.raisedBy?.flatNumber || 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Ionicons name="person-outline" size={18} color={COLORS.primaryLight} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Raised By</Text>
              <Text style={styles.infoValue}>
                {ticket.raisedBy?.name || 'Society Resident'}
              </Text>
            </View>
          </View>

          {ticket.raisedBy?.email && (
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="mail-outline" size={18} color={COLORS.primaryLight} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{ticket.raisedBy.email}</Text>
              </View>
            </View>
          )}

          {ticket.raisedBy?.phone && (
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="call-outline" size={18} color={COLORS.primaryLight} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{ticket.raisedBy.phone}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Timeline & Metadata */}
        <View style={styles.card}>
          <Text style={styles.cardSectionHeader}>Timeline</Text>

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: COLORS.pending }]} />
            <View style={styles.timelineTextContainer}>
              <Text style={styles.timelineTitle}>Ticket Created</Text>
              <Text style={styles.timelineDate}>{formatDate(ticket.createdAt)}</Text>
            </View>
          </View>

          {ticket.status === 'In Progress' || ticket.status === 'Resolved' ? (
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: COLORS.inProgress }]} />
              <View style={styles.timelineTextContainer}>
                <Text style={styles.timelineTitle}>Assigned / In Progress</Text>
                <Text style={styles.timelineDate}>
                  {formatDate(ticket.updatedAt)}
                </Text>
              </View>
            </View>
          ) : null}

          {ticket.status === 'Resolved' && (
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: COLORS.resolved }]} />
              <View style={styles.timelineTextContainer}>
                <Text style={styles.timelineTitle}>Resolved & Closed</Text>
                <Text style={styles.timelineDate}>
                  {formatDate(ticket.resolvedAt || ticket.updatedAt)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Staff Action Controls (Manager & Admin only) */}
        {isStaff && (
          <View style={styles.card}>
            <Text style={styles.cardSectionHeader}>Staff Action Desk</Text>
            <Text style={styles.actionPrompt}>
              Update the current progress or complete the maintenance service
            </Text>

            <View style={styles.staffButtonsRow}>
              {ticket.status !== 'In Progress' && (
                <Button
                  title="Mark In Progress"
                  onPress={() => handleOpenStatusModal('In Progress')}
                  variant="secondary"
                  icon="construct-outline"
                  style={styles.staffButton}
                />
              )}

              {ticket.status !== 'Resolved' && (
                <Button
                  title="Mark Resolved"
                  onPress={() => handleOpenStatusModal('Resolved')}
                  variant="primary"
                  icon="checkmark-circle-outline"
                  style={styles.staffButton}
                />
              )}

              {ticket.status === 'Resolved' && (
                <Button
                  title="Reopen Ticket"
                  onPress={() => handleOpenStatusModal('Pending')}
                  variant="outline"
                  icon="refresh-outline"
                  style={styles.staffButton}
                />
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Status Update Modal */}
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
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    fontSize: 22,
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    ...TYPOGRAPHY.small,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  noteBox: {
    marginTop: SPACING.md,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primaryLight,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  noteTitle: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.primaryLight,
  },
  noteText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    lineHeight: 18,
  },
  cardSectionHeader: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  infoIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    ...TYPOGRAPHY.small,
    color: COLORS.textMuted,
  },
  infoValue: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.text,
    marginTop: 1,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: SPACING.md,
  },
  timelineTextContainer: {
    flex: 1,
  },
  timelineTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.text,
  },
  timelineDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  actionPrompt: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  staffButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  staffButton: {
    flex: 1,
  },
  modalInputGroup: {
    marginVertical: SPACING.sm,
  },
  modalInputLabel: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
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

export default TicketDetailScreen;
