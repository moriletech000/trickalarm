import { useState } from 'react';
import { X, Smartphone, Info } from 'lucide-react';
import { mobileAlarmHelper } from '../utils/mobileAlarmHelper';

export default function MobileAlarmTips() {
  const [isVisible, setIsVisible] = useState(() => {
    // Only show on mobile devices and if not dismissed before
    return mobileAlarmHelper.isMobile() && !localStorage.getItem('mobile-tips-dismissed');
  });

  if (!isVisible) return null;

  const recommendations = mobileAlarmHelper.getDeviceRecommendations();
  const isPWA = mobileAlarmHelper.isPWA();

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('mobile-tips-dismissed', 'true');
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
      <div className="bg-zinc-900 border-2 border-yellow-500 rounded-xl p-4 shadow-lg">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-yellow-500" />
            <h3 className="text-white font-semibold text-sm">Mobile Alarm Tips</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 mb-3">
          {!isPWA && (
            <div className="flex items-start gap-2 p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <Info className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-yellow-400 text-xs">
                <strong>Install as App:</strong> Add to Home Screen for better alarm reliability
              </p>
            </div>
          )}

          {recommendations.slice(0, 2).map((tip, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full flex-shrink-0 mt-2"></div>
              <p className="text-zinc-300 text-xs">{tip}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            className="flex-1 bg-zinc-800 text-white py-2 px-3 rounded-lg text-xs border border-zinc-700"
          >
            Got it
          </button>
          {!isPWA && (
            <button
              onClick={() => {
                // Show install prompt if available
                if ('beforeinstallprompt' in window) {
                  (window as any).deferredPrompt?.prompt();
                }
                handleDismiss();
              }}
              className="flex-1 bg-yellow-500 text-black py-2 px-3 rounded-lg text-xs font-medium"
            >
              Install App
            </button>
          )}
        </div>
      </div>
    </div>
  );
}