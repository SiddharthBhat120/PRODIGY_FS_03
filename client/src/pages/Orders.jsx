import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../utils/api";

const STATUS_COLORS = {
  Processing: "bg-warning/10 text-warning border-warning/20",
  Confirmed: "bg-accent/10 text-accent border-accent/20",
  Shipped: "bg-neon/10 text-neon border-neon/20",
  Delivered: "bg-success/10 text-success border-success/20",
  Cancelled: "bg-danger/10 text-danger border-danger/20",
};

const STATUS_STEPS = ["Processing", "Confirmed", "Shipped", "Delivered"];

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/orders/my").then(({ data }) => setOrders(data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen pt-24 flex justify-center"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mt-10" /></div>;

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="section-title mb-8">MY ORDERS</h1>
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-white font-semibold mb-2">No orders yet</p>
            <Link to="/products" className="btn-primary mx-auto w-auto px-8 mt-4">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Link key={order._id} to={`/orders/${order._id}`} className="card-hover block p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-mono text-accent text-sm font-bold">#{order.orderId}</p>
                      <span className={`badge border ${STATUS_COLORS[order.orderStatus] || ""}`}>{order.orderStatus}</span>
                    </div>
                    <p className="text-dim text-xs">{new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
                    <p className="text-dim text-xs mt-0.5">{order.orderItems.length} item(s)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold font-mono text-lg">₹{order.totalPrice.toLocaleString("en-IN")}</p>
                    <p className="text-dim text-xs">{order.paymentMethod} · {order.paymentStatus}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/orders/${id}`).then(({ data }) => setOrder(data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen pt-24 flex justify-center"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mt-10" /></div>;
  if (!order) return null;

  const stepIdx = STATUS_STEPS.indexOf(order.orderStatus);

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/orders" className="btn-ghost py-2 px-3 text-sm">← Back</Link>
          <div>
            <h1 className="text-white font-bold text-xl font-mono">#{order.orderId}</h1>
            <p className="text-dim text-xs">{new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
          </div>
        </div>

        {/* Tracker */}
        {order.orderStatus !== "Cancelled" && (
          <div className="card p-6 mb-5">
            <h2 className="text-white font-bold mb-6 text-sm">Order Tracking</h2>
            <div className="flex items-center">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${i <= stepIdx ? "border-accent bg-accent text-white" : "border-border text-muted"}`}>
                      {i < stepIdx ? "✓" : i + 1}
                    </div>
                    <p className={`text-xs mt-1 text-center ${i <= stepIdx ? "text-accent" : "text-muted"}`}>{step}</p>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 ${i < stepIdx ? "bg-accent" : "bg-border"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-5 mb-5">
          {/* Shipping */}
          <div className="card p-5">
            <h3 className="text-xs text-dim uppercase tracking-wider mb-3">Shipping Address</h3>
            <p className="text-white text-sm">{order.shippingAddress.street}</p>
            <p className="text-dim text-sm">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
            <p className="text-dim text-sm">{order.shippingAddress.pincode}</p>
            <p className="text-dim text-sm">{order.shippingAddress.phone}</p>
          </div>
          {/* Payment */}
          <div className="card p-5">
            <h3 className="text-xs text-dim uppercase tracking-wider mb-3">Payment Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-dim">Method</span><span className="text-white">{order.paymentMethod}</span></div>
              <div className="flex justify-between"><span className="text-dim">Status</span>
                <span className={order.paymentStatus === "Paid" ? "text-success" : "text-warning"}>{order.paymentStatus}</span>
              </div>
              <div className="flex justify-between"><span className="text-dim">Shipping</span><span className={order.shippingPrice === 0 ? "text-success" : "text-white"}>{order.shippingPrice === 0 ? "FREE" : `₹${order.shippingPrice}`}</span></div>
              <hr className="border-border" />
              <div className="flex justify-between font-bold"><span className="text-white">Total</span><span className="text-accent font-mono">₹{order.totalPrice.toLocaleString("en-IN")}</span></div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card p-5">
          <h3 className="text-xs text-dim uppercase tracking-wider mb-4">Order Items</h3>
          <div className="space-y-3">
            {order.orderItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface flex-shrink-0">
                  {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">🎮</div>}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{item.name}</p>
                  <p className="text-dim text-xs">Qty: {item.quantity}</p>
                </div>
                <p className="text-white font-mono text-sm">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
