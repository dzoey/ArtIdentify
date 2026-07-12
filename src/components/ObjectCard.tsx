import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import type {DetectedObject} from '../types';

interface ObjectCardProps {
  object: DetectedObject;
  onPress: (obj: DetectedObject) => void;
}

/**
 * ObjectCard — a compact card showing a detected object's label and confidence.
 * Used in the list view when multiple objects are detected.
 */
export function ObjectCard({object, onPress}: ObjectCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => onPress(object)}>
      <View style={styles.cardContent}>
        <Text style={styles.label}>{object.label}</Text>
        <Text style={styles.confidence}>
          {Math.round(object.confidence * 100)}% confidence
        </Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C2E',
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#333355',
  },
  cardContent: {
    flex: 1,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  confidence: {
    fontSize: 14,
    color: '#8888AA',
  },
  arrow: {
    fontSize: 28,
    color: '#555577',
    marginLeft: 8,
  },
});