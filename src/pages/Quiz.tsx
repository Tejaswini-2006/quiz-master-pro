import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
}

const QUIZ_DURATION = 600; // 10 minutes in seconds

export default function Quiz() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase.from("questions").select("*");
      if (error || !data) {
        toast({ title: "Failed to load questions", variant: "destructive" });
        return;
      }
      // Shuffle
      const shuffled = [...data]
        .sort(() => Math.random() - 0.5)
        .slice(0, 10)
        .map((q) => ({
          ...q,
          options: q.options as string[],
        }));
      setQuestions(shuffled);
      setLoading(false);
    };
    fetchQuestions();
  }, []);

  const submitQuiz = useCallback(async () => {
    if (submitted || questions.length === 0) return;
    setSubmitted(true);

    let correctCount = 0;
    const answerDetails = questions.map((q) => {
      const userAnswer = answers[q.id] ?? -1;
      const isCorrect = userAnswer === q.correct_answer;
      if (isCorrect) correctCount++;
      return {
        questionId: q.id,
        question: q.question,
        options: q.options,
        userAnswer,
        correctAnswer: q.correct_answer,
        isCorrect,
      };
    });

    const result = {
      user_id: user!.id,
      score: Math.round((correctCount / questions.length) * 100),
      total_questions: questions.length,
      correct_count: correctCount,
      wrong_count: questions.length - correctCount,
      answers: answerDetails,
      time_taken: QUIZ_DURATION - timeLeft,
    };

    const { data, error } = await supabase.from("quiz_results").insert(result).select().single();
    if (error) {
      toast({ title: "Failed to save results", variant: "destructive" });
      return;
    }
    navigate(`/results/${data.id}`);
  }, [submitted, questions, answers, timeLeft, user, navigate, toast]);

  // Timer
  useEffect(() => {
    if (loading || submitted) return;
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
  }, [loading, submitted, submitQuiz]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const current = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft < 60;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        {/* Timer & Progress */}
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className={`flex items-center gap-1 text-sm font-bold ${isLowTime ? "text-destructive animate-pulse-soft" : "text-foreground"}`}>
              <Clock className="h-4 w-4" />
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <div className="card-elevated rounded-2xl p-6 md:p-8 mb-6 animate-scale-in" key={current.id}>
          <h2 className="font-display text-lg md:text-xl font-bold text-foreground mb-6">{current.question}</h2>

          <div className="space-y-3">
            {current.options.map((option, i) => {
              const selected = answers[current.id] === i;
              return (
                <button
                  key={i}
                  onClick={() => setAnswers((prev) => ({ ...prev, [current.id]: i }))}
                  className={`w-full rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                    selected
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/40 hover:bg-secondary/50"
                  }`}
                >
                  <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-sm font-semibold mr-3 ${
                    selected ? "gradient-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-foreground">{option}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between animate-fade-in">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Previous
          </Button>

          {currentIndex === questions.length - 1 ? (
            <Button
              onClick={submitQuiz}
              className="gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <AlertTriangle className="mr-1 h-4 w-4" /> Submit Quiz
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
            >
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
