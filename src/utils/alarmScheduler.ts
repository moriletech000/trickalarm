import { useAppStore } from '../store/appStore';
import { mobileAlarmHelper } from './mobileAlarmHelper';

let lastTriggeredAlarmId: string | null = null;
let lastTriggeredTime: number = 0;
let alarmCheckInterval: number | null = null;

// Enhanced alarm checking with mobile optimizations
export function checkAlarms() {
  const { alarms, activeAlarm, setActiveAlarm } = useAppStore.getState();
  
  // If there's already an active alarm, don't check for new ones
  if (activeAlarm) {
    return;
  }

  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const currentTimestamp = now.getTime();

  const matchingAlarms = alarms.filter((alarm) => {
    if (!alarm.isActive) return false;
    if (!alarm.days.includes(currentDay)) return false;

    // Don't re-trigger the same alarm within 2 minutes
    if (alarm.id === lastTriggeredAlarmId && currentTimestamp - lastTriggeredTime < 120000) {
      return false;
    }

    const [alarmHour, alarmMinute] = alarm.time.split(':').map(Number);
    const [currentHour, currentMinute] = currentTime.split(':').map(Number);

    const alarmTotalMinutes = alarmHour * 60 + alarmMinute;
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    return Math.abs(alarmTotalMinutes - currentTotalMinutes) <= 1;
  });

  if (matchingAlarms.length > 0) {
    const earliestAlarm = matchingAlarms.sort((a, b) => {
      const [aHour, aMinute] = a.time.split(':').map(Number);
      const [bHour, bMinute] = b.time.split(':').map(Number);
      return aHour * 60 + aMinute - (bHour * 60 + bMinute);
    })[0];

    const resetAlarm = { ...earliestAlarm, snoozeCount: 0 };
    
    // Store the triggered alarm info to prevent re-triggering
    lastTriggeredAlarmId = resetAlarm.id;
    lastTriggeredTime = currentTimestamp;
    
    setActiveAlarm(resetAlarm);

    // Mobile-specific alarm handling
    mobileAlarmHelper.requestWakeLock();
    mobileAlarmHelper.vibrate([500, 200, 500, 200, 500]);
    mobileAlarmHelper.showAlarmNotification(resetAlarm);
    mobileAlarmHelper.bringToForeground();

    // Multiple methods to ensure navigation works on mobile
    try {
      // Method 1: Use history API if available
      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', '/alarm');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
      
      // Method 2: Force navigation
      if (window.location.pathname !== '/alarm') {
        window.location.href = '/alarm';
      }
      
      // Method 3: Focus window (for PWA)
      if (window.focus) {
        window.focus();
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback: just ensure we're on the alarm page
      window.location.href = '/alarm';
    }
  }
}

// Start continuous alarm checking with mobile optimizations
export function startAlarmScheduler() {
  // Clear any existing interval
  if (alarmCheckInterval) {
    clearInterval(alarmCheckInterval);
  }

  // Start mobile keep-alive mechanism
  mobileAlarmHelper.startKeepAlive();

  // Initial check
  checkAlarms();
  
  // Check every 15 seconds for better mobile responsiveness
  alarmCheckInterval = window.setInterval(() => {
    const currentPath = window.location.pathname;
    if (currentPath !== '/alarm' && currentPath !== '/scan') {
      checkAlarms();
    }
  }, 15000);

  // Additional checks on visibility change (mobile app switching)
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Check on page focus (mobile browser switching)
  window.addEventListener('focus', handleFocus);

  // Check on page load/reload
  window.addEventListener('load', handleLoad);

  // Handle beforeunload to maintain alarms
  window.addEventListener('beforeunload', handleBeforeUnload);
}

// Stop alarm scheduler
export function stopAlarmScheduler() {
  if (alarmCheckInterval) {
    clearInterval(alarmCheckInterval);
    alarmCheckInterval = null;
  }
  
  mobileAlarmHelper.releaseWakeLock();
  mobileAlarmHelper.stopKeepAlive();
  
  // Remove event listeners
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  window.removeEventListener('focus', handleFocus);
  window.removeEventListener('load', handleLoad);
  window.removeEventListener('beforeunload', handleBeforeUnload);
}

// Event handlers
function handleVisibilityChange() {
  if (!document.hidden) {
    // App became visible, check alarms immediately
    setTimeout(checkAlarms, 100);
  }
}

function handleFocus() {
  setTimeout(checkAlarms, 100);
}

function handleLoad() {
  setTimeout(checkAlarms, 500);
}

function handleBeforeUnload(event: BeforeUnloadEvent) {
  const { activeAlarm } = useAppStore.getState();
  if (activeAlarm) {
    // Prevent page unload if alarm is active
    event.preventDefault();
    event.returnValue = 'An alarm is currently ringing. Are you sure you want to leave?';
    return event.returnValue;
  }
}

// Reset the last triggered alarm when it's dismissed
export function resetLastTriggeredAlarm() {
  lastTriggeredAlarmId = null;
  lastTriggeredTime = 0;
  mobileAlarmHelper.releaseWakeLock();
}
