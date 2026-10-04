import { store } from '../store';

/**
 * Exam Readiness Calculator
 * Determines how ready a student is for an upcoming exam based on:
 * - Syllabus coverage (chapters/topics completed)
 * - Quiz scores for the relevant subject
 * - Study hours dedicated to the subject
 */

export const calculateExamReadiness = (examId) => {
  const exam = store.getExam(examId);
  if (!exam) return { readiness: 0, factors: [], label: 'Unknown' };

  const subject = store.getSubject(exam.subject);
  if (!subject) return { readiness: 0, factors: [], label: 'Unknown' };

  let readinessScore = 0;
  const factors = [];

  // Factor 1: Syllabus Progress (Weight: 40%)
  const syllabusProgress = subject.progress || 0;
  readinessScore += (syllabusProgress / 100) * 40;
  factors.push({
    name: 'Syllabus Coverage',
    value: syllabusProgress,
    max: 100,
    impact: 'High',
    description: `${syllabusProgress}% of chapters completed.`
  });

  // Factor 2: Quiz Performance in this subject (Weight: 40%)
  const subjectQuizzes = store.getQuizzes().filter(q => q.subject === subject.id);
  let avgQuizScore = 0;
  if (subjectQuizzes.length > 0) {
    avgQuizScore = subjectQuizzes.reduce((sum, q) => sum + q.score, 0) / subjectQuizzes.length;
    readinessScore += (avgQuizScore / 100) * 40;
    factors.push({
      name: 'Quiz Performance',
      value: Math.round(avgQuizScore),
      max: 100,
      impact: 'High',
      description: `Averaging ${Math.round(avgQuizScore)}% on practice quizzes.`
    });
  } else {
    factors.push({
      name: 'Quiz Performance',
      value: 0,
      max: 100,
      impact: 'High',
      description: `No practice quizzes taken yet. Taking quizzes will improve your readiness score.`
    });
  }

  // Factor 3: Time Investment / Focus (Weight: 20%)
  // Assumption: A good baseline is 10 hours (600 mins) per subject for high readiness
  const targetStudyMinutes = 600;
  const subjectSessions = store.getSessions().filter(s => s.subject === subject.id && s.completed);
  const totalMinutes = subjectSessions.reduce((sum, s) => sum + (s.duration || 0), 0);

  let timeScore = Math.min(100, (totalMinutes / targetStudyMinutes) * 100);
  readinessScore += (timeScore / 100) * 20;

  factors.push({
    name: 'Study Time',
    value: Math.round(timeScore),
    max: 100,
    impact: 'Medium',
    description: `${Math.round(totalMinutes / 60)} hours invested.`
  });

  readinessScore = Math.round(readinessScore);

  let label = 'Needs Prep';
  if (readinessScore >= 80) label = 'Highly Ready';
  else if (readinessScore >= 60) label = 'On Track';
  else if (readinessScore >= 40) label = 'Needs Prep';
  else label = 'Not Ready';

  return {
    examId,
    readiness: readinessScore,
    label,
    factors
  };
};

export const getUpcomingExamsReadiness = () => {
    const exams = store.getExams().filter(e => new Date(e.date) > new Date());
    return exams.map(exam => calculateExamReadiness(exam.id));
}
