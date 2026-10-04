import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, ChevronLeft, ChevronRight, CheckCircle2, Home, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_QUESTIONS, Question as DefaultQuestion } from "@/data/questionsData";
import { prepareQuizQuestions, calculateQuizScore, formatTimeMMSS, QuestionItem } from "@/lib/quizUtils";

export default function Quiz() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const categoryParam = searchParams.get("category") || "All";
  const difficultyParam = searchParams.get("difficulty") || "All";
  const durationMinutes = parseInt(searchParams.get("duration") || "10", 10);
  const quizDurationSeconds = durationMinutes * 60;

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(quizDurationSeconds);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      let rawQuestions: QuestionItem[] = [];

      try {
        const { data, error } = await supabase.from("questions").select("*");
        if (!error && data && data.length > 0) {
          rawQuestions = data.map((q) => ({
            ...q,
            options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as unknown as string),
          }));
        }
      } catch (e) {
        console.warn("Supabase fetch questions error, using fallback questions:", e);
      }

      // If database didn't yield questions, use default questions bank
      if (rawQuestions.length === 0) {
        rawQuestions = DEFAULT_QUESTIONS;
      }

      const prepared = prepareQuizQuestions(rawQuestions, 10, categoryParam, difficultyParam);
      setQuestions(prepared);
      setLoading(false);
    };

    fetchQuestions();
  }, [categoryParam, difficultyParam]);

  const submitQuiz = useCallback(async () => {
    if (submitted || questions.length === 0) return;
    setSubmitted(true);

    const timeTaken = quizDurationSeconds - timeLeft;
    const calc = calculateQuizScore(questions, answers);
    const resultId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const resultPayload = {
      id: resultId,
      user_id: user?.id || "guest_user",
      score: calc.score,
      total_questions: calc.totalQuestions,
      correct_count: calc.correctCount,
      wrong_count: calc.wrongCount,
      answers: calc.answerDetails,
      time_taken: timeTaken,
      category: categoryParam,
      difficulty: difficultyParam,
      created_at: new Date().toISOString()
    };

    // Save to LocalStorage fallback first
    try {
      const existingLocal = JSON.parse(localStorage.getItem("quiz_local_results") || "[]");
      const updatedLocal = [resultPayload, ...existingLocal].slice(0, 20);
      localStorage.setItem("quiz_local_results", JSON.stringify(updatedLocal));
      localStorage.setItem(`quiz_result_${resultId}`, JSON.stringify(resultPayload));
    } catch (e) {
      console.warn("Error saving to localStorage:", e);
    }

    // Try saving to Supabase if logged in
    let finalId = resultId;
    if (user && user.id) {
      try {
        const { data, error } = await supabase.from("quiz_results").insert({
          user_id: user.id,
          score: calc.score,
          total_questions: calc.totalQuestions,
          correct_count: calc.correctCount,
          wrong_count: calc.wrongCount,
          answers: calc.answerDetails as unknown as any,
          time_taken: timeTaken
        }).select().single();

        if (!error && data?.id) {
          finalId = data.id;
          // Cache the supabase result locally too
          localStorage.setItem(`quiz_result_${finalId}`, JSON.stringify({ ...resultPayload, id: finalId }));
        }
      } catch (e) {
        console.warn("Error saving quiz result to Supabase:", e);
      }
    }

    toast({
      title: "Quiz Completed! 🎉",
      description: `You scored ${calc.score}% (${calc.correctCount}/${calc.totalQuestions} correct)`
    });

    navigate(`/results/${finalId}`);
  }, [submitted, questions, answers, quizDurationSeconds, timeLeft, user, categoryParam, difficultyParam, navigate, toast]);

  // Timer
  useEffect(() => {
    if (loading || submitted || questions.length === 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          submitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, submitted, questions.length, submitQuiz]);

  const handleLeave = () => {
    if (window.confirm("Are you sure you want to leave? Your quiz progress will be lost.")) {
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading Quiz Questions...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="card-glass max-w-md p-8 text-center rounded-2xl space-y-4">
          <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="font-display text-xl font-bold">No Questions Found</h2>
          <p className="text-sm text-muted-foreground">We couldn't find questions for the selected filters. Try another category or difficulty.</p>
          <Button onClick={() => navigate("/")} className="gradient-primary text-primary-foreground">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const current = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isLowTime = timeLeft < 60;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between card-glass p-4 rounded-2xl animate-fade-in">
          <Button variant="ghost" size="sm" onClick={handleLeave} className="text-muted-foreground hover:text-foreground">
            <Home className="mr-1.5 h-4 w-4" /> Exit
          </Button>

          <div className="flex items-center gap-3">
            {current.category && (
              <span className="hidden sm:inline-block bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full font-semibold">
                {current.category}
              </span>
            )}
            {current.difficulty && (
              <span className="hidden sm:inline-block bg-accent/10 text-accent text-xs px-2.5 py-1 rounded-full font-semibold">
                {current.difficulty}
              </span>
            )}
          </div>

          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-sm font-bold ${
            isLowTime ? "bg-destructive/15 text-destructive animate-pulse" : "bg-secondary text-foreground"
          }`}>
            <Clock className="h-4 w-4" />
            <span>{formatTimeMMSS(timeLeft)}</span>
          </div>
        </div>

        {/* Progress Bar & Question Counter */}
        <div className="space-y-2 animate-fade-in">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{answeredCount} of {questions.length} Answered</span>
          </div>
          <Progress value={progress} className="h-2.5 rounded-full" />
        </div>

        {/* Interactive Question Navigator Grid */}
        <div className="card-glass p-3 rounded-xl flex items-center gap-2 overflow-x-auto">
          {questions.map((q, idx) => {
            const isAnswered = answers[q.id] !== undefined;
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`h-8 w-8 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center justify-center ${
                  isCurrent
                    ? "ring-2 ring-primary ring-offset-2 gradient-primary text-primary-foreground"
                    : isAnswered
                    ? "bg-success/20 text-success border border-success/30"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
                title={`Question ${idx + 1}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Current Question Card */}
        <div className="card-elevated rounded-2xl p-6 md:p-8 animate-scale-in" key={current.id}>
          <div className="mb-6 flex items-start gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm shrink-0">
              {currentIndex + 1}
            </span>
            <h2 className="font-display text-lg md:text-xl font-bold text-foreground leading-snug pt-0.5">
              {current.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {current.options.map((option, i) => {
              const selected = answers[current.id] === i;
              return (
                <button
                  key={i}
                  onClick={() => setAnswers((prev) => ({ ...prev, [current.id]: i }))}
                  className={`w-full rounded-xl border-2 p-4 text-left transition-all duration-200 flex items-center justify-between ${
                    selected
                      ? "border-primary bg-primary/10 shadow-md ring-1 ring-primary"
                      : "border-border hover:border-primary/40 hover:bg-secondary/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold ${
                      selected ? "gradient-primary text-primary-foreground shadow-sm" : "bg-secondary text-secondary-foreground"
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-foreground font-medium text-sm md:text-base">{option}</span>
                  </div>
                  {selected && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="rounded-xl px-5"
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Previous
          </Button>

          {currentIndex === questions.length - 1 ? (
            <Button
              onClick={submitQuiz}
              className="gradient-primary text-primary-foreground hover:opacity-90 transition-opacity rounded-xl px-6 py-5 shadow-lg"
            >
              Submit Quiz <CheckCircle2 className="ml-1.5 h-5 w-5" />
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
              className="rounded-xl px-6"
            >
              Next Question <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
