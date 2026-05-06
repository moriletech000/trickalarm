import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { soundEngine } from '../utils/soundEngine';
import { AlarmClock, Camera, Moon } from 'lucide-react';
import { getObjectIcon } from '../utils/objectIcons';
import KioskModeHelper from '../components/KioskModeHelper';

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

    // Enhanced tab protection - prevent closing/navigation
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '🚨 ALARM IS RINGING! Are you sure you want to close? The alarm will stop!';
      return e.returnValue;
    };

    // Prevent back button navigation
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, '', '/alarm');
      // Show warning if user tries to navigate away
      if (!confirm('🚨 ALARM IS RINGING! Going back will stop the alarm. Are you sure?')) {
        return;
      }
    };

    // Prevent keyboard shortcuts (Ctrl+W, Alt+F4, etc.)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+W (close tab)
      if (e.ctrlKey && e.key === 'w') {
        e.preventDefault();
        alert('🚨 Cannot close tab while alarm is ringing! Dismiss the alarm first.');
        return false;
      }
      
      // Prevent Alt+F4 (close window)
      if (e.altKey && e.key === 'F4') {
        e.preventDefault();
        alert('🚨 Cannot close window while alarm is ringing! Dismiss the alarm first.');
        return false;
      }
      
      // Prevent Ctrl+Shift+W (close window)
      if (e.ctrlKey && e.shiftKey && e.key === 'W') {
        e.preventDefault();
        alert('🚨 Cannot close window while alarm is ringing! Dismiss the alarm first.');
        return false;
      }

      // Prevent F5/Ctrl+R (refresh)
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        alert('🚨 Cannot refresh while alarm is ringing! Dismiss the alarm first.');
        return false;
      }

      // Prevent Escape key
      if (e.key === 'Escape') {
        e.preventDefault();
        alert('🚨 Cannot escape the alarm! Find the challenge object to dismiss.');
        return false;
      }
    };

    // Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      alert('🚨 Right-click disabled during alarm! Dismiss the alarm first.');
      return false;
    };

    // Add all event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    
    // Push current state to prevent back navigation
    window.history.pushState(null, '', '/alarm');

    // Focus trap - keep focus on alarm page
    const focusTrap = () => {
      if (document.activeElement?.tagName === 'IFRAME') {
        (document.querySelector('button') as HTMLElement)?.focus();
      }
    };
    
    const focusInterval = setInterval(focusTrap, 1000);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      clearInterval(focusInterval);
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

  // Request fullscreen when alarm fires
  useEffect(() => {
    // Change page title to show alarm status
    const originalTitle = document.title;
    let titleFlash = true;
    
    const titleInterval = setInterval(() => {
      document.title = titleFlash 
        ? '🚨 ALARM RINGING - DO NOT CLOSE! 🚨' 
        : '⚠️ TRICKALARM ACTIVE ⚠️';
      titleFlash = !titleFlash;
    }, 1000);

    const requestFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          await (document.documentElement as any).webkitRequestFullscreen();
        } else if ((document.documentElement as any).msRequestFullscreen) {
          await (document.documentElement as any).msRequestFullscreen();
        }
      } catch (error) {
        console.log('Fullscreen request failed:', error);
      }
    };

    // Request fullscreen after a short delay
    const fullscreenTimer = setTimeout(requestFullscreen, 1000);

    // Prevent exiting fullscreen
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && activeAlarm) {
        // If user exits fullscreen, show warning and try to re-enter
        setTimeout(() => {
          if (activeAlarm && !document.fullscreenElement) {
            alert('🚨 Fullscreen mode helps prevent accidental alarm dismissal!');
            requestFullscreen();
          }
        }, 500);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      clearTimeout(fullscreenTimer);
      clearInterval(titleInterval);
      document.title = originalTitle;
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      
      // Exit fullscreen when alarm is dismissed
      if (document.fullscreenElement) {
        document.exitFullscreen?.();
      }
    };
  }, [activeAlarm]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-black relative overflow-hidden">
      {/* Pulsing border warning */}
      <div className="fixed inset-0 border-8 border-red-500 animate-pulse pointer-events-none z-50"></div>
      
      {/* Warning overlay */}
      <div className="fixed top-4 left-4 right-4 z-40 bg-red-600 text-white p-3 rounded-lg border-2 border-red-400 animate-pulse">
        <div className="text-center font-bold text-sm">
          🚨 ALARM ACTIVE - DO NOT CLOSE BROWSER TAB 🚨
        </div>
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center max-w-lg relative z-10"
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

      {/* Kiosk Mode Helper */}
      <KioskModeHelper isAlarmActive={!!activeAlarm} />
    </div>
  );
}
