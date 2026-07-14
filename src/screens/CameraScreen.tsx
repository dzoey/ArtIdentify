import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {Camera, useCameraDevice, useCameraPermission} from 'react-native-vision-camera';
import type {DetectedObject, LocationData} from '../types';
import {detectObjects} from '../services/DetectionService';
import {getCurrentLocation} from '../services/LocationService';

interface CameraScreenProps {
  onPhotoCaptured: (
    photoUri: string,
    objects: DetectedObject[],
    location: LocationData | null,
  ) => void;
}

export function CameraScreen({onPhotoCaptured}: CameraScreenProps) {
  const cameraRef = useRef<any>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [flash, setFlash] = useState(false);
  const device = useCameraDevice('back');
  const { requestPermission: requestCameraPermission } = useCameraPermission();

  useEffect(() => {
    requestPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function requestPermissions() {
    if (Platform.OS === 'android') {
      try {
        const cameraGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        setHasPermission(cameraGranted === PermissionsAndroid.RESULTS.GRANTED);
      } catch (err) {
        console.warn('Permission error:', err);
      }
    } else {
      const cameraPermission = await requestCameraPermission();
      setHasPermission(cameraPermission === true);
    }
  }

  async function handleCapture() {
    if (!cameraRef.current || isProcessing) return;

    setIsProcessing(true);

    try {
      // 1. Capture the photo
      const photo = await cameraRef.current.takePhoto({
        flash: flash ? 'on' : 'off',
        quality: 'high',
        skipMetadata: false,
      });

      const photoUri = `file://${photo.path}`;

      // 2. Get current location (non-blocking — don't fail if denied)
      const location = await getCurrentLocation();

      // 3. Run on-device object detection
      const result = await detectObjects(photoUri);

      // 4. Pass everything to the results screen
      onPhotoCaptured(photoUri, result.objects, location);
    } catch (error) {
      console.error('Capture error:', error);
      Alert.alert('Error', 'Failed to capture and analyze photo. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera permission is required</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermissions}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color="#00E5FF" />
        <Text style={styles.permissionText}>Loading camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill as any}
        device={device}
        isActive={true}
      />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.title}>ArtIdentify</Text>
        <TouchableOpacity
          style={styles.flashButton}
          onPress={() => setFlash(!flash)}>
          <Text style={styles.flashText}>{flash ? '⚡ ON' : '⚡ OFF'}</Text>
        </TouchableOpacity>
      </View>

      {/* Viewfinder guide */}
      <View style={styles.viewfinder} pointerEvents="none">
        <View style={styles.viewfinderCornerTL} />
        <View style={styles.viewfinderCornerTR} />
        <View style={styles.viewfinderCornerBL} />
        <View style={styles.viewfinderCornerBR} />
        <Text style={styles.viewfinderText}>
          Point at a painting, sculpture, or artifact
        </Text>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomBar}>
        {isProcessing ? (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#00E5FF" />
            <Text style={styles.processingText}>Analyzing...</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleCapture}
            disabled={isProcessing}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A1A',
  },
  permissionText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#00E5FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 16,
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 4,
  },
  flashButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  flashText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  viewfinder: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    right: '10%',
    bottom: '25%',
  },
  viewfinderCornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#00E5FF',
  },
  viewfinderCornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#00E5FF',
  },
  viewfinderCornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#00E5FF',
  },
  viewfinderCornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#00E5FF',
  },
  viewfinderText: {
    position: 'absolute',
    bottom: -30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#00E5FF',
    fontSize: 14,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: '#00E5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00E5FF',
  },
  processingContainer: {
    alignItems: 'center',
  },
  processingText: {
    color: '#00E5FF',
    fontSize: 16,
    marginTop: 8,
    fontWeight: '600',
  },
});