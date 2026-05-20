import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    address: {
      street: user?.address?.street || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      pincode: user?.address?.pincode || "",
      phone: user?.address?.phone || "",
    },
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.put("/auth/profile", form);
      await refreshUser();
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="section-title mb-8">MY PROFILE</h1>
        <div className="card p-6 mb-5">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center text-2xl font-bold text-accent">
              {user?.name[0].toUpperCase()}
            </div>
            <div>
              <p className="text-white font-bold text-lg">{user?.name}</p>
              <p className="text-dim text-sm">{user?.email}</p>
              <span className={`badge mt-1 ${user?.role === "admin" ? "bg-accent/10 text-accent border border-accent/20" : "bg-surface border border-border text-dim"}`}>
                {user?.role}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Street Address</label>
                <input value={form.address.street} onChange={e => setForm({ ...form, address: { ...form.address, street: e.target.value } })} className="input" placeholder="123 Main St" />
              </div>
              <div>
                <label className="label">City</label>
                <input value={form.address.city} onChange={e => setForm({ ...form, address: { ...form.address, city: e.target.value } })} className="input" placeholder="Mumbai" />
              </div>
              <div>
                <label className="label">State</label>
                <input value={form.address.state} onChange={e => setForm({ ...form, address: { ...form.address, state: e.target.value } })} className="input" placeholder="Maharashtra" />
              </div>
              <div>
                <label className="label">Pincode</label>
                <input value={form.address.pincode} onChange={e => setForm({ ...form, address: { ...form.address, pincode: e.target.value } })} className="input" placeholder="400001" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input value={form.address.phone} onChange={e => setForm({ ...form, address: { ...form.address, phone: e.target.value } })} className="input" placeholder="+91 98765 43210" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-auto px-8">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        <div className="flex gap-3">
          <Link to="/orders" className="btn-ghost flex-1 justify-center">📦 My Orders</Link>
          {user?.role === "admin" && <Link to="/admin" className="btn-primary flex-1 justify-center">⚙️ Admin Panel</Link>}
        </div>
      </div>
    </div>
  );
};

export default Profile;
