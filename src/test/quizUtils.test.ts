import { describe, it, expect } from "vitest";
import {
  shuffleArray,
  prepareQuizQuestions,
  calculateQuizScore,
  formatTimeMMSS,
  formatTimeHuman,
  QuestionItem
} from "@/lib/quizUtils";

const mockQuestions: QuestionItem[] = [
  {
    id: "q1",
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correct_answer: 1,
    category: "Math",
    difficulty: "Easy"
  },
  {
    id: "q2",
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correct_answer: 2,
    category: "General Knowledge",
    difficulty: "Medium"
  }
];

describe("quizUtils", () => {
  it("should format time in MM:SS correctly", () => {
    expect(formatTimeMMSS(600)).toBe("10:00");
    expect(formatTimeMMSS(65)).toBe("01:05");
    expect(formatTimeMMSS(0)).toBe("00:00");
  });

  it("should format time in human readable format correctly", () => {
    expect(formatTimeHuman(125)).toBe("2m 5s");
    expect(formatTimeHuman(45)).toBe("45s");
  });

  it("should calculate quiz score correctly with all correct answers", () => {
    const answers = { q1: 1, q2: 2 };
    const result = calculateQuizScore(mockQuestions, answers);
    expect(result.score).toBe(100);
    expect(result.correctCount).toBe(2);
    expect(result.wrongCount).toBe(0);
  });

  it("should calculate quiz score correctly with partial correct answers", () => {
    const answers = { q1: 1, q2: 0 };
    const result = calculateQuizScore(mockQuestions, answers);
    expect(result.score).toBe(50);
    expect(result.correctCount).toBe(1);
    expect(result.wrongCount).toBe(1);
  });

  it("should handle unanswered questions properly", () => {
    const answers = { q1: 1 };
    const result = calculateQuizScore(mockQuestions, answers);
    expect(result.score).toBe(50);
    expect(result.correctCount).toBe(1);
    expect(result.wrongCount).toBe(1);
    expect(result.answerDetails[1].userAnswer).toBe(-1);
    expect(result.answerDetails[1].isCorrect).toBe(false);
  });

  it("should shuffle arrays without losing items", () => {
    const items = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(items);
    expect(shuffled).toHaveLength(5);
    expect(shuffled.sort()).toEqual(items.sort());
  });

  it("should prepare questions according to limit and category filter", () => {
    const prepared = prepareQuizQuestions(mockQuestions, 1, "Math", "All");
    expect(prepared).toHaveLength(1);
    expect(prepared[0].category).toBe("Math");
  });
});
