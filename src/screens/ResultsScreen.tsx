import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import type {DetectedObject, LocationData, ObjectInfo} from '../types';
import {DetectionOverlay} from '../components/DetectionOverlay';
import {ObjectCard} from '../components/ObjectCard';
import {getObjectInfo} from '../services/InfoService';
import {findNearestVenue} from '../services/MuseumLocations';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const IMAGE_HEIGHT = Math.round(SCREEN_WIDTH * 1.2);

interface ResultsScreenProps {
  photoUri: string;
  objects: DetectedObject[];
  location: LocationData | null;
  onObjectSelected: (info: ObjectInfo) => void;
  onRetake: () => void;
  onSaveScan: () => void;
}

export function ResultsScreen({
  photoUri,
  objects,
  location,
  onObjectSelected,
  onRetake,
  onSaveScan,
}: ResultsScreenProps) {
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [loadingObjectId, setLoadingObjectId] = useState<string | null>(null);
  const [venueName, setVenueName] = useState<string | null>(null);

  useEffect(() => {
    if (location) {
      const venue = findNearestVenue(location);
      if (venue) {
        setVenueName(venue.name);
      }
    }
  }, [location]);

  async function handleObjectPress(obj: DetectedObject) {
    setLoadingObjectId(obj.id);
    try {
      const info = await getObjectInfo(obj, location);
      onObjectSelected(info);
    } catch (error) {
      console.error('Info retrieval error:', error);
    } finally {
      setLoadingObjectId(null);
    }
  }

  return (
    <ScrollView style={styles.container} bounces={false}>
      {/* Photo with detection overlay */}
      <View style={styles.imageContainer}>
        <Image
          source={{uri: photoUri}}
          style={styles.image}
          resizeMode="cover"
        />
        <DetectionOverlay
          imageWidth={SCREEN_WIDTH}
          imageHeight={IMAGE_HEIGHT}
          objects={objects}
          selectedObjectId={selectedObjectId}
          onSelectObject={(obj) => {
            setSelectedObjectId(obj.id);
            handleObjectPress(obj);
          }}
        />

        {/* Location badge */}
        {venueName && (
          <View style={styles.locationBadge}>
            <Text style={styles.locationText}>📍 {venueName}</Text>
          </View>
        )}

        {/* Object count badge */}
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {objects.length} object{objects.length !== 1 ? 's' : ''} found
          </Text>
        </View>
      </View>

      {/* Object list */}
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>
          {objects.length > 1
            ? 'Tap an object to learn more'
            : objects.length === 1
            ? 'Object identified'
            : 'No objects detected'}
        </Text>

        {objects.length === 0 && (
          <Text style={styles.emptyText}>
            Try taking another photo with better lighting or closer to the object.
          </Text>
        )}

        {objects.map(obj => (
          <View key={obj.id}>
            {loadingObjectId === obj.id ? (
              <View style={styles.loadingCard}>
                <ActivityIndicator size="small" color="#00E5FF" />
                <Text style={styles.loadingText}>Fetching info...</Text>
              </View>
            ) : (
              <ObjectCard object={obj} onPress={handleObjectPress} />
            )}
          </View>
        ))}
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.saveButton} onPress={onSaveScan}>
          <Text style={styles.saveButtonText}>💾 Save to Collection</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.retakeButton} onPress={onRetake}>
          <Text style={styles.retakeButtonText}>📷 Take Another</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1A',
  },
  imageContainer: {
    position: 'relative',
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  locationBadge: {
    position: 'absolute',
    top: 50,
    left: 16,
    backgroundColor: 'rgba(0, 229, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  locationText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
  },
  countBadge: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  listContainer: {
    paddingVertical: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  emptyText: {
    color: '#8888AA',
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 20,
    textAlign: 'center',
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C2E',
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#00E5FF',
    gap: 8,
  },
  loadingText: {
    color: '#00E5FF',
    fontSize: 15,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    paddingBottom: 40,
  },
  saveButton: {
    backgroundColor: '#00E5FF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  saveButtonText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 15,
  },
  retakeButton: {
    backgroundColor: '#1C1C2E',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444466',
  },
  retakeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});