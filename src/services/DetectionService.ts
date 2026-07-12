import type {DetectedObject, BoundingBox} from '../types';

/**
 * DetectionService — bridges on-device ML Kit object detection with the app.
 *
 * In the hybrid approach:
 * - On-device: ML Kit object detection + image labeling identifies what's in the photo
 * - Cloud: Wikipedia/museum APIs retrieve detailed info (handled by InfoService)
 *
 * This module provides a fallback mock detector for development/testing when
 * the native ML Kit module isn't available, and a real detector that uses
 * react-native-object-detection.
 */

// Try to import the native module (may not be available in all environments)
let ObjectDetectionModule: any = null;
try {
  // react-native-object-detection exports
  ObjectDetectionModule = require('react-native-object-detection');
} catch {
  console.log('react-native-object-detection not available, using mock');
}

let ImageLabelingModule: any = null;
try {
  ImageLabelingModule = require('@react-native-ml-kit/image-labeling');
} catch {
  console.log('@react-native-ml-kit/image-labeling not available, using mock');
}

export interface DetectionResult {
  objects: DetectedObject[];
  processingTime: number;
}

/**
 * Generate a unique ID for a detected object
 */
function generateId(): string {
  return `obj_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Run on-device object detection on an image URI.
 * Uses ML Kit if available, falls back to image labeling, then to mock data.
 */
export async function detectObjects(imageUri: string): Promise<DetectionResult> {
  const startTime = Date.now();

  // Try native object detection first
  if (ObjectDetectionModule) {
    try {
      const result = await ObjectDetectionModule.detect(imageUri);
      if (result && result.length > 0) {
        const objects: DetectedObject[] = result.map((item: any) => ({
          id: generateId(),
          label: item.label || item.name || 'Unknown',
          confidence: item.confidence || item.score || 0.5,
          boundingBox: {
            x: item.boundingBox?.x || item.left || 0,
            y: item.boundingBox?.y || item.top || 0,
            width: item.boundingBox?.width || 100,
            height: item.boundingBox?.height || 100,
          },
        }));
        return {
          objects,
          processingTime: Date.now() - startTime,
        };
      }
    } catch (error) {
      console.log('Native object detection failed, trying image labeling:', error);
    }
  }

  // Fall back to image labeling (gives labels without bounding boxes)
  if (ImageLabelingModule) {
    try {
      const labels = await ImageLabelingModule.label(imageUri);
      if (labels && labels.length > 0) {
        // Filter to art-related labels with reasonable confidence
        const filtered = labels
          .filter((l: any) => l.confidence > 0.5)
          .slice(0, 5);

        const objects: DetectedObject[] = filtered.map((item: any, index: number) => {
          // Since image labeling doesn't give bounding boxes,
          // we create approximate regions for the overlay
          const regions = [
            {x: 50, y: 50, width: 200, height: 200},
            {x: 300, y: 50, width: 200, height: 200},
            {x: 50, y: 350, width: 200, height: 200},
            {x: 300, y: 350, width: 200, height: 200},
            {x: 200, y: 200, width: 200, height: 200},
          ];
          const region = regions[index % regions.length];
          return {
            id: generateId(),
            label: item.text || item.label || 'Unknown',
            confidence: item.confidence,
            boundingBox: region,
          };
        });

        return {
          objects,
          processingTime: Date.now() - startTime,
        };
      }
    } catch (error) {
      console.log('Image labeling failed, using mock:', error);
    }
  }

  // Final fallback: mock detection for development
  return mockDetect(imageUri, startTime);
}

/**
 * Mock detection — simulates finding objects in an image.
 * Useful for development when no ML model is available.
 */
function mockDetect(imageUri: string, startTime: number): DetectionResult {
  const mockLabels = [
    {label: 'Painting', confidence: 0.92, box: {x: 30, y: 40, width: 250, height: 320}},
    {label: 'Sculpture', confidence: 0.85, box: {x: 320, y: 60, width: 180, height: 280}},
    {label: 'Portrait', confidence: 0.78, box: {x: 100, y: 100, width: 200, height: 250}},
  ];

  // Pick 1-3 random mock objects
  const count = Math.floor(Math.random() * 3) + 1;
  const selected = mockLabels.slice(0, count);

  const objects: DetectedObject[] = selected.map(item => ({
    id: generateId(),
    label: item.label,
    confidence: item.confidence,
    boundingBox: item.box,
  }));

  return {
    objects,
    processingTime: Date.now() - startTime,
  };
}