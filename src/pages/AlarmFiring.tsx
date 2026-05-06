import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { soundEngine } from '../utils/soundEngine';
import { AlarmClock, Camera, Moon } from 'lucide-react';
import { getObjectIcon } from '../utils/objectIcons';

export default function AlarmFiring() {
  const navigate = useNavigate();
  const { activeAlarm, snoozeActiveAlarm } = useAppStore();

  useEffect(() => {
    if (!activeAlarm) {
      navigate('/');
      return;
    }

    // Start playing the alarm sound
    soundEngine.start(activeAlarm.sound);

    // Prevent navigation away from alarm page
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    // Prevent back button
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, '', '/alarm');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    
    // Push current state to prevent back navigation
    window.history.pushState(null, '', '/alarm');

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [activeAlarm, navigate]);

  if (!activeAlarm) {
    return null;
  }

  const handleSnooze = () => {
    if (activeAlarm.snoozeCount >= 2) {
      return;
    }
    soundEngine.stop();
    snoozeActiveAlarm();
    
    // Show a toast or message that snooze is active
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('TrickAlarm Snoozed', {
        body: 'Alarm will ring again in 5 minutes',
        icon: '/icon-192.png',
      });
    }
    
    navigate('/');
  };

  const handleStartScanning = () => {
    navigate('/scan');
  };

  const ObjectIcon = getObjectIcon(activeAlarm.challengeObject);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-black">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center max-w-lg"
      >
        {/* Alarm Icon */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="mb-8 pulse-alarm flex justify-center"
        >
          <AlarmClock className="w-32 h-32 text-yellow-500" strokeWidth={1.5} />
        </motion.div>

        {/* Alarm Info Card */}
        <div className="bg-zinc-900 rounded-3xl p-8 mb-8 border-2 border-zinc-800">
          <h1 className="text-4xl font-bold text-white mb-2">
            {activeAlarm.label || 'Alarm'}
          </h1>
          <p className="text-zinc-400 text-xl mb-6">{activeAlarm.time}</p>

          <div className="border-2 border-yellow-500 rounded-2xl p-6 mb-6 bg-yellow-500/5">
            <p className="text-zinc-300 text-lg mb-4">To dismiss, show your camera:</p>
            <div className="flex items-center justify-center mb-4">
              <ObjectIcon className="w-24 h-24 text-yellow-500" strokeWidth={1.5} />
            </div>
            <p className="text-yellow-500 text-4xl font-bold capitalize">
              {activeAlarm.challengeObject}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleStartScanning}
          className="w-full max-w-sm bg-yellow-500 text-black py-6 rounded-2xl font-bold text-xl mb-4 flex items-center justify-center gap-3"
        >
          <Camera className="w-6 h-6" />
          Start Scanning
        </motion.button>

        <button
          onClick={handleSnooze}
          disabled={activeAlarm.snoozeCount >= 2}
          className={`w-full max-w-sm py-5 rounded-2xl font-semibold flex items-center justify-center gap-2 ${
            activeAlarm.snoozeCount >= 2
              ? 'bg-zinc-900 opacity-50 text-zinc-600 cursor-not-allowed border-2 border-zinc-800'
              : 'bg-zinc-900 text-zinc-300 border-2 border-zinc-800'
          }`}
        >
          <Moon className="w-5 h-5" />
          {activeAlarm.snoozeCount >= 2
            ? 'No more snoozes'
            : `Snooze 5 min (${2 - activeAlarm.snoozeCount} left)`}
        </button>
      </motion.div>
    </div>
  );
}
