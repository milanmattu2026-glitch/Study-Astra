import { store } from '../store';

/**
 * Weakness Analyzer Service
 * Calculates dynamic weakness scores based on a student's history.
 */

export const calculateTopicWeakness = (subjectId, topicId) => {
  const quizzes = store.getQuizzes().filter(q => q.subject === subjectId && q.topicId === topicId);

  if (quizzes.length === 0) {
    return { status: 'UNKNOWN', score: 0, reasons: ['No data available. Take a quiz!'] };
  }

  // Sort chronologically
  quizzes.sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));

  const attempts = quizzes.length;
  const recentQuizzes = quizzes.slice(-3); // Look at last 3 attempts mostly
  const avgScore = quizzes.reduce((sum, q) => sum + q.score, 0) / attempts;
  const recentAvg = recentQuizzes.reduce((sum, q) => sum + q.score, 0) / recentQuizzes.length;
  const lastScore = quizzes[quizzes.length - 1].score;

  let weaknessScore = 100 - recentAvg; // Base score (0-100, where 100 is extremely weak)
  const reasons = [];

  // Adjustments based on patterns
  if (lastScore < 60) {
    weaknessScore += 15;
    reasons.push(`Latest score was very low (${lastScore}%)`);
  }

  if (attempts >= 3 && recentAvg < 70) {
    weaknessScore += 10;
    reasons.push(`Struggling to improve after ${attempts} attempts`);
  }

  if (quizzes.length >= 2 && lastScore < quizzes[quizzes.length - 2].score) {
    weaknessScore += 5;
    reasons.push("Recent performance has dropped");
  }

  // Cap between 0 and 100
  weaknessScore = Math.min(Math.max(Math.round(weaknessScore), 0), 100);

  // Categorize
  let status = 'STRONG';
  if (weaknessScore >= 70) status = 'CRITICAL';
  else if (weaknessScore >= 50) status = 'WEAK';
  else if (weaknessScore >= 30) status = 'NEEDS_PRACTICE';
  else if (weaknessScore >= 15) status = 'IMPROVING';

  if (status === 'STRONG') reasons.push("Consistently high scores!");

  return {
    score: weaknessScore,
    status, // CRITICAL, WEAK, NEEDS_PRACTICE, IMPROVING, STRONG
    avgScore: Math.round(avgScore),
    lastScore,
    attempts,
    reasons
  };
};

export const getAllWeakTopics = () => {
  const subjects = store.getSubjects();
  const weakTopics = [];

  subjects.forEach(subject => {
    subject.chapters?.forEach(chapter => {
      chapter.topics?.forEach(topic => {
        const analysis = calculateTopicWeakness(subject.id, topic.id);
        if (analysis.status === 'CRITICAL' || analysis.status === 'WEAK' || analysis.status === 'NEEDS_PRACTICE') {
          weakTopics.push({
            subjectId: subject.id,
            subjectName: subject.name,
            subjectColor: subject.color,
            chapterId: chapter.id,
            chapterName: chapter.name,
            topicId: topic.id,
            topicName: topic.name,
            ...analysis
          });
        }
      });
    });
  });

  // Sort most critical first
  return weakTopics.sort((a, b) => b.score - a.score);
};

export const generateRecoveryPlan = (topicId) => {
  // Finds the weak topic and builds a 3-day recovery sprint plan
  const weakTopics = getAllWeakTopics();
  const topic = weakTopics.find(t => t.topicId === topicId);

  if (!topic) return null;

  return {
    title: `🔥 3-Day Recovery: ${topic.topicName}`,
    targetAccuracy: 80,
    days: [
      {
        day: 1,
        focus: 'Review & Fundamentals',
        activities: [
          { type: 'review', content: `Review notes for ${topic.topicName}`, duration: 20 },
          { type: 'practice', content: 'Take a 5-question Easy Quiz', duration: 10 }
        ]
      },
      {
        day: 2,
        focus: 'Deep Understanding',
        activities: [
          { type: 'review', content: 'Focus on recent mistakes', duration: 15 },
          { type: 'practice', content: 'Take a 10-question Medium Quiz', duration: 15 }
        ]
      },
      {
        day: 3,
        focus: 'Mastery Verification',
        activities: [
          { type: 'test', content: 'Take full 15-question Retest', duration: 20 }
        ]
      }
    ]
  };
};
