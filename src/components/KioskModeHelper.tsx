import { useState, useEffect } from 'react';
import { X, Monitor, Smartphone, Info } from 'lucide-react';

interface KioskModeHelperProps {
  isAlarmActive: boolean;
}

export default function KioskModeHelper({ isAlarmActive }: KioskModeHelperProps) {
  const [showInstructions, setShowInstructions] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const checkFullscreen = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', checkFullscreen);
    document.addEventListener('webkitfullscreenchange', checkFullscreen);
    
    return () => {
      document.removeEventListener('fullscreenchange', checkFullscreen);
      document.removeEventListener('webkitfullscreenchange', checkFullscreen);
    };
  }, []);

  // Show instructions when alarm is active but not in fullscreen
  useEffect(() => {
    if (isAlarmActive && !isFullscreen) {
      const timer = setTimeout(() => {
        setShowInstructions(true);
      }, 3000); // Show after 3 seconds

      return () => clearTimeout(timer);
    } else {
      setShowInstructions(false);
    }
  }, [isAlarmActive, isFullscreen]);

  const enterKioskMode = async () => {
    try {
      // Request fullscreen
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        await (document.documentElement as any).webkitRequestFullscreen();
      }
      
      setShowInstructions(false);
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
    }
  };

  if (!showInstructions || !isAlarmActive) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border-2 border-yellow-500 rounded-xl p-6 max-w-md w-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Monitor className="w-6 h-6 text-yellow-500" />
            <h3 className="text-white font-bold text-lg">Kiosk Mode</h3>
          </div>
          <button
            onClick={() => setShowInstructions(false)}
            className="text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <Info className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-400 text-sm font-medium mb-1">
                Prevent Accidental Closure
              </p>
              <p className="text-zinc-300 text-xs">
                Fullscreen mode makes it harder to accidentally close the alarm
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-medium text-sm">Browser Instructions:</h4>
            <div className="space-y-1 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                <span><strong>Chrome:</strong> Press F11 or click fullscreen button</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                <span><strong>Safari:</strong> View → Enter Full Screen</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                <span><strong>Mobile:</strong> Add to Home Screen for app mode</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-medium text-sm flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Mobile Kiosk Mode:
            </h4>
            <div className="space-y-1 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                <span><strong>Android:</strong> Enable "Guided Access" in Settings</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                <span><strong>iOS:</strong> Settings → Accessibility → Guided Access</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={enterKioskMode}
            className="flex-1 bg-yellow-500 text-black py-3 px-4 rounded-lg font-semibold text-sm"
          >
            Enter Fullscreen
          </button>
          <button
            onClick={() => setShowInstructions(false)}
            className="flex-1 bg-zinc-800 text-white py-3 px-4 rounded-lg font-medium text-sm border border-zinc-700"
          >
            Continue
          </button>
        </div>

        <p className="text-zinc-500 text-xs text-center mt-3">
          Fullscreen mode can be exited by pressing Esc key
        </p>
      </div>
    </div>
  );
}