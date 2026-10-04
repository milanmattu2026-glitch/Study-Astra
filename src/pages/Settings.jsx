import { useState } from 'react';
import { Sun, Moon, Bell, Clock, Download, Upload, Trash2, RefreshCw } from 'lucide-react';
import { useStore, useTheme } from '../hooks/useStore';
import { store } from '../store';
import { exportData, importData } from '../utils/helpers';

export default function Settings() {
  const settings = useStore('settings');
  const { theme, setThemeMode } = useTheme();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleExportData = () => {
    const data = store.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `study-astra-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const success = store.importData(event.target.result);
        if (success) {
          alert('Data imported successfully!');
          window.location.reload();
        } else {
          alert('Failed to import data. Please check the file format.');
        }
      } catch (error) {
        alert('Error importing data: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (showResetConfirm) {
      store.resetData();
      setShowResetConfirm(false);
      alert('All data has been reset to demo data.');
      window.location.reload();
    } else {
      setShowResetConfirm(true);
    }
  };

  return (
    <div className="page-enter space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-[var(--color-text-secondary)]">
          Customize your Study Astra experience
        </p>
      </div>

      {/* Appearance */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Sun size={20} />
          Appearance
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-3">Theme</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setThemeMode('dark')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  theme === 'dark'
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                    : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/50'
                }`}
              >
                <Moon size={24} className="mx-auto mb-2" />
                <div className="text-sm font-medium">Dark</div>
              </button>

              <button
                onClick={() => setThemeMode('light')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  theme === 'light'
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                    : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/50'
                }`}
              >
                <Sun size={24} className="mx-auto mb-2" />
                <div className="text-sm font-medium">Light</div>
              </button>

              <button
                onClick={() => setThemeMode('system')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  theme === 'system'
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                    : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/50'
                }`}
              >
                <RefreshCw size={24} className="mx-auto mb-2" />
                <div className="text-sm font-medium">System</div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Accent Color</label>
            <div className="flex gap-3">
              {[
                { name: 'Purple', value: '#6c63ff' },
                { name: 'Blue', value: '#3b82f6' },
                { name: 'Green', value: '#10b981' },
                { name: 'Orange', value: '#f97316' },
                { name: 'Pink', value: '#ec4899' },
              ].map(color => (
                <button
                  key={color.value}
                  onClick={() => store.updateSettings({ accentColor: color.value })}
                  className={`w-12 h-12 rounded-lg border-2 transition-all ${
                    settings?.accentColor === color.value
                      ? 'border-white scale-110'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Study Preferences */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock size={20} />
          Study Preferences
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Daily Study Goal (minutes)
            </label>
            <input
              type="number"
              value={settings?.dailyStudyGoal || 240}
              onChange={(e) => store.updateSettings({ dailyStudyGoal: parseInt(e.target.value) })}
              className="input"
              min="15"
              max="720"
            />
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {Math.floor((settings?.dailyStudyGoal || 240) / 60)}h {(settings?.dailyStudyGoal || 240) % 60}m per day
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Pomodoro Focus Duration (minutes)
            </label>
            <input
              type="number"
              value={settings?.pomodoroFocus || 25}
              onChange={(e) => store.updateSettings({ pomodoroFocus: parseInt(e.target.value) })}
              className="input"
              min="5"
              max="60"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Short Break (minutes)
              </label>
              <input
                type="number"
                value={settings?.pomodoroShortBreak || 5}
                onChange={(e) => store.updateSettings({ pomodoroShortBreak: parseInt(e.target.value) })}
                className="input"
                min="1"
                max="15"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Long Break (minutes)
              </label>
              <input
                type="number"
                value={settings?.pomodoroLongBreak || 15}
                onChange={(e) => store.updateSettings({ pomodoroLongBreak: parseInt(e.target.value) })}
                className="input"
                min="5"
                max="30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Week Starts On</label>
            <select
              value={settings?.weekStartsOn || 'monday'}
              onChange={(e) => store.updateSettings({ weekStartsOn: e.target.value })}
              className="input"
            >
              <option value="sunday">Sunday</option>
              <option value="monday">Monday</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Bell size={20} />
          Notifications
        </h2>

        <div className="space-y-3">
          {[
            { key: 'examReminders', label: 'Exam Reminders' },
            { key: 'taskReminders', label: 'Task Due Reminders' },
            { key: 'studyReminders', label: 'Daily Study Reminders' },
            { key: 'streakReminders', label: 'Streak Reminders' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between p-3 bg-[var(--color-bg-tertiary)] rounded-lg">
              <span>{item.label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.[item.key] ?? true}
                  onChange={(e) => store.updateSettings({ [item.key]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--color-bg-hover)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--color-accent)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent)]"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Download size={20} />
          Data Management
        </h2>

        <div className="space-y-3">
          <button
            onClick={handleExportData}
            className="btn btn-secondary w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <Download size={18} />
              Export Data
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">Backup your data</span>
          </button>

          <label className="btn btn-secondary w-full justify-between cursor-pointer">
            <span className="flex items-center gap-2">
              <Upload size={18} />
              Import Data
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">Restore from backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>

          <button
            onClick={handleResetData}
            className={`btn w-full justify-between ${
              showResetConfirm ? 'btn-danger' : 'btn-secondary'
            }`}
          >
            <span className="flex items-center gap-2">
              <Trash2 size={18} />
              {showResetConfirm ? 'Click again to confirm' : 'Reset to Demo Data'}
            </span>
            {showResetConfirm && (
              <span className="text-xs">This will erase all your data!</span>
            )}
          </button>

          {showResetConfirm && (
            <button
              onClick={() => setShowResetConfirm(false)}
              className="btn btn-ghost w-full text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* About */}
      <div className="card text-center">
        <h2 className="text-xl font-semibold mb-2">Study Astra</h2>
        <p className="text-[var(--color-text-muted)] mb-4">
          Your academic universe. Navigate your learning journey.
        </p>
        <div className="text-sm text-[var(--color-text-muted)]">
          Version 1.0.0 • Made with ❤️ for students
        </div>
      </div>
    </div>
  );
}
