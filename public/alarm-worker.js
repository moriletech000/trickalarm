// Enhanced Service Worker for Alarm Persistence
const CACHE_NAME = 'trickalarm-alarm-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Alarm Service Worker installed');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Alarm Service Worker activated');
  event.waitUntil(self.clients.claim());
});

// Background sync for alarm persistence
self.addEventListener('sync', (event) => {
  if (event.tag === 'alarm-persistence') {
    event.waitUntil(maintainAlarmState());
  }
});

// Message handler for alarm state
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'ALARM_ACTIVE') {
    // Store alarm state
    self.alarmActive = true;
    self.alarmData = event.data.alarm;
    
    // Start persistent checking
    startAlarmPersistence();
  } else if (event.data && event.data.type === 'ALARM_DISMISSED') {
    // Clear alarm state
    self.alarmActive = false;
    self.alarmData = null;
    
    // Stop persistent checking
    stopAlarmPersistence();
  }
});

// Persistent alarm checking
let persistenceInterval;

function startAlarmPersistence() {
  if (persistenceInterval) {
    clearInterval(persistenceInterval);
  }
  
  persistenceInterval = setInterval(async () => {
    if (self.alarmActive) {
      // Check if any clients are still connected
      const clients = await self.clients.matchAll();
      
      if (clients.length === 0) {
        // No clients connected, show notification to bring user back
        await showPersistentNotification();
      } else {
        // Check if alarm page is still active
        let alarmPageActive = false;
        for (const client of clients) {
          if (client.url.includes('/alarm')) {
            alarmPageActive = true;
            break;
          }
        }
        
        if (!alarmPageActive) {
          // Alarm page not active, try to redirect
          for (const client of clients) {
            client.postMessage({
              type: 'REDIRECT_TO_ALARM',
              alarm: self.alarmData
            });
          }
        }
      }
    }
  }, 5000); // Check every 5 seconds
}

function stopAlarmPersistence() {
  if (persistenceInterval) {
    clearInterval(persistenceInterval);
    persistenceInterval = null;
  }
}

async function showPersistentNotification() {
  const options = {
    body: `${self.alarmData?.label || 'Alarm'} is still ringing! Tap to return to TrickAlarm.`,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'trickalarm-persistent',
    requireInteraction: true,
    silent: false,
    actions: [
      {
        action: 'open',
        title: 'Open TrickAlarm'
      }
    ],
    data: {
      url: '/alarm',
      alarm: self.alarmData
    }
  };

  return self.registration.showNotification('🚨 TrickAlarm Still Ringing!', options);
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
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
              return client.navigate('/alarm');
            }
          }
          
          // Open new window if none exists
          if (self.clients.openWindow) {
            return self.clients.openWindow('/alarm');
          }
        })
    );
  }
});

// Maintain alarm state function
async function maintainAlarmState() {
  if (self.alarmActive) {
    const clients = await self.clients.matchAll();
    
    // Ensure at least one client is on the alarm page
    let alarmPageExists = false;
    for (const client of clients) {
      if (client.url.includes('/alarm')) {
        alarmPageExists = true;
        break;
      }
    }
    
    if (!alarmPageExists && clients.length > 0) {
      // Navigate existing client to alarm page
      clients[0].postMessage({
        type: 'FORCE_ALARM_PAGE',
        alarm: self.alarmData
      });
    } else if (clients.length === 0) {
      // No clients at all, show notification
      await showPersistentNotification();
    }
  }
}

console.log('TrickAlarm Enhanced Service Worker loaded');