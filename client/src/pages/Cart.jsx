import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const shipping = cartTotal >= 999 ? 0 : 99;
  const total = cartTotal + shipping;

  if (cart.length === 0) return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4">
      <div className="text-center animate-fade-up">
        <div className="text-7xl mb-6">🛒</div>
        <h2 className="text-2xl font-bold text-white mb-3">Your cart is empty</h2>
        <p className="text-dim mb-8">Add some awesome gaming gear!</p>
        <Link to="/products" className="btn-primary mx-auto w-auto px-10">Browse Store</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="section-title">YOUR CART</h1>
          <button onClick={clearCart} className="btn-danger text-sm">Clear Cart</button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <div key={item._id} className="card p-4 flex gap-4 animate-fade-up">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface flex-shrink-0">
                  {item.images?.[0] ? (
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🎮</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link to={`/products/${item._id}`} className="text-white font-semibold text-sm hover:text-accent transition-colors line-clamp-1">
                        {item.name}
                      </Link>
                      <p className="text-dim text-xs mt-0.5">{item.category} · {item.brand}</p>
                    </div>
                    <button onClick={() => removeFromCart(item._id)} className="text-muted hover:text-danger transition-colors flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-border rounded-lg">
                      <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="px-2.5 py-1 text-dim hover:text-white text-sm">−</button>
                      <span className="px-3 py-1 text-white text-sm font-mono border-x border-border">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="px-2.5 py-1 text-dim hover:text-white text-sm">+</button>
                    </div>
                    <span className="text-white font-bold font-mono">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-20 space-y-4">
              <h2 className="text-white font-bold text-lg">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-dim">
                  <span>Subtotal ({cart.reduce((a, i) => a + i.quantity, 0)} items)</span>
                  <span className="text-white font-mono">₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-dim">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-success font-medium" : "text-white font-mono"}>
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-dim">Add ₹{(999 - cartTotal).toLocaleString("en-IN")} more for free shipping</p>
                )}
                <hr className="border-border" />
                <div className="flex justify-between text-white font-bold text-base">
                  <span>Total</span>
                  <span className="font-mono font-display">₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {user ? (
                <button onClick={() => navigate("/checkout")} className="btn-primary w-full py-3 text-base font-bold">
                  Proceed to Checkout →
                </button>
              ) : (
                <Link to="/login" state={{ from: { pathname: "/checkout" } }} className="btn-primary w-full py-3 text-base font-bold">
                  Login to Checkout
                </Link>
              )}
              <Link to="/products" className="btn-ghost w-full justify-center text-sm">← Continue Shopping</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
