import { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Calendar, Clock, Flag, Tag, ChevronDown, ChevronRight } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { store } from '../store';
import { formatDate, formatTime, getPriorityBadge } from '../utils/helpers';

export default function Tasks() {
  const tasks = useStore('tasks');
  const subjects = useStore('subjects');

  const [activeView, setActiveView] = useState('today');
  const [showAddTask, setShowAddTask] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState({});
  const [newTask, setNewTask] = useState({
    title: '',
    subject: '',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '',
    tags: [],
    notes: '',
    subtasks: []
  });

  const views = [
    { id: 'today', label: 'Today' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'completed', label: 'Completed' },
    { id: 'important', label: 'Important' },
  ];

  const filterTasks = () => {
    const now = new Date();
    const today = now.toDateString();

    switch (activeView) {
      case 'today':
        return tasks.filter(t => new Date(t.dueDate).toDateString() === today);
      case 'upcoming':
        return tasks.filter(t => !t.completed && new Date(t.dueDate) > now);
      case 'completed':
        return tasks.filter(t => t.completed);
      case 'important':
        return tasks.filter(t => !t.completed && (t.priority === 'high' || t.priority === 'critical'));
      default:
        return tasks;
    }
  };

  const filteredTasks = filterTasks().sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    store.addTask(newTask);
    setNewTask({
      title: '',
      subject: '',
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '',
      tags: [],
      notes: '',
      subtasks: []
    });
    setShowAddTask(false);
  };

  const handleDeleteTask = (taskId) => {
    if (confirm('Delete this task?')) {
      store.deleteTask(taskId);
    }
  };

  const toggleTaskExpanded = (taskId) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  return (
    <div className="page-enter space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Stay organized and on track
          </p>
        </div>
        <button
          onClick={() => setShowAddTask(true)}
          className="btn btn-primary"
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {views.map(view => {
          const count = filterTasks().filter(t => view.id === activeView).length;
          return (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeView === view.id
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
              }`}
            >
              {view.label}
            </button>
          );
        })}
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">✓</div>
          <h3 className="text-xl font-semibold mb-2">
            {activeView === 'completed' ? 'No completed tasks yet' : 'No tasks here'}
          </h3>
          <p className="text-[var(--color-text-muted)] mb-6">
            {activeView === 'completed'
              ? 'Complete some tasks to see them here'
              : 'Add your first task to get started'}
          </p>
          {activeView !== 'completed' && (
            <button onClick={() => setShowAddTask(true)} className="btn btn-primary">
              <Plus size={16} />
              Add Task
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map(task => {
            const subject = subjects.find(s => s.id === task.subject);
            const isExpanded = expandedTasks[task.id];
            const hasDetails = task.notes || (task.subtasks && task.subtasks.length > 0);

            return (
              <div
                key={task.id}
                className={`card ${task.completed ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => store.toggleTask(task.id)}
                    className="flex-shrink-0 mt-1"
                  >
                    {task.completed ? (
                      <CheckCircle2 size={24} className="text-[var(--color-success)]" />
                    ) : (
                      <Circle size={24} className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)]" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3
                        className={`font-semibold cursor-pointer ${
                          task.completed ? 'line-through text-[var(--color-text-muted)]' : ''
                        }`}
                        onClick={() => hasDetails && toggleTaskExpanded(task.id)}
                      >
                        {task.title}
                      </h3>

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="flex-shrink-0 p-1 hover:bg-[var(--color-bg-hover)] rounded text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      {subject && (
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: subject.color + '20',
                            color: subject.color
                          }}
                        >
                          {subject.name}
                        </span>
                      )}

                      <span className={`badge ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>

                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-[var(--color-text-muted)]">
                          <Calendar size={14} />
                          {formatDate(task.dueDate)}
                        </span>
                      )}

                      {task.dueTime && (
                        <span className="flex items-center gap-1 text-[var(--color-text-muted)]">
                          <Clock size={14} />
                          {task.dueTime}
                        </span>
                      )}

                      {task.tags && task.tags.length > 0 && (
                        <span className="flex items-center gap-1 text-[var(--color-text-muted)]">
                          <Tag size={14} />
                          {task.tags.join(', ')}
                        </span>
                      )}

                      {hasDetails && (
                        <button
                          onClick={() => toggleTaskExpanded(task.id)}
                          className="text-[var(--color-accent)] text-xs hover:underline"
                        >
                          {isExpanded ? 'Hide details' : 'Show details'}
                        </button>
                      )}
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-[var(--color-border)] space-y-3">
                        {task.notes && (
                          <div>
                            <div className="text-sm font-medium mb-1">Notes</div>
                            <div className="text-sm text-[var(--color-text-secondary)]">
                              {task.notes}
                            </div>
                          </div>
                        )}

                        {task.subtasks && task.subtasks.length > 0 && (
                          <div>
                            <div className="text-sm font-medium mb-2">Subtasks</div>
                            <div className="space-y-1">
                              {task.subtasks.map(subtask => (
                                <div
                                  key={subtask.id}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <input
                                    type="checkbox"
                                    checked={subtask.completed}
                                    onChange={() => {
                                      const updatedSubtasks = task.subtasks.map(st =>
                                        st.id === subtask.id ? { ...st, completed: !st.completed } : st
                                      );
                                      store.updateTask(task.id, { subtasks: updatedSubtasks });
                                    }}
                                    className="w-4 h-4"
                                  />
                                  <span className={subtask.completed ? 'line-through text-[var(--color-text-muted)]' : ''}>
                                    {subtask.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="modal-overlay" onClick={() => setShowAddTask(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Add Task</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Task Title</label>
                <input
                  type="text"
                  placeholder="What needs to be done?"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="input"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <select
                    value={newTask.subject}
                    onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                    className="input"
                  >
                    <option value="">None</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="input"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Due Time</label>
                  <input
                    type="time"
                    value={newTask.dueTime}
                    onChange={(e) => setNewTask({ ...newTask, dueTime: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                <textarea
                  placeholder="Add any additional details..."
                  value={newTask.notes}
                  onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                  className="input min-h-[80px]"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={handleAddTask} className="btn btn-primary flex-1">
                Add Task
              </button>
              <button onClick={() => setShowAddTask(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
