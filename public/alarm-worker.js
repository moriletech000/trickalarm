// Simple Service Worker for TrickAlarm
const CACHE_NAME = 'trickalarm-v1';

// Global alarm state
let alarmState = {
  active: false,
  data: null,
  startTime: null
};

// Install event
self.addEventListener('install', () => {
  console.log('TrickAlarm Service Worker installed');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('TrickAlarm Service Worker activated');
  event.waitUntil(self.clients.claim());
});

// Message handler for alarm state
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'ALARM_ACTIVE') {
    startAlarmNotifications(event.data.alarm);
  } else if (event.data && event.data.type === 'ALARM_DISMISSED') {
    stopAlarmNotifications();
  }
});

// Start alarm notifications
function startAlarmNotifications(alarmData) {
  alarmState.active = true;
  alarmState.data = alarmData;
  alarmState.startTime = Date.now();
  
  console.log('Starting alarm notifications');
  
  // Show immediate notification
  showAlarmNotification();
  
  // Schedule recurring notifications
  if (self.notificationInterval) {
    clearInterval(self.notificationInterval);
  }
  
  self.notificationInterval = setInterval(() => {
    if (alarmState.active) {
      showAlarmNotification();
    }
  }, 30000); // Show notification every 30 seconds
}

// Stop alarm notifications
function stopAlarmNotifications() {
  alarmState.active = false;
  alarmState.data = null;
  
  if (self.notificationInterval) {
    clearInterval(self.notificationInterval);
    self.notificationInterval = null;
  }
  
  console.log('Alarm notifications stopped');
}

// Show alarm notification
async function showAlarmNotification() {
  if (!alarmState.active || !alarmState.data) return;
  
  const timeSinceStart = Math.floor((Date.now() - alarmState.startTime) / 1000);
  
  const options = {
    body: `${alarmState.data.label || 'Alarm'} is ringing! Tap to return to TrickAlarm.`,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'trickalarm-alarm',
    requireInteraction: true,
    silent: false,
    renotify: true,
    actions: [
      {
        action: 'open',
        title: 'Open TrickAlarm'
      }
    ],
    data: {
      url: '/alarm',
      alarm: alarmState.data
    }
  };

  try {
    await self.registration.showNotification(`🚨 TrickAlarm Ringing! (${Math.floor(timeSinceStart / 60)}m ${timeSinceStart % 60}s)`, options);
  } catch (error) {
    console.log('Notification failed:', error);
  }
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Open or focus alarm page
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Try to focus existing alarm page
        for (const client of clientList) {
          if (client.url.includes('/alarm') && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Try to focus any existing page and navigate
        for (const client of clientList) {
          if ('focus' in client) {
            client.focus();
            client.postMessage({
              type: 'NAVIGATE_TO_ALARM',
              alarm: alarmState.data
            });
            return;
          }
        }
        
        // Open new window if none exists
        if (self.clients.openWindow) {
          return self.clients.openWindow('/alarm');
        }
      })
  );
});

console.log('TrickAlarm Service Worker loaded');