import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';

// Evidence picker: camera + gallery, compressed before upload
export const ImageEvidencePicker = ({ evidenceUri, evidenceImage, onChange, onOpenCamera, editable = true }) => {
  const [loading, setLoading] = useState(false);

  const processImage = async (uri) => {
    try {
      setLoading(true);
      if (!uri) throw new Error('No image selected');

      // Compress & resize: reduce upload size for MongoDB (max width 800, quality 0.7)
      const manipulated = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      const dataUrl = `data:image/jpeg;base64,${manipulated.base64}`;

      if (dataUrl.length > 2_500_000) {
        Alert.alert('Image Too Large', 'Please select a smaller image or crop it.');
        return;
      }

      onChange({ uri: manipulated.uri, base64: dataUrl });
    } catch (e) {
      Alert.alert('Image Error', e.message || 'Failed to process image.');
    } finally {
      setLoading(false);
    }
  };

  const handlePickGallery = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Allow photo library access to attach evidence.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await processImage(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Gallery Error', e.message);
    }
  };

  const handleRemove = () => {
    Alert.alert('Remove Evidence', 'Remove attached photo?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => onChange({ uri: null, base64: '' }) },
    ]);
  };

  if (evidenceUri) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Evidence Photo</Text>
        <View style={styles.previewCard}>
          <Image source={{ uri: evidenceUri }} style={styles.previewImage} resizeMode="cover" />
          {editable && (
            <View style={styles.previewActions}>
              <Pressable style={styles.secondaryBtn} onPress={onOpenCamera}>
                <Ionicons name="camera-outline" size={16} color={COLORS.text} />
                <Text style={styles.secondaryText}>Retake</Text>
              </Pressable>
              <Pressable style={styles.removeBtn} onPress={handleRemove}>
                <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            </View>
          )}
        </View>
        <Text style={styles.hint}>Attached and will be sent with the complaint</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Evidence Photo (Optional)</Text>

      {loading ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator color={COLORS.text} size="small" />
          <Text style={styles.loadingText}>Processing image...</Text>
        </View>
      ) : (
        <View style={styles.buttonsRow}>
          <Pressable
            style={({ pressed }) => [styles.pickBtn, pressed && { opacity: 0.85 }]}
            onPress={onOpenCamera}
          >
            <Ionicons name="camera" size={18} color={COLORS.white} />
            <Text style={styles.pickText}>Take Photo</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.pickBtnSecondary, pressed && { opacity: 0.85 }]}
            onPress={handlePickGallery}
          >
            <Ionicons name="images-outline" size={18} color={COLORS.text} />
            <Text style={styles.pickSecondaryText}>Gallery</Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.hint}>Photos are compressed to 800px JPEG before upload</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.md },
  label: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 6,
  },
  buttonsRow: { flexDirection: 'row', gap: SPACING.sm },
  pickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: RADIUS.md,
  },
  pickText: { ...TYPOGRAPHY.captionBold, color: COLORS.white, fontSize: 13 },
  pickBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surfaceElevated,
    paddingVertical: 13,
    borderRadius: RADIUS.md,
  },
  pickSecondaryText: { ...TYPOGRAPHY.captionBold, color: COLORS.text, fontSize: 13 },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surfaceElevated,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  loadingText: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary },
  previewCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  previewImage: { width: '100%', height: 200 },
  previewActions: { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.sm },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
  },
  secondaryText: { ...TYPOGRAPHY.small, color: COLORS.text, fontWeight: '600' },
  removeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.dangerBg,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
  },
  removeText: { ...TYPOGRAPHY.small, color: COLORS.danger, fontWeight: '600' },
  hint: { ...TYPOGRAPHY.small, color: COLORS.textMuted, marginTop: 7, fontSize: 10.5 },
});

export default ImageEvidencePicker;
