import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Mail, Lock, User, UserCheck, ArrowRight } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp, signInAsGuest } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || password.length < 6) {
      toast({ title: "Please fill all fields correctly", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, name);
    setLoading(false);
    if (error) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome! 🎉", description: "Account created successfully" });
      navigate("/");
    }
  };

  const handleGuestLogin = () => {
    signInAsGuest("Guest Champion");
    toast({ title: "Signed in as Guest", description: "Enjoy testing Quiz Master Pro!" });
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="card-elevated rounded-2xl p-8 shadow-2xl border border-border">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-lg">
              <BookOpen className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">Create Your Account</h1>
            <p className="mt-1 text-sm text-muted-foreground">Join Quiz Master Pro to start taking custom quizzes</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="name" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} className="pl-10" required minLength={6} />
              </div>
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity py-5 rounded-xl shadow-md" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
            <span className="relative bg-card px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">or</span>
          </div>

          <Button
            variant="outline"
            onClick={handleGuestLogin}
            className="w-full py-5 rounded-xl border-dashed border-primary/50 text-foreground hover:bg-primary/5 flex items-center justify-center gap-2"
          >
            <UserCheck className="h-4 w-4 text-primary" /> Continue as Guest <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
