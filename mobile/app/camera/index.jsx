import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../src/constants/theme';
import * as ImageManipulator from 'expo-image-manipulator';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off');
  const [zoom, setZoom] = useState(0);
  const [capturedUri, setCapturedUri] = useState(null);
  const [capturing, setCapturing] = useState(false);

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.permissionText}>Checking camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={56} color={COLORS.textMuted} />
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionText}>Society Connect needs camera to capture complaint photos.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission} activeOpacity={0.85}>
          <Ionicons name="key-outline" size={18} color={COLORS.white} />
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={() => router.back()}>
          <Text style={styles.skipText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      setCapturedUri(photo.uri);
    } catch (e) {
      Alert.alert('Capture Failed', e.message || 'Could not capture image.');
    } finally {
      setCapturing(false);
    }
  };

  const handleUsePhoto = async () => {
    try {
      const result = await ImageManipulator.manipulateAsync(
        capturedUri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      const dataUrl = `data:image/jpeg;base64,${result.base64}`;
      global._cameraEvidence = { uri: result.uri, base64: dataUrl };
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Failed to process image.');
    }
  };

  const toggleFacing = () => setFacing((f) => (f === 'back' ? 'front' : 'back'));
  const toggleFlash = () => setFlash((f) => (f === 'off' ? 'on' : 'off'));
  const zoomIn = () => setZoom((z) => Math.min(z + 0.1, 1));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.1, 0));

  if (capturedUri) {
    return (
      <SafeAreaView style={styles.previewContainer}>
        <View style={styles.previewHeader}>
          <TouchableOpacity onPress={() => setCapturedUri(null)} style={styles.iconBtn}>
            <Ionicons name="refresh-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.previewTitle}>Preview</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="close-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        <Image source={{ uri: capturedUri }} style={styles.previewImage} resizeMode="contain" />
        <View style={styles.previewActions}>
          <Pressable style={styles.retakeBtn} onPress={() => setCapturedUri(null)}>
            <Ionicons name="camera-reverse-outline" size={20} color={COLORS.text} />
            <Text style={styles.retakeText}>Retake</Text>
          </Pressable>
          <Pressable style={styles.useBtn} onPress={handleUsePhoto}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
            <Text style={styles.useText}>Use Photo</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing} flash={flash} zoom={zoom} enableTorch={flash === 'on'}>
        <SafeAreaView edges={['top']} style={styles.topBar}>
          <TouchableOpacity style={styles.topBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={22} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Add Evidence</Text>
          <View style={{ width: 36 }} />
        </SafeAreaView>

        <View style={styles.controlsRow}>
          <View style={styles.zoomGroup}>
            <TouchableOpacity style={styles.zoomBtn} onPress={zoomOut}>
              <Ionicons name="remove" size={16} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.zoomText}>{Math.round(zoom * 10) / 10}x</Text>
            <TouchableOpacity style={styles.zoomBtn} onPress={zoomIn}>
              <Ionicons name="add" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.sideBtn} onPress={toggleFlash}>
            <Ionicons name={flash === 'on' ? 'flash' : 'flash-off'} size={22} color={flash === 'on' ? COLORS.primaryLight : COLORS.white} />
            <Text style={styles.sideLabel}>{flash === 'on' ? 'Flash On' : 'Flash Off'}</Text>
          </TouchableOpacity>

          <Pressable onPress={handleCapture} disabled={capturing} style={({ pressed }) => [styles.shutter, pressed && { opacity: 0.7 }]}>
            {capturing ? <ActivityIndicator color={COLORS.primary} /> : <View style={styles.shutterInner} />}
          </Pressable>

          <TouchableOpacity style={styles.sideBtn} onPress={toggleFacing}>
            <Ionicons name="camera-reverse" size={22} color={COLORS.white} />
            <Text style={styles.sideLabel}>Flip</Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      <View style={styles.hintBar}>
        <Text style={styles.hintText}>Tip: Hold steady • Tap shutter • Use evidence to help resolve faster</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  camera: { flex: 1 },
  permissionContainer: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  permissionTitle: { ...TYPOGRAPHY.h2, color: COLORS.text, marginTop: SPACING.md, textAlign: 'center' },
  permissionText: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm, lineHeight: 18 },
  permissionButton: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, borderRadius: RADIUS.md, marginTop: SPACING.lg },
  permissionButtonText: { ...TYPOGRAPHY.bodyBold, color: COLORS.white },
  skipButton: { marginTop: SPACING.md, padding: SPACING.sm },
  skipText: { ...TYPOGRAPHY.captionBold, color: COLORS.textSecondary },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, backgroundColor: 'rgba(0,0,0,0.35)' },
  topBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  topTitle: { ...TYPOGRAPHY.bodyBold, color: COLORS.white },
  controlsRow: { position: 'absolute', top: 90, alignSelf: 'center', flexDirection: 'row' },
  zoomGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 4, gap: SPACING.xs },
  zoomBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  zoomText: { ...TYPOGRAPHY.captionBold, color: COLORS.white, minWidth: 32, textAlign: 'center' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg + 6, backgroundColor: 'rgba(0,0,0,0.42)' },
  sideBtn: { alignItems: 'center', gap: 4, minWidth: 64 },
  sideLabel: { ...TYPOGRAPHY.small, color: COLORS.white, fontSize: 10 },
  shutter: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: 'rgba(255,255,255,0.8)' },
  shutterInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: COLORS.white, borderWidth: 2, borderColor: COLORS.borderLight },
  hintBar: { backgroundColor: COLORS.surface, paddingVertical: SPACING.sm, alignItems: 'center' },
  hintText: { ...TYPOGRAPHY.small, color: COLORS.textMuted, fontSize: 10 },
  previewContainer: { flex: 1, backgroundColor: COLORS.background },
  previewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.lg },
  previewTitle: { ...TYPOGRAPHY.h3, color: COLORS.text },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  previewImage: { flex: 1, backgroundColor: COLORS.black, marginHorizontal: SPACING.lg, borderRadius: RADIUS.lg },
  previewActions: { flexDirection: 'row', gap: SPACING.md, padding: SPACING.lg },
  retakeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.surfaceElevated },
  retakeText: { ...TYPOGRAPHY.bodyBold, color: COLORS.text },
  useBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.primary },
  useText: { ...TYPOGRAPHY.bodyBold, color: COLORS.white },
});
