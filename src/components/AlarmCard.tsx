import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Alarm } from '../store/appStore';
import { getObjectIcon } from '../utils/objectIcons';

interface AlarmCardProps {
  alarm: Alarm;
  index: number;
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
}

export default function AlarmCard({ alarm, index, onToggle, onDelete }: AlarmCardProps) {
  const navigate = useNavigate();
  const ObjectIcon = getObjectIcon(alarm.challengeObject);

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
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-slate-800 rounded-2xl p-5 border-2 transition-all ${
        alarm.isActive ? 'border-primary' : 'border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="text-4xl font-bold text-white mb-1">{alarm.time}</div>
          <div className="text-slate-400 text-sm">{alarm.label || 'Alarm'}</div>
        </div>
        <div
          className={`toggle-switch ${alarm.isActive ? 'active' : ''}`}
          onClick={() => onToggle(alarm.id, alarm.isActive)}
        >
          <div className="toggle-switch-handle" />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm mb-3">
        <span className="text-slate-400">{getDayNames(alarm.days)}</span>
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Challenge:</span>
          <ObjectIcon className="text-yellow-500" size={20} />
          <span className="text-white font-medium capitalize">{alarm.challengeObject}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => navigate(`/set/${alarm.id}`)}
          className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-medium transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(alarm.id)}
          className="flex-1 bg-danger/20 hover:bg-danger/30 text-danger py-2 rounded-lg font-medium transition-colors"
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
}
