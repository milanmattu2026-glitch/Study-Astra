import { sampleData } from './sampleData.js';

const STORAGE_KEY = 'studyastra_data';
const STORAGE_VERSION = '1.0.0';

// Event emitter for reactive updates
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return () => this.off(event, listener);
  }

  off(event, listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }

  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(data));
  }
}

// Store class
class Store extends EventEmitter {
  constructor() {
    super();
    this.data = this.loadData();
  }

  loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.version === STORAGE_VERSION) {
          return parsed.data;
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }

    // Return sample data if nothing stored
    return JSON.parse(JSON.stringify(sampleData));
  }

  saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: STORAGE_VERSION,
        data: this.data,
        lastUpdated: new Date().toISOString()
      }));
      this.emit('dataChanged', this.data);
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  // User methods
  getUser() {
    return this.data.user;
  }

  updateUser(updates) {
    this.data.user = { ...this.data.user, ...updates };
    this.saveData();
    this.emit('userUpdated', this.data.user);
  }

  // Subject methods
  getSubjects() {
    return this.data.subjects || [];
  }

  getSubject(id) {
    return this.data.subjects.find(s => s.id === id);
  }

  addSubject(subject) {
    const newSubject = {
      id: `subj-${Date.now()}`,
      createdAt: new Date().toISOString(),
      progress: 0,
      studyHours: 0,
      chapters: [],
      ...subject
    };
    this.data.subjects.push(newSubject);
    this.saveData();
    this.emit('subjectsUpdated', this.data.subjects);
    return newSubject;
  }

  updateSubject(id, updates) {
    const index = this.data.subjects.findIndex(s => s.id === id);
    if (index !== -1) {
      this.data.subjects[index] = { ...this.data.subjects[index], ...updates };

      // Recalculate progress if chapters updated
      if (updates.chapters) {
        this.data.subjects[index].progress = this.calculateSubjectProgress(this.data.subjects[index]);
      }

      this.saveData();
      this.emit('subjectsUpdated', this.data.subjects);
      this.emit(`subject:${id}:updated`, this.data.subjects[index]);
    }
  }

  deleteSubject(id) {
    this.data.subjects = this.data.subjects.filter(s => s.id !== id);
    // Also delete related tasks, notes, etc.
    this.data.tasks = this.data.tasks.filter(t => t.subject !== id);
    this.data.notes = this.data.notes.filter(n => n.subject !== id);
    this.data.exams = this.data.exams.filter(e => e.subject !== id);
    this.data.sessions = this.data.sessions.filter(s => s.subject !== id);
    this.saveData();
    this.emit('subjectsUpdated', this.data.subjects);
  }

  calculateSubjectProgress(subject) {
    if (!subject.chapters || subject.chapters.length === 0) return 0;

    let totalTopics = 0;
    let completedTopics = 0;

    subject.chapters.forEach(chapter => {
      chapter.topics?.forEach(topic => {
        totalTopics++;
        if (topic.status === 'completed') completedTopics++;
      });
    });

    return totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  }

  updateTopicStatus(subjectId, chapterId, topicId, status) {
    const subject = this.getSubject(subjectId);
    if (!subject) return;

    const chapter = subject.chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    const topic = chapter.topics.find(t => t.id === topicId);
    if (!topic) return;

    topic.status = status;
    subject.progress = this.calculateSubjectProgress(subject);

    this.saveData();
    this.emit('subjectsUpdated', this.data.subjects);
    this.emit(`subject:${subjectId}:updated`, subject);
  }

  // Task methods
  getTasks() {
    return this.data.tasks || [];
  }

  getTask(id) {
    return this.data.tasks.find(t => t.id === id);
  }

  addTask(task) {
    const newTask = {
      id: `task-${Date.now()}`,
      completed: false,
      createdAt: new Date().toISOString(),
      tags: [],
      subtasks: [],
      ...task
    };
    this.data.tasks.push(newTask);
    this.saveData();
    this.emit('tasksUpdated', this.data.tasks);
    return newTask;
  }

  updateTask(id, updates) {
    const index = this.data.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      this.data.tasks[index] = { ...this.data.tasks[index], ...updates };
      this.saveData();
      this.emit('tasksUpdated', this.data.tasks);
    }
  }

  deleteTask(id) {
    this.data.tasks = this.data.tasks.filter(t => t.id !== id);
    this.saveData();
    this.emit('tasksUpdated', this.data.tasks);
  }

  toggleTask(id) {
    const task = this.getTask(id);
    if (task) {
      this.updateTask(id, { completed: !task.completed });
    }
  }

  // Note methods
  getNotes() {
    return this.data.notes || [];
  }

  getNote(id) {
    return this.data.notes.find(n => n.id === id);
  }

  addNote(note) {
    const newNote = {
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      favorite: false,
      tags: [],
      ...note
    };
    this.data.notes.push(newNote);
    this.saveData();
    this.emit('notesUpdated', this.data.notes);
    return newNote;
  }

  updateNote(id, updates) {
    const index = this.data.notes.findIndex(n => n.id === id);
    if (index !== -1) {
      this.data.notes[index] = {
        ...this.data.notes[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveData();
      this.emit('notesUpdated', this.data.notes);
    }
  }

  deleteNote(id) {
    this.data.notes = this.data.notes.filter(n => n.id !== id);
    this.saveData();
    this.emit('notesUpdated', this.data.notes);
  }

  toggleNoteFavorite(id) {
    const note = this.getNote(id);
    if (note) {
      this.updateNote(id, { favorite: !note.favorite });
    }
  }

  // Exam methods
  getExams() {
    return this.data.exams || [];
  }

  getExam(id) {
    return this.data.exams.find(e => e.id === id);
  }

  addExam(exam) {
    const newExam = {
      id: `exam-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...exam
    };
    this.data.exams.push(newExam);
    this.saveData();
    this.emit('examsUpdated', this.data.exams);
    return newExam;
  }

  updateExam(id, updates) {
    const index = this.data.exams.findIndex(e => e.id === id);
    if (index !== -1) {
      this.data.exams[index] = { ...this.data.exams[index], ...updates };
      this.saveData();
      this.emit('examsUpdated', this.data.exams);
    }
  }

  deleteExam(id) {
    this.data.exams = this.data.exams.filter(e => e.id !== id);
    this.saveData();
    this.emit('examsUpdated', this.data.exams);
  }

  // Session methods
  getSessions() {
    return this.data.sessions || [];
  }

  getSession(id) {
    return this.data.sessions.find(s => s.id === id);
  }

  addSession(session) {
    const newSession = {
      id: `sess-${Date.now()}`,
      completed: false,
      createdAt: new Date().toISOString(),
      ...session
    };
    this.data.sessions.push(newSession);
    this.saveData();
    this.emit('sessionsUpdated', this.data.sessions);
    return newSession;
  }

  updateSession(id, updates) {
    const index = this.data.sessions.findIndex(s => s.id === id);
    if (index !== -1) {
      this.data.sessions[index] = { ...this.data.sessions[index], ...updates };
      this.saveData();
      this.emit('sessionsUpdated', this.data.sessions);
    }
  }

  deleteSession(id) {
    this.data.sessions = this.data.sessions.filter(s => s.id !== id);
    this.saveData();
    this.emit('sessionsUpdated', this.data.sessions);
  }

  // Quiz methods
  getQuizzes() {
    return this.data.quizzes || [];
  }

  getQuiz(id) {
    return this.data.quizzes.find(q => q.id === id);
  }

  addQuiz(quiz) {
    const newQuiz = {
      id: `quiz-${Date.now()}`,
      completedAt: new Date().toISOString(),
      ...quiz
    };
    this.data.quizzes.push(newQuiz);
    this.saveData();
    this.emit('quizzesUpdated', this.data.quizzes);
    return newQuiz;
  }

  deleteQuiz(id) {
    this.data.quizzes = this.data.quizzes.filter(q => q.id !== id);
    this.saveData();
    this.emit('quizzesUpdated', this.data.quizzes);
  }

  // Streak methods
  getStreakData() {
    return this.data.streakData || { currentStreak: 0, bestStreak: 0, studyDates: [] };
  }

  updateStreakData(updates) {
    this.data.streakData = { ...this.data.streakData, ...updates };
    this.saveData();
    this.emit('streakUpdated', this.data.streakData);
  }

  // Settings methods
  getSettings() {
    return this.data.settings || {};
  }

  updateSettings(updates) {
    this.data.settings = { ...this.data.settings, ...updates };
    this.saveData();
    this.emit('settingsUpdated', this.data.settings);
  }

  // Dashboard config methods
  getDashboardConfig() {
    return this.data.dashboardConfig || { widgets: [] };
  }

  updateDashboardConfig(config) {
    this.data.dashboardConfig = config;
    this.saveData();
    this.emit('dashboardConfigUpdated', config);
  }

  // Notification methods
  getNotifications() {
    return this.data.notifications || [];
  }

  addNotification(notification) {
    const newNotification = {
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
      ...notification
    };
    this.data.notifications.unshift(newNotification);
    this.saveData();
    this.emit('notificationsUpdated', this.data.notifications);
    return newNotification;
  }

  markNotificationRead(id) {
    const notification = this.data.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveData();
      this.emit('notificationsUpdated', this.data.notifications);
    }
  }

  dismissNotification(id) {
    this.data.notifications = this.data.notifications.filter(n => n.id !== id);
    this.saveData();
    this.emit('notificationsUpdated', this.data.notifications);
  }

  clearAllNotifications() {
    this.data.notifications = [];
    this.saveData();
    this.emit('notificationsUpdated', this.data.notifications);
  }

  // Reset data
  resetData() {
    this.data = JSON.parse(JSON.stringify(sampleData));
    this.saveData();
    this.emit('dataReset', this.data);
  }

  // Export/Import
  exportData() {
    return JSON.stringify(this.data, null, 2);
  }

  importData(jsonData) {
    try {
      const imported = JSON.parse(jsonData);
      this.data = imported;
      this.saveData();
      this.emit('dataImported', this.data);
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // Search
  search(query) {
    const lowerQuery = query.toLowerCase();
    const results = {
      subjects: [],
      tasks: [],
      notes: [],
      exams: [],
      sessions: []
    };

    // Search subjects
    results.subjects = this.data.subjects.filter(s =>
      s.name.toLowerCase().includes(lowerQuery)
    );

    // Search tasks
    results.tasks = this.data.tasks.filter(t =>
      t.title.toLowerCase().includes(lowerQuery) ||
      t.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );

    // Search notes
    results.notes = this.data.notes.filter(n =>
      n.title.toLowerCase().includes(lowerQuery) ||
      n.content.toLowerCase().includes(lowerQuery) ||
      n.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );

    // Search exams
    results.exams = this.data.exams.filter(e =>
      e.name.toLowerCase().includes(lowerQuery)
    );

    // Search sessions
    results.sessions = this.data.sessions.filter(s =>
      s.topic.toLowerCase().includes(lowerQuery)
    );

    return results;
  }
}

// Create and export singleton instance
export const store = new Store();

// Export for debugging
if (typeof window !== 'undefined') {
  window.__store = store;
}
