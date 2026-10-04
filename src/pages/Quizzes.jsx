import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Brain, Plus, Clock, Target, TrendingUp, AlertCircle, CheckCircle2, XCircle, Play } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { store } from '../store';
import { formatDate, getRelativeTime } from '../utils/helpers';

export default function Quizzes() {
  const navigate = useNavigate();
  const { id } = useParams();
  const quizzes = useStore('quizzes');
  const subjects = useStore('subjects');

  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [quizConfig, setQuizConfig] = useState({
    subject: '',
    topic: '',
    difficulty: 'medium',
    questionCount: 10,
    questionTypes: ['multiple-choice']
  });

  const selectedQuiz = id ? quizzes.find(q => q.id === id) : null;

  const handleCreateQuiz = () => {
    if (!quizConfig.subject) {
      alert('Please select a subject');
      return;
    }

    setShowCreateQuiz(false);
    navigate(`/quizzes/create?subjectId=${quizConfig.subject}&topicId=${quizConfig.topic}`);
  };

  if (selectedQuiz) {
    // Quiz result detail view
    const subject = subjects.find(s => s.id === selectedQuiz.subject);
    const percentage = selectedQuiz.score;
    const passed = percentage >= 60;

    return (
      <div className="page-enter space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <Link
            to="/quizzes"
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] mb-2 inline-block"
          >
            ← Back to all quizzes
          </Link>
          <h1 className="text-3xl font-bold">{selectedQuiz.topic} Quiz</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Taken {getRelativeTime(selectedQuiz.completedAt)}
          </p>
        </div>

        {/* Score Card */}
        <div className={`card ${passed ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20' : 'bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20'}`}>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">
              {passed ? '🎉' : '📚'}
            </div>
            <h2 className="text-4xl font-bold mb-2">{percentage}%</h2>
            <p className="text-lg text-[var(--color-text-secondary)]">
              {passed ? 'Great job!' : 'Keep practicing!'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="card text-center">
            <div className="text-2xl font-bold text-[var(--color-accent)]">
              {selectedQuiz.questionCount}
            </div>
            <div className="text-sm text-[var(--color-text-muted)]">Questions</div>
          </div>

          <div className="card text-center">
            <div className="text-2xl font-bold text-[var(--color-success)]">
              {Math.round((selectedQuiz.questionCount * selectedQuiz.score) / 100)}
            </div>
            <div className="text-sm text-[var(--color-text-muted)]">Correct</div>
          </div>

          <div className="card text-center">
            <div className="text-2xl font-bold text-[var(--color-danger)]">
              {selectedQuiz.questionCount - Math.round((selectedQuiz.questionCount * selectedQuiz.score) / 100)}
            </div>
            <div className="text-sm text-[var(--color-text-muted)]">Incorrect</div>
          </div>

          <div className="card text-center">
            <div className="text-2xl font-bold text-[var(--color-info)]">
              {selectedQuiz.timeTaken}m
            </div>
            <div className="text-sm text-[var(--color-text-muted)]">Time Taken</div>
          </div>
        </div>

        {/* Analysis */}
        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Target size={20} />
            Performance Analysis
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Accuracy</span>
                <span className="text-sm font-medium">{percentage}%</span>
              </div>
              <div className="h-3 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: passed ? 'var(--color-success)' : 'var(--color-warning)'
                  }}
                />
              </div>
            </div>

            {selectedQuiz.weakAreas && selectedQuiz.weakAreas.length > 0 && (
              <div>
                <div className="font-medium mb-2 flex items-center gap-2">
                  <AlertCircle size={16} className="text-[var(--color-warning)]" />
                  Needs Attention
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedQuiz.weakAreas.map((area, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-[var(--color-warning)]/10 text-[var(--color-warning)] rounded-full text-sm"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 rounded-lg">
              <div className="font-medium mb-2">💡 Recommended Action</div>
              <div className="text-sm text-[var(--color-text-secondary)]">
                {percentage >= 80
                  ? 'Excellent work! You have a strong understanding of this topic.'
                  : percentage >= 60
                  ? 'Good job! Review the weak areas and try again to improve your score.'
                  : 'Focus on understanding the fundamentals. Review your notes and try practicing with easier questions first.'}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            to={`/notes?subject=${selectedQuiz.subject}&topic=${selectedQuiz.topic}`}
            className="btn btn-secondary flex-1"
          >
            📖 Review Notes
          </Link>
          <button
            onClick={() => alert('Retake quiz coming soon!')}
            className="btn btn-primary flex-1"
          >
            <Play size={16} />
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  // Quiz list view
  const recentQuizzes = quizzes.slice(-10).reverse();

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quizzes</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Test your knowledge and track your progress
          </p>
        </div>
        <button
          onClick={() => setShowCreateQuiz(true)}
          className="btn btn-primary"
        >
          <Plus size={16} />
          Create Quiz
        </button>
      </div>

      {/* Quick Stats */}
      {quizzes.length > 0 && (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="card text-center">
            <Brain size={32} className="mx-auto mb-2 text-[var(--color-accent)]" />
            <div className="text-2xl font-bold mb-1">{quizzes.length}</div>
            <div className="text-sm text-[var(--color-text-muted)]">Quizzes Taken</div>
          </div>

          <div className="card text-center">
            <Target size={32} className="mx-auto mb-2 text-[var(--color-success)]" />
            <div className="text-2xl font-bold mb-1">
              {Math.round(quizzes.reduce((sum, q) => sum + q.score, 0) / quizzes.length)}%
            </div>
            <div className="text-sm text-[var(--color-text-muted)]">Avg Score</div>
          </div>

          <div className="card text-center">
            <TrendingUp size={32} className="mx-auto mb-2 text-[var(--color-info)]" />
            <div className="text-2xl font-bold mb-1">
              {quizzes.filter(q => q.score >= 80).length}
            </div>
            <div className="text-sm text-[var(--color-text-muted)]">Above 80%</div>
          </div>

          <div className="card text-center">
            <Clock size={32} className="mx-auto mb-2 text-[var(--color-warning)]" />
            <div className="text-2xl font-bold mb-1">
              {Math.round(quizzes.reduce((sum, q) => sum + (q.timeTaken || 0), 0) / quizzes.length)}m
            </div>
            <div className="text-sm text-[var(--color-text-muted)]">Avg Time</div>
          </div>
        </div>
      )}

      {/* Quiz History */}
      <div className="card">
        <h3 className="font-semibold mb-4">Recent Quizzes</h3>

        {recentQuizzes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🧠</div>
            <h3 className="text-xl font-semibold mb-2">No quizzes yet</h3>
            <p className="text-[var(--color-text-muted)] mb-6">
              Create your first quiz to test your knowledge
            </p>
            <button onClick={() => setShowCreateQuiz(true)} className="btn btn-primary">
              <Plus size={16} />
              Create Quiz
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentQuizzes.map(quiz => {
              const subject = subjects.find(s => s.id === quiz.subject);
              const passed = quiz.score >= 60;

              return (
                <Link
                  key={quiz.id}
                  to={`/quizzes/${quiz.id}`}
                  className="block p-4 bg-[var(--color-bg-tertiary)] rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{quiz.topic}</h4>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-muted)]">
                        {subject && (
                          <span
                            className="px-2 py-0.5 rounded-full text-xs"
                            style={{
                              backgroundColor: subject.color + '20',
                              color: subject.color
                            }}
                          >
                            {subject.name}
                          </span>
                        )}
                        <span>{quiz.questionCount} questions</span>
                        <span>•</span>
                        <span>{quiz.difficulty}</span>
                        <span>•</span>
                        <span>{getRelativeTime(quiz.completedAt)}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-2xl font-bold ${passed ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}`}>
                        {quiz.score}%
                      </div>
                      <div className="text-xs text-[var(--color-text-muted)]">
                        {quiz.timeTaken}m
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Quiz Modal */}
      {showCreateQuiz && (
        <div className="modal-overlay" onClick={() => setShowCreateQuiz(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Create Quiz</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <select
                  value={quizConfig.subject}
                  onChange={(e) => setQuizConfig({ ...quizConfig, subject: e.target.value })}
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
                <label className="block text-sm font-medium mb-2">Topic (optional)</label>
                <input
                  type="text"
                  placeholder="Leave blank for all topics"
                  value={quizConfig.topic}
                  onChange={(e) => setQuizConfig({ ...quizConfig, topic: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <div className="grid grid-cols-4 gap-2">
                  {['easy', 'medium', 'hard', 'mixed'].map(diff => (
                    <button
                      key={diff}
                      onClick={() => setQuizConfig({ ...quizConfig, difficulty: diff })}
                      className={`py-2 rounded-lg text-sm font-medium transition-all ${
                        quizConfig.difficulty === diff
                          ? 'bg-[var(--color-accent)] text-white'
                          : 'bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-hover)]'
                      }`}
                    >
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Number of Questions: {quizConfig.questionCount}
                </label>
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="5"
                  value={quizConfig.questionCount}
                  onChange={(e) => setQuizConfig({ ...quizConfig, questionCount: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div className="p-4 bg-[var(--color-info)]/10 border border-[var(--color-info)]/20 rounded-lg">
                <div className="text-sm">
                  <strong>Smart Generation:</strong> Questions will be generated from your syllabus and notes for this subject.
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={handleCreateQuiz} className="btn btn-primary flex-1">
                Generate Quiz
              </button>
              <button onClick={() => setShowCreateQuiz(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
