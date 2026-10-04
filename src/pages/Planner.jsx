import { useState } from 'react';
import { Plus, Calendar, Clock, List, Grid, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { store } from '../store';
import { format, startOfWeek, endOfWeek, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';

export default function Planner() {
  const sessions = useStore('sessions');
  const subjects = useStore('subjects');

  const [view, setView] = useState('timeline'); // timeline, calendar, list
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddSession, setShowAddSession] = useState(false);
  const [newSession, setNewSession] = useState({
    subject: '',
    topic: '',
    startTime: new Date().toISOString().split('T')[0] + 'T09:00',
    endTime: new Date().toISOString().split('T')[0] + 'T10:00',
    priority: 'medium',
    goal: '',
    notes: ''
  });

  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);

  // Get sessions for current view
  const todaySessions = sessions.filter(s => {
    const sessionDate = format(new Date(s.startTime), 'yyyy-MM-dd');
    const today = format(currentDate, 'yyyy-MM-dd');
    return sessionDate === today;
  }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  const handleAddSession = () => {
    if (!newSession.subject || !newSession.topic) return;

    const start = new Date(newSession.startTime);
    const end = new Date(newSession.endTime);
    const duration = Math.round((end - start) / (1000 * 60));

    store.addSession({
      ...newSession,
      duration,
      completed: false
    });

    setShowAddSession(false);
    setNewSession({
      subject: '',
      topic: '',
      startTime: new Date().toISOString().split('T')[0] + 'T09:00',
      endTime: new Date().toISOString().split('T')[0] + 'T10:00',
      priority: 'medium',
      goal: '',
      notes: ''
    });
  };

  const handleDeleteSession = (sessionId) => {
    if (confirm('Delete this study session?')) {
      store.deleteSession(sessionId);
    }
  };

  const previousDay = () => setCurrentDate(addDays(currentDate, -1));
  const nextDay = () => setCurrentDate(addDays(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Study Planner</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Plan your study sessions
          </p>
        </div>
        <button
          onClick={() => setShowAddSession(true)}
          className="btn btn-primary"
        >
          <Plus size={16} />
          Add Session
        </button>
      </div>

      {/* View Selector & Date Navigation */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setView('timeline')}
            className={`btn ${view === 'timeline' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Clock size={16} />
            Timeline
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`btn ${view === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Calendar size={16} />
            Calendar
          </button>
          <button
            onClick={() => setView('list')}
            className={`btn ${view === 'list' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <List size={16} />
            List
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={previousDay} className="btn btn-ghost">
            <ChevronLeft size={20} />
          </button>

          <button onClick={goToToday} className="btn btn-secondary">
            Today
          </button>

          <div className="text-center min-w-[200px]">
            <div className="font-semibold">{format(currentDate, 'EEEE')}</div>
            <div className="text-sm text-[var(--color-text-muted)]">
              {format(currentDate, 'MMMM d, yyyy')}
            </div>
          </div>

          <button onClick={nextDay} className="btn btn-ghost">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Timeline View */}
      {view === 'timeline' && (
        <div className="card">
          {todaySessions.length === 0 ? (
            <div className="text-center py-16">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No sessions planned</h3>
              <p className="text-[var(--color-text-muted)] mb-6">
                Add your first study session for {format(currentDate, 'MMMM d')}
              </p>
              <button onClick={() => setShowAddSession(true)} className="btn btn-primary">
                <Plus size={16} />
                Add Session
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {todaySessions.map(session => {
                const subject = subjects.find(s => s.id === session.subject);
                const startTime = new Date(session.startTime);
                const endTime = new Date(session.endTime);

                return (
                  <div
                    key={session.id}
                    className="flex items-start gap-4 p-4 bg-[var(--color-bg-tertiary)] rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors"
                  >
                    <div className="flex-shrink-0 text-sm text-[var(--color-text-muted)] w-20">
                      <div>{format(startTime, 'HH:mm')}</div>
                      <div>{format(endTime, 'HH:mm')}</div>
                    </div>

                    <div
                      className="flex-shrink-0 w-1 h-full rounded-full"
                      style={{ backgroundColor: subject?.color || 'var(--color-accent)' }}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className="font-semibold">{session.topic}</h3>
                        <button
                          onClick={() => handleDeleteSession(session.id)}
                          className="p-1 hover:bg-[var(--color-bg-hover)] rounded text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        {subject && (
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: subject.color + '20',
                              color: subject.color
                            }}
                          >
                            {subject.name}
                          </span>
                        )}

                        <span className="text-[var(--color-text-muted)]">
                          {session.duration} min
                        </span>

                        {session.goal && (
                          <span className="text-[var(--color-text-muted)]">
                            Goal: {session.goal}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

            {/* Calendar View */}
      {view === 'calendar' && (
        <div className="card">
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2 border-b border-[var(--color-border)]">
             {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="flex-1 text-center font-semibold text-sm text-[var(--color-text-muted)] p-2">
                   {d}
                </div>
             ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-[var(--color-border)] border border-[var(--color-border)] rounded-lg overflow-hidden">
             {eachDayOfInterval({
               start: startOfWeek(startOfMonth(currentDate)),
               end: endOfWeek(endOfMonth(currentDate))
             }).map((day, idx) => {
               const daySessions = sessions.filter(s => isSameDay(new Date(s.startTime), day));
               return (
                 <div
                   key={idx}
                   onClick={() => {
                     setCurrentDate(day);
                     setView('timeline');
                   }}
                   className={`min-h-[100px] p-2 bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-tertiary)] cursor-pointer transition-colors ${
                     !isSameMonth(day, currentDate) ? 'opacity-40' : ''
                   } ${isSameDay(day, new Date()) ? 'bg-[var(--color-bg-tertiary)] ring-1 ring-[var(--color-accent)] ring-inset' : ''}`}
                 >
                   <div className="font-semibold text-sm mb-1">{format(day, 'd')}</div>
                   <div className="space-y-1">
                     {daySessions.slice(0, 3).map(session => {
                       const subject = subjects.find(s => s.id === session.subject);
                       return (
                         <div
                           key={session.id}
                           className="text-xs px-1.5 py-0.5 rounded truncate"
                           style={{
                             backgroundColor: subject ? `${subject.color}20` : 'var(--color-bg-secondary)',
                             color: subject ? subject.color : 'inherit',
                             borderLeft: `2px solid ${subject ? subject.color : 'var(--color-accent)'}`
                           }}
                         >
                           {session.topic}
                         </div>
                       );
                     })}
                     {daySessions.length > 3 && (
                       <div className="text-xs text-[var(--color-text-muted)] pl-1">
                         +{daySessions.length - 3} more
                       </div>
                     )}
                   </div>
                 </div>
               );
             })}
          </div>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="card">
          <div className="space-y-2">
            {sessions.length === 0 ? (
              <div className="text-center py-16">
                <List size={48} className="mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No sessions yet</h3>
                <p className="text-[var(--color-text-muted)] mb-6">
                  Start planning your study schedule
                </p>
                <button onClick={() => setShowAddSession(true)} className="btn btn-primary">
                  <Plus size={16} />
                  Add Session
                </button>
              </div>
            ) : (
              sessions
                .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
                .slice(0, 20)
                .map(session => {
                  const subject = subjects.find(s => s.id === session.subject);
                  return (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 bg-[var(--color-bg-tertiary)] rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {subject && (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: subject.color }}
                          />
                        )}
                        <div>
                          <div className="font-medium">{session.topic}</div>
                          <div className="text-sm text-[var(--color-text-muted)]">
                            {format(new Date(session.startTime), 'MMM d, HH:mm')} • {session.duration}min
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="p-2 hover:bg-[var(--color-bg-hover)] rounded text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* Add Session Modal */}
      {showAddSession && (
        <div className="modal-overlay" onClick={() => setShowAddSession(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Add Study Session</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <select
                  value={newSession.subject}
                  onChange={(e) => setNewSession({ ...newSession, subject: e.target.value })}
                  className="input"
                >
                  <option value="">Select subject</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Topic</label>
                <input
                  type="text"
                  placeholder="What will you study?"
                  value={newSession.topic}
                  onChange={(e) => setNewSession({ ...newSession, topic: e.target.value })}
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Time</label>
                  <input
                    type="datetime-local"
                    value={newSession.startTime}
                    onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">End Time</label>
                  <input
                    type="datetime-local"
                    value={newSession.endTime}
                    onChange={(e) => setNewSession({ ...newSession, endTime: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Goal (optional)</label>
                <input
                  type="text"
                  placeholder="What do you want to achieve?"
                  value={newSession.goal}
                  onChange={(e) => setNewSession({ ...newSession, goal: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={handleAddSession} className="btn btn-primary flex-1">
                Add Session
              </button>
              <button onClick={() => setShowAddSession(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
