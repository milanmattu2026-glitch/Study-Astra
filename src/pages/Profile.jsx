import { useStore } from '../hooks/useStore';
import { User, Mail, Calendar, Award, TrendingUp, Target, Flame, Edit2 } from 'lucide-react';
import { formatDate } from '../utils/helpers';

export default function Profile() {
  const user = useStore('user');
  const subjects = useStore('subjects');
  const tasks = useStore('tasks');
  const sessions = useStore('sessions');
  const quizzes = useStore('quizzes');
  const streakData = useStore('streak');

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalStudyMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const totalStudyHours = Math.floor(totalStudyMinutes / 60);
  const avgQuizScore = quizzes.length > 0
    ? Math.round(quizzes.reduce((sum, q) => sum + (q.score || 0), 0) / quizzes.length)
    : 0;
  const avgProgress = subjects.length > 0
    ? Math.round(subjects.reduce((sum, s) => sum + (s.progress || 0), 0) / subjects.length)
    : 0;

  return (
    <div className="page-enter space-y-6 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="card">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-purple-600 flex items-center justify-center text-4xl">
            {user?.avatar || '👨‍🎓'}
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">{user?.name || 'Student'}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-[var(--color-text-muted)]">
              {user?.email && (
                <span className="flex items-center gap-1">
                  <Mail size={16} />
                  {user.email}
                </span>
              )}
              {user?.educationLevel && (
                <span className="flex items-center gap-1">
                  <User size={16} />
                  {user.educationLevel}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={16} />
                Member since {formatDate(user?.createdAt || new Date())}
              </span>
            </div>
          </div>

          <button className="btn btn-secondary">
            <Edit2 size={16} />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-4xl mb-2">📚</div>
          <div className="text-2xl font-bold mb-1">{subjects.length}</div>
          <div className="text-sm text-[var(--color-text-muted)]">Subjects</div>
        </div>

        <div className="card text-center">
          <div className="text-4xl mb-2">✅</div>
          <div className="text-2xl font-bold mb-1">{completedTasks}</div>
          <div className="text-sm text-[var(--color-text-muted)]">Tasks Done</div>
        </div>

        <div className="card text-center">
          <div className="text-4xl mb-2">⏱️</div>
          <div className="text-2xl font-bold mb-1">{totalStudyHours}h</div>
          <div className="text-sm text-[var(--color-text-muted)]">Study Time</div>
        </div>

        <div className="card text-center">
          <div className="text-4xl mb-2">🔥</div>
          <div className="text-2xl font-bold mb-1">{streakData?.currentStreak || 0}</div>
          <div className="text-sm text-[var(--color-text-muted)]">Day Streak</div>
        </div>
      </div>

      {/* Achievements */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Award size={20} />
          Achievements
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          {streakData?.currentStreak >= 7 && (
            <div className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg">
              <div className="text-3xl mb-2">🔥</div>
              <div className="font-semibold mb-1">Week Warrior</div>
              <div className="text-sm text-[var(--color-text-muted)]">
                7+ day study streak
              </div>
            </div>
          )}

          {completedTasks >= 50 && (
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg">
              <div className="text-3xl mb-2">✅</div>
              <div className="font-semibold mb-1">Task Master</div>
              <div className="text-sm text-[var(--color-text-muted)]">
                50+ tasks completed
              </div>
            </div>
          )}

          {avgProgress >= 80 && (
            <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg">
              <div className="text-3xl mb-2">🎯</div>
              <div className="font-semibold mb-1">Syllabus Champion</div>
              <div className="text-sm text-[var(--color-text-muted)]">
                80%+ average progress
              </div>
            </div>
          )}

          {quizzes.length >= 10 && (
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
              <div className="text-3xl mb-2">🧠</div>
              <div className="font-semibold mb-1">Quiz Expert</div>
              <div className="text-sm text-[var(--color-text-muted)]">
                10+ quizzes taken
              </div>
            </div>
          )}

          {totalStudyHours >= 20 && (
            <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg">
              <div className="text-3xl mb-2">⏰</div>
              <div className="font-semibold mb-1">Focused Learner</div>
              <div className="text-sm text-[var(--color-text-muted)]">
                20+ study hours
              </div>
            </div>
          )}

          {avgQuizScore >= 90 && (
            <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-lg">
              <div className="text-3xl mb-2">⭐</div>
              <div className="font-semibold mb-1">Top Performer</div>
              <div className="text-sm text-[var(--color-text-muted)]">
                90%+ quiz average
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Target size={20} />
            Progress Overview
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Syllabus Completion</span>
                <span className="text-sm font-medium">{avgProgress}%</span>
              </div>
              <div className="h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--color-accent)] rounded-full transition-all"
                  style={{ width: `${avgProgress}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Quiz Performance</span>
                <span className="text-sm font-medium">{avgQuizScore}%</span>
              </div>
              <div className="h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--color-success)] rounded-full transition-all"
                  style={{ width: `${avgQuizScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Task Completion</span>
                <span className="text-sm font-medium">
                  {tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--color-info)] rounded-full transition-all"
                  style={{ width: `${tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Study Statistics
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[var(--color-bg-tertiary)] rounded-lg">
              <span className="text-sm">Total Study Sessions</span>
              <span className="font-semibold">{sessions.length}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-[var(--color-bg-tertiary)] rounded-lg">
              <span className="text-sm">Quizzes Taken</span>
              <span className="font-semibold">{quizzes.length}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-[var(--color-bg-tertiary)] rounded-lg">
              <span className="text-sm">Best Streak</span>
              <span className="font-semibold">{streakData?.bestStreak || 0} days</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-[var(--color-bg-tertiary)] rounded-lg">
              <span className="text-sm">Daily Study Goal</span>
              <span className="font-semibold">{user?.dailyStudyGoal || 240} min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Subjects */}
      {subjects.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-4">Top Subjects by Progress</h3>
          <div className="space-y-3">
            {subjects
              .sort((a, b) => (b.progress || 0) - (a.progress || 0))
              .slice(0, 5)
              .map(subject => (
                <div key={subject.id} className="flex items-center gap-4">
                  <div className="text-2xl">{subject.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium mb-1">{subject.name}</div>
                    <div className="h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${subject.progress}%`,
                          backgroundColor: subject.color
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-sm font-medium" style={{ color: subject.color }}>
                    {subject.progress}%
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
