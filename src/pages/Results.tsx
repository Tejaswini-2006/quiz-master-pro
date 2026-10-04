import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Trophy, XCircle, CheckCircle2, RotateCcw, Home, Clock, Sparkles } from "lucide-react";
import { formatTimeHuman } from "@/lib/quizUtils";

interface AnswerDetail {
  questionId: string;
  question: string;
  options: string[];
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
}

interface Result {
  id: string;
  score: number;
  total_questions: number;
  correct_count: number;
  wrong_count: number;
  answers: AnswerDetail[];
  time_taken: number;
  created_at: string;
  category?: string;
  difficulty?: string;
}

export default function Results() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      setLoading(true);

      // 1. Try LocalStorage fallback first if present
      if (id) {
        try {
          const cachedSingle = localStorage.getItem(`quiz_result_${id}`);
          if (cachedSingle) {
            setResult(JSON.parse(cachedSingle));
            setLoading(false);
            return;
          }

          const localResults: Result[] = JSON.parse(localStorage.getItem("quiz_local_results") || "[]");
          const foundLocal = localResults.find((r) => r.id === id);
          if (foundLocal) {
            setResult(foundLocal);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn("Error reading local cached result:", e);
        }

        // 2. Try Supabase
        try {
          const { data, error } = await supabase
            .from("quiz_results")
            .select("*")
            .eq("id", id)
            .maybeSingle();

          if (!error && data) {
            setResult({
              ...data,
              answers: data.answers as unknown as AnswerDetail[],
            });
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn("Supabase fetch result error:", e);
        }
      }

      setLoading(false);
    };

    fetchResult();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading Results...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="card-glass rounded-2xl p-8 max-w-md text-center space-y-4">
          <XCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="font-display text-xl font-bold">Result Not Found</h2>
          <p className="text-sm text-muted-foreground">We couldn't find the quiz score report for ID: {id}</p>
          <Button onClick={() => navigate("/")} className="gradient-primary text-primary-foreground">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const passed = result.score >= 60;
  const unansweredCount = Math.max(0, result.total_questions - (result.correct_count + result.wrong_count));

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Score Card */}
        <div className="card-elevated rounded-2xl p-8 text-center animate-scale-in relative overflow-hidden">
          <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl shadow-inner ${
            passed ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
          }`}>
            {passed ? (
              <Trophy className="h-10 w-10 text-success" />
            ) : (
              <XCircle className="h-10 w-10 text-destructive" />
            )}
          </div>

          <h1 className="font-display text-3xl font-bold text-foreground mb-1">
            {passed ? "Congratulations! 🎉" : "Keep Learning! 💪"}
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            {passed ? "Great job! You successfully passed the quiz." : "Don't worry! Review your answers below and try again."}
          </p>

          <div className="text-6xl font-display font-extrabold gradient-text mb-6 tracking-tight">
            {result.score}%
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-secondary p-3">
              <p className="text-2xl font-bold text-foreground">{result.total_questions}</p>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-0.5">Total</p>
            </div>
            <div className="rounded-xl bg-success/10 p-3">
              <p className="text-2xl font-bold text-success">{result.correct_count}</p>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-0.5">Correct</p>
            </div>
            <div className="rounded-xl bg-destructive/10 p-3">
              <p className="text-2xl font-bold text-destructive">{result.wrong_count}</p>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-0.5">Wrong</p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground font-medium">
            <Clock className="h-4 w-4 text-primary" />
            <span>Completion Time: {formatTimeHuman(result.time_taken || 0)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in">
          <Button variant="outline" onClick={() => navigate("/")} className="rounded-xl py-5 px-6">
            <Home className="mr-2 h-4 w-4" /> Go to Dashboard
          </Button>
          <Button onClick={() => navigate("/quiz")} className="gradient-primary text-primary-foreground rounded-xl py-5 px-6 shadow-md hover:opacity-90">
            <RotateCcw className="mr-2 h-4 w-4" /> Retake Quiz
          </Button>
        </div>

        {/* Answer Review Section */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" /> Answer Breakdown & Review
            </h2>
            <span className="text-xs text-muted-foreground">{result.correct_count}/{result.total_questions} Correct</span>
          </div>

          <div className="space-y-4">
            {result.answers && result.answers.map((a, idx) => (
              <div key={idx} className="card-glass rounded-2xl p-5 md:p-6 border border-border">
                <div className="flex items-start gap-3 mb-4">
                  {a.isCorrect ? (
                    <div className="h-6 w-6 rounded-full bg-success/15 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    </div>
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-destructive/15 flex items-center justify-center shrink-0 mt-0.5">
                      <XCircle className="h-4 w-4 text-destructive" />
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Question {idx + 1}
                    </span>
                    <p className="font-bold text-foreground text-base mt-0.5 leading-snug">
                      {a.question}
                    </p>
                  </div>
                </div>

                <div className="pl-9 space-y-2">
                  {a.options.map((opt, i) => {
                    const isCorrect = i === a.correctAnswer;
                    const isUserAnswer = i === a.userAnswer;
                    const isWrong = isUserAnswer && !isCorrect;

                    let bgClass = "bg-secondary/40 text-muted-foreground border-transparent";
                    if (isCorrect) bgClass = "bg-success/15 text-success font-medium border-success/30";
                    if (isWrong) bgClass = "bg-destructive/15 text-destructive font-medium border-destructive/30";

                    return (
                      <div
                        key={i}
                        className={`rounded-xl px-4 py-2.5 text-sm border transition-all flex items-center justify-between ${bgClass}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-xs opacity-75">
                            {String.fromCharCode(65 + i)}.
                          </span>
                          <span>{opt}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold">
                          {isCorrect && <span className="text-success flex items-center gap-1">Correct Option ✓</span>}
                          {isWrong && <span className="text-destructive flex items-center gap-1">Your Answer ✗</span>}
                          {isUserAnswer && isCorrect && <span className="text-success text-[10px] bg-success/20 px-2 py-0.5 rounded-full">Selected</span>}
                        </div>
                      </div>
                    );
                  })}

                  {a.userAnswer === -1 && (
                    <p className="text-xs text-amber-500 italic mt-1 font-medium">
                      ⚠️ You did not select an answer for this question.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
