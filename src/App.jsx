import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, BookOpen, Calendar, CheckSquare, FileText, Brain,
  BarChart3, Timer, Flame, Settings, User, Search, X, Menu,
  Sun, Moon, Bell, Command
} from 'lucide-react';
import { useStore, useTheme, useToast, useKeyboard, useMediaQuery } from './hooks/useStore';
import { store } from './store';

// Lazy load pages
import Dashboard from './pages/Dashboard';
import Syllabus from './pages/Syllabus';
import Planner from './pages/Planner';
import Tasks from './pages/Tasks';
import Notes from './pages/Notes';
import Quizzes from './pages/Quizzes';
import Analytics from './pages/Analytics';
import Focus from './pages/Focus';
import Streak from './pages/Streak';
import SettingsPage from './pages/Settings';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import WeakTopics from './pages/WeakTopics';
import QuizTake from './pages/QuizTake';
import Login from './pages/Login';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useStore('user');
  const notifications = useStore('notifications');
  const { theme, toggleTheme } = useTheme();
  const { toasts, removeToast } = useToast();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Command palette keyboard shortcut
  useKeyboard('ctrl+k', (e) => {
    e.preventDefault();
    setCommandPaletteOpen(true);
  });

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = store.search(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults(null);
    }
  }, [searchQuery]);

  // Check onboarding and auth
  useEffect(() => {
    // Basic Auth Check
    if (!user && location.pathname !== '/login') {
      navigate('/login');
      return;
    }

    if (user && !user.onboardingCompleted && location.pathname !== '/onboarding' && location.pathname !== '/login') {
      navigate('/onboarding');
    }
  }, [user, location.pathname, navigate]);

  if (!user && location.pathname === '/login') {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </div>
    );
  }

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/syllabus', icon: BookOpen, label: 'Syllabus' },
    { path: '/planner', icon: Calendar, label: 'Planner' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/notes', icon: FileText, label: 'Notes' },
    { path: '/quizzes', icon: Brain, label: 'Quizzes' },
    { path: '/weak-topics', icon: Brain, label: 'Weak Topics' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/focus', icon: Timer, label: 'Focus' },
    { path: '/streak', icon: Flame, label: 'Streak' },
  ];

  const unreadNotifications = notifications?.filter(n => !n.read).length || 0;

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] transition-transform duration-300 z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isMobile ? 'w-64' : 'w-64'}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-[var(--color-border)]">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--color-accent)] to-purple-500 bg-clip-text text-transparent">
              Study Astra
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">Smart Learning Engine</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom actions */}
          <div className="p-4 border-t border-[var(--color-border)] space-y-1">
            <Link
              to="/settings"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                location.pathname === '/settings'
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <Settings size={20} />
              <span className="font-medium">Settings</span>
            </Link>
            <Link
              to="/profile"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                location.pathname === '/profile'
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <User size={20} />
              <span className="font-medium">Profile</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen && !isMobile ? 'ml-64' : 'ml-0'
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] backdrop-blur-lg bg-opacity-90">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-lg transition-colors"
              >
                <Menu size={20} />
              </button>

              {/* Search */}
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-[var(--color-bg-tertiary)] rounded-lg hover:border-[var(--color-accent)] border border-transparent transition-all"
              >
                <Search size={16} />
                <span className="text-sm text-[var(--color-text-muted)]">Search...</span>
                <kbd className="ml-auto px-2 py-0.5 bg-[var(--color-bg-hover)] rounded text-xs">
                  Ctrl K
                </kbd>
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-lg transition-colors"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Notifications */}
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 hover:bg-[var(--color-bg-tertiary)] rounded-lg transition-colors"
              >
                <Bell size={20} />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/syllabus" element={<Syllabus />} />
            <Route path="/syllabus/:id" element={<Syllabus />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/notes/:id" element={<Notes />} />
            <Route path="/quizzes" element={<Quizzes />} />
            <Route path="/quizzes/create" element={<QuizTake />} />
            <Route path="/quizzes/:id" element={<Quizzes />} />
            <Route path="/weak-topics" element={<WeakTopics />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/focus" element={<Focus />} />
            <Route path="/streak" element={<Streak />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/onboarding" element={<Onboarding />} />
          </Routes>
        </main>
      </div>

      {/* Mobile bottom nav */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] z-30">
          <div className="flex justify-around items-center px-2 py-3">
            {[
              { path: '/', icon: Home },
              { path: '/tasks', icon: CheckSquare },
              { path: '/quizzes', icon: Brain },
              { path: '/analytics', icon: BarChart3 },
              { path: '/settings', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'text-[var(--color-accent)]'
                      : 'text-[var(--color-text-muted)]'
                  }`}
                >
                  <Icon size={22} />
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Command Palette */}
      {commandPaletteOpen && (
        <div
          className="modal-overlay"
          onClick={() => setCommandPaletteOpen(false)}
        >
          <div
            className="modal-content max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <Search size={20} className="text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder="Search subjects, tasks, notes, exams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input flex-1"
                autoFocus
              />
              <button
                onClick={() => setCommandPaletteOpen(false)}
                className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {searchResults && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {searchResults.subjects.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-text-muted)] mb-2">
                      Subjects
                    </h3>
                    {searchResults.subjects.map((subject) => (
                      <Link
                        key={subject.id}
                        to={`/syllabus/${subject.id}`}
                        onClick={() => setCommandPaletteOpen(false)}
                        className="block p-3 hover:bg-[var(--color-bg-tertiary)] rounded-lg mb-1"
                      >
                        <div className="font-medium">{subject.name}</div>
                        <div className="text-sm text-[var(--color-text-muted)]">
                          {subject.progress}% complete
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {searchResults.tasks.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-text-muted)] mb-2">
                      Tasks
                    </h3>
                    {searchResults.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="block p-3 hover:bg-[var(--color-bg-tertiary)] rounded-lg mb-1"
                      >
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-[var(--color-text-muted)]">
                          {task.completed ? 'Completed' : 'Pending'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.notes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-text-muted)] mb-2">
                      Notes
                    </h3>
                    {searchResults.notes.map((note) => (
                      <Link
                        key={note.id}
                        to={`/notes/${note.id}`}
                        onClick={() => setCommandPaletteOpen(false)}
                        className="block p-3 hover:bg-[var(--color-bg-tertiary)] rounded-lg mb-1"
                      >
                        <div className="font-medium">{note.title}</div>
                        <div className="text-sm text-[var(--color-text-muted)]">
                          {note.tags?.join(', ')}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifications Panel */}
      {notificationsOpen && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setNotificationsOpen(false)}
        >
          <div
            className="absolute top-16 right-6 w-96 max-w-[90vw] bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl shadow-2xl animate-fadeIn max-h-[70vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              {notifications.length > 0 && (
                <button
                  onClick={() => store.clearAllNotifications()}
                  className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-[var(--color-text-muted)]">
                  <Bell size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 border-b border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)] transition-colors ${
                      !notif.read ? 'bg-[var(--color-accent-light)]' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-medium mb-1">{notif.title}</div>
                        <div className="text-sm text-[var(--color-text-muted)]">
                          {notif.message}
                        </div>
                      </div>
                      <button
                        onClick={() => store.dismissNotification(notif.id)}
                        className="p-1 hover:bg-[var(--color-bg-hover)] rounded"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-[var(--color-bg-hover)] rounded"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
