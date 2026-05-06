import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import SetAlarm from './pages/SetAlarm';
import AlarmFiring from './pages/AlarmFiring';
import Scanner from './pages/Scanner';
import { useAppStore } from './store/appStore';
import { loadTensorFlowModel } from './utils/tensorflowLoader';
import { startAlarmScheduler, stopAlarmScheduler } from './utils/alarmScheduler';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const { modelLoaded, setTfModel, setModelLoaded } = useAppStore();
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initModel = async () => {
      try {
        console.log('Starting TensorFlow model load...');
        const model = await loadTensorFlowModel();
        
        if (mounted) {
          console.log('Model loaded successfully');
          setTfModel(model);
          setModelLoaded(true);
          setIsInitializing(false);
        }
      } catch (error) {
        console.error('Failed to load TensorFlow model:', error);
        if (mounted) {
          setLoadingError('Failed to load AI model. You can still use the app, but object detection will not work.');
          setModelLoaded(true); // Allow app to continue
          setIsInitializing(false);
        }
      }
    };

    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (mounted && !modelLoaded) {
        console.warn('Model loading timeout - continuing without model');
        setLoadingError('Model loading is taking too long. Continuing without AI detection.');
        setModelLoaded(true);
        setIsInitializing(false);
      }
    }, 15000); // 15 second timeout

    initModel();

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [setTfModel, setModelLoaded]);

  useEffect(() => {
    if (!modelLoaded) return;

    // Start the enhanced alarm scheduler
    startAlarmScheduler();

    return () => {
      stopAlarmScheduler();
    };
  }, [modelLoaded]);

  useEffect(() => {
    // Request notification permission immediately
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }

    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        console.log('Service Worker registrations:', registrations.length);
      });
    }

    // Prevent mobile browser from sleeping
    const preventSleep = () => {
      // Keep a small audio context active to prevent sleep
      if ('AudioContext' in window || 'webkitAudioContext' in window) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContext();
        
        // Create a silent oscillator to keep audio context active
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.01);
      }
    };

    // Run prevent sleep every 30 seconds
    const sleepPrevention = setInterval(preventSleep, 30000);

    // Handle page visibility changes (mobile app switching)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible, schedule immediate alarm check
        setTimeout(() => {
          const { checkAlarms } = require('./utils/alarmScheduler');
          checkAlarms();
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(sleepPrevention);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleSkip = () => {
    console.log('User skipped model loading');
    setModelLoaded(true);
    setIsInitializing(false);
  };

  if (isInitializing) {
    return <LoadingScreen error={loadingError} onSkip={handleSkip} />;
  }

  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/set" element={<SetAlarm />} />
          <Route path="/set/:id" element={<SetAlarm />} />
          <Route path="/alarm" element={<AlarmFiring />} />
          <Route path="/scan" element={<Scanner />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}

export default App;
