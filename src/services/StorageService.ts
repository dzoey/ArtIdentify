import AsyncStorage from '@react-native-async-storage/async-storage';
import type {ScanRecord} from '../types';

const STORAGE_KEY = '@artidentify_scans';

/**
 * StorageService — persists the user's personal collection of scanned objects
 * using AsyncStorage. Each scan record includes the photo, detected objects,
 * location, and timestamp.
 */

export async function saveScan(scan: ScanRecord): Promise<void> {
  try {
    const existing = await getAllScans();
    const updated = [scan, ...existing];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save scan:', error);
  }
}

export async function getAllScans(): Promise<ScanRecord[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as ScanRecord[];
  } catch (error) {
    console.error('Failed to load scans:', error);
    return [];
  }
}

export async function deleteScan(id: string): Promise<void> {
  try {
    const existing = await getAllScans();
    const updated = existing.filter(scan => scan.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to delete scan:', error);
  }
}

export async function clearAllScans(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear scans:', error);
  }
}

export async function getScanById(id: string): Promise<ScanRecord | null> {
  try {
    const all = await getAllScans();
    return all.find(scan => scan.id === id) || null;
  } catch (error) {
    console.error('Failed to get scan:', error);
    return null;
  }
}