import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, Routes, Route } from "react-router-dom";
import API from "../utils/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

// ── Admin Sidebar ──────────────────────────────────────────────
const AdminSidebar = ({ onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const links = [
    { to: "/admin", label: "Dashboard", icon: "📊" },
    { to: "/admin/products", label: "Products", icon: "🎮" },
    { to: "/admin/orders", label: "Orders", icon: "📦" },
    { to: "/admin/add-product", label: "Add Product", icon: "➕" },
  ];
  return (
    <aside className="w-56 bg-surface border-r border-border flex flex-col h-full">
      <div className="p-5 border-b border-border">
        <Link to="/" className="font-display font-bold text-white tracking-widest text-sm">PIXEL<span className="text-accent">STORE</span></Link>
        <p className="text-dim text-xs mt-0.5">Admin Panel</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end={l.to === "/admin"}
            onClick={onClose}
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-accent/10 text-accent border border-accent/20" : "text-dim hover:text-white hover:bg-border"}`}>
            <span>{l.icon}</span>{l.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-border">
        <button onClick={() => { logout(); navigate("/"); }} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-danger hover:bg-border w-full">
          🚪 Logout
        </button>
      </div>
    </aside>
  );
};

// ── Admin Stats Dashboard ──────────────────────────────────────
const AdminHome = () => {
  const [stats, setStats] = useState(null);
  const [orderStats, setOrderStats] = useState(null);

  useEffect(() => {
    Promise.all([API.get("/products/stats"), API.get("/orders/admin/stats")])
      .then(([p, o]) => { setStats(p.data.stats); setOrderStats(o.data.stats); })
      .catch(() => {});
  }, []);

  const handleSeedProducts = async () => {
    try {
      const { data } = await API.post("/products/seed");
      toast.success(data.message);
      window.location.reload();
    } catch (err) { toast.error(err.response?.data?.message || "Seed failed"); }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <button onClick={handleSeedProducts} className="btn-ghost text-xs">🌱 Seed Sample Products</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Products", value: stats?.total ?? "—", icon: "🎮", color: "text-accent" },
          { label: "Out of Stock", value: stats?.outOfStock ?? "—", icon: "⚠️", color: "text-warning" },
          { label: "Total Orders", value: orderStats?.total ?? "—", icon: "📦", color: "text-neon" },
          { label: "Revenue", value: orderStats?.revenue ? `₹${Math.round(orderStats.revenue / 1000)}K` : "—", icon: "💰", color: "text-success" },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <p className="text-xs text-dim uppercase tracking-wider mb-2">{s.label}</p>
            <div className="flex items-center justify-between">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <span className="text-2xl">{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Top selling */}
      {stats?.topSelling?.length > 0 && (
        <div className="card p-5">
          <h2 className="text-white font-bold mb-4 text-sm">Top Selling Products</h2>
          <div className="space-y-3">
            {stats.topSelling.map(p => (
              <div key={p._id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface flex-shrink-0">
                  {p.images?.[0] ? <img src={p.images[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-sm">🎮</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{p.name}</p>
                  <p className="text-dim text-xs">{p.sold} sold</p>
                </div>
                <p className="text-white font-mono text-sm">₹{p.price.toLocaleString("en-IN")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent orders */}
      {orderStats?.recent?.length > 0 && (
        <div className="card p-5">
          <h2 className="text-white font-bold mb-4 text-sm">Recent Orders</h2>
          <div className="space-y-2">
            {orderStats.recent.map(o => (
              <Link key={o._id} to={`/orders/${o._id}`} className="flex items-center justify-between py-2 hover:opacity-75 transition-opacity">
                <div>
                  <p className="text-accent font-mono text-xs">#{o.orderId}</p>
                  <p className="text-dim text-xs">{o.user?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-mono text-sm">₹{o.totalPrice.toLocaleString("en-IN")}</p>
                  <p className="text-dim text-xs">{o.orderStatus}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Admin Products List ─────────────────────────────────────────
const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetch = async () => {
    setLoading(true);
    try { const { data } = await API.get("/products?limit=50"); setProducts(data.data); }
    catch { } finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try { await API.delete(`/products/${id}`); toast.success("Deleted!"); fetch(); }
    catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Products ({products.length})</h1>
        <Link to="/admin/add-product" className="btn-primary text-sm py-2">+ Add Product</Link>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-surface border-b border-border">
              <tr>{["Product", "Category", "Price", "Stock", "Actions"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-dim uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={5} className="text-center py-10 text-dim">Loading...</td></tr>
                : products.map(p => (
                  <tr key={p._id} className="border-b border-border/50 hover:bg-surface/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface flex-shrink-0">
                          {p.images?.[0] ? <img src={p.images[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-sm">🎮</div>}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium line-clamp-1">{p.name}</p>
                          <p className="text-dim text-xs">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-dim text-sm">{p.category}</td>
                    <td className="px-4 py-3 text-white font-mono text-sm">₹{p.price.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <span className={`badge border text-xs ${p.stock === 0 ? "bg-danger/10 text-danger border-danger/20" : p.stock <= 5 ? "bg-warning/10 text-warning border-warning/20" : "bg-success/10 text-success border-success/20"}`}>
                        {p.stock === 0 ? "Out" : p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/admin/edit-product/${p._id}`)} className="p-1.5 rounded-lg hover:bg-warning/10 text-dim hover:text-warning transition-colors" title="Edit">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleDelete(p._id, p.name)} className="p-1.5 rounded-lg hover:bg-danger/10 text-dim hover:text-danger transition-colors" title="Delete">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ── Admin Orders ────────────────────────────────────────────────
const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try { const { data } = await API.get("/orders/admin/all"); setOrders(data.data); }
    catch { } finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const updateStatus = async (id, status) => {
    try { await API.put(`/orders/${id}/status`, { orderStatus: status }); toast.success("Status updated!"); fetch(); }
    catch (err) { toast.error("Failed"); }
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <h1 className="text-lg font-bold text-white">All Orders ({orders.length})</h1>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-surface border-b border-border">
              <tr>{["Order ID", "Customer", "Total", "Payment", "Status", "Update"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-dim uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="text-center py-10 text-dim">Loading...</td></tr>
                : orders.map(o => (
                  <tr key={o._id} className="border-b border-border/50 hover:bg-surface/50">
                    <td className="px-4 py-3 font-mono text-accent text-xs">#{o.orderId}</td>
                    <td className="px-4 py-3"><p className="text-white text-sm">{o.user?.name}</p><p className="text-dim text-xs">{o.user?.email}</p></td>
                    <td className="px-4 py-3 text-white font-mono text-sm">₹{o.totalPrice.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-dim text-sm">{o.paymentMethod}</td>
                    <td className="px-4 py-3">
                      <span className={`badge border text-xs ${o.orderStatus === "Delivered" ? "bg-success/10 text-success border-success/20" : o.orderStatus === "Cancelled" ? "bg-danger/10 text-danger border-danger/20" : "bg-warning/10 text-warning border-warning/20"}`}>{o.orderStatus}</span>
                    </td>
                    <td className="px-4 py-3">
                      <select value={o.orderStatus} onChange={e => updateStatus(o._id, e.target.value)}
                        className="bg-surface border border-border text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-accent">
                        {["Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ── Add/Edit Product Form ───────────────────────────────────────
const CATEGORIES = ["Games", "Controllers", "Headsets", "Keyboards", "Mice", "Monitors", "GPUs", "Consoles", "Accessories", "Gift Cards"];

export const ProductForm = ({ editId }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!editId);
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({
    name: "", description: "", price: "", originalPrice: "", category: "Games",
    brand: "", stock: "", platform: "", tags: "", featured: false,
  });

  useEffect(() => {
    if (!editId) return;
    API.get(`/products/${editId}`).then(({ data }) => {
      const p = data.data;
      setForm({ name: p.name, description: p.description, price: p.price, originalPrice: p.originalPrice || "", category: p.category, brand: p.brand, stock: p.stock, platform: p.platform || "", tags: p.tags?.join(", ") || "", featured: p.featured });
    }).finally(() => setFetching(false));
  }, [editId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (form.tags) fd.set("tags", form.tags.split(",").map(t => t.trim()).join(","));
      images.forEach(img => fd.append("images", img));
      if (editId) {
        await API.put(`/products/${editId}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Product updated!");
      } else {
        await API.post("/products", fd, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Product created!");
      }
      navigate("/admin/products");
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); } finally { setLoading(false); }
  };

  if (fetching) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-2xl animate-fade-up">
      <h1 className="text-lg font-bold text-white mb-6">{editId ? "Edit" : "Add"} Product</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-5 space-y-4">
          <div><label className="label">Product Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" placeholder="Elden Ring GOTY" required /></div>
          <div><label className="label">Description *</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input resize-none" rows={3} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Price (₹) *</label><input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="input" required /></div>
            <div><label className="label">Original Price (₹)</label><input type="number" value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: e.target.value })} className="input" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category *</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="label">Brand *</label><input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} className="input" placeholder="CD Projekt Red" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Stock *</label><input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="input" required /></div>
            <div><label className="label">Platform</label><input value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} className="input" placeholder="PC, PS5, Xbox" /></div>
          </div>
          <div><label className="label">Tags (comma separated)</label><input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="input" placeholder="RPG, Open World, Action" /></div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="featured" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 accent-violet-500" />
            <label htmlFor="featured" className="text-sm text-dim">Mark as Featured</label>
          </div>
          <div>
            <label className="label">Product Images</label>
            <input type="file" multiple accept="image/*" onChange={e => setImages(Array.from(e.target.files))} className="input py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-accent/20 file:text-accent file:text-xs" />
            {images.length > 0 && <p className="text-xs text-dim mt-1">{images.length} image(s) selected</p>}
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate("/admin/products")} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading ? "Saving..." : editId ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

// ── Admin Layout wrapper ────────────────────────────────────────
const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { id } = { id: undefined };

  return (
    <div className="min-h-screen pt-16 flex">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <div className={`fixed top-16 left-0 h-[calc(100vh-4rem)] z-30 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <AdminSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main */}
      <div className="flex-1 lg:ml-56 p-4 lg:p-6 min-w-0">
        {/* Mobile menu btn */}
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden mb-4 btn-ghost py-2 px-3 text-sm">☰ Menu</button>
        <Routes>
          <Route path="/" element={<AdminHome />} />
          <Route path="/products" element={<AdminProducts />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/add-product" element={<ProductForm />} />
          <Route path="/edit-product/:id" element={<EditProductWrapper />} />
        </Routes>
      </div>
    </div>
  );
};

const EditProductWrapper = () => {
  const { id } = require("react-router-dom").useParams();
  return <ProductForm editId={id} />;
};

export default AdminDashboard;
