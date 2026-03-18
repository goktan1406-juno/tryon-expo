import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Alert } from 'react-native';

// Ensure the image is a JPEG regardless of source format (HEIC, HEIF, etc.)
async function toJpeg(asset) {
  if (asset.uri?.toLowerCase().match(/\.(jpg|jpeg)$/)) return asset;
  const result = await ImageManipulator.manipulateAsync(
    asset.uri,
    [],
    { compress: 0.88, format: ImageManipulator.SaveFormat.JPEG }
  );
  return { ...asset, uri: result.uri, width: result.width, height: result.height };
}

export function useImagePicker() {
  const [image, setImage] = useState(null); // { uri, width, height }

  const requestPermission = async (type) => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    }
  };

  const pickFromLibrary = useCallback(async () => {
    const ok = await requestPermission('library');
    if (!ok) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.85,
    });
    if (!result.canceled && result.assets?.[0]) {
      setImage(await toJpeg(result.assets[0]));
    }
  }, []);

  const pickFromCamera = useCallback(async () => {
    const ok = await requestPermission('camera');
    if (!ok) {
      Alert.alert('Permission Required', 'Please allow camera access.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.85,
    });
    if (!result.canceled && result.assets?.[0]) {
      setImage(await toJpeg(result.assets[0]));
    }
  }, []);

  const showPicker = useCallback(() => {
    Alert.alert('Select Image', '', [
      { text: 'Gallery', onPress: pickFromLibrary },
      { text: 'Camera', onPress: pickFromCamera },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [pickFromLibrary, pickFromCamera]);

  const clear = useCallback(() => setImage(null), []);
  const setExternalImage = useCallback((asset) => setImage(asset), []);

  return { image, showPicker, pickFromLibrary, pickFromCamera, clear, setExternalImage };
}
