import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import type {ScanRecord} from '../types';
import {getAllScans, deleteScan, clearAllScans} from '../services/StorageService';

interface CollectionScreenProps {
  onSelectScan: (scan: ScanRecord) => void;
}

export function CollectionScreen({onSelectScan}: CollectionScreenProps) {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadScans = useCallback(async () => {
    const data = await getAllScans();
    setScans(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadScans();
  }, [loadScans]);

  function handleDelete(id: string) {
    Alert.alert(
      'Delete Scan',
      'Remove this scan from your collection?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteScan(id);
            loadScans();
          },
        },
      ],
    );
  }

  function handleClearAll() {
    Alert.alert(
      'Clear All Scans',
      'Remove all scans from your collection? This cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearAllScans();
            loadScans();
          },
        },
      ],
    );
  }

  function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  function renderItem({item}: {item: ScanRecord}) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => onSelectScan(item)}
        activeOpacity={0.7}>
        <Image
          source={{uri: item.photoUri}}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>
            {item.detectedObjects.map(o => o.label).join(', ') || 'Unknown'}
          </Text>
          <Text style={styles.cardDate}>{formatDate(item.timestamp)}</Text>
          {item.location?.venueName && (
            <Text style={styles.cardLocation}>📍 {item.location.venueName}</Text>
          )}
          <Text style={styles.cardObjects}>
            {item.detectedObjects.length} object
            {item.detectedObjects.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}>
          <Text style={styles.deleteText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Collection</Text>
        {scans.length > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <Text style={styles.emptyText}>Loading...</Text>
      ) : scans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🖼️</Text>
          <Text style={styles.emptyText}>
            Your collection is empty.{'\n'}
            Take photos of art and objects to build your personal gallery!
          </Text>
        </View>
      ) : (
        <FlatList
          data={scans}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#222244',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  clearAllText: {
    color: '#FF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1C1C2E',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333355',
  },
  thumbnail: {
    width: 80,
    height: 80,
  },
  cardInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDate: {
    color: '#8888AA',
    fontSize: 13,
    marginBottom: 2,
  },
  cardLocation: {
    color: '#00E5FF',
    fontSize: 13,
    marginBottom: 2,
  },
  cardObjects: {
    color: '#666688',
    fontSize: 12,
  },
  deleteButton: {
    padding: 16,
    justifyContent: 'center',
  },
  deleteText: {
    color: '#FF4444',
    fontSize: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: '#8888AA',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});