import { format, formatDistanceToNow, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';

export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export const motivationalQuotes = [
  "Small progress every day adds up.",
  "You're one step closer to your goals.",
  "Consistency is the key to mastery.",
  "Every expert was once a beginner.",
  "Focus on progress, not perfection.",
  "The secret of getting ahead is getting started.",
  "Your future self will thank you.",
  "Knowledge is power.",
  "Stay curious, stay hungry.",
  "The best time to start was yesterday. The next best time is now.",
  "Success is the sum of small efforts repeated daily.",
  "Dream big, work hard, stay focused.",
];

export const getMotivationalQuote = () => {
  return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
};

export const formatDate = (date) => {
  if (!date) return '';
  return format(new Date(date), 'MMM dd, yyyy');
};

export const formatTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'hh:mm a');
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'MMM dd, yyyy hh:mm a');
};

export const getRelativeTime = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const getDaysUntil = (date) => {
  if (!date) return 0;
  return differenceInDays(new Date(date), new Date());
};

export const getHoursUntil = (date) => {
  if (!date) return 0;
  return differenceInHours(new Date(date), new Date());
};

export const getMinutesUntil = (date) => {
  if (!date) return 0;
  return differenceInMinutes(new Date(date), new Date());
};

export const formatDuration = (minutes) => {
  if (!minutes) return '0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

export const calculateProgress = (completed, total) => {
  if (!total || total === 0) return 0;
  return Math.round((completed / total) * 100);
};

export const calculateStreak = (streakData) => {
  if (!streakData || !streakData.lastStudyDate) return 0;

  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');

  if (streakData.lastStudyDate === today) {
    return streakData.currentStreak || 0;
  } else if (streakData.lastStudyDate === yesterday) {
    return streakData.currentStreak || 0;
  } else {
    return 0;
  }
};

export const updateStreak = (streakData) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');

  if (!streakData) {
    return {
      currentStreak: 1,
      bestStreak: 1,
      lastStudyDate: today,
      studyDates: [today]
    };
  }

  if (streakData.lastStudyDate === today) {
    return streakData;
  }

  const newStreak = streakData.lastStudyDate === yesterday
    ? (streakData.currentStreak || 0) + 1
    : 1;

  return {
    currentStreak: newStreak,
    bestStreak: Math.max(newStreak, streakData.bestStreak || 0),
    lastStudyDate: today,
    studyDates: [...(streakData.studyDates || []), today]
  };
};

export const getPriorityColor = (priority) => {
  const colors = {
    low: 'text-blue-400',
    medium: 'text-yellow-400',
    high: 'text-orange-400',
    critical: 'text-red-400'
  };
  return colors[priority] || colors.medium;
};

export const getPriorityBadge = (priority) => {
  const badges = {
    low: 'badge-info',
    medium: 'badge-warning',
    high: 'badge-warning',
    critical: 'badge-danger'
  };
  return badges[priority] || badges.medium;
};

export const getStatusColor = (status) => {
  const colors = {
    'not-started': 'text-gray-400',
    'in-progress': 'text-blue-400',
    'completed': 'text-green-400'
  };
  return colors[status] || colors['not-started'];
};

export const getStudyPulseInsights = (data) => {
  const insights = [];

  // Task completion insight
  const completedTasks = data.tasks.filter(t => t.completed).length;
  const totalTasks = data.tasks.length;
  const taskCompletionRate = calculateProgress(completedTasks, totalTasks);

  if (taskCompletionRate >= 80) {
    insights.push("You're crushing your tasks! 🚀");
  } else if (taskCompletionRate >= 50) {
    insights.push(`You've completed ${taskCompletionRate}% of your tasks. Keep going!`);
  } else if (taskCompletionRate < 30 && totalTasks > 0) {
    insights.push(`${totalTasks - completedTasks} tasks pending. Start with the high-priority ones.`);
  }

  // Syllabus progress insight
  const subjects = data.subjects || [];
  const avgProgress = subjects.reduce((sum, s) => sum + (s.progress || 0), 0) / (subjects.length || 1);

  if (avgProgress >= 75) {
    insights.push("Your syllabus progress is excellent! 📚");
  } else if (avgProgress < 50) {
    const lowestSubject = subjects.sort((a, b) => (a.progress || 0) - (b.progress || 0))[0];
    if (lowestSubject) {
      insights.push(`${lowestSubject.name} needs attention. Consider scheduling a study session.`);
    }
  }

  // Streak insight
  const streak = data.streakData?.currentStreak || 0;
  if (streak >= 7) {
    insights.push(`${streak}-day streak! You're on fire 🔥`);
  } else if (streak >= 3) {
    insights.push(`${streak}-day streak going strong!`);
  } else if (streak === 0) {
    insights.push("Start a new study streak today!");
  }

  // Quiz performance insight
  const quizzes = data.quizzes || [];
  if (quizzes.length > 0) {
    const avgScore = quizzes.reduce((sum, q) => sum + (q.score || 0), 0) / quizzes.length;
    if (avgScore >= 80) {
      insights.push(`Quiz average: ${avgScore.toFixed(0)}%. Excellent work!`);
    } else if (avgScore < 60) {
      insights.push(`Quiz average: ${avgScore.toFixed(0)}%. Focus on weak areas.`);
    }
  }

  // Study sessions insight
  const sessions = data.sessions || [];
  const todaySessions = sessions.filter(s => {
    const sessionDate = format(new Date(s.startTime), 'yyyy-MM-dd');
    const today = format(new Date(), 'yyyy-MM-dd');
    return sessionDate === today;
  });

  if (todaySessions.length > 0) {
    const totalMinutes = todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    insights.push(`${formatDuration(totalMinutes)} studied today.`);
  }

  // Exam countdown insight
  const exams = data.exams || [];
  const upcomingExams = exams
    .filter(e => new Date(e.date) > new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (upcomingExams.length > 0) {
    const nextExam = upcomingExams[0];
    const daysUntil = getDaysUntil(nextExam.date);
    if (daysUntil <= 7) {
      insights.push(`${nextExam.name} in ${daysUntil} days!`);
    }
  }

  return insights.length > 0 ? insights[Math.floor(Math.random() * insights.length)] : "Keep up the great work!";
};

export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) result[group] = [];
    result[group].push(item);
    return result;
  }, {});
};

export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    if (order === 'asc') {
      return a[key] > b[key] ? 1 : -1;
    }
    return a[key] < b[key] ? 1 : -1;
  });
};

export const filterByDate = (array, dateKey, filter) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const tomorrow = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');

  return array.filter(item => {
    const itemDate = format(new Date(item[dateKey]), 'yyyy-MM-dd');

    switch(filter) {
      case 'today':
        return itemDate === today;
      case 'tomorrow':
        return itemDate === tomorrow;
      case 'upcoming':
        return new Date(item[dateKey]) > new Date();
      case 'past':
        return new Date(item[dateKey]) < new Date();
      default:
        return true;
    }
  });
};

export const searchItems = (items, query, fields) => {
  if (!query) return items;

  const lowerQuery = query.toLowerCase();

  return items.filter(item => {
    return fields.some(field => {
      const value = item[field];
      if (!value) return false;
      return value.toString().toLowerCase().includes(lowerQuery);
    });
  });
};

export const getSubjectColor = (index) => {
  const colors = [
    '#6c63ff', '#ff6b6b', '#4ecdc4', '#45b7d1',
    '#96ceb4', '#ffeaa7', '#dfe6e9', '#a29bfe',
    '#fd79a8', '#fdcb6e', '#e17055', '#74b9ff'
  ];
  return colors[index % colors.length];
};

export const exportData = (data, filename) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const importData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};
