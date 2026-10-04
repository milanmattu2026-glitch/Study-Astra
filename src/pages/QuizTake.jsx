import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { generateId } from '../utils/helpers';
import { useStore } from '../hooks/useStore';
import { store } from '../store';
import { CheckCircle2, XCircle, ArrowRight, Save, Clock } from 'lucide-react';
import { generateQuiz } from '../services/quizGenerator';

export default function QuizTake() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subjectIdParam = searchParams.get('subjectId');
  const topicIdParam = searchParams.get('topicId');

  const subjects = useStore('subjects');
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // questionId -> selected option index
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    // Generate the quiz on page load
    const loadQuiz = async () => {
      try {
        const generated = await generateQuiz({
          subjectId: subjectIdParam || subjects[0]?.id,
          topicId: topicIdParam || null,
          notes: [],
          difficulty: 'medium',
          questionCount: 5,
          types: ['multiple-choice', 'true-false']
        });
        setQuizData(generated);
      } catch (e) {
        console.error("Failed to generate quiz", e);
      } finally {
        setLoading(false);
      }
    };
    if (subjects.length > 0) {
      loadQuiz();
    }
  }, [subjects, subjectIdParam, topicIdParam]);

  // Timer
  useEffect(() => {
    let interval;
    if (quizData && !isSubmitted) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [quizData, isSubmitted]);

  if (loading) {
    return (
      <div className="page-enter min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[var(--color-text-secondary)]">Generating smart questions from your syllabus...</p>
      </div>
    );
  }

  if (!quizData) {
    return <div className="page-enter">Error generating quiz. Please go back.</div>;
  }

  const currentQ = quizData.questions[currentQuestionIndex];
  const hasSelectedAnswer = answers[currentQ.id] !== undefined;

  const handleSelectAnswer = (index) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [currentQ.id]: index }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < quizData.questions.length) {
      if (!confirm("You haven't answered all questions. Submit anyway?")) {
        return;
      }
    }

    // Calculate score
    let correctCount = 0;
    quizData.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / quizData.questions.length) * 100);

    // Determine weak areas (simple logic looking at wrong answers)
    const weakAreas = quizData.questions
      .filter(q => answers[q.id] !== q.correctAnswer)
      .map(q => quizData.topic);

    // Filter unique weak areas
    const uniqueWeakAreas = [...new Set(weakAreas)];

    // Save to store
    const resultToSave = {
      subject: quizData.subject,
      topic: quizData.topic,
      topicId: quizData.topicId,
      difficulty: quizData.difficulty,
      questionCount: quizData.questionCount,
      score: percentage,
      totalScore: 100,
      timeTaken: Math.ceil(timer / 60),
      weakAreas: uniqueWeakAreas,
      // We could save full Q&A history here if we wanted deep review
    };

    const saved = store.addQuiz(resultToSave);
    setIsSubmitted(true);

    // Redirect to quiz result page after short delay
    setTimeout(() => {
      navigate(`/quizzes/${saved.id}`);
    }, 1500);
  };

  return (
    <div className="page-enter max-w-3xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{quizData.topic} Quiz</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Question {currentQuestionIndex + 1} of {quizData.questions.length}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-[var(--color-bg-tertiary)] rounded-lg font-mono">
          <Clock size={16} />
          {Math.floor(timer / 60).toString().padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--color-accent)] transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="card">
        <h2 className="text-xl mb-6 leading-relaxed">
          {currentQ.question}
        </h2>

        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => {
            const isSelected = answers[currentQ.id] === idx;

            return (
              <button
                key={idx}
                onClick={() => handleSelectAnswer(idx)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 shadow-sm'
                    : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-bg-hover)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'border-[var(--color-accent)]' : 'border-[var(--color-text-muted)]'
                  }`}>
                    {isSelected && <div className="w-3 h-3 rounded-full bg-[var(--color-accent)]" />}
                  </div>
                  <span className="text-base">{opt}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={handlePrev}
          disabled={currentQuestionIndex === 0}
          className={`btn ${currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'btn-secondary'}`}
        >
          Previous
        </button>

        {currentQuestionIndex === quizData.questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitted}
            className={`btn btn-primary ${isSubmitted ? 'opacity-75' : ''}`}
          >
            {isSubmitted ? 'Submitting...' : 'Submit Quiz'}
          </button>
        ) : (
          <button onClick={handleNext} className="btn btn-primary">
            Next <ArrowRight size={16} />
          </button>
        )}
      </div>

      {/* Visual map */}
      <div className="flex justify-center gap-2 mt-8 flex-wrap">
        {quizData.questions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentQuestionIndex(idx)}
            className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition-colors ${
              idx === currentQuestionIndex
                ? 'bg-[var(--color-accent)] text-white'
                : answers[q.id] !== undefined
                ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30'
                : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]'
            }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}