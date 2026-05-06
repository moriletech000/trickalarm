import { motion } from 'framer-motion';
import { AlarmClock, AlertTriangle } from 'lucide-react';

interface LoadingScreenProps {
  error?: string | null;
  onSkip?: () => void;
}

export default function LoadingScreen({ error, onSkip }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-black">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="bg-zinc-900 rounded-3xl p-12 border-2 border-zinc-800">
          <div className="flex justify-center mb-6">
            <AlarmClock className="w-24 h-24 text-yellow-500" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-bold text-yellow-500 mb-4">TrickAlarm</h1>
          
          {!error ? (
            <>
              <div className="flex items-center justify-center space-x-3 mb-6">
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-4 h-4 bg-yellow-500 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  className="w-4 h-4 bg-yellow-500 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  className="w-4 h-4 bg-yellow-500 rounded-full"
                />
              </div>
              <p className="text-zinc-300 text-lg mb-2">Loading AI model...</p>
              <p className="text-zinc-500 text-sm">This may take a few seconds on first load</p>
              
              {onSkip && (
                <button
                  onClick={onSkip}
                  className="mt-6 px-6 py-3 bg-zinc-800 text-white rounded-xl text-sm border-2 border-zinc-700"
                >
                  Skip and Continue
                </button>
              )}
            </>
          ) : (
            <>
              <div className="border-2 border-yellow-500 rounded-xl p-4 mt-4 bg-yellow-500/10 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-yellow-400 text-sm">{error}</p>
              </div>
              
              {onSkip && (
                <button
                  onClick={onSkip}
                  className="mt-4 px-6 py-3 bg-yellow-500 text-black rounded-xl font-semibold"
                >
                  Continue to App
                </button>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
