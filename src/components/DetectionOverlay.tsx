import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Dimensions} from 'react-native';
import type {DetectedObject} from '../types';

interface DetectionOverlayProps {
  imageWidth: number;
  imageHeight: number;
  objects: DetectedObject[];
  selectedObjectId: string | null;
  onSelectObject: (obj: DetectedObject) => void;
}

/**
 * DetectionOverlay — renders bounding boxes over the captured photo.
 * Each box is tappable; tapping selects that object for info retrieval.
 *
 * The bounding boxes from ML Kit are in image coordinates.
 * We scale them to the displayed image size.
 */
export function DetectionOverlay({
  imageWidth,
  imageHeight,
  objects,
  selectedObjectId,
  onSelectObject,
}: DetectionOverlayProps) {
  if (objects.length === 0) return null;

  return (
    <View style={styles.container}>
      {objects.map((obj, index) => {
        const isSelected = selectedObjectId === obj.id;
        const box = obj.boundingBox;

        // Scale bounding box to displayed image dimensions
        // The detection coordinates are typically in a 0-400 space
        const scaleX = imageWidth / 400;
        const scaleY = imageHeight / 400;

        const left = box.x * scaleX;
        const top = box.y * scaleY;
        const width = box.width * scaleX;
        const height = box.height * scaleY;

        return (
          <TouchableOpacity
            key={obj.id}
            activeOpacity={0.7}
            onPress={() => onSelectObject(obj)}
            style={[
              styles.box,
              {
                left,
                top,
                width,
                height,
                borderColor: isSelected ? '#FFD700' : '#00E5FF',
                backgroundColor: isSelected
                  ? 'rgba(255, 215, 0, 0.15)'
                  : 'rgba(0, 229, 255, 0.1)',
              },
            ]}>
            <View style={styles.labelContainer}>
              <Text style={styles.labelText}>
                {obj.label} ({Math.round(obj.confidence * 100)}%)
              </Text>
            </View>
            {isSelected && (
              <View style={styles.selectedIndicator}>
                <Text style={styles.selectedText}>TAP FOR INFO</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  box: {
    position: 'absolute',
    borderWidth: 3,
    borderRadius: 8,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  labelContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: -12,
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    paddingVertical: 4,
    alignItems: 'center',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  selectedText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '700',
  },
});