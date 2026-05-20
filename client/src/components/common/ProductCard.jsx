import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";

const Stars = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <svg key={s} className={`w-3 h-3 ${s <= Math.round(rating) ? "text-gold" : "text-muted"}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
    <span className="text-xs text-dim ml-1">({rating?.toFixed(1) || "0.0"})</span>
  </div>
);

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="product-card group animate-fade-up">
      <Link to={`/products/${product._id}`}>
        <div className="relative overflow-hidden bg-surface h-52">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface to-card">
              <svg className="w-16 h-16 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
          )}
          {discount > 0 && (
            <span className="absolute top-2 left-2 badge bg-danger text-white font-bold">-{discount}%</span>
          )}
          {product.featured && (
            <span className="absolute top-2 right-2 badge bg-accent/80 text-white">Featured</span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-bold tracking-widest text-sm uppercase">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link to={`/products/${product._id}`}>
            <h3 className="text-white font-semibold text-sm leading-tight hover:text-accent transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
        </div>
        <p className="text-xs text-dim mb-1">{product.brand} · {product.category}</p>
        {product.platform && (
          <p className="text-xs font-mono text-neon/70 mb-2">{product.platform}</p>
        )}
        <Stars rating={product.rating} />

        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-white font-bold text-base font-mono">₹{product.price.toLocaleString("en-IN")}</span>
            {product.originalPrice > product.price && (
              <span className="text-dim text-xs line-through ml-2">₹{product.originalPrice.toLocaleString("en-IN")}</span>
            )}
          </div>
          <button
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className="p-2 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Add to cart"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        </div>

        {product.stock > 0 && product.stock <= 5 && (
          <p className="text-xs text-warning mt-2">⚡ Only {product.stock} left!</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
