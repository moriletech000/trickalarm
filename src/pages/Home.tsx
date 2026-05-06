import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, AlarmClock } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { getObjectIcon } from '../utils/objectIcons';

export default function Home() {
  const navigate = useNavigate();
  const { alarms, updateAlarm, deleteAlarm } = useAppStore();

  const handleToggleAlarm = (id: string, isActive: boolean) => {
    updateAlarm(id, { isActive: !isActive });
  };

  const handleDeleteAlarm = (id: string) => {
    if (confirm('Delete this alarm?')) {
      deleteAlarm(id);
    }
  };

  const getDayNames = (days: number[]) => {
    const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    if (days.length === 7) return 'Every day';
    if (days.length === 0) return 'Never';
    return days
      .sort((a, b) => a - b)
      .map((d) => dayMap[d])
      .join(', ');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black pb-24"
    >
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="bg-[#1a1a1a] rounded-xl p-6 border-2 border-[#2a2a2a]">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-yellow-500 mb-1">TrickAlarm</h1>
                <p className="text-gray-400 text-sm">Smart alarm with AI challenges</p>
              </div>
              <AlarmClock className="text-yellow-500" size={40} />
            </div>
          </div>
        </motion.header>

        {alarms.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-20"
          >
            <div className="bg-[#1a1a1a] rounded-xl p-12 border-2 border-[#2a2a2a]">
              <AlarmClock className="mx-auto mb-6 text-yellow-500" size={80} />
              <h2 className="text-2xl font-bold text-white mb-3">No alarms yet</h2>
              <p className="text-gray-400 mb-6">Create your first smart alarm</p>
              <div className="inline-block px-6 py-2 bg-[#2a2a2a] rounded-lg text-sm text-gray-300 border border-[#3a3a3a]">
                Tap the + button below
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {alarms.map((alarm, index) => {
              const ObjectIcon = getObjectIcon(alarm.challengeObject);
              
              return (
                <motion.div
                  key={alarm.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-[#1a1a1a] rounded-xl p-6 border-2 ${
                    alarm.isActive ? 'border-yellow-500' : 'border-[#2a2a2a]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="text-5xl font-bold text-white mb-2 tracking-tight">
                        {alarm.time}
                      </div>
                      <div className="text-gray-400 text-sm font-medium">
                        {alarm.label || 'Alarm'}
                      </div>
                    </div>
                    <div
                      className={`toggle-switch ${alarm.isActive ? 'active' : ''}`}
                      onClick={() => handleToggleAlarm(alarm.id, alarm.isActive)}
                    >
                      <div className="toggle-switch-handle" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm mb-4 pb-4 border-b border-[#2a2a2a]">
                    <span className="text-gray-400">{getDayNames(alarm.days)}</span>
                    <div className="flex items-center space-x-2 bg-[#2a2a2a] rounded-lg px-3 py-2 border border-[#3a3a3a]">
                      <ObjectIcon className="text-yellow-500" size={20} />
                      <span className="text-white font-medium capitalize text-xs">
                        {alarm.challengeObject}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate(`/set/${alarm.id}`)}
                      className="flex-1 bg-[#2a2a2a] text-white py-3 rounded-lg font-medium border border-[#3a3a3a] flex items-center justify-center space-x-2"
                    >
                      <Edit2 size={16} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteAlarm(alarm.id)}
                      className="flex-1 bg-red-900/20 text-red-500 py-3 rounded-lg font-medium border border-red-900/50 flex items-center justify-center space-x-2"
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/set')}
        className="fixed bottom-8 right-8 w-16 h-16 bg-yellow-500 rounded-xl flex items-center justify-center text-black"
      >
        <Plus size={32} strokeWidth={3} />
      </motion.button>
    </motion.div>
  );
}
