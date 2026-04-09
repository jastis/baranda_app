import { storage } from '../services/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export interface ImageUploadResult {
  url: string;
  path: string;
}

/**
 * Request camera permissions
 */
export const requestCameraPermissions = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission Required', 'Camera permission is required to take photos.');
    return false;
  }
  return true;
};

/**
 * Request media library permissions
 */
export const requestMediaLibraryPermissions = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission Required', 'Media library permission is required to select photos.');
    return false;
  }
  return true;
};

/**
 * Pick an image from the gallery
 */
export const pickImage = async (): Promise<string | null> => {
  const hasPermission = await requestMediaLibraryPermissions();
  if (!hasPermission) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.canceled && result.assets[0]) {
    return result.assets[0].uri;
  }

  return null;
};

/**
 * Take a photo with the camera
 */
export const takePhoto = async (): Promise<string | null> => {
  const hasPermission = await requestCameraPermissions();
  if (!hasPermission) return null;

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.canceled && result.assets[0]) {
    return result.assets[0].uri;
  }

  return null;
};

/**
 * Upload image to Firebase Storage
 * @param uri - Local image URI
 * @param folder - Storage folder (e.g., 'products', 'profiles', 'responses')
 * @param userId - User ID for organizing files
 * @param onProgress - Optional progress callback (0-100)
 */
export const uploadImage = async (
  uri: string,
  folder: string,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<ImageUploadResult> => {
  try {
    // Fetch the image as a blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${folder}/${userId}/${timestamp}.jpg`;
    const storageRef = ref(storage, filename);

    // Upload with progress tracking
    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(Math.round(progress));
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              url: downloadURL,
              path: filename,
            });
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};

/**
 * Upload multiple images
 */
export const uploadMultipleImages = async (
  uris: string[],
  folder: string,
  userId: string,
  onProgress?: (index: number, progress: number) => void
): Promise<ImageUploadResult[]> => {
  const uploadPromises = uris.map((uri, index) =>
    uploadImage(uri, folder, userId, (progress) => {
      onProgress?.(index, progress);
    })
  );

  return Promise.all(uploadPromises);
};

/**
 * Delete image from Firebase Storage
 */
export const deleteImage = async (imagePath: string): Promise<void> => {
  try {
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Image deletion error:', error);
    throw error;
  }
};

/**
 * Show image picker options (Camera or Gallery)
 */
export const showImagePickerOptions = (): Promise<string | null> => {
  return new Promise((resolve) => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const uri = await takePhoto();
            resolve(uri);
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            const uri = await pickImage();
            resolve(uri);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => resolve(null),
        },
      ],
      { cancelable: true }
    );
  });
};
