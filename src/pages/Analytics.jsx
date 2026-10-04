import { useStore } from '../hooks/useStore';
import { BarChart3, TrendingUp, Clock, Target, Award, Brain } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

export default function Analytics() {
  const subjects = useStore('subjects');
  const tasks = useStore('tasks');
  const sessions = useStore('sessions');
  const quizzes = useStore('quizzes');
  const streakData = useStore('streak');

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalStudyMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const totalStudyHours = Math.floor(totalStudyMinutes / 60);

  const avgProgress = subjects.length > 0
    ? Math.round(subjects.reduce((sum, s) => sum + (s.progress || 0), 0) / subjects.length)
    : 0;

  const avgQuizScore = quizzes.length > 0
    ? Math.round(quizzes.reduce((sum, q) => sum + (q.score || 0), 0) / quizzes.length)
    : 0;

  // Study hours per day (last 7 days)
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date()
  });

  const studyHoursData = last7Days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const daySessions = sessions.filter(s => {
      const sessionDate = format(new Date(s.startTime), 'yyyy-MM-dd');
      return sessionDate === dayStr;
    });
    const minutes = daySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    return {
      day: format(day, 'EEE'),
      hours: Math.round((minutes / 60) * 10) / 10
    };
  });

  // Subject progress data
  const subjectProgressData = subjects.map(s => ({
    name: s.name.length > 15 ? s.name.substring(0, 15) + '...' : s.name,
    progress: s.progress || 0,
    color: s.color
  }));

  // Quiz scores over time
  const quizScoreData = quizzes.slice(-10).map((q, idx) => ({
    quiz: `Q${idx + 1}`,
    score: q.score,
    name: q.topic.length > 20 ? q.topic.substring(0, 20) + '...' : q.topic
  }));

  // Task distribution by priority
  const priorityData = [
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, color: '#60a5fa' },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, color: '#fbbf24' },
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length, color: '#fb923c' },
    { name: 'Critical', value: tasks.filter(t => t.priority === 'critical').length, color: '#f87171' },
  ].filter(p => p.value > 0);

  // Weekly productivity
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const thisWeekTasks = tasks.filter(t => {
    const taskDate = new Date(t.createdAt);
    return taskDate >= weekStart && taskDate <= weekEnd;
  });
  const thisWeekCompleted = thisWeekTasks.filter(t => t.completed).length;
  const weeklyProductivity = thisWeekTasks.length > 0
    ? Math.round((thisWeekCompleted / thisWeekTasks.length) * 100)
    : 0;

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-[var(--color-text-secondary)]">
          Track your progress and insights
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <Target size={20} className="text-[var(--color-accent)]" />
            <span className="text-sm text-[var(--color-text-muted)]">Syllabus</span>
          </div>
          <div className="text-2xl font-bold">{avgProgress}%</div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">Average completion</div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <Clock size={20} className="text-[var(--color-success)]" />
            <span className="text-sm text-[var(--color-text-muted)]">Study Time</span>
          </div>
          <div className="text-2xl font-bold">{totalStudyHours}h</div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">Total hours</div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 size={20} className="text-[var(--color-info)]" />
            <span className="text-sm text-[var(--color-text-muted)]">Tasks</span>
          </div>
          <div className="text-2xl font-bold">{taskCompletionRate}%</div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">
            {completedTasks}/{totalTasks} completed
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <Brain size={20} className="text-[var(--color-warning)]" />
            <span className="text-sm text-[var(--color-text-muted)]">Quiz Avg</span>
          </div>
          <div className="text-2xl font-bold">{avgQuizScore}%</div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">{quizzes.length} quizzes taken</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Study Hours Chart */}
        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock size={20} />
            Study Hours (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={studyHoursData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="day"
                stroke="var(--color-text-muted)"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="var(--color-text-muted)"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="hours" fill="var(--color-accent)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Progress */}
        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Target size={20} />
            Subject Progress
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={subjectProgressData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                type="number"
                domain={[0, 100]}
                stroke="var(--color-text-muted)"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="var(--color-text-muted)"
                style={{ fontSize: '12px' }}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="progress" radius={[0, 8, 8, 0]}>
                {subjectProgressData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Quiz Performance */}
        {quizzes.length > 0 && (
          <div className="card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Brain size={20} />
              Quiz Performance
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={quizScoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="quiz"
                  stroke="var(--color-text-muted)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="var(--color-text-muted)"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="var(--color-success)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-success)', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Task Priority Distribution */}
        {priorityData.length > 0 && (
          <div className="card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart3 size={20} />
              Tasks by Priority
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="card">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={20} />
          Insights
        </h3>
        <div className="space-y-3">
          {weeklyProductivity >= 80 && (
            <div className="p-3 bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 rounded-lg">
              <div className="font-medium text-[var(--color-success)]">
                🎉 Excellent productivity this week!
              </div>
              <div className="text-sm text-[var(--color-text-secondary)] mt-1">
                You completed {weeklyProductivity}% of this week's tasks.
              </div>
            </div>
          )}

          {avgProgress >= 75 && (
            <div className="p-3 bg-[var(--color-info)]/10 border border-[var(--color-info)]/20 rounded-lg">
              <div className="font-medium text-[var(--color-info)]">
                📚 Great syllabus progress!
              </div>
              <div className="text-sm text-[var(--color-text-secondary)] mt-1">
                Your average completion is {avgProgress}%. Keep it up!
              </div>
            </div>
          )}

          {streakData?.currentStreak >= 7 && (
            <div className="p-3 bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/20 rounded-lg">
              <div className="font-medium text-[var(--color-warning)]">
                🔥 {streakData.currentStreak}-day streak!
              </div>
              <div className="text-sm text-[var(--color-text-secondary)] mt-1">
                You're building an amazing study habit.
              </div>
            </div>
          )}

          {avgQuizScore >= 80 && quizzes.length >= 3 && (
            <div className="p-3 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 rounded-lg">
              <div className="font-medium text-[var(--color-accent)]">
                🧠 Strong quiz performance!
              </div>
              <div className="text-sm text-[var(--color-text-secondary)] mt-1">
                Your average score is {avgQuizScore}%. Excellent understanding!
              </div>
            </div>
          )}

          {avgProgress < 50 && subjects.length > 0 && (
            <div className="p-3 bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/20 rounded-lg">
              <div className="font-medium text-[var(--color-warning)]">
                ⚠️ Syllabus needs attention
              </div>
              <div className="text-sm text-[var(--color-text-secondary)] mt-1">
                Your average completion is {avgProgress}%. Consider dedicating more time to your subjects.
              </div>
            </div>
          )}

          {totalStudyHours < 5 && sessions.length > 0 && (
            <div className="p-3 bg-[var(--color-info)]/10 border border-[var(--color-info)]/20 rounded-lg">
              <div className="font-medium text-[var(--color-info)]">
                💡 Increase study time
              </div>
              <div className="text-sm text-[var(--color-text-secondary)] mt-1">
                You've studied {totalStudyHours} hours total. Try to increase your daily study sessions.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
