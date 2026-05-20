import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";
import toast from "react-hot-toast";

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [address, setAddress] = useState({
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    pincode: user?.address?.pincode || "",
    phone: user?.address?.phone || "",
  });

  const shipping = cartTotal > 999 ? 0 : 99;
  const total = cartTotal + shipping;

  const handleChange = (e) => setAddress(a => ({ ...a, [e.target.name]: e.target.value }));

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!address.street || !address.city || !address.state || !address.pincode || !address.phone) {
      return toast.error("Fill in all address fields");
    }
    setLoading(true);
    try {
      const orderItems = cart.map(i => ({
        product: i._id,
        name: i.name,
        image: i.images?.[0] || "",
        price: i.price,
        quantity: i.quantity,
      }));
      const { data } = await API.post("/orders", {
        orderItems,
        shippingAddress: address,
        paymentMethod,
        itemsPrice: cartTotal,
        shippingPrice: shipping,
        totalPrice: total,
      });
      clearCart();
      toast.success("Order placed successfully! 🎉");
      navigate(`/orders/${data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Order failed");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) { navigate("/cart"); return null; }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="section-title mb-8">CHECKOUT</h1>
        <form onSubmit={handleOrder}>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              {/* Shipping */}
              <div className="card p-6">
                <h2 className="text-white font-bold mb-5 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs flex items-center justify-center font-bold">1</span>
                  Shipping Address
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="label">Street Address</label>
                    <input name="street" value={address.street} onChange={handleChange} className="input" placeholder="123 Main Street" required />
                  </div>
                  <div>
                    <label className="label">City</label>
                    <input name="city" value={address.city} onChange={handleChange} className="input" placeholder="Mumbai" required />
                  </div>
                  <div>
                    <label className="label">State</label>
                    <input name="state" value={address.state} onChange={handleChange} className="input" placeholder="Maharashtra" required />
                  </div>
                  <div>
                    <label className="label">Pincode</label>
                    <input name="pincode" value={address.pincode} onChange={handleChange} className="input" placeholder="400001" required />
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input name="phone" value={address.phone} onChange={handleChange} className="input" placeholder="+91 98765 43210" required />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="card p-6">
                <h2 className="text-white font-bold mb-5 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs flex items-center justify-center font-bold">2</span>
                  Payment Method
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { value: "COD", label: "Cash on Delivery", icon: "💵", desc: "Pay when delivered" },
                    { value: "Online", label: "Online Payment", icon: "💳", desc: "UPI / Cards / Net Banking" },
                  ].map(m => (
                    <button type="button" key={m.value} onClick={() => setPaymentMethod(m.value)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${paymentMethod === m.value ? "border-accent bg-accent/10" : "border-border hover:border-accent/40"}`}>
                      <div className="text-2xl mb-1">{m.icon}</div>
                      <p className="text-white font-semibold text-sm">{m.label}</p>
                      <p className="text-dim text-xs">{m.desc}</p>
                    </button>
                  ))}
                </div>
                {paymentMethod === "Online" && (
                  <div className="mt-4 p-4 bg-warning/5 border border-warning/20 rounded-xl">
                    <p className="text-warning text-sm font-medium">📱 Demo Mode</p>
                    <p className="text-dim text-xs mt-1">In production this would connect to a real payment gateway. For now the order will be marked as paid.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="card p-5 h-fit sticky top-20">
              <h2 className="text-white font-bold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {cart.map(item => (
                  <div key={item._id} className="flex justify-between text-xs gap-2">
                    <span className="text-dim truncate flex-1">{item.name} × {item.quantity}</span>
                    <span className="text-white font-mono flex-shrink-0">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
              <hr className="border-border mb-3" />
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-dim">
                  <span>Subtotal</span>
                  <span className="text-white font-mono">₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-dim">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-success" : "text-white font-mono"}>
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>
                <hr className="border-border" />
                <div className="flex justify-between font-bold text-white">
                  <span>Total</span>
                  <span className="font-mono text-accent text-lg">₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full text-base font-bold py-3">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                {loading ? "Placing Order..." : "Place Order 🎮"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
