import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../utils/api";
import ProductCard from "../components/common/ProductCard";
import toast from "react-hot-toast";

const CATEGORIES = [
  { name: "Games", icon: "🎮", color: "from-accent/20 to-accent-2/10" },
  { name: "Controllers", icon: "🕹️", color: "from-neon/20 to-accent/10" },
  { name: "Headsets", icon: "🎧", color: "from-purple-500/20 to-pink-500/10" },
  { name: "Keyboards", icon: "⌨️", color: "from-cyan-500/20 to-blue-500/10" },
  { name: "Mice", icon: "🖱️", color: "from-green-500/20 to-emerald-500/10" },
  { name: "GPUs", icon: "💻", color: "from-orange-500/20 to-red-500/10" },
  { name: "Monitors", icon: "🖥️", color: "from-yellow-500/20 to-orange-500/10" },
  { name: "Consoles", icon: "📺", color: "from-pink-500/20 to-rose-500/10" },
];

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/products?featured=true&limit=8")
      .then(({ data }) => setFeatured(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSeed = async () => {
    try {
      const { data } = await API.post("/auth/seed-admin");
      toast.success(`${data.message} | ${data.credentials?.email} / ${data.credentials?.password}`);
    } catch {}
    try {
      const token = localStorage.getItem("ps_token");
      if (token) {
        const { data } = await API.post("/products/seed");
        toast.success(data.message);
        window.location.reload();
      }
    } catch {}
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden scanlines">
        {/* BG */}
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent-2/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-48 h-48 bg-neon/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center animate-fade-up pt-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono mb-8 tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse-neon" />
            PRODIGY INFOTECH — TASK 03
          </div>

          <h1 className="font-display font-black text-5xl sm:text-7xl md:text-8xl tracking-widest mb-6 leading-none">
            <span className="text-white">PIXEL</span>
            <br />
            <span className="neon-text">STORE</span>
          </h1>

          <p className="text-dim text-lg sm:text-xl max-w-2xl mx-auto mb-10 font-sans leading-relaxed">
            Your ultimate destination for PC games, peripherals, and gaming gear.
            Level up your setup today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/products" className="btn-primary px-10 py-4 text-base font-bold tracking-wider">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              BROWSE STORE
            </Link>
            <Link to="/register" className="btn-neon px-10 py-4 text-base font-bold tracking-wider">
              JOIN NOW
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 sm:gap-16 mt-16">
            {[["500+", "Games"], ["50+", "Brands"], ["10K+", "Gamers"], ["24/7", "Support"]].map(([v, l]) => (
              <div key={l} className="text-center">
                <p className="font-display font-bold text-2xl sm:text-3xl text-white">{v}</p>
                <p className="text-dim text-xs sm:text-sm tracking-wider mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-9 border-2 border-dim rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-accent rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-accent text-xs font-mono tracking-widest mb-2">BROWSE BY</p>
            <h2 className="section-title">CATEGORIES</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {CATEGORIES.map(cat => (
              <Link key={cat.name} to={`/products?category=${cat.category || cat.name}`}
                className={`card-hover p-4 text-center bg-gradient-to-br ${cat.color} hover:scale-105 transition-transform`}>
                <div className="text-3xl mb-2">{cat.icon}</div>
                <p className="text-white text-xs font-semibold tracking-wide">{cat.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-4 bg-surface/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <p className="text-accent text-xs font-mono tracking-widest mb-2">HANDPICKED</p>
              <h2 className="section-title">FEATURED GEAR</h2>
            </div>
            <Link to="/products" className="btn-ghost hidden sm:flex">View All →</Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : featured.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-dim mb-6">No products yet.</p>
              <button onClick={handleSeed} className="btn-primary mx-auto w-auto px-8">
                🌱 Seed Sample Products
              </button>
              <p className="text-xs text-muted mt-2">Login as admin first, then click this button</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/products" className="btn-neon mx-auto w-auto px-10">VIEW ALL PRODUCTS</Link>
          </div>
        </div>
      </section>

      {/* Banner */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="card neon-border p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-accent-2/5" />
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-5xl font-bold text-white tracking-widest mb-4">
                FREE SHIPPING
              </h2>
              <p className="text-dim text-lg mb-8">On all orders above ₹999. Level up your gear today!</p>
              <Link to="/products" className="btn-primary mx-auto w-auto px-12 py-4 text-base font-bold">
                SHOP NOW
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="font-display font-bold text-xl text-white tracking-widest mb-2">
            PIXEL<span className="text-accent">STORE</span>
          </p>
          <p className="text-dim text-sm">Prodigy Infotech Full Stack Internship — Task 03</p>
          <p className="text-muted text-xs mt-4">© 2026 PixelStore. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
