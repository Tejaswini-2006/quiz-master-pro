import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { BookOpen, Trophy, Clock, LogOut, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface QuizResult {
  id: string;
  score: number;
  total_questions: number;
  correct_count: number;
  created_at: string;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [profileName, setProfileName] = useState("User");

  useEffect(() => {
    const fetchData = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("user_id", user?.id)
        .single();
      if (profile) setProfileName(profile.name);

      const { data } = await supabase
        .from("quiz_results")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (data) setResults(data);
    };
    if (user) fetchData();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">QuizMaster</h1>
              <p className="text-xs text-muted-foreground">Welcome, {profileName}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </header>

        {/* Start Quiz Card */}
        <div className="card-elevated rounded-2xl p-8 mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">Ready for a Challenge?</h2>
              <p className="text-muted-foreground">Test your knowledge with 10 multiple-choice questions. You have 10 minutes to complete the quiz.</p>
              <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> 10 minutes</span>
                <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> 10 questions</span>
              </div>
            </div>
            <Button 
              size="lg" 
              onClick={() => navigate("/quiz")} 
              className="gradient-primary text-primary-foreground hover:opacity-90 transition-opacity whitespace-nowrap text-base px-8"
            >
              <PlayCircle className="mr-2 h-5 w-5" /> Start Quiz
            </Button>
          </div>
        </div>

        {/* Recent Results */}
        <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-accent" /> Recent Results
          </h3>
          {results.length === 0 ? (
            <div className="card-glass rounded-xl p-8 text-center">
              <p className="text-muted-foreground">No quizzes taken yet. Start your first quiz!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((r) => {
                const pct = Math.round((r.correct_count / r.total_questions) * 100);
                const passed = pct >= 60;
                return (
                  <div key={r.id} className="card-glass rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{r.correct_count}/{r.total_questions} correct</p>
                      <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className={`rounded-full px-3 py-1 text-sm font-semibold ${passed ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                      {pct}%
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
