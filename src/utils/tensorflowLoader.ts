import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

export async function loadTensorFlowModel() {
  try {
    console.log('Initializing TensorFlow.js...');
    await tf.ready();
    console.log('TensorFlow.js ready, loading COCO-SSD model...');
    
    const model = await cocoSsd.load({
      base: 'lite_mobilenet_v2',
    });
    
    console.log('COCO-SSD model loaded successfully');
    return model;
  } catch (error) {
    console.error('Error loading TensorFlow model:', error);
    throw error;
  }
}
