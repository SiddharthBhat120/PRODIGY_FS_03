import { Link } from "react-router-dom";
const NotFound = () => (
  <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4 text-center">
    <p className="font-display text-8xl font-black text-accent/20">404</p>
    <h1 className="text-2xl font-bold text-white mt-4 mb-2">Level Not Found</h1>
    <p className="text-dim mb-6">This page doesn't exist in our universe.</p>
    <Link to="/" className="btn-primary w-auto px-8">← Back to Home</Link>
  </div>
);
export default NotFound;
