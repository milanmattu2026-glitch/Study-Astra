import { useStore } from '../hooks/useStore';
import { Flame, Calendar, TrendingUp, Award } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, addMonths } from 'date-fns';
import { useState } from 'react';

export default function Streak() {
  const streakData = useStore('streak');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const studyDates = streakData?.studyDates || [];
  const currentStreak = streakData?.currentStreak || 0;
  const bestStreak = streakData?.bestStreak || 0;

  // Get days in current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Organize days into weeks
  const weeks = [];
  let currentWeek = [];

  // Add empty cells for days before month starts
  const firstDayOfWeek = monthStart.getDay();
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null);
  }

  daysInMonth.forEach((day, index) => {
    currentWeek.push(day);

    if (currentWeek.length === 7 || index === daysInMonth.length - 1) {
      // Fill remaining days if last week
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const hasStudiedOnDay = (day) => {
    if (!day) return false;
    const dateStr = format(day, 'yyyy-MM-dd');
    return studyDates.includes(dateStr);
  };

  const isToday = (day) => {
    if (!day) return false;
    return isSameDay(day, new Date());
  };

  const getIntensity = (day) => {
    if (!hasStudiedOnDay(day)) return 0;
    // Could be enhanced to show intensity based on study hours
    return 1;
  };

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const totalStudyDays = studyDates.length;
  const thisMonthStudyDays = studyDates.filter(dateStr => {
    const date = new Date(dateStr);
    return date.getMonth() === currentMonth.getMonth() &&
           date.getFullYear() === currentMonth.getFullYear();
  }).length;

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="text-6xl mb-4">🔥</div>
        <h1 className="text-4xl font-bold mb-2">
          {currentStreak} Day Streak
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          {currentStreak === 0
            ? 'Start studying today to begin your streak!'
            : currentStreak === 1
            ? 'Great start! Keep it going tomorrow.'
            : currentStreak >= 7
            ? "You're on fire! Keep up the amazing work."
            : 'Keep going! Consistency is key.'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="card text-center">
          <Flame size={32} className="mx-auto mb-2 text-[var(--color-warning)]" />
          <div className="text-2xl font-bold mb-1">{currentStreak}</div>
          <div className="text-sm text-[var(--color-text-muted)]">Current Streak</div>
        </div>

        <div className="card text-center">
          <Award size={32} className="mx-auto mb-2 text-[var(--color-accent)]" />
          <div className="text-2xl font-bold mb-1">{bestStreak}</div>
          <div className="text-sm text-[var(--color-text-muted)]">Best Streak</div>
        </div>

        <div className="card text-center">
          <Calendar size={32} className="mx-auto mb-2 text-[var(--color-success)]" />
          <div className="text-2xl font-bold mb-1">{totalStudyDays}</div>
          <div className="text-sm text-[var(--color-text-muted)]">Total Study Days</div>
        </div>

        <div className="card text-center">
          <TrendingUp size={32} className="mx-auto mb-2 text-[var(--color-info)]" />
          <div className="text-2xl font-bold mb-1">{thisMonthStudyDays}</div>
          <div className="text-sm text-[var(--color-text-muted)]">This Month</div>
        </div>
      </div>

      {/* Calendar */}
      <div className="card">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={previousMonth}
            className="btn btn-ghost"
          >
            ←
          </button>
          <h2 className="text-xl font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button
            onClick={nextMonth}
            className="btn btn-ghost"
            disabled={currentMonth.getMonth() === new Date().getMonth() &&
                     currentMonth.getFullYear() === new Date().getFullYear()}
          >
            →
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-[var(--color-text-muted)]">
                {day}
              </div>
            ))}
          </div>

          {/* Weeks */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-2">
              {week.map((day, dayIndex) => {
                if (!day) {
                  return <div key={dayIndex} />;
                }

                const hasStudied = hasStudiedOnDay(day);
                const today = isToday(day);
                const isFuture = day > new Date();

                return (
                  <div
                    key={dayIndex}
                    className={`
                      aspect-square flex items-center justify-center rounded-lg text-sm font-medium
                      transition-all cursor-default
                      ${isFuture
                        ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] opacity-50'
                        : hasStudied
                        ? 'bg-[var(--color-success)] text-white shadow-lg'
                        : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
                      }
                      ${today ? 'ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--color-bg-card)]' : ''}
                    `}
                    title={hasStudied ? `Studied on ${format(day, 'MMM d')}` : ''}
                  >
                    {format(day, 'd')}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[var(--color-bg-tertiary)]" />
            <span className="text-sm text-[var(--color-text-muted)]">No activity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[var(--color-success)]" />
            <span className="text-sm text-[var(--color-text-muted)]">Studied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded ring-2 ring-[var(--color-accent)]" />
            <span className="text-sm text-[var(--color-text-muted)]">Today</span>
          </div>
        </div>
      </div>

      {/* Motivational Section */}
      {currentStreak > 0 && (
        <div className="card bg-gradient-to-br from-[var(--color-accent)] to-purple-600 text-white">
          <h3 className="text-xl font-semibold mb-2">Keep it Going! 🚀</h3>
          <p className="opacity-90">
            {currentStreak < 7
              ? `You're ${7 - currentStreak} day${7 - currentStreak === 1 ? '' : 's'} away from a week streak!`
              : currentStreak < 30
              ? `Amazing! You're ${30 - currentStreak} day${30 - currentStreak === 1 ? '' : 's'} away from a month streak!`
              : currentStreak < bestStreak
              ? `You're ${bestStreak - currentStreak} day${bestStreak - currentStreak === 1 ? '' : 's'} away from your best streak!`
              : "You're at your personal best! New record! 🎉"}
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="card">
        <h3 className="font-semibold mb-3">💡 Streak Tips</h3>
        <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
          <li>• Complete a task, take a quiz, or complete a focus session to maintain your streak</li>
          <li>• Set a daily reminder to study at the same time each day</li>
          <li>• Even 15 minutes of focused study counts!</li>
          <li>• Your streak resets if you miss a day, so stay consistent</li>
        </ul>
      </div>
    </div>
  );
}
