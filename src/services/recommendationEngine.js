import { store } from '../store';
import { getAllWeakTopics } from './weaknessAnalyzer';

export const getSmartDailyPlan = () => {
  const plan = [];

  const upcomingExams = store.getExams().filter(e => new Date(e.date) > new Date());
  upcomingExams.sort((a, b) => new Date(a.date) - new Date(b.date));

  const weakTopics = getAllWeakTopics();
  const tasks = store.getTasks().filter(t => !t.completed);

  // 1. Exam Prep (Highest Priority if exam is within 7 days)
  if (upcomingExams.length > 0) {
    const nextExam = upcomingExams[0];
    const diffDays = Math.ceil((new Date(nextExam.date) - new Date()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) {
      plan.push({
        id: 'plan-action-1',
        type: 'exam_prep',
        title: `Prepare for ${nextExam.name}`,
        subtitle: `Exam in ${diffDays} days`,
        priority: 'high',
        duration: 45,
        action: 'Review',
        reason: 'Exam is approaching rapidly.'
      });
    }
  }

  // 2. Critical Weaknesses
  const criticalTopics = weakTopics.filter(t => t.status === 'CRITICAL');
  if (criticalTopics.length > 0) {
    const criticalTarget = criticalTopics[0];
    plan.push({
      id: 'plan-action-2',
      type: 'weakness_recovery',
      title: `Recover: ${criticalTarget.topicName}`,
      subtitle: criticalTarget.subjectName,
      priority: 'high',
      duration: 30,
      action: 'Start Recovery Plan',
      reason: `Accuracy is low (${criticalTarget.avgScore}%) and needs immediate attention.`
    });
  }

  // 3. High Priority Tasks
  const highTasks = tasks.filter(t => t.priority === 'high' || t.priority === 'critical');
  if (highTasks.length > 0) {
    plan.push({
      id: 'plan-action-3',
      type: 'task',
      title: `Complete High Priority Task`,
      subtitle: highTasks[0].title,
      priority: 'medium',
      duration: 25,
      action: 'View Task',
      reason: 'Task is marked as high/critical priority.'
    });
  }

  // 4. Maintenance (if we have fewer than 3 items, suggest maintaining a weak but improving topic, or reading notes)
  if (plan.length < 3 && weakTopics.length > 1) {
    const mildTarget = weakTopics[1];
    plan.push({
      id: 'plan-action-4',
      type: 'maintenance',
      title: `Practice: ${mildTarget.topicName}`,
      subtitle: mildTarget.subjectName,
      priority: 'low',
      duration: 15,
      action: 'Take Quick Quiz',
      reason: 'Needs light practice to improve from current accuracy.'
    });
  }

  return plan;
};
