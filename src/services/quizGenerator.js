import { store } from '../store';
import { generateId } from '../utils/helpers';

/**
 * Quiz Generator Service
 * Currently builds mock questions based on stored notes and topics.
 * Structured to be easily replaced with an AI API (e.g., OpenAI/Anthropic) later.
 */

export const generateQuiz = async (input) => {
  const { subjectId, topicId, notes, difficulty, questionCount, types } = input;

  const subject = store.getSubject(subjectId);
  if (!subject) throw new Error("Subject not found");

  // In a real AI implementation, we would send the 'notes' content to the LLM here.
  // For the local version, we'll generate smart contextual mocks based on the topic name.

  let topicName = "General";
  let chapterId = null;

  if (topicId) {
    for (const chapter of subject.chapters || []) {
      const topic = chapter.topics?.find(t => t.id === topicId);
      if (topic) {
        topicName = topic.name;
        chapterId = chapter.id;
        break;
      }
    }
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const questions = [];

  for (let i = 0; i < questionCount; i++) {
    const isMultipleChoice = types.includes('multiple-choice');
    const isTrueFalse = types.includes('true-false');

    // Randomly pick type from requested
    const type = isMultipleChoice && isTrueFalse
      ? (Math.random() > 0.3 ? 'multiple-choice' : 'true-false')
      : (isMultipleChoice ? 'multiple-choice' : 'true-false');

    if (type === 'multiple-choice') {
      questions.push({
        id: generateId(),
        type: 'multiple-choice',
        question: `What is the primary characteristic or purpose of ${topicName}? (Question ${i + 1})`,
        options: [
          `The correct definition and application of ${topicName}`,
          `An incorrect but plausible sounding concept related to the syllabus`,
          `A completely unrelated concept from another chapter`,
          `A common misconception about ${topicName}`
        ],
        correctAnswer: 0, // Using index for multiple choice
        explanation: `This is correct because ${topicName} fundamental rules strictly define this behavior. Review the related note for deep dive.`,
        subjectId,
        chapterId,
        topicId,
        difficulty
      });
    } else {
      const isTrue = Math.random() > 0.5;
      questions.push({
        id: generateId(),
        type: 'true-false',
        question: `True or False: ${topicName} always behaves in a predictable, constant-time manner regardless of input size.`,
        options: ['True', 'False'],
        correctAnswer: isTrue ? 0 : 1,
        explanation: `The statement is ${isTrue}. Detailed mechanics of ${topicName} show that edge cases alter this behavior.`,
        subjectId,
        chapterId,
        topicId,
        difficulty
      });
    }
  }

  return {
    id: `quiz-sess-${Date.now()}`,
    subject: subjectId,
    topic: topicName,
    topicId,
    difficulty,
    questionCount,
    questions,
    generatedAt: new Date().toISOString()
  };
};
