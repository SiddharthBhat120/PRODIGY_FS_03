import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../utils/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Stars = ({ rating, size = "sm" }) => {
  const sz = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <svg key={s} className={`${sz} ${s <= Math.round(rating) ? "text-gold" : "text-muted"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    API.get(`/products/${id}`)
      .then(({ data }) => setProduct(data.data))
      .catch(() => toast.error("Product not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => addToCart(product, qty);

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Login to review");
    setSubmitting(true);
    try {
      await API.post(`/products/${id}/review`, review);
      toast.success("Review submitted!");
      const { data } = await API.get(`/products/${id}`);
      setProduct(data.data);
      setReview({ rating: 5, comment: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center pt-16"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center pt-16"><p className="text-dim">Product not found</p></div>;

  const discount = product.originalPrice > product.price ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-dim mb-8 font-mono">
          <Link to="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-white">Store</Link>
          <span>/</span>
          <span className="text-accent truncate">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 mb-12">
          {/* Images */}
          <div className="space-y-3">
            <div className="card overflow-hidden h-80 md:h-96">
              {product.images?.[activeImg] ? (
                <img src={product.images[activeImg]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-surface flex items-center justify-center">
                  <svg className="w-20 h-20 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${activeImg === i ? "border-accent" : "border-border"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5 animate-fade-up">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="badge bg-accent/10 text-accent border border-accent/20">{product.category}</span>
                {product.platform && <span className="badge bg-neon/10 text-neon border border-neon/20 font-mono">{product.platform}</span>}
                {product.featured && <span className="badge bg-gold/10 text-gold border border-gold/20">⭐ Featured</span>}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{product.name}</h1>
              <p className="text-dim text-sm mt-1">{product.brand}</p>
            </div>

            <div className="flex items-center gap-3">
              <Stars rating={product.rating} size="lg" />
              <span className="text-white font-semibold">{product.rating?.toFixed(1)}</span>
              <span className="text-dim text-sm">({product.numReviews} reviews)</span>
              <span className="text-dim text-sm">· {product.sold} sold</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-display text-4xl font-bold text-white">₹{product.price.toLocaleString("en-IN")}</span>
              {discount > 0 && (
                <>
                  <span className="text-dim line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>
                  <span className="badge bg-danger text-white font-bold">-{discount}%</span>
                </>
              )}
            </div>

            <p className="text-dim leading-relaxed text-sm">{product.description}</p>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map(t => (
                  <span key={t} className="badge bg-surface border border-border text-dim text-xs">{t}</span>
                ))}
              </div>
            )}

            {/* Stock */}
            <div className={`flex items-center gap-2 text-sm font-medium ${product.stock > 0 ? "text-success" : "text-danger"}`}>
              <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? "bg-success animate-pulse" : "bg-danger"}`} />
              {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
            </div>

            {/* Qty + Add to cart */}
            {product.stock > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border rounded-lg">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 text-dim hover:text-white">−</button>
                  <span className="px-4 py-2 text-white font-mono border-x border-border">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-3 py-2 text-dim hover:text-white">+</button>
                </div>
                <button onClick={handleAddToCart} className="btn-primary flex-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  Add to Cart
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-white mb-6">Reviews ({product.numReviews})</h2>

          {/* Write review */}
          {user && (
            <form onSubmit={handleReview} className="mb-8 p-5 bg-surface rounded-xl border border-border">
              <h3 className="text-sm font-semibold text-white mb-4">Write a Review</h3>
              <div className="mb-3">
                <label className="label">Rating</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(s => (
                    <button type="button" key={s} onClick={() => setReview(r => ({ ...r, rating: s }))}
                      className={`text-2xl transition-transform hover:scale-110 ${s <= review.rating ? "text-gold" : "text-muted"}`}>★</button>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <label className="label">Comment</label>
                <textarea value={review.comment} onChange={e => setReview(r => ({ ...r, comment: e.target.value }))}
                  className="input resize-none" rows={3} placeholder="Share your experience..." required />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-auto px-6">
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          )}

          {/* Reviews list */}
          {product.reviews?.length === 0 ? (
            <p className="text-dim text-center py-8">No reviews yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {product.reviews.map((r, i) => (
                <div key={i} className="p-4 bg-surface rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent">
                        {r.name[0]}
                      </div>
                      <span className="text-white text-sm font-medium">{r.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Stars rating={r.rating} />
                      <span className="text-xs text-dim">{new Date(r.createdAt).toLocaleDateString("en-IN")}</span>
                    </div>
                  </div>
                  <p className="text-dim text-sm">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
