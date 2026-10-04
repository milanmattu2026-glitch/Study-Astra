import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { store } from '../store';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    educationLevel: 'Undergraduate',
    dailyStudyGoal: 240,
    preferredStudyHours: { start: '09:00', end: '17:00' },
    theme: 'dark'
  });

  const steps = [
    {
      title: 'Welcome to Study Astra ✨',
      subtitle: 'Your academic universe. Navigate your learning.',
      content: (
        <div className="text-center py-12">
          <div className="text-8xl mb-6">🚀</div>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-md mx-auto">
            Study Astra is your personal command center for managing syllabus, tasks, notes, quizzes, and tracking your progress.
          </p>
        </div>
      )
    },
    {
      title: "What's your name?",
      subtitle: 'Let\'s personalize your experience',
      content: (
        <div className="max-w-md mx-auto">
          <input
            type="text"
            placeholder="Enter your name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input text-center text-xl"
            autoFocus
          />
        </div>
      )
    },
    {
      title: 'Education Level',
      subtitle: 'Tell us about your current studies',
      content: (
        <div className="max-w-md mx-auto space-y-3">
          {['High School', 'Undergraduate', 'Graduate', 'Professional', 'Self-Learning'].map(level => (
            <button
              key={level}
              onClick={() => setFormData({ ...formData, educationLevel: level })}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                formData.educationLevel === level
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                  : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/50'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      )
    },
    {
      title: 'Daily Study Goal',
      subtitle: 'How much time do you want to study each day?',
      content: (
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-[var(--color-accent)] mb-2">
              {Math.floor(formData.dailyStudyGoal / 60)}h {formData.dailyStudyGoal % 60}m
            </div>
            <div className="text-sm text-[var(--color-text-muted)]">per day</div>
          </div>
          <input
            type="range"
            min="30"
            max="480"
            step="30"
            value={formData.dailyStudyGoal}
            onChange={(e) => setFormData({ ...formData, dailyStudyGoal: parseInt(e.target.value) })}
            className="w-full h-2 bg-[var(--color-bg-tertiary)] rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${(formData.dailyStudyGoal / 480) * 100}%, var(--color-bg-tertiary) ${(formData.dailyStudyGoal / 480) * 100}%, var(--color-bg-tertiary) 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-[var(--color-text-muted)] mt-2">
            <span>30 min</span>
            <span>8 hours</span>
          </div>
        </div>
      )
    },
    {
      title: 'Choose Your Theme',
      subtitle: 'Pick your preferred appearance',
      content: (
        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setFormData({ ...formData, theme: 'dark' })}
              className={`p-6 rounded-xl border-2 transition-all ${
                formData.theme === 'dark'
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                  : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/50'
              }`}
            >
              <div className="w-full aspect-video bg-[#0a0a0f] rounded-lg mb-3 border border-gray-700 flex items-center justify-center">
                <span className="text-2xl">🌙</span>
              </div>
              <div className="font-medium text-center">Dark</div>
            </button>

            <button
              onClick={() => setFormData({ ...formData, theme: 'light' })}
              className={`p-6 rounded-xl border-2 transition-all ${
                formData.theme === 'light'
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                  : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/50'
              }`}
            >
              <div className="w-full aspect-video bg-white rounded-lg mb-3 border border-gray-300 flex items-center justify-center">
                <span className="text-2xl">☀️</span>
              </div>
              <div className="font-medium text-center">Light</div>
            </button>
          </div>
        </div>
      )
    },
    {
      title: "You're all set! 🎉",
      subtitle: 'Start your learning journey',
      content: (
        <div className="text-center py-12">
          <div className="text-6xl mb-6">✨</div>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-md mx-auto mb-8">
            {formData.name ? `Welcome ${formData.name}! ` : 'Welcome! '}
            Your personalized study space is ready. Let's build your academic universe together.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="px-4 py-2 bg-[var(--color-bg-tertiary)] rounded-full">
              📚 Track syllabus
            </div>
            <div className="px-4 py-2 bg-[var(--color-bg-tertiary)] rounded-full">
              ✅ Manage tasks
            </div>
            <div className="px-4 py-2 bg-[var(--color-bg-tertiary)] rounded-full">
              🧠 Take quizzes
            </div>
            <div className="px-4 py-2 bg-[var(--color-bg-tertiary)] rounded-full">
              📊 View analytics
            </div>
            <div className="px-4 py-2 bg-[var(--color-bg-tertiary)] rounded-full">
              🔥 Build streaks
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;
  const canProceed = step === 0 || (step === 1 && formData.name.trim());

  const handleNext = () => {
    if (isLastStep) {
      // Complete onboarding
      store.updateUser({
        name: formData.name || 'Student',
        educationLevel: formData.educationLevel,
        dailyStudyGoal: formData.dailyStudyGoal,
        preferredStudyHours: formData.preferredStudyHours,
        onboardingCompleted: true
      });

      store.updateSettings({
        theme: formData.theme
      });

      navigate('/');
    } else {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    store.updateUser({
      name: 'Student',
      onboardingCompleted: true
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--color-bg-primary)]">
      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-1 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-accent)] transition-all duration-300"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-sm text-[var(--color-text-muted)]">
            <span>Step {step + 1} of {steps.length}</span>
            {step < steps.length - 1 && (
              <button onClick={handleSkip} className="hover:text-[var(--color-text-primary)] transition-colors">
                Skip
              </button>
            )}
          </div>
        </div>

        {/* Content Card */}
        <div className="card animate-fadeIn">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{currentStep.title}</h1>
            <p className="text-[var(--color-text-secondary)]">{currentStep.subtitle}</p>
          </div>

          <div className="mb-12">
            {currentStep.content}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={step === 0}
              className={`btn ${step === 0 ? 'btn-ghost opacity-0 pointer-events-none' : 'btn-secondary'}`}
            >
              <ChevronLeft size={20} />
              Back
            </button>

            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === step
                      ? 'bg-[var(--color-accent)] w-8'
                      : index < step
                      ? 'bg-[var(--color-accent)] opacity-50'
                      : 'bg-[var(--color-bg-tertiary)]'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={!canProceed && step === 1}
              className="btn btn-primary"
            >
              {isLastStep ? (
                <>
                  Get Started
                  <Sparkles size={20} />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Branding */}
        <div className="text-center mt-8 text-sm text-[var(--color-text-muted)]">
          Study Astra • Your academic universe
        </div>
      </div>
    </div>
  );
}
