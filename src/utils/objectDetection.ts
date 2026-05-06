import { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../store/appStore';

interface DetectionResult {
  detectedObjects: string[];
  isTargetFound: boolean;
  confidence: number;
  allPredictions: Array<{ class: string; score: number }>;
}

// Map of alternative names for objects (helps with detection variations)
const objectAliases: Record<string, string[]> = {
  'shoe': ['sneaker', 'boot', 'sandal', 'footwear', 'person'], // person often detected with shoes
  'cell phone': ['phone', 'mobile phone', 'smartphone'],
  'laptop': ['computer', 'notebook'],
  'cup': ['mug', 'glass', 'bottle'],
  'bottle': ['cup', 'glass'],
  'remote': ['remote control'],
  'book': ['notebook'],
  'backpack': ['bag', 'handbag', 'suitcase'],
  'handbag': ['bag', 'backpack', 'purse'],
  'suitcase': ['bag', 'backpack', 'luggage'],
  'clock': ['watch'],
  'chair': ['couch', 'bench', 'seat'],
  'keyboard': ['laptop', 'computer'],
  'mouse': ['laptop', 'computer'],
};

// Check if detected object matches target (including aliases)
function isMatchingObject(detected: string, target: string): boolean {
  const detectedLower = detected.toLowerCase();
  const targetLower = target.toLowerCase();
  
  // Direct match
  if (detectedLower === targetLower) return true;
  
  // Check if detected is in target's aliases
  const targetAliases = objectAliases[targetLower] || [];
  if (targetAliases.some(alias => detectedLower.includes(alias) || alias.includes(detectedLower))) {
    return true;
  }
  
  // Check if target is in detected's aliases
  const detectedAliases = objectAliases[detectedLower] || [];
  if (detectedAliases.some(alias => targetLower.includes(alias) || alias.includes(targetLower))) {
    return true;
  }
  
  // Partial match (e.g., "cell phone" matches "phone")
  if (detectedLower.includes(targetLower) || targetLower.includes(detectedLower)) {
    return true;
  }
  
  return false;
}

export function useObjectDetection(
  videoRef: React.RefObject<HTMLVideoElement>,
  targetObject: string
) {
  const [result, setResult] = useState<DetectionResult>({
    detectedObjects: [],
    isTargetFound: false,
    confidence: 0,
    allPredictions: [],
  });
  const { tfModel } = useAppStore();
  const intervalRef = useRef<number | null>(null);
  const consecutiveDetections = useRef<number>(0);
  const lastDetectionTime = useRef<number>(0);

  useEffect(() => {
    if (!tfModel || !videoRef.current) return;

    const detect = async () => {
      if (!videoRef.current || videoRef.current.readyState !== 4) return;

      try {
        const predictions = await tfModel.detect(videoRef.current);

        // Get all detected objects
        const detectedObjects: string[] = predictions.map((pred: any) => pred.class);
        const uniqueObjects: string[] = [...new Set(detectedObjects)];

        // Find best matching prediction for target
        let bestMatch: any = null;
        let bestScore = 0;

        for (const pred of predictions) {
          if (isMatchingObject(pred.class, targetObject)) {
            if (pred.score > bestScore) {
              bestMatch = pred;
              bestScore = pred.score;
            }
          }
        }

        // Lower confidence threshold for better detection
        const confidenceThreshold = 0.45; // Lowered from 0.65
        const isFound = bestMatch && bestScore >= confidenceThreshold;

        // Require 2 consecutive detections to reduce false positives
        const now = Date.now();
        if (isFound) {
          if (now - lastDetectionTime.current < 1000) {
            consecutiveDetections.current += 1;
          } else {
            consecutiveDetections.current = 1;
          }
          lastDetectionTime.current = now;
        } else {
          consecutiveDetections.current = 0;
        }

        const confirmedDetection = consecutiveDetections.current >= 2;

        setResult({
          detectedObjects: uniqueObjects,
          isTargetFound: confirmedDetection,
          confidence: bestScore,
          allPredictions: predictions.map((p: any) => ({
            class: p.class,
            score: p.score,
          })),
        });
      } catch (error) {
        console.error('Detection error:', error);
      }
    };

    // Run detection every 300ms
    intervalRef.current = window.setInterval(detect, 300);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [tfModel, videoRef, targetObject]);

  return result;
}
