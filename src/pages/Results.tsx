import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Trophy, XCircle, CheckCircle2, RotateCcw, Home, Clock } from "lucide-react";

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
}

export default function Results() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("quiz_results")
        .select("*")
        .eq("id", id)
        .single();
      if (data) {
        setResult({
          ...data,
          answers: data.answers as unknown as AnswerDetail[],
        });
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Result not found</p>
      </div>
    );
  }

  const passed = result.score >= 60;
  const minutes = Math.floor(result.time_taken / 60);
  const seconds = result.time_taken % 60;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        {/* Score Card */}
        <div className="card-elevated rounded-2xl p-8 text-center mb-8 animate-scale-in">
          <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${passed ? "bg-success/10" : "bg-destructive/10"}`}>
            {passed ? (
              <Trophy className="h-10 w-10 text-success" />
            ) : (
              <XCircle className="h-10 w-10 text-destructive" />
            )}
          </div>

          <h1 className="font-display text-3xl font-bold text-foreground mb-1">
            {passed ? "Congratulations! 🎉" : "Keep Trying! 💪"}
          </h1>
          <p className="text-muted-foreground mb-6">
            {passed ? "You passed the quiz!" : "You didn't pass this time. Try again!"}
          </p>

          <div className="text-5xl font-display font-bold gradient-text mb-6">{result.score}%</div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-xl bg-secondary p-3">
              <p className="text-2xl font-bold text-foreground">{result.total_questions}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="rounded-xl bg-success/10 p-3">
              <p className="text-2xl font-bold text-success">{result.correct_count}</p>
              <p className="text-xs text-muted-foreground">Correct</p>
            </div>
            <div className="rounded-xl bg-destructive/10 p-3">
              <p className="text-2xl font-bold text-destructive">{result.wrong_count}</p>
              <p className="text-xs text-muted-foreground">Wrong</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Time: {minutes}m {seconds}s
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center mb-8 animate-fade-in">
          <Button variant="outline" onClick={() => navigate("/")}>
            <Home className="mr-2 h-4 w-4" /> Dashboard
          </Button>
          <Button onClick={() => navigate("/quiz")} className="gradient-primary text-primary-foreground hover:opacity-90 transition-opacity">
            <RotateCcw className="mr-2 h-4 w-4" /> Retake Quiz
          </Button>
        </div>

        {/* Answer Review */}
        <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">Answer Review</h2>
          <div className="space-y-4">
            {result.answers.map((a, idx) => (
              <div key={idx} className="card-glass rounded-xl p-5">
                <div className="flex items-start gap-3 mb-3">
                  {a.isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                  )}
                  <p className="font-medium text-foreground">{idx + 1}. {a.question}</p>
                </div>
                <div className="ml-8 space-y-1.5">
                  {a.options.map((opt, i) => {
                    const isCorrect = i === a.correctAnswer;
                    const isUserAnswer = i === a.userAnswer;
                    const isWrong = isUserAnswer && !isCorrect;
                    return (
                      <div
                        key={i}
                        className={`rounded-lg px-3 py-2 text-sm ${
                          isCorrect ? "bg-success/10 text-success font-medium" : isWrong ? "bg-destructive/10 text-destructive" : "text-muted-foreground"
                        }`}
                      >
                        {String.fromCharCode(65 + i)}. {opt}
                        {isCorrect && " ✓"}
                        {isWrong && " ✗"}
                        {isUserAnswer && !isCorrect && <span className="text-xs ml-1">(your answer)</span>}
                      </div>
                    );
                  })}
                  {a.userAnswer === -1 && (
                    <p className="text-xs text-muted-foreground italic">Not answered</p>
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
