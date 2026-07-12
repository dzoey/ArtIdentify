import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
  Dimensions,
} from 'react-native';
import type {ObjectInfo} from '../types';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface DetailScreenProps {
  info: ObjectInfo;
  photoUri?: string;
  onBack: () => void;
}

export function DetailScreen({info, photoUri, onBack}: DetailScreenProps) {
  const obj = info.detectedObject;

  return (
    <ScrollView style={styles.container}>
      {/* Header with photo thumbnail */}
      {photoUri && (
        <Image
          source={{uri: photoUri}}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      )}

      {/* Title section */}
      <View style={styles.header}>
        <Text style={styles.title}>{obj.label}</Text>
        <Text style={styles.confidence}>
          Identified with {Math.round(obj.confidence * 100)}% confidence
        </Text>
        {info.infoSource && (
          <View style={styles.sourceBadge}>
            <Text style={styles.sourceText}>
              Source: {info.infoSource.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Info content */}
      <View style={styles.content}>
        {obj.artist && (
          <InfoRow label="Artist" value={obj.artist} />
        )}
        {obj.title && (
          <InfoRow label="Title" value={obj.title} />
        )}
        {obj.date && (
          <InfoRow label="Date" value={obj.date} />
        )}
        {obj.medium && (
          <InfoRow label="Medium" value={obj.medium} />
        )}
        {obj.dimensions && (
          <InfoRow label="Dimensions" value={obj.dimensions} />
        )}

        {/* Main description */}
        {info.infoText && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bodyText}>{info.infoText}</Text>
          </View>
        )}

        {/* Provenance */}
        {obj.provenance && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Provenance & Ownership History</Text>
            <Text style={styles.bodyText}>{obj.provenance}</Text>
          </View>
        )}

        {/* Cultural significance */}
        {obj.culturalSignificance && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cultural Significance</Text>
            <Text style={styles.bodyText}>{obj.culturalSignificance}</Text>
          </View>
        )}

        {/* Critical reception */}
        {obj.criticalReception && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Critical Reception</Text>
            <Text style={styles.bodyText}>{obj.criticalReception}</Text>
          </View>
        )}

        {/* External links */}
        {info.externalLinks && info.externalLinks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Learn More</Text>
            {info.externalLinks.map((link, i) => (
              <TouchableOpacity
                key={i}
                style={styles.linkButton}
                onPress={() => Linking.openURL(link.url)}>
                <Text style={styles.linkText}>🔗 {link.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Back to Results</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1A',
  },
  thumbnail: {
    width: SCREEN_WIDTH,
    height: 250,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222244',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  confidence: {
    color: '#8888AA',
    fontSize: 14,
    marginBottom: 8,
  },
  sourceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1C1C2E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#333355',
  },
  sourceText: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#222244',
  },
  infoLabel: {
    color: '#8888AA',
    fontSize: 15,
    fontWeight: '600',
    width: 100,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 15,
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: '#00E5FF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  bodyText: {
    color: '#CCCCCC',
    fontSize: 16,
    lineHeight: 24,
  },
  linkButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1C1C2E',
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#333355',
  },
  linkText: {
    color: '#00E5FF',
    fontSize: 15,
    fontWeight: '600',
  },
  backButton: {
    margin: 20,
    marginTop: 10,
    padding: 16,
    backgroundColor: '#1C1C2E',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444466',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});