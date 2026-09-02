import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../../src/context/AuthContext';
import { ticketAPI, getErrorMessage } from '../../../src/services/api';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, CATEGORIES, PRIORITIES } from '../../../src/constants/theme';
import Header from '../../../src/components/common/Header';
import Input from '../../../src/components/common/Input';
import Button from '../../../src/components/common/Button';
import SuccessModal from '../../../src/components/common/SuccessModal';
import ErrorBanner from '../../../src/components/common/ErrorBanner';
import ImageEvidencePicker from '../../../src/components/complaint/ImageEvidencePicker';
import LocationSection from '../../../src/components/complaint/LocationSection';

export default function RaiseComplaint() {
  const { user } = useAuth();
  const navigation = useNavigation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [evidenceUri, setEvidenceUri] = useState(null);
  const [evidenceImage, setEvidenceImage] = useState('');
  const [location, setLocation] = useState(null);

  // Pick up evidence/location from camera/location screens via global
  useFocusEffect(
    React.useCallback(() => {
      if (global._cameraEvidence) {
        setEvidenceUri(global._cameraEvidence.uri);
        setEvidenceImage(global._cameraEvidence.base64);
        global._cameraEvidence = null;
      }
      if (global._selectedLocation) {
        setLocation(global._selectedLocation);
        global._selectedLocation = null;
      }
    }, [])
  );

  const handleCreateTicket = async () => {
    if (!title.trim()) { setErrorMessage('Please enter an issue title.'); return; }
    if (title.trim().length < 3) { setErrorMessage('Title must be at least 3 characters.'); return; }
    if (!category) { setErrorMessage('Please select a category for your complaint.'); return; }
    if (!description.trim()) { setErrorMessage('Please describe the issue in detail.'); return; }
    if (description.trim().length < 5) { setErrorMessage('Description must be at least 5 characters.'); return; }

    setErrorMessage('');
    setLoading(true);

    try {
      await ticketAPI.createTicket({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        evidenceImage: evidenceImage || undefined,
        location: location || undefined,
      });

      setTitle('');
      setDescription('');
      setCategory('');
      setPriority('Medium');
      setEvidenceUri(null);
      setEvidenceImage('');
      setLocation(null);
      setShowSuccessModal(true);
    } catch (error) {
      const msg = getErrorMessage(error);
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMyTickets = () => {
    setShowSuccessModal(false);
    router.push('/(drawer)/(tabs)/tickets');
  };

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header
        title="Raise Complaint"
        subtitle="Submit a maintenance or service request"
        showDrawer
        onDrawerPress={openDrawer}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.flatBanner}>
            <View style={styles.flatBannerIcon}>
              <Ionicons name="business" size={20} color={COLORS.primaryLight} />
            </View>
            <View style={styles.flatBannerTextContainer}>
              <Text style={styles.flatBannerTitle}>Filing for Flat</Text>
              <Text style={styles.flatBannerValue}>{user?.flatNumber || 'Flat Not Set'}</Text>
            </View>
          </View>

          <View style={styles.card}>
            {errorMessage ? <ErrorBanner message={errorMessage} onDismiss={() => setErrorMessage('')} /> : null}

            <Input label="Issue Title" placeholder="e.g. Master bathroom tap dripping, corridor tube light off" value={title} onChangeText={(text) => { setTitle(text); if (errorMessage) setErrorMessage(''); }} icon="construct-outline" required />

            <View style={styles.selectorGroup}>
              <Text style={styles.selectorLabel}>Category *</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <Pressable key={cat} onPress={() => { setCategory(cat); if (errorMessage) setErrorMessage(''); }} style={({ pressed }) => [styles.categoryTile, isSelected && styles.selectedCategoryTile, pressed && { opacity: 0.7 }]}>
                      <Text style={[styles.categoryTileText, isSelected && styles.selectedCategoryTileText]}>{cat}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.selectorGroup}>
              <Text style={styles.selectorLabel}>Urgency / Priority</Text>
              <View style={styles.priorityRow}>
                {PRIORITIES.map((p) => {
                  const isSelected = priority === p;
                  return (
                    <Pressable key={p} onPress={() => setPriority(p)} style={({ pressed }) => [styles.priorityPill, isSelected && styles.selectedPriorityPill, pressed && { opacity: 0.7 }]}>
                      <Text style={[styles.priorityText, isSelected && styles.selectedPriorityText]}>{p}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Input label="Detailed Description" placeholder="Describe the exact location, symptoms, when the issue started, and any technician access preferences..." value={description} onChangeText={(text) => { setDescription(text); if (errorMessage) setErrorMessage(''); }} multiline numberOfLines={4} required />

            <ImageEvidencePicker
              evidenceUri={evidenceUri}
              evidenceImage={evidenceImage}
              onChange={({ uri, base64 }) => { setEvidenceUri(uri); setEvidenceImage(base64); }}
              onOpenCamera={() => router.push('/camera')}
            />

            <LocationSection location={location} onPick={() => router.push('/location')} onClear={() => setLocation(null)} />

            <Button title="Submit Complaint" onPress={handleCreateTicket} loading={loading} icon="paper-plane-outline" size="lg" style={styles.submitButton} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <SuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Complaint Raised Successfully!"
        message="Your complaint has been submitted successfully."
        primaryButtonText="View My Tickets"
        onPrimaryPress={handleViewMyTickets}
        secondaryButtonText="Done"
        onSecondaryPress={() => setShowSuccessModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  keyboardView: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  flatBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surfaceElevated, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  flatBannerIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(99,102,241,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  flatBannerTextContainer: { flex: 1 },
  flatBannerTitle: { ...TYPOGRAPHY.small, color: COLORS.textSecondary, textTransform: 'uppercase' },
  flatBannerValue: { ...TYPOGRAPHY.bodyBold, color: COLORS.text },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.xl, borderWidth: 1, borderColor: COLORS.border },
  selectorGroup: { marginBottom: SPACING.md + 2 },
  selectorLabel: { ...TYPOGRAPHY.captionBold, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 11, marginBottom: SPACING.xs + 2 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs + 2 },
  categoryTile: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: RADIUS.md, backgroundColor: COLORS.surfaceElevated, borderWidth: 1, borderColor: COLORS.border },
  selectedCategoryTile: { backgroundColor: 'rgba(99,102,241,0.2)', borderColor: COLORS.primaryLight },
  categoryTileText: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, fontWeight: '500' },
  selectedCategoryTileText: { color: COLORS.primaryLight, fontWeight: '700' },
  priorityRow: { flexDirection: 'row', gap: SPACING.sm },
  priorityPill: { flex: 1, paddingVertical: 8, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.md, backgroundColor: COLORS.surfaceElevated, borderWidth: 1, borderColor: COLORS.border },
  selectedPriorityPill: { backgroundColor: COLORS.primary, borderColor: COLORS.primaryLight },
  priorityText: { ...TYPOGRAPHY.captionBold, color: COLORS.textSecondary },
  selectedPriorityText: { color: COLORS.white },
  submitButton: { marginTop: SPACING.md },
});
