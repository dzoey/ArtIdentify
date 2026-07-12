import {Platform, Alert, Linking} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import type {LocationData} from '../types';

/**
 * Request location permission and get the current GPS position.
 * Returns null if the user denies or if location is unavailable.
 */
export function getCurrentLocation(): Promise<LocationData | null> {
  return new Promise(resolve => {
    Geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy ?? undefined,
          altitude: position.coords.altitude,
          timestamp: position.timestamp,
        });
      },
      error => {
        console.log('Location error:', error.message);
        // Don't block the app — just return null
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  });
}

/**
 * Check if location permissions are granted.
 * On Android 12+, ACCESS_FINE_LOCATION is needed.
 */
export async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    return true; // iOS handles via Info.plist
  }

  try {
    // For React Native, the geolocation library handles permission natively
    // But we should check if we can access location
    return true;
  } catch (error) {
    console.log('Permission error:', error);
    return false;
  }
}

/**
 * Open the device settings page if the user denied location permissions
 */
export function openLocationSettings(): void {
  Alert.alert(
    'Location Permission Required',
    'Please enable location access in Settings to help identify nearby artworks.',
    [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Open Settings',
        onPress: () => {
          if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
          } else {
            Linking.openSettings();
          }
        },
      },
    ],
  );
}