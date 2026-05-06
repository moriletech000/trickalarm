import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Alarm {
  id: string;
  label: string;
  time: string;
  days: number[];
  sound: 'beep' | 'buzz' | 'bell';
  challengeObject: string;
  isActive: boolean;
  snoozeCount: number;
  createdAt: number;
}

interface AppState {
  alarms: Alarm[];
  activeAlarm: Alarm | null;
  tfModel: any | null;
  modelLoaded: boolean;
  addAlarm: (alarm: Alarm) => void;
  updateAlarm: (id: string, updates: Partial<Alarm>) => void;
  deleteAlarm: (id: string) => void;
  setActiveAlarm: (alarm: Alarm | null) => void;
  setTfModel: (model: any) => void;
  setModelLoaded: (loaded: boolean) => void;
  snoozeActiveAlarm: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      alarms: [],
      activeAlarm: null,
      tfModel: null,
      modelLoaded: false,

      addAlarm: (alarm) =>
        set((state) => ({
          alarms: [...state.alarms, alarm],
        })),

      updateAlarm: (id, updates) =>
        set((state) => ({
          alarms: state.alarms.map((alarm) =>
            alarm.id === id ? { ...alarm, ...updates } : alarm
          ),
        })),

      deleteAlarm: (id) =>
        set((state) => ({
          alarms: state.alarms.filter((alarm) => alarm.id !== id),
        })),

      setActiveAlarm: (alarm) =>
        set(() => ({
          activeAlarm: alarm,
        })),

      setTfModel: (model) =>
        set(() => ({
          tfModel: model,
        })),

      setModelLoaded: (loaded) =>
        set(() => ({
          modelLoaded: loaded,
        })),

      snoozeActiveAlarm: () => {
        const { activeAlarm } = get();
        if (!activeAlarm) return;

        const newSnoozeCount = activeAlarm.snoozeCount + 1;

        // Temporarily clear active alarm to stop the sound
        set(() => ({
          activeAlarm: null,
        }));

        get().updateAlarm(activeAlarm.id, { snoozeCount: newSnoozeCount });

        // Set a timeout to re-activate the alarm after 5 minutes
        setTimeout(() => {
          const currentAlarms = get().alarms;
          const alarmToReactivate = currentAlarms.find(a => a.id === activeAlarm.id);
          
          if (alarmToReactivate && alarmToReactivate.isActive) {
            set(() => ({
              activeAlarm: { ...alarmToReactivate, snoozeCount: newSnoozeCount },
            }));
            
            if (window.location.pathname !== '/alarm') {
              window.location.href = '/alarm';
            }
          }
        }, 5 * 60 * 1000);
      },
    }),
    {
      name: 'trickalarm-storage',
      partialize: (state) => ({
        alarms: state.alarms,
      }),
    }
  )
);
