import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, CheckCircle2 } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { store } from '../store';
import { updateStreak } from '../utils/helpers';

export default function Focus() {
  const settings = useStore('settings');
  const subjects = useStore('subjects');
  const streakData = useStore('streak');

  const [mode, setMode] = useState('focus'); // focus, short-break, long-break
  const [timeLeft, setTimeLeft] = useState(settings?.pomodoroFocus * 60 || 1500); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [sessionTopic, setSessionTopic] = useState('');
  const [completedToday, setCompletedToday] = useState([]);

  const intervalRef = useRef(null);

  const durations = {
    focus: settings?.pomodoroFocus || 25,
    'short-break': settings?.pomodoroShortBreak || 5,
    'long-break': settings?.pomodoroLongBreak || 15
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleTimerComplete = () => {
    setIsRunning(false);

    if (mode === 'focus') {
      // Session completed
      const newSessions = sessions + 1;
      setSessions(newSessions);

      // Save session to store
      const duration = durations.focus;
      const session = {
        subject: selectedSubject,
        topic: sessionTopic || 'Focus Session',
        startTime: new Date(Date.now() - duration * 60 * 1000).toISOString(),
        endTime: new Date().toISOString(),
        duration: duration,
        completed: true,
        priority: 'medium',
        goal: 'Pomodoro focus session',
        notes: ''
      };
      store.addSession(session);

      // Update streak
      const updatedStreak = updateStreak(streakData);
      store.updateStreakData(updatedStreak);

      // Add to completed today
      setCompletedToday(prev => [...prev, {
        time: new Date(),
        duration,
        subject: selectedSubject,
        topic: sessionTopic
      }]);

      // Auto-switch to break
      if (newSessions % 4 === 0) {
        setMode('long-break');
        setTimeLeft(durations['long-break'] * 60);
      } else {
        setMode('short-break');
        setTimeLeft(durations['short-break'] * 60);
      }

      // Show notification
      if (Notification.permission === 'granted') {
        new Notification('Focus Session Complete! 🎉', {
          body: 'Great work! Time for a break.',
          icon: '/favicon.ico'
        });
      }
    } else {
      // Break completed
      setMode('focus');
      setTimeLeft(durations.focus * 60);

      if (Notification.permission === 'granted') {
        new Notification('Break Complete!', {
          body: 'Ready to focus again?',
          icon: '/favicon.ico'
        });
      }
    }
  };

  const handleStartPause = () => {
    if (!isRunning && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(durations[mode] * 60);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setTimeLeft(durations[newMode] * 60);
    setIsRunning(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((durations[mode] * 60 - timeLeft) / (durations[mode] * 60)) * 100;

  const todayMinutes = completedToday.reduce((sum, s) => sum + s.duration, 0);
  const subject = subjects.find(s => s.id === selectedSubject);

  return (
    <div className="page-enter min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Focus Timer</h1>
          <p className="text-[var(--color-text-secondary)]">
            Stay focused, take breaks, get things done
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => handleModeChange('focus')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              mode === 'focus'
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
            }`}
          >
            Focus
          </button>
          <button
            onClick={() => handleModeChange('short-break')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              mode === 'short-break'
                ? 'bg-[var(--color-success)] text-white'
                : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
            }`}
          >
            Short Break
          </button>
          <button
            onClick={() => handleModeChange('long-break')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              mode === 'long-break'
                ? 'bg-[var(--color-info)] text-white'
                : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
            }`}
          >
            Long Break
          </button>
        </div>

        {/* Timer Circle */}
        <div className="card bg-gradient-to-br from-[var(--color-bg-secondary)] to-[var(--color-bg-tertiary)]">
          <div className="flex flex-col items-center justify-center py-12">
            {/* Circular Progress */}
            <div className="relative w-64 h-64 mb-8">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="var(--color-bg-tertiary)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke={mode === 'focus' ? 'var(--color-accent)' : mode === 'short-break' ? 'var(--color-success)' : 'var(--color-info)'}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 120}`}
                  strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>

              {/* Time Display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold mb-2">{formatTime(timeLeft)}</div>
                  <div className="text-sm text-[var(--color-text-muted)] uppercase tracking-wide">
                    {mode.replace('-', ' ')}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleReset}
                className="p-3 hover:bg-[var(--color-bg-hover)] rounded-full transition-colors"
                title="Reset"
              >
                <RotateCcw size={24} />
              </button>

              <button
                onClick={handleStartPause}
                className={`p-6 rounded-full transition-all transform hover:scale-105 ${
                  mode === 'focus' ? 'bg-[var(--color-accent)]' : mode === 'short-break' ? 'bg-[var(--color-success)]' : 'bg-[var(--color-info)]'
                } text-white shadow-lg`}
              >
                {isRunning ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
              </button>

              <button
                onClick={() => setShowSettings(true)}
                className="p-3 hover:bg-[var(--color-bg-hover)] rounded-full transition-colors"
                title="Settings"
              >
                <Settings size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Session Info */}
        {mode === 'focus' && (
          <div className="card">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">What are you working on?</label>
                <input
                  type="text"
                  placeholder="e.g., Study Data Structures"
                  value={sessionTopic}
                  onChange={(e) => setSessionTopic(e.target.value)}
                  disabled={isRunning}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subject (optional)</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  disabled={isRunning}
                  className="input"
                >
                  <option value="">None</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card text-center">
            <div className="text-2xl font-bold text-[var(--color-accent)]">{sessions}</div>
            <div className="text-sm text-[var(--color-text-muted)]">Sessions</div>
          </div>

          <div className="card text-center">
            <div className="text-2xl font-bold text-[var(--color-success)]">{todayMinutes}m</div>
            <div className="text-sm text-[var(--color-text-muted)]">Today</div>
          </div>

          <div className="card text-center">
            <div className="text-2xl font-bold text-[var(--color-warning)]">
              🔥 {streakData?.currentStreak || 0}
            </div>
            <div className="text-sm text-[var(--color-text-muted)]">Streak</div>
          </div>
        </div>

        {/* Completed Today */}
        {completedToday.length > 0 && (
          <div className="card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-[var(--color-success)]" />
              Completed Today
            </h3>
            <div className="space-y-2">
              {completedToday.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-[var(--color-bg-tertiary)] rounded-lg">
                  <div>
                    <div className="font-medium">{s.topic || 'Focus Session'}</div>
                    {s.subject && (
                      <div className="text-sm text-[var(--color-text-muted)]">
                        {subjects.find(sub => sub.id === s.subject)?.name}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-[var(--color-text-muted)]">
                    {s.duration}m
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div className="modal-overlay" onClick={() => setShowSettings(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold mb-4">Timer Settings</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Focus Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={durations.focus}
                    onChange={(e) => {
                      store.updateSettings({ pomodoroFocus: parseInt(e.target.value) });
                    }}
                    className="input"
                    min="1"
                    max="60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Short Break (minutes)
                  </label>
                  <input
                    type="number"
                    value={durations['short-break']}
                    onChange={(e) => {
                      store.updateSettings({ pomodoroShortBreak: parseInt(e.target.value) });
                    }}
                    className="input"
                    min="1"
                    max="30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Long Break (minutes)
                  </label>
                  <input
                    type="number"
                    value={durations['long-break']}
                    onChange={(e) => {
                      store.updateSettings({ pomodoroLongBreak: parseInt(e.target.value) });
                    }}
                    className="input"
                    min="1"
                    max="60"
                  />
                </div>
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="btn btn-primary w-full mt-6"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
