import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../utils/api";
import ProductCard from "../components/common/ProductCard";

const CATEGORIES = ["Games", "Controllers", "Headsets", "Keyboards", "Mice", "Monitors", "GPUs", "Consoles", "Accessories", "Gift Cards"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "popular", label: "Most Popular" },
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sort, setSort] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12, sort });
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      const { data } = await API.get(`/products?${params}`);
      setProducts(data.data);
      setPagination(data.pagination);
    } catch { } finally { setLoading(false); }
  }, [page, search, category, sort, minPrice, maxPrice]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { const t = setTimeout(() => setPage(1), 400); return () => clearTimeout(t); }, [search]);

  const clearFilters = () => { setCategory(""); setMinPrice(""); setMaxPrice(""); setSort("newest"); setSearch(""); setPage(1); };

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-semibold text-dim uppercase tracking-wider mb-3">Categories</h3>
        <div className="space-y-1">
          <button onClick={() => { setCategory(""); setPage(1); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!category ? "bg-accent/10 text-accent border border-accent/20" : "text-dim hover:text-white hover:bg-border"}`}>
            All Products
          </button>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => { setCategory(c); setPage(1); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${category === c ? "bg-accent/10 text-accent border border-accent/20" : "text-dim hover:text-white hover:bg-border"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-dim uppercase tracking-wider mb-3">Price Range (₹)</h3>
        <div className="flex gap-2">
          <input value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min" className="input py-2 text-sm" type="number" />
          <input value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max" className="input py-2 text-sm" type="number" />
        </div>
        <button onClick={() => setPage(1)} className="btn-primary w-full mt-2 py-2 text-sm">Apply</button>
      </div>

      <button onClick={clearFilters} className="btn-ghost w-full justify-center text-sm">Clear All</button>
    </div>
  );

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
          <div>
            <h1 className="section-title">GAME STORE</h1>
            <p className="text-dim text-sm mt-1">{pagination.total} products found</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)} className="input pl-9 py-2.5" placeholder="Search games, gear..." />
            </div>
            {/* Sort */}
            <select value={sort} onChange={e => setSort(e.target.value)} className="input py-2.5 w-44">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {/* Mobile filter btn */}
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden btn-ghost py-2.5 px-3">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filter — desktop */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="card p-5 sticky top-20"><FilterPanel /></div>
          </aside>

          {/* Mobile filter overlay */}
          {sidebarOpen && (
            <>
              <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setSidebarOpen(false)} />
              <div className="fixed left-0 top-0 h-full w-72 bg-surface border-r border-border z-50 p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-bold text-white">Filters</h2>
                  <button onClick={() => setSidebarOpen(false)} className="text-dim hover:text-white"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
                <FilterPanel />
              </div>
            </>
          )}

          {/* Products grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-4">🎮</p>
                <p className="text-white font-semibold mb-2">No products found</p>
                <p className="text-dim text-sm">Try different filters</p>
                <button onClick={clearFilters} className="btn-primary mx-auto mt-4 w-auto px-6">Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-ghost py-2 px-4 disabled:opacity-40">← Prev</button>
                    <span className="flex items-center px-4 text-sm text-dim">{page} / {pagination.pages}</span>
                    <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} className="btn-ghost py-2 px-4 disabled:opacity-40">Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
