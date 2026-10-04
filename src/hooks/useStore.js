import { useState, useEffect } from 'react';
import { store } from '../store';

// Main store hook
export const useStore = (key) => {
  const [data, setData] = useState(() => {
    switch(key) {
      case 'user': return store.getUser();
      case 'subjects': return store.getSubjects();
      case 'tasks': return store.getTasks();
      case 'notes': return store.getNotes();
      case 'exams': return store.getExams();
      case 'sessions': return store.getSessions();
      case 'quizzes': return store.getQuizzes();
      case 'streak': return store.getStreakData();
      case 'settings': return store.getSettings();
      case 'dashboardConfig': return store.getDashboardConfig();
      case 'notifications': return store.getNotifications();
      default: return null;
    }
  });

  useEffect(() => {
    const eventName = `${key}Updated`;
    const unsubscribe = store.on(eventName, (newData) => {
      setData(newData);
    });

    return unsubscribe;
  }, [key]);

  return data;
};

// Theme hook
export const useTheme = () => {
  const settings = useStore('settings');
  const [theme, setTheme] = useState(settings?.theme || 'dark');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark');

    let actualTheme = theme;
    if (theme === 'system') {
      actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    root.classList.add(`theme-${actualTheme}`);

    // Listen for system theme changes
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e) => {
        root.classList.remove('theme-light', 'theme-dark');
        root.classList.add(e.matches ? 'theme-dark' : 'theme-light');
      };
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    store.updateSettings({ theme: newTheme });
  };

  const setThemeMode = (mode) => {
    setTheme(mode);
    store.updateSettings({ theme: mode });
  };

  return { theme, toggleTheme, setThemeMode };
};

// Toast hook
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const toast = { id, message, type };

    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return {
    toasts,
    showToast,
    removeToast,
    success: (msg, duration) => showToast(msg, 'success', duration),
    error: (msg, duration) => showToast(msg, 'error', duration),
    warning: (msg, duration) => showToast(msg, 'warning', duration),
    info: (msg, duration) => showToast(msg, 'info', duration),
  };
};

// Search hook
export const useSearch = (items, fields, query) => {
  const [results, setResults] = useState(items);

  useEffect(() => {
    if (!query || query.trim() === '') {
      setResults(items);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = items.filter(item => {
      return fields.some(field => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], item);
        if (!value) return false;
        return String(value).toLowerCase().includes(lowerQuery);
      });
    });

    setResults(filtered);
  }, [items, fields, query]);

  return results;
};

// Keyboard shortcut hook
export const useKeyboard = (key, callback, deps = []) => {
  useEffect(() => {
    const handler = (e) => {
      // Check for meta key (Cmd on Mac, Ctrl on Windows)
      const metaKey = e.metaKey || e.ctrlKey;

      if (key.includes('+')) {
        const [modifier, keyCode] = key.split('+');

        if (modifier === 'ctrl' && metaKey && e.key.toLowerCase() === keyCode.toLowerCase()) {
          e.preventDefault();
          callback(e);
        } else if (modifier === 'shift' && e.shiftKey && e.key.toLowerCase() === keyCode.toLowerCase()) {
          e.preventDefault();
          callback(e);
        } else if (modifier === 'alt' && e.altKey && e.key.toLowerCase() === keyCode.toLowerCase()) {
          e.preventDefault();
          callback(e);
        }
      } else {
        if (e.key.toLowerCase() === key.toLowerCase()) {
          callback(e);
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, ...deps]);
};

// Local storage hook
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

// Media query hook
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e) => setMatches(e.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
};

// Debounce hook
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Click outside hook
export const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);

    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [ref, callback]);
};

// Timer hook
export const useTimer = (initialSeconds = 0) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval = null;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const reset = () => {
    setSeconds(initialSeconds);
    setIsRunning(false);
  };
  const stop = () => {
    setIsRunning(false);
    return seconds;
  };

  return {
    seconds,
    minutes: Math.floor(seconds / 60),
    hours: Math.floor(seconds / 3600),
    isRunning,
    start,
    pause,
    reset,
    stop,
  };
};

// Countdown hook
export const useCountdown = (targetDate) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate) - new Date();

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          total: difference
        };
      }

      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
};

// Interval hook
export const useInterval = (callback, delay) => {
  useEffect(() => {
    if (delay === null) return;

    const id = setInterval(callback, delay);
    return () => clearInterval(id);
  }, [callback, delay]);
};
