import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Trophy, Clock, LogOut, PlayCircle, BarChart2, CheckCircle, Flame, Layers, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface QuizResult {
  id: string;
  score: number;
  total_questions: number;
  correct_count: number;
  wrong_count?: number;
  time_taken?: number;
  created_at: string;
  category?: string;
  difficulty?: string;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [profileName, setProfileName] = useState<string>("User");
  const [category, setCategory] = useState<string>("All");
  const [difficulty, setDifficulty] = useState<string>("All");
  const [duration, setDuration] = useState<string>("10"); // in minutes

  useEffect(() => {
    const fetchData = async () => {
      let displayName = user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
      
      if (user) {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("name")
            .eq("user_id", user.id)
            .maybeSingle();
          if (profile?.name) displayName = profile.name;
        } catch (e) {
          console.warn("Failed to fetch profile:", e);
        }
      }
      setProfileName(displayName);

      // Try fetching from Supabase
      let fetchedResults: QuizResult[] = [];
      if (user) {
        try {
          const { data } = await supabase
            .from("quiz_results")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(10);
          if (data && data.length > 0) {
            fetchedResults = data;
          }
        } catch (e) {
          console.warn("Failed to fetch Supabase results:", e);
        }
      }

      // Check LocalStorage fallback results
      try {
        const localResults: QuizResult[] = JSON.parse(localStorage.getItem("quiz_local_results") || "[]");
        if (localResults.length > 0) {
          const combined = [...fetchedResults, ...localResults];
          // Remove duplicates by ID
          const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
          unique.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setResults(unique.slice(0, 10));
          return;
        }
      } catch (e) {
        console.warn("Error reading local results:", e);
      }

      setResults(fetchedResults);
    };

    fetchData();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleStartQuiz = () => {
    const queryParams = new URLSearchParams({
      category,
      difficulty,
      duration
    });
    navigate(`/quiz?${queryParams.toString()}`);
  };

  // Stats calculation
  const totalTaken = results.length;
  const bestScore = totalTaken > 0 ? Math.max(...results.map(r => r.score)) : 0;
  const avgScore = totalTaken > 0 ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / totalTaken) : 0;
  const passedCount = results.filter(r => r.score >= 60).length;
  const passRate = totalTaken > 0 ? Math.round((passedCount / totalTaken) * 100) : 0;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary shadow-lg">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Quiz Master Pro</h1>
              <p className="text-sm text-muted-foreground">Welcome back, <span className="font-semibold text-foreground">{profileName}</span> 👋</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: "0.05s" }}>
          <div className="card-glass rounded-2xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <BarChart2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Quizzes</p>
              <p className="text-xl font-bold text-foreground">{totalTaken}</p>
            </div>
          </div>

          <div className="card-glass rounded-2xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <Flame className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Best Score</p>
              <p className="text-xl font-bold text-foreground">{bestScore}%</p>
            </div>
          </div>

          <div className="card-glass rounded-2xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Average Score</p>
              <p className="text-xl font-bold text-foreground">{avgScore}%</p>
            </div>
          </div>

          <div className="card-glass rounded-2xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <Trophy className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pass Rate</p>
              <p className="text-xl font-bold text-foreground">{passRate}%</p>
            </div>
          </div>
        </div>

        {/* Start Quiz Card */}
        <div className="card-elevated rounded-2xl p-6 md:p-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                <PlayCircle className="h-6 w-6 text-primary" /> Ready for a Quiz Challenge?
              </h2>
              <p className="text-muted-foreground">
                Customize your quiz parameters below and test your knowledge.
              </p>
            </div>

            {/* Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" /> Category
                </label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    <SelectItem value="Web Development">Web Development</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="General Knowledge">General Knowledge</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5" /> Difficulty
                </label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Difficulties</SelectItem>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Duration
                </label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Time Limit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Minutes</SelectItem>
                    <SelectItem value="10">10 Minutes</SelectItem>
                    <SelectItem value="15">15 Minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border">
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <Clock className="h-3.5 w-3.5 text-primary" /> {duration} min time limit
                </span>
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <BookOpen className="h-3.5 w-3.5 text-accent" /> 10 Multiple-Choice Questions
                </span>
              </div>

              <Button
                size="lg"
                onClick={handleStartQuiz}
                className="w-full sm:w-auto gradient-primary text-primary-foreground hover:opacity-90 transition-opacity text-base px-8 py-6 rounded-xl shadow-md"
              >
                <PlayCircle className="mr-2 h-5 w-5" /> Start Quiz Now
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Results */}
        <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" /> Recent Quiz Results
            </h3>
            {results.length > 0 && (
              <span className="text-xs text-muted-foreground">Showing last {results.length} attempts</span>
            )}
          </div>

          {results.length === 0 ? (
            <div className="card-glass rounded-2xl p-8 text-center border border-dashed border-border">
              <div className="mx-auto h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                <Trophy className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">No quizzes taken yet</p>
              <p className="text-sm text-muted-foreground mt-1">Start your first quiz challenge to build your score history!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((r) => {
                const totalQ = r.total_questions || 10;
                const pct = r.score !== undefined ? r.score : Math.round((r.correct_count / totalQ) * 100);
                const passed = pct >= 60;
                return (
                  <div
                    key={r.id}
                    onClick={() => navigate(`/results/${r.id}`)}
                    className="card-glass rounded-xl p-4 flex items-center justify-between hover:border-primary/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm ${passed ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                        {pct}%
                      </div>
                      <div>
                        <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {r.correct_count} of {totalQ} Correct
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span>{new Date(r.created_at).toLocaleDateString()} at {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {r.category && <span className="bg-secondary px-2 py-0.5 rounded text-[10px] font-medium text-secondary-foreground">{r.category}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${passed ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                        {passed ? "Passed" : "Needs Review"}
                      </span>
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
