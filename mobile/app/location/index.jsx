import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../src/constants/theme';
import { useLocation } from '../../src/hooks/useLocation';

// Location screen without maps - uses expo-location GPS + reverse geocode only
// Flow: Get current location -> show coords + address -> Confirm
export default function LocationPicker() {
  const { getCurrentLocation, isFetching, error, setError, permission, requestPermission } = useLocation();
  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState('');

  const handleGetCurrent = async () => {
    setError('');
    const loc = await getCurrentLocation();
    if (loc) {
      setCoords({ latitude: loc.latitude, longitude: loc.longitude });
      setAddress(loc.address);
    }
  };

  const handleConfirm = () => {
    if (!coords) {
      Alert.alert('No Location', 'Please get your current location first.');
      return;
    }
    global._selectedLocation = { latitude: coords.latitude, longitude: coords.longitude, address };
    router.back();
  };

  if (permission && !permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Ionicons name="location-outline" size={56} color={COLORS.textMuted} />
        <Text style={styles.permissionTitle}>Location Access Needed</Text>
        <Text style={styles.permissionText}>Allow location to attach complaint location. Your GPS coordinates and address will be attached to the complaint.</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Ionicons name="navigate-outline" size={18} color={COLORS.white} />
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={() => router.back()}>
          <Text style={styles.skipText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Complaint Location</Text>
          <Text style={styles.headerSubtitle}>GPS coordinates + address</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoIconWrap}>
          <Ionicons name="navigate-circle-outline" size={64} color={COLORS.primaryLight} />
          <Text style={styles.infoTitle}>Attach GPS Location</Text>
          <Text style={styles.infoDesc}>Press the button below to capture your current GPS coordinates and auto-filled address. No map required.</Text>
        </View>

        <View style={styles.infoCard}>
          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="warning-outline" size={16} color={COLORS.danger} />
              <Text style={styles.errorTextFlex}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.coordRow}>
            <Ionicons name="pin-outline" size={16} color={COLORS.primaryLight} />
            <Text style={styles.coordLabel}>Latitude</Text>
            <Text style={styles.coordValue}>{coords ? coords.latitude.toFixed(6) : '—'}</Text>
          </View>
          <View style={styles.coordRow}>
            <Ionicons name="pin-outline" size={16} color={COLORS.primaryLight} />
            <Text style={styles.coordLabel}>Longitude</Text>
            <Text style={styles.coordValue}>{coords ? coords.longitude.toFixed(6) : '—'}</Text>
          </View>

          <View style={styles.addressBox}>
            <Text style={styles.addressLabel}>Address (reverse geocoded)</Text>
            <Text style={styles.addressText}>{address || 'Tap "Use Current Location" to capture address'}</Text>
          </View>

          <TouchableOpacity style={styles.getCurrentBtn} onPress={handleGetCurrent} disabled={isFetching}>
            {isFetching ? <ActivityIndicator color={COLORS.primaryLight} size="small" /> : <Ionicons name="navigate" size={18} color={COLORS.primaryLight} />}
            <Text style={styles.getCurrentText}>{isFetching ? 'Getting location...' : 'Use Current Location'}</Text>
          </TouchableOpacity>

          <Pressable style={({ pressed }) => [styles.confirmBtn, pressed && { opacity: 0.85 }, !coords && styles.confirmBtnDisabled]} onPress={handleConfirm} disabled={!coords}>
            <Text style={styles.confirmText}>Confirm Location</Text>
            <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />
          </Pressable>

          <Pressable style={styles.clearBtn} onPress={() => { setCoords(null); setAddress(''); }}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  permissionContainer: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  permissionTitle: { ...TYPOGRAPHY.h2, color: COLORS.text, marginTop: SPACING.md, textAlign: 'center' },
  permissionText: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm, lineHeight: 18 },
  permissionButton: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, borderRadius: RADIUS.md, marginTop: SPACING.lg },
  permissionButtonText: { ...TYPOGRAPHY.bodyBold, color: COLORS.white },
  skipButton: { marginTop: SPACING.md, padding: SPACING.sm },
  skipText: { ...TYPOGRAPHY.captionBold, color: COLORS.textSecondary },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.dangerBg, padding: SPACING.sm, borderRadius: RADIUS.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
  errorText: { ...TYPOGRAPHY.small, color: COLORS.danger, flex: 1, textAlign: 'center', marginTop: SPACING.sm },
  errorTextFlex: { ...TYPOGRAPHY.small, color: COLORS.danger, flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.surfaceElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  headerTitle: { ...TYPOGRAPHY.h3, color: COLORS.text },
  headerSubtitle: { ...TYPOGRAPHY.small, color: COLORS.textMuted, fontSize: 11 },
  scrollContent: { padding: SPACING.lg },
  infoIconWrap: { alignItems: 'center', paddingVertical: SPACING.xl },
  infoTitle: { ...TYPOGRAPHY.h2, color: COLORS.text, marginTop: SPACING.md },
  infoDesc: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm, lineHeight: 18, paddingHorizontal: SPACING.lg },
  infoCard: { backgroundColor: COLORS.surface, padding: SPACING.lg, borderRadius: RADIUS.xl, borderWidth: 1, borderTopWidth: 1, borderColor: COLORS.border },
  coordRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 6 },
  coordLabel: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, width: 70 },
  coordValue: { ...TYPOGRAPHY.captionBold, color: COLORS.text },
  addressBox: { backgroundColor: COLORS.surfaceElevated, padding: SPACING.md, borderRadius: RADIUS.md, marginTop: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  addressLabel: { ...TYPOGRAPHY.small, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10 },
  addressText: { ...TYPOGRAPHY.caption, color: COLORS.text, marginTop: 4, lineHeight: 18 },
  getCurrentBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, marginTop: SPACING.md, paddingVertical: 12, borderRadius: RADIUS.md, backgroundColor: 'rgba(52,211,153,0.12)', borderWidth: 1, borderColor: 'rgba(52,211,153,0.25)' },
  getCurrentText: { ...TYPOGRAPHY.captionBold, color: COLORS.primaryLight },
  confirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: RADIUS.md, marginTop: SPACING.md },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmText: { ...TYPOGRAPHY.bodyBold, color: COLORS.white },
  clearBtn: { alignItems: 'center', paddingVertical: 10, marginTop: 6 },
  clearText: { ...TYPOGRAPHY.captionBold, color: COLORS.textMuted },
});
