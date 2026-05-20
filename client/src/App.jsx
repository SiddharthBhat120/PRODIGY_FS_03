import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/layout/Navbar";
import { ProtectedRoute, AdminRoute } from "./components/common/ProtectedRoute";
import Home from "./pages/Home";
import { Login, Register } from "./pages/Auth";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import { Orders, OrderDetails } from "./pages/Orders";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/Admin";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>

          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#111827",
                border: "1px solid #1f2937",
                color: "#e5e7eb",
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "14px",
                borderRadius: "10px",
              },
              success: { iconTheme: { primary: "#10b981", secondary: "#111827" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#111827" } },
            }}
          />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
