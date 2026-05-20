import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";
import toast from "react-hot-toast";

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const { data } = await API.post("/auth/seed-admin");
      toast.success(`${data.message} | ${data.credentials.email} / ${data.credentials.password}`);
    } catch { toast.error("Seed failed"); } finally { setSeeding(false); }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="fixed top-0 right-0 w-96 h-96 bg-accent/8 rounded-full blur-3xl pointer-events-none" />
      <div className="w-full max-w-md relative z-10 animate-fade-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block font-display font-bold text-2xl tracking-widest text-white mb-2">
            PIXEL<span className="text-accent">STORE</span>
          </Link>
          <p className="text-dim text-sm">Sign in to your account</p>
        </div>
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input" placeholder="gamer@example.com" required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={show ? "text" : "password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input pr-10" placeholder="Your password" required />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-dim">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={show ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} /></svg>
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <div className="mt-5 pt-5 border-t border-border">
            <p className="text-xs text-dim text-center mb-3">First time? Create default admin:</p>
            <button onClick={handleSeed} disabled={seeding} className="btn-ghost w-full justify-center text-xs">
              {seeding ? "Creating..." : "🌱 Seed Admin (admin@pixelstore.com / admin123)"}
            </button>
          </div>
          <p className="mt-4 text-center text-sm text-dim">
            No account? <Link to="/register" className="text-accent hover:underline">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success("Account created! Welcome to PixelStore!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md relative z-10 animate-fade-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block font-display font-bold text-2xl tracking-widest text-white mb-2">
            PIXEL<span className="text-accent">STORE</span>
          </Link>
          <p className="text-dim text-sm">Create your gamer account</p>
        </div>
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" placeholder="John Doe" required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input" placeholder="gamer@example.com" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input" placeholder="Min. 6 characters" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? "Creating account..." : "Create Account 🎮"}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-dim">
            Have an account? <Link to="/login" className="text-accent hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
