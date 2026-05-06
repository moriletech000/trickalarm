import { useAppStore } from '../store/appStore';

let lastTriggeredAlarmId: string | null = null;
let lastTriggeredTime: number = 0;

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

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('TrickAlarm', {
        body: `${resetAlarm.label || 'Alarm'} - Find a ${resetAlarm.challengeObject}!`,
        icon: '/icon-192.png',
        tag: 'alarm',
        requireInteraction: true,
      });
    }

    if (window.location.pathname !== '/alarm') {
      window.location.href = '/alarm';
    }
  }
}

// Reset the last triggered alarm when it's dismissed
export function resetLastTriggeredAlarm() {
  lastTriggeredAlarmId = null;
  lastTriggeredTime = 0;
}
