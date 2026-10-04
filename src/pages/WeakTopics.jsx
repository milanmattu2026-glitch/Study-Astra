import { useState } from 'react';
import { AlertTriangle, TrendingDown, Clock, BarChart3, BookOpen, Brain, Target, CheckCircle2, Calendar } from 'lucide-react';
import { useStore, useToast } from '../hooks/useStore';
import { Link, useNavigate } from 'react-router-dom';
import { getAllWeakTopics, generateRecoveryPlan } from '../services/weaknessAnalyzer';
import { store } from '../store';

export default function WeakTopics() {
  const navigate = useNavigate();
  const subjects = useStore('subjects');
  const notes = useStore('notes');
  const quizzes = useStore('quizzes');
  const { addToast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedTopicId, setSelectedTopicId] = useState(null);

  const weakTopics = getAllWeakTopics();

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'CRITICAL': return 'var(--color-danger)';
      case 'WEAK': return 'var(--color-warning)';
      case 'NEEDS_PRACTICE': return 'var(--color-info)';
      case 'IMPROVING': return 'var(--color-success)';
      default: return 'var(--color-success)';
    }
  };

  const getSeverityLabel = (severity) => {
    switch(severity) {
      case 'CRITICAL': return 'Critical';
      case 'WEAK': return 'Weak';
      case 'NEEDS_PRACTICE': return 'Needs Practice';
      case 'IMPROVING': return 'Improving';
      default: return 'Strong';
    }
  };

  const handleGeneratePlan = (topicId) => {
    setSelectedTopicId(topicId);
    const plan = generateRecoveryPlan(topicId);
    setSelectedPlan(plan);
  };

  const handleAcceptPlan = () => {
    if (!selectedPlan || !selectedTopicId) return;

    const topicData = weakTopics.find(t => t.topicId === selectedTopicId);

    // Create a planner session for each day in the plan
    selectedPlan.days.forEach((day, index) => {
      const sessionDate = new Date();
      sessionDate.setDate(sessionDate.getDate() + index); // Schedule over next N days

      const sessionStr = sessionDate.toISOString().split('T')[0];
      const durationStr = day.activities.reduce((sum, act) => sum + act.duration, 0);

      store.addSession({
        subject: topicData?.subjectId || '',
        topic: `Recovery: ${topicData?.topicName} (Day ${day.day})`,
        startTime: `${sessionStr}T17:00`, // Default to 5 PM
        endTime: `${sessionStr}T${17 + Math.floor(durationStr/60)}:${(durationStr%60).toString().padStart(2, '0')}`,
        priority: 'high',
        goal: day.focus,
        notes: day.activities.map(a => `- ${a.content} (${a.duration}m)`).join('\n')
      });
    });

    addToast('Recovery plan added to your Study Planner!');
    setSelectedPlan(null);
  };

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Weak Topics</h1>
        <p className="text-[var(--color-text-secondary)]">
          Identify and strengthen your weak areas
        </p>
      </div>

      {/* Overview Stats */}
      {weakTopics.length > 0 && (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="card text-center">
            <AlertTriangle size={32} className="mx-auto mb-2 text-[var(--color-danger)]" />
            <div className="text-2xl font-bold mb-1">
              {weakTopics.filter(t => t.status === 'CRITICAL').length}
            </div>
            <div className="text-sm text-[var(--color-text-muted)]">Critical</div>
          </div>

          <div className="card text-center">
            <TrendingDown size={32} className="mx-auto mb-2 text-[var(--color-warning)]" />
            <div className="text-2xl font-bold mb-1">
              {weakTopics.filter(t => t.status === 'WEAK').length}
            </div>
            <div className="text-sm text-[var(--color-text-muted)]">Weak</div>
          </div>

          <div className="card text-center">
            <BarChart3 size={32} className="mx-auto mb-2 text-[var(--color-info)]" />
            <div className="text-2xl font-bold mb-1">
              {weakTopics.filter(t => t.status === 'NEEDS_PRACTICE').length}
            </div>
            <div className="text-sm text-[var(--color-text-muted)]">Needs Practice</div>
          </div>

          <div className="card text-center">
            <Target size={32} className="mx-auto mb-2 text-[var(--color-accent)]" />
            <div className="text-2xl font-bold mb-1">
              {Math.round(weakTopics.reduce((sum, t) => sum + t.avgScore, 0) / weakTopics.length)}%
            </div>
            <div className="text-sm text-[var(--color-text-muted)]">Avg Accuracy</div>
          </div>
        </div>
      )}

      {/* Weak Topics List */}
      <div className="space-y-4">
        {weakTopics.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">No weak topics detected</h3>
            <p className="text-[var(--color-text-muted)] mb-6">
              {quizzes.length === 0
                ? 'Take some quizzes to get personalized insights on areas that need improvement.'
                : 'Great job! Your quiz performance is strong across all topics.'}
            </p>
            {quizzes.length === 0 && (
              <Link to="/quizzes" className="btn btn-primary">
                <Brain size={16} />
                Take a Quiz
              </Link>
            )}
          </div>
        ) : (
          weakTopics.map(topic => {
            const subject = subjects.find(s => s.id === topic.subjectId);
            const relatedNotes = notes.filter(n =>
              n.subject === topic.subjectId &&
              n.title.toLowerCase().includes(topic.topicName.toLowerCase())
            );

            return (
              <div key={`${topic.subjectId}-${topic.topicId}`} className="card">
                <div className="flex items-start gap-4">
                  {/* Severity Indicator */}
                  <div className="flex-shrink-0 pt-1">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                      style={{
                        backgroundColor: getSeverityColor(topic.status) + '20',
                        color: getSeverityColor(topic.status)
                      }}
                    >
                      ⚠️
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{topic.topicName}</h3>
                        {subject && (
                          <span
                            className="inline-block px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: subject.color + '20',
                              color: subject.color
                            }}
                          >
                            {subject.name}
                          </span>
                        )}
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div
                          className="text-2xl font-bold"
                          style={{ color: getSeverityColor(topic.status) }}
                        >
                          {topic.avgScore}%
                        </div>
                        <div className="text-xs text-[var(--color-text-muted)]">
                          accuracy
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 text-sm text-[var(--color-text-muted)] mb-3">
                      <span className="flex items-center gap-1">
                        <BarChart3 size={14} />
                        {topic.attempts} {topic.attempts === 1 ? 'attempt' : 'attempts'}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: getSeverityColor(topic.status) + '20',
                          color: getSeverityColor(topic.status)
                        }}
                      >
                        {getSeverityLabel(topic.status)}
                      </span>
                    </div>

                    {/* Why This Topic is Weak */}
                    <div className="p-3 bg-[var(--color-bg-tertiary)] rounded-lg mb-3">
                      <div className="text-sm font-medium mb-1">
                        Why this topic needs attention:
                      </div>
                      <div className="text-sm text-[var(--color-text-secondary)]">
                        {topic.reasons.join(' • ')}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {relatedNotes.length > 0 && (
                        <Link
                          to={`/notes/${relatedNotes[0].id}`}
                          className="btn btn-secondary text-sm"
                        >
                          <BookOpen size={14} />
                          Review Notes
                        </Link>
                      )}

                      <button
                        onClick={() => navigate(`/quizzes/create?subjectId=${topic.subjectId}&topicId=${topic.topicId}`)}
                        className="btn btn-secondary text-sm"
                      >
                        <Brain size={14} />
                        Practice
                      </button>

                      <button
                        onClick={() => handleGeneratePlan(topic.topicId)}
                        className="btn btn-primary text-sm"
                      >
                        <Target size={14} />
                        Improve This Topic
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Recovery Plan Modal */}
      {selectedPlan && (
        <div className="modal-overlay" onClick={() => setSelectedPlan(null)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{selectedPlan.title}</h2>
              <div className="flex items-center gap-2 text-sm text-green-500 bg-green-500/10 px-3 py-1 rounded-full font-medium">
                <Target size={14} /> Target: {selectedPlan.targetAccuracy}%
              </div>
            </div>

            <div className="space-y-6">
              {selectedPlan.days.map((day) => (
                <div key={day.day} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent)] flex items-center justify-center font-bold">
                      {day.day}
                    </div>
                    {day.day !== selectedPlan.days.length && (
                      <div className="w-0.5 flex-1 bg-[var(--color-border)] my-2"></div>
                    )}
                  </div>

                  <div className="flex-1 bg-[var(--color-bg-tertiary)] rounded-xl p-4">
                    <h3 className="font-semibold text-[var(--color-accent)] mb-3 flex items-center gap-2">
                      <Calendar size={16} /> Day {day.day}: {day.focus}
                    </h3>

                    <div className="space-y-2">
                      {day.activities.map((activity, idx) => (
                        <div key={idx} className="flex items-start justify-between gap-4 p-3 bg-[var(--color-bg-card)] rounded-lg border border-[var(--color-border)]">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">
                              {activity.type === 'review' ? '📖' : activity.type === 'practice' ? '🧠' : '🎯'}
                            </span>
                            <span className="text-sm font-medium">{activity.content}</span>
                          </div>
                          <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 font-mono bg-[var(--color-bg-hover)] px-2 py-1 rounded">
                            <Clock size={12} /> {activity.duration}m
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-8">
              <button className="btn btn-primary flex-1" onClick={handleAcceptPlan}>
                Accept Plan (Adds to Planner)
              </button>
              <button
                onClick={() => setSelectedPlan(null)}
                className="btn btn-secondary w-full sm:w-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      {weakTopics.length > 0 && (
        <div className="card bg-gradient-to-br from-[var(--color-accent)] to-purple-600 text-white">
          <h3 className="font-semibold mb-3">💡 Tips for Improvement</h3>
          <ul className="space-y-2 text-sm opacity-90">
            <li>• Focus on one weak topic at a time for better results</li>
            <li>• Review your notes before practicing</li>
            <li>• Take multiple practice quizzes to build confidence</li>
            <li>• Start with easier questions and gradually increase difficulty</li>
            <li>• Track your progress over time to stay motivated</li>
          </ul>
        </div>
      )}
    </div>
  );
}
