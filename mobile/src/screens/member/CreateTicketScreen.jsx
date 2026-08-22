import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { ticketAPI, getErrorMessage } from '../../services/api';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, CATEGORIES, PRIORITIES } from '../../constants/theme';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import SuccessModal from '../../components/common/SuccessModal';

export const CreateTicketScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleCreateTicket = async () => {
    if (!title.trim()) {
      setErrorMessage('Please enter an issue title.');
      return;
    }
    if (title.trim().length < 3) {
      setErrorMessage('Title must be at least 3 characters.');
      return;
    }
    if (!category) {
      setErrorMessage('Please select a category for your complaint.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Please describe the issue in detail.');
      return;
    }
    if (description.trim().length < 5) {
      setErrorMessage('Description must be at least 5 characters.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      await ticketAPI.createTicket({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      setPriority('Medium');

      setShowSuccessModal(true);
    } catch (error) {
      const msg = getErrorMessage(error);
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMyTickets = () => {
    navigation.navigate('TicketsTab');
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header
        title="Raise Complaint"
        subtitle="Submit a maintenance or service request"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Unit Info Banner */}
          <View style={styles.flatBanner}>
            <View style={styles.flatBannerIcon}>
              <Ionicons name="business" size={20} color={COLORS.primaryLight} />
            </View>
            <View style={styles.flatBannerTextContainer}>
              <Text style={styles.flatBannerTitle}>Filing for Flat</Text>
              <Text style={styles.flatBannerValue}>
                {user?.flatNumber || 'Flat Not Set'}
              </Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {errorMessage ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={18} color={COLORS.danger} />
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            ) : null}

            <Input
              label="Issue Title"
              placeholder="e.g. Master bathroom tap dripping, corridor tube light off"
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (errorMessage) setErrorMessage('');
              }}
              icon="construct-outline"
              required
            />

            {/* Category Selector */}
            <View style={styles.selectorGroup}>
              <Text style={styles.selectorLabel}>Category *</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => {
                        setCategory(cat);
                        if (errorMessage) setErrorMessage('');
                      }}
                      style={[
                        styles.categoryTile,
                        isSelected && styles.selectedCategoryTile,
                      ]}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.categoryTileText,
                          isSelected && styles.selectedCategoryTileText,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Priority Selector */}
            <View style={styles.selectorGroup}>
              <Text style={styles.selectorLabel}>Urgency / Priority</Text>
              <View style={styles.priorityRow}>
                {PRIORITIES.map((p) => {
                  const isSelected = priority === p;
                  return (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setPriority(p)}
                      style={[
                        styles.priorityPill,
                        isSelected && styles.selectedPriorityPill,
                      ]}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.priorityText,
                          isSelected && styles.selectedPriorityText,
                        ]}
                      >
                        {p}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <Input
              label="Detailed Description"
              placeholder="Describe the exact location, symptoms, when the issue started, and any technician access preferences..."
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                if (errorMessage) setErrorMessage('');
              }}
              multiline
              numberOfLines={4}
              required
            />

            <Button
              title="Submit Complaint"
              onPress={handleCreateTicket}
              loading={loading}
              icon="paper-plane-outline"
              size="lg"
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <SuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Complaint Raised Successfully!"
        message="Your complaint has been submitted successfully."
        primaryButtonText="View My Tickets"
        onPrimaryPress={handleViewMyTickets}
        secondaryButtonText="Done"
        onSecondaryPress={handleSuccessModalClose}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  flatBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  flatBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  flatBannerTextContainer: {
    flex: 1,
  },
  flatBannerTitle: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  flatBannerValue: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.text,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerBg,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  errorBannerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.danger,
    flex: 1,
    fontWeight: '500',
  },
  selectorGroup: {
    marginBottom: SPACING.md + 2,
  },
  selectorLabel: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 11,
    marginBottom: SPACING.xs + 2,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs + 2,
  },
  categoryTile: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedCategoryTile: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: COLORS.primaryLight,
  },
  categoryTileText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  selectedCategoryTileText: {
    color: COLORS.primaryLight,
    fontWeight: '700',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  priorityPill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedPriorityPill: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  priorityText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textSecondary,
  },
  selectedPriorityText: {
    color: COLORS.white,
  },
  submitButton: {
    marginTop: SPACING.md,
  },
});

export default CreateTicketScreen;
