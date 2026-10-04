import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, Plus, Trash2, Calendar, Clock, Flag, Tag, Brain, Target, Sparkles } from 'lucide-react';
import { useStore, useToast } from '../hooks/useStore';
import { store } from '../store';
import { formatDate, formatTime, getPriorityBadge } from '../utils/helpers';
import { getSmartDailyPlan } from '../services/recommendationEngine';

export default function Dashboard() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const user = useStore('user');
  const subjects = useStore('subjects');
  const tasks = useStore('tasks');
  const exams = useStore('exams');
  const sessions = useStore('sessions');
  const streak = useStore('streak');
  const quizzes = useStore('quizzes');

  const [greeting, setGreeting] = useState('');
  const [quote, setQuote] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const smartRecommendations = getSmartDailyPlan();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    const quotes = [
      "Small progress every day adds up.",
      "You're one step closer to your goals.",
      "Consistency is the key to mastery.",
    ];
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Today's stats
  const todaysTasks = tasks.filter(t => {
    const taskDate = new Date(t.dueDate).toDateString();
    return taskDate === new Date().toDateString();
  });
  const completedTasks = todaysTasks.filter(t => t.completed).length;

  const todaysSessions = sessions.filter(s => {
    const sessionDate = new Date(s.startTime).toDateString();
    return sessionDate === new Date().toDateString();
  });

  const totalStudyMinutes = todaysSessions.reduce((sum, s) => sum + (s.duration || 0), 0);

  const avgProgress = subjects.length > 0
    ? Math.round(subjects.reduce((sum, s) => sum + (s.progress || 0), 0) / subjects.length)
    : 0;

  const upcomingExams = exams
    .filter(e => new Date(e.date) > new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  const handleRecommendationAction = (rec) => {
    if (rec.type === 'weakness_recovery') {
      navigate('/weak-topics');
    } else if (rec.type === 'exam_prep') {
      addToast('Review functionality for exams coming soon!');
    } else if (rec.type === 'task') {
      navigate('/tasks');
    } else if (rec.type === 'maintenance') {
      navigate('/quizzes/create');
    }
  };

  return (
    <div className="page-enter space-y-6 pb-20 md:pb-6">
      {/* Greeting */}
      <div className="animate-fadeIn">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          {greeting}, {user?.name} 👋
        </h1>
        <p className="text-[var(--color-text-secondary)]">{quote}</p>
      </div>

      {/* Today's Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
        <div className="card">
          <div className="text-[var(--color-text-muted)] text-sm mb-2">Tasks Completed</div>
          <div className="text-2xl font-bold text-[var(--color-accent)]">
            {completedTasks}/{todaysTasks.length}
          </div>
        </div>

        <div className="card">
          <div className="text-[var(--color-text-muted)] text-sm mb-2">Study Hours</div>
          <div className="text-2xl font-bold text-[var(--color-success)]">
            {Math.floor(totalStudyMinutes / 60)}h {totalStudyMinutes % 60}m
          </div>
        </div>

        <div className="card">
          <div className="text-[var(--color-text-muted)] text-sm mb-2">Syllabus Progress</div>
          <div className="text-2xl font-bold text-[var(--color-info)]">{avgProgress}%</div>
        </div>

        <div className="card">
          <div className="text-[var(--color-text-muted)] text-sm mb-2">Study Streak</div>
          <div className="text-2xl font-bold text-[var(--color-warning)] flex items-center gap-2">
            🔥 {streak?.currentStreak || 0}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Smart Recommendations */}
        <div className="card animate-fadeIn" style={{ animationDelay: '0.2s', gridColumn: '1 / -1' }}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-[var(--color-accent)]" size={24} />
            <h2 className="text-xl font-semibold">AI Study Recommendations</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {smartRecommendations.length === 0 ? (
              <div className="col-span-3 text-center py-6 text-[var(--color-text-muted)]">
                You're all caught up! Enjoy your free time.
              </div>
            ) : (
              smartRecommendations.map(rec => (
                <div key={rec.id} className="p-4 bg-[var(--color-bg-primary)] border-2 border-[var(--color-accent)]/20 rounded-xl relative overflow-hidden group hover:border-[var(--color-accent)] transition-all flex flex-col h-full">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-accent)] opacity-5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>

                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded-md font-medium uppercase tracking-wider ${
                      rec.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                      rec.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {rec.priority} Priority
                    </span>
                    <span className="text-xs font-medium text-[var(--color-text-muted)] flex items-center gap-1">
                      <Clock size={12} /> {rec.duration}m
                    </span>
                  </div>

                  <h3 className="font-bold text-lg mb-1">{rec.title}</h3>
                  <p className="text-sm font-medium text-[var(--color-text-muted)] mb-3">{rec.subtitle}</p>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-6 flex-1">{rec.reason}</p>

                  <button onClick={() => handleRecommendationAction(rec)} className="btn btn-primary w-full mt-auto">
                    {rec.action}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="card animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Today's Tasks</h2>
            <Link to="/tasks" className="text-sm text-[var(--color-accent)] hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-2">
            {todaysTasks.length === 0 ? (
              <div className="text-center py-8 text-[var(--color-text-muted)]">
                <CheckCircle2 size={48} className="mx-auto mb-3 opacity-50" />
                <p>No tasks for today</p>
              </div>
            ) : (
              todaysTasks.slice(0, 5).map(task => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 bg-[var(--color-bg-tertiary)] rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors"
                >
                  <button
                    onClick={() => store.toggleTask(task.id)}
                    className="flex-shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 size={20} className="text-[var(--color-success)]" />
                    ) : (
                      <Circle size={20} className="text-[var(--color-text-muted)]" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className={`font-medium truncate ${task.completed ? 'line-through text-[var(--color-text-muted)]' : ''}`}>
                      {task.title}
                    </div>
                    <div className="text-sm text-[var(--color-text-muted)] flex items-center gap-2">
                      {task.dueTime && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {task.dueTime}
                        </span>
                      )}
                      <span className={`badge ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's Study Plan */}
        <div className="card animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Today's Study Plan</h2>
            <Link to="/planner" className="text-sm text-[var(--color-accent)] hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {todaysSessions.length === 0 ? (
              <div className="text-center py-8 text-[var(--color-text-muted)]">
                <Calendar size={48} className="mx-auto mb-3 opacity-50" />
                <p>No sessions planned</p>
              </div>
            ) : (
              todaysSessions.slice(0, 5).map((session, idx) => {
                const subject = subjects.find(s => s.id === session.subject);
                return (
                  <div key={session.id} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-16 text-sm text-[var(--color-text-muted)]">
                      {new Date(session.startTime).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="h-px flex-1 bg-[var(--color-border)]" />
                    <div className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium"
                         style={{ backgroundColor: subject?.color + '20', color: subject?.color }}>
                      {subject?.name || 'Unknown'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Exam Countdown */}
      {upcomingExams.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          {upcomingExams.map(exam => {
            const examDate = new Date(exam.date);
            const now = new Date();
            const diff = examDate - now;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            return (
              <div key={exam.id} className="card text-center">
                <h3 className="font-semibold mb-2 text-[var(--color-text-muted)] text-sm">
                  {exam.name}
                </h3>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <div className="text-3xl font-bold text-[var(--color-accent)]">{days}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">DAYS</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[var(--color-accent)]">{hours}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">HOURS</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[var(--color-accent)]">{minutes}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">MIN</div>
                  </div>
                </div>
                <div className="text-sm text-[var(--color-text-secondary)]">
                  {formatDate(exam.date)} at {exam.time}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Study Pulse */}
      <div className="card bg-gradient-to-br from-[var(--color-accent)] to-purple-600 text-white animate-fadeIn" style={{ animationDelay: '0.5s' }}>
        <h2 className="text-xl font-semibold mb-3">📊 Study Pulse</h2>
        <p className="text-lg opacity-90">
          {completedTasks >= todaysTasks.length && todaysTasks.length > 0
            ? "All tasks completed! 🎉"
            : streak?.currentStreak >= 7
            ? `${streak.currentStreak}-day streak! You're on fire 🔥`
            : avgProgress >= 75
            ? "Your syllabus progress is excellent! 📚"
            : "Keep up the great work!"}
        </p>
      </div>
    </div>
  );
}
