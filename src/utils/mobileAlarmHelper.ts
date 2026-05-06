// Mobile-specific alarm utilities for better reliability

export class MobileAlarmHelper {
  private static instance: MobileAlarmHelper;
  private wakeLock: any = null;
  private audioContext: AudioContext | null = null;
  private keepAliveInterval: number | null = null;

  static getInstance(): MobileAlarmHelper {
    if (!MobileAlarmHelper.instance) {
      MobileAlarmHelper.instance = new MobileAlarmHelper();
    }
    return MobileAlarmHelper.instance;
  }

  // Detect if running on mobile device
  isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // Detect if running as PWA
  isPWA(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true ||
           document.referrer.includes('android-app://');
  }

  // Request screen wake lock to prevent device from sleeping
  async requestWakeLock(): Promise<boolean> {
    try {
      if ('wakeLock' in navigator) {
        this.wakeLock = await (navigator as any).wakeLock.request('screen');
        console.log('Screen wake lock acquired');
        
        // Handle wake lock release (e.g., when tab becomes hidden)
        this.wakeLock.addEventListener('release', () => {
          console.log('Screen wake lock released');
        });
        
        return true;
      }
    } catch (err) {
      console.log('Wake lock failed:', err);
    }
    return false;
  }

  // Release screen wake lock
  releaseWakeLock(): void {
    if (this.wakeLock) {
      this.wakeLock.release();
      this.wakeLock = null;
      console.log('Screen wake lock released manually');
    }
  }

  // Keep app active with silent audio context
  startKeepAlive(): void {
    if (this.keepAliveInterval) {
      this.stopKeepAlive();
    }

    const keepActive = () => {
      try {
        if (!this.audioContext) {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          this.audioContext = new AudioContext();
        }

        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }

        // Create a very short, silent tone to keep audio context active
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Set volume to 0 (silent)
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.01);
      } catch (error) {
        console.log('Keep alive audio failed:', error);
      }
    };

    // Run every 25 seconds (before most mobile browsers timeout at 30s)
    this.keepAliveInterval = window.setInterval(keepActive, 25000);
    keepActive(); // Run immediately
  }

  // Stop keep alive mechanism
  stopKeepAlive(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  // Enhanced vibration for mobile devices
  vibrate(pattern: number[] = [500, 200, 500]): void {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  // Show persistent notification with enhanced mobile features
  async showAlarmNotification(alarm: any): Promise<Notification | null> {
    if (!('Notification' in window)) {
      return null;
    }

    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return null;
      }
    }

    const options: any = {
      body: `${alarm.label || 'Alarm'} - Find a ${alarm.challengeObject} to dismiss!`,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'trickalarm-active',
      requireInteraction: true,
      silent: false,
      actions: [
        {
          action: 'open',
          title: 'Open Alarm'
        },
        {
          action: 'snooze',
          title: 'Snooze 5min'
        }
      ],
      data: {
        alarmId: alarm.id,
        timestamp: Date.now()
      }
    };

    // Add vibration separately (not part of NotificationOptions in TypeScript)
    const notification = new Notification('🚨 TrickAlarm Ringing!', options);
    
    // Trigger vibration separately
    this.vibrate([500, 200, 500, 200, 500]);

    // Handle notification click
    notification.onclick = () => {
      window.focus();
      if (window.location.pathname !== '/alarm') {
        window.location.href = '/alarm';
      }
      notification.close();
    };

    return notification;
  }

  // Force app to foreground (mobile-specific techniques)
  async bringToForeground(): Promise<void> {
    try {
      // Method 1: Focus window
      if (window.focus) {
        window.focus();
      }

      // Method 2: Use Page Visibility API
      if (document.hidden) {
        // Try to trigger visibility change
        document.dispatchEvent(new Event('visibilitychange'));
      }

      // Method 3: Audio notification (works even when backgrounded)
      this.playAlertSound();

      // Method 4: Vibration
      this.vibrate([1000, 500, 1000]);

      // Method 5: Service Worker notification
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'BRING_TO_FOREGROUND'
        });
      }

    } catch (error) {
      console.error('Failed to bring app to foreground:', error);
    }
  }

  // Play alert sound that works in background
  private playAlertSound(): void {
    try {
      if (!this.audioContext) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContext();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Alert sound failed:', error);
    }
  }

  // Check if device supports background execution
  supportsBackgroundExecution(): boolean {
    return 'serviceWorker' in navigator && 
           'PushManager' in window && 
           'Notification' in window;
  }

  // Get device-specific recommendations
  getDeviceRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.isMobile()) {
      recommendations.push('Install as PWA for better alarm reliability');
      recommendations.push('Keep the app open or in recent apps');
      recommendations.push('Enable notifications for this app');
      
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        recommendations.push('Add to Home Screen for iOS background support');
        recommendations.push('Keep device plugged in for overnight alarms');
      }
      
      if (/Android/i.test(navigator.userAgent)) {
        recommendations.push('Disable battery optimization for this app');
        recommendations.push('Allow background activity in app settings');
      }
    }

    return recommendations;
  }
}

// Export singleton instance
export const mobileAlarmHelper = MobileAlarmHelper.getInstance();