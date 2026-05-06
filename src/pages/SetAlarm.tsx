import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Shuffle } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { getRandomChallengeObject } from '../utils/challengeObjects';
import { getObjectIcon } from '../utils/objectIcons';

export default function SetAlarm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { alarms, addAlarm, updateAlarm } = useAppStore();

  const existingAlarm = id ? alarms.find((a) => a.id === id) : null;

  const [time, setTime] = useState(existingAlarm?.time || '07:00');
  const [label, setLabel] = useState(existingAlarm?.label || '');
  const [selectedDays, setSelectedDays] = useState<number[]>(existingAlarm?.days || [1, 2, 3, 4, 5]);
  const [sound, setSound] = useState<'beep' | 'buzz' | 'bell'>(existingAlarm?.sound || 'beep');
  const [challengeObject, setChallengeObject] = useState(
    existingAlarm?.challengeObject || getRandomChallengeObject().name
  );

  const days = [
    { name: 'Sun', value: 0 },
    { name: 'Mon', value: 1 },
    { name: 'Tue', value: 2 },
    { name: 'Wed', value: 3 },
    { name: 'Thu', value: 4 },
    { name: 'Fri', value: 5 },
    { name: 'Sat', value: 6 },
  ];

  const sounds: Array<'beep' | 'buzz' | 'bell'> = ['beep', 'buzz', 'bell'];

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleReroll = () => {
    setChallengeObject(getRandomChallengeObject().name);
  };

  const handleSave = () => {
    if (selectedDays.length === 0) {
      alert('Please select at least one day');
      return;
    }

    const alarmData = {
      id: id || `alarm-${Date.now()}`,
      label,
      time,
      days: selectedDays,
      sound,
      challengeObject,
      isActive: true,
      snoozeCount: 0,
      createdAt: existingAlarm?.createdAt || Date.now(),
    };

    if (id) {
      updateAlarm(id, alarmData);
    } else {
      addAlarm(alarmData);
    }

    navigate('/');
  };

  const ObjectIcon = getObjectIcon(challengeObject);

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      className="min-h-screen bg-black"
    >
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]"
          >
            <ArrowLeft className="text-white" size={20} />
          </button>
          <h1 className="text-2xl font-bold text-yellow-500">
            {id ? 'Edit Alarm' : 'New Alarm'}
          </h1>
          <div className="w-12" />
        </header>

        <div className="space-y-6">
          {/* Time Picker */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-gray-400 text-sm font-medium mb-3">Time</label>
            <div className="bg-[#1a1a1a] rounded-xl p-8 border-2 border-[#2a2a2a]">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-6xl font-bold text-center bg-transparent border-none focus:outline-none text-white"
              />
            </div>
          </motion.div>

          {/* Label Input */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-gray-400 text-sm font-medium mb-3">Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Morning, Gym, Work"
              className="w-full bg-[#1a1a1a] py-4 px-5 text-white rounded-xl border-2 border-[#2a2a2a]"
            />
          </motion.div>

          {/* Days Selector */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-gray-400 text-sm font-medium mb-3">Repeat</label>
            <div className="flex items-center justify-between gap-2">
              {days.map((day) => (
                <button
                  key={day.value}
                  onClick={() => toggleDay(day.value)}
                  className={`flex-1 py-3 rounded-lg font-medium ${
                    selectedDays.includes(day.value)
                      ? 'bg-yellow-500 text-black'
                      : 'bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a]'
                  }`}
                >
                  {day.name}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Sound Selector */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-gray-400 text-sm font-medium mb-3">Sound</label>
            <div className="grid grid-cols-3 gap-3">
              {sounds.map((s) => (
                <button
                  key={s}
                  onClick={() => setSound(s)}
                  className={`py-4 rounded-lg font-medium capitalize ${
                    sound === s
                      ? 'bg-yellow-500 text-black'
                      : 'bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Challenge Object */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block text-gray-400 text-sm font-medium mb-3">
              Challenge Object
            </label>
            <div className="bg-[#1a1a1a] rounded-xl p-6 border-2 border-[#2a2a2a]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <ObjectIcon className="text-yellow-500" size={48} />
                  <div>
                    <div className="text-white font-bold text-xl capitalize mb-1">
                      {challengeObject}
                    </div>
                    <div className="text-gray-400 text-sm">Scan this to dismiss</div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleReroll}
                className="w-full bg-[#2a2a2a] text-white py-3 rounded-lg font-medium border border-[#3a3a3a] flex items-center justify-center space-x-2"
              >
                <Shuffle size={18} />
                <span>Re-roll Object</span>
              </button>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="w-full bg-yellow-500 text-black py-5 rounded-xl font-bold text-lg"
          >
            {id ? 'Update Alarm' : 'Save Alarm'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
