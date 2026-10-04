export interface QuestionItem {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  category?: string;
  difficulty?: string;
}

export interface AnswerDetail {
  questionId: string;
  question: string;
  options: string[];
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
}

export interface QuizCalculationResult {
  score: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  answerDetails: AnswerDetail[];
}

/**
 * Fisher-Yates unbiased array shuffle algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Filter and shuffle quiz questions safely
 */
export function prepareQuizQuestions(
  questions: QuestionItem[],
  limit: number = 10,
  category: string = "All",
  difficulty: string = "All"
): QuestionItem[] {
  let filtered = [...questions];

  if (category && category !== "All") {
    const categoryMatches = filtered.filter(
      (q) => q.category?.toLowerCase() === category.toLowerCase()
    );
    if (categoryMatches.length > 0) {
      filtered = categoryMatches;
    }
  }

  if (difficulty && difficulty !== "All") {
    const difficultyMatches = filtered.filter(
      (q) => q.difficulty?.toLowerCase() === difficulty.toLowerCase()
    );
    if (difficultyMatches.length > 0) {
      filtered = difficultyMatches;
    }
  }

  const shuffled = shuffleArray(filtered);
  return shuffled.slice(0, Math.min(limit, shuffled.length));
}

/**
 * Calculate quiz final score and detailed breakdown
 */
export function calculateQuizScore(
  questions: QuestionItem[],
  answers: Record<string, number>
): QuizCalculationResult {
  const totalQuestions = questions.length;
  if (totalQuestions === 0) {
    return {
      score: 0,
      totalQuestions: 0,
      correctCount: 0,
      wrongCount: 0,
      answerDetails: []
    };
  }

  let correctCount = 0;

  const answerDetails: AnswerDetail[] = questions.map((q) => {
    const userAnswer = answers[q.id] ?? -1;
    const isCorrect = userAnswer === q.correct_answer;
    if (isCorrect) correctCount++;

    return {
      questionId: q.id,
      question: q.question,
      options: q.options,
      userAnswer,
      correctAnswer: q.correct_answer,
      isCorrect
    };
  });

  const wrongCount = totalQuestions - correctCount;
  const score = Math.round((correctCount / totalQuestions) * 100);

  return {
    score,
    totalQuestions,
    correctCount,
    wrongCount,
    answerDetails
  };
}

/**
 * Format time in seconds to MM:SS string
 */
export function formatTimeMMSS(seconds: number): string {
  const mins = Math.floor(Math.max(0, seconds) / 60);
  const secs = Math.floor(Math.max(0, seconds) % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Format time in seconds to human readable Xm Ys
 */
export function formatTimeHuman(seconds: number): string {
  const mins = Math.floor(Math.max(0, seconds) / 60);
  const secs = Math.floor(Math.max(0, seconds) % 60);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}
