import { format, formatDistanceToNow, isPast, parseISO } from 'date-fns';

export const generateId = (prefix = '') => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    const uuid = crypto.randomUUID();
    return prefix ? `${prefix}-${uuid}` : uuid;
  }
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  const id = `${timestamp}-${randomStr}`;
  return prefix ? `${prefix}-${id}` : id;
};

export const formatTime = (time) => {
  if (!time) return '';
  if (typeof time === 'number') {
    const hours = Math.floor(time / 60);
    const mins = time % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  }
  try {
    if (typeof time === 'string' && /^\d{1,2}:\d{2}$/.test(time.trim())) {
      const [h, m] = time.trim().split(':').map(Number);
      const period = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 || 12;
      return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
    }
    const d = typeof time === 'string' ? parseISO(time) : new Date(time);
    if (!isNaN(d.getTime())) return format(d, 'h:mm a');
  } catch (err) {}
  return String(time);
};

export const formatDate = (date, formatStr = 'MMM d, yyyy') => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date);
    if (!isNaN(d.getTime())) return format(d, formatStr);
  } catch (err) {}
  return String(date);
};

export const getPriorityBadge = (priority) => {
  const p = (priority || 'medium').toLowerCase();
  const config = {
    urgent: { label: 'Urgent', bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20' },
    critical: { label: 'Critical', bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
    high: { label: 'High', bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
    medium: { label: 'Medium', bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
    low: { label: 'Low', bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
  };
  const c = config[p] || config.medium;
  const className = `px-2 py-0.5 text-xs rounded-full font-medium ${c.bg} ${c.text} border ${c.border}`;
  const badge = new String(className);
  badge.label = c.label;
  badge.bg = c.bg;
  badge.text = c.text;
  badge.border = c.border;
  badge.className = className;
  return badge;
};

export const getPriorityColor = (priority) => {
  const p = (priority || 'medium').toLowerCase();
  switch (p) {
    case 'critical':
    case 'urgent': return '#ef4444';
    case 'high': return '#f59e0b';
    case 'medium': return '#3b82f6';
    case 'low': return '#10b981';
    default: return '#64748b';
  }
};

export const getSubjectColor = (subjectId, subjects = []) => {
  if (!subjectId) return 'var(--color-accent, #6366f1)';
  const match = subjects.find(s => s.id === subjectId || s.name === subjectId);
  return match?.color || 'var(--color-accent, #6366f1)';
};

export const getYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

export const getYouTubeThumbnail = (url, quality = 'hqdefault') => {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/${quality}.jpg` : null;
};

export const getRelativeTime = (date) => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date);
    if (!isNaN(d.getTime())) return formatDistanceToNow(d, { addSuffix: true });
  } catch (err) {}
  return String(date);
};

export const formatDuration = (minutes) => {
  const mins = Number(minutes) || 0;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

export const isOverdue = (date) => {
  if (!date) return false;
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date);
    return isPast(d);
  } catch (err) {
    return false;
  }
};

export const updateStreak = (currentData) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const streakKey = 'study_streak';
  let streak = currentData;
  if (!streak || typeof streak !== 'object') {
    try {
      const saved = localStorage.getItem(streakKey) || localStorage.getItem('studyos_streak');
      streak = saved ? JSON.parse(saved) : null;
    } catch {
      streak = null;
    }
  }
  if (!streak) {
    streak = { currentStreak: 0, longestStreak: 0, lastStudyDate: null, history: [] };
  }
  const lastDate = streak.lastStudyDate || streak.lastActiveDate;
  if (lastDate === today) return streak;
  const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
  const isConsecutive = lastDate === yesterday;
  const current = isConsecutive ? (streak.currentStreak || 0) + 1 : 1;
  const longest = Math.max(streak.longestStreak || 0, current);
  const history = Array.isArray(streak.history) ? [...streak.history] : [];
  if (!history.includes(today)) history.push(today);
  const updated = {
    ...streak,
    currentStreak: current,
    longestStreak: longest,
    lastStudyDate: today,
    lastActiveDate: today,
    history
  };
  try {
    localStorage.setItem(streakKey, JSON.stringify(updated));
    localStorage.setItem('studyos_streak', JSON.stringify(updated));
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('study_streak_updated'));
  } catch {}
  return updated;
};

export const exportData = (customData) => {
  try {
    let dataToExport = customData;
    if (!dataToExport && typeof localStorage !== 'undefined') {
      dataToExport = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
          dataToExport[key] = JSON.parse(localStorage.getItem(key));
        } catch {
          dataToExport[key] = localStorage.getItem(key);
        }
      }
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataToExport || {}, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `study-astra-backup-${format(new Date(), 'yyyy-MM-dd')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    return true;
  } catch (err) {
    return false;
  }
};

export const importData = (fileOrData, callback) => {
  return new Promise((resolve, reject) => {
    if (!fileOrData) {
      const err = new Error('No data provided to import');
      if (callback) callback(err);
      return reject(err);
    }
    const applyData = (data) => {
      try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        if (parsed && typeof parsed === 'object') {
          Object.entries(parsed).forEach(([key, val]) => {
            localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
          });
          if (typeof window !== 'undefined') window.dispatchEvent(new Event('storage'));
          if (callback) callback(null, parsed);
          resolve(parsed);
        } else {
          throw new Error('Invalid backup file format');
        }
      } catch (e) {
        if (callback) callback(e);
        reject(e);
      }
    };
    if (typeof File !== 'undefined' && (fileOrData instanceof File || fileOrData instanceof Blob)) {
      const reader = new FileReader();
      reader.onload = (e) => applyData(e.target.result);
      reader.onerror = (e) => {
        if (callback) callback(e);
        reject(e);
      };
      reader.readAsText(fileOrData);
    } else {
      applyData(fileOrData);
    }
  });
};