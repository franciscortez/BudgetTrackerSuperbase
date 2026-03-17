import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (form.password !== form.confirm) {
      return setError("Passwords do not match.");
    }
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    setLoading(true);
    const { error } = await updatePassword(form.password);
    
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setMessage("Your password has been updated successfully!");
      setLoading(false);
      setTimeout(() => navigate("/login"), 3000);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[65%_35%]">
      {/* Left Column - Marketing Message */}
      <div className="hidden lg:flex relative bg-pink-100 p-8 lg:p-12 flex flex-col justify-center overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse delay-700"></div>
        
        {/* Content */}
        <div className="relative z-10 max-w-2xl mx-auto text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-8 shadow-sm">
            <svg className="w-5 h-5 text-white" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 48 20 C 40 10 30 15 35 20" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M 52 20 C 60 10 70 15 65 20" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M 48 30 C 20 -5 0 20 15 45 C 0 65 20 95 48 65 Z" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="2"/>
              <path d="M 52 30 C 80 -5 100 20 85 45 C 100 65 80 95 52 65 Z" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="2"/>
              <circle cx="25" cy="30" r="3" fill="currentColor" fillOpacity="0.2"/>
              <circle cx="75" cy="30" r="3" fill="currentColor" fillOpacity="0.2"/>
              <rect x="47" y="20" width="6" height="45" rx="3" fill="currentColor"/>
              <circle cx="50" cy="18" r="4" fill="currentColor"/>
            </svg>
            PennyWings
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-pink-800 mb-6 leading-tight">
            Secure your account with a new password
          </h1>
          <p className="text-xl text-pink-700 mb-12 leading-relaxed">
            You're just one step away from getting back to managing your finances beautifully. Choose a strong password to keep your wings protected.
          </p>
          
          {/* Feature Highlight */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-pink-200 inline-block text-left shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-pink-200 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.124a11.954 11.954 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-pink-800 font-semibold">Bank-Level Security</h3>
                <p className="text-pink-600 text-sm">Your new password is encrypted instantly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="bg-white p-8 lg:p-12 flex flex-col justify-center relative">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Back Button */}
          <Link
            to="/login"
            className="lg:hidden flex items-center gap-2 text-pink-700 hover:text-pink-800 transition-colors group mb-8"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Back to Login</span>
          </Link>

          <div className="mb-8">
            <h2 className="text-4xl font-bold text-pink-800 mb-3">
              Set New Password
            </h2>
            <p className="text-pink-600 text-lg">
              Create a secure password for your account
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-6 border border-red-100">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-50 text-green-700 text-sm rounded-lg px-4 py-3 mb-6 border border-green-100">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-pink-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-pink-200 rounded-xl px-4 py-3 text-sm text-pink-900 placeholder:text-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition pr-12"
                  placeholder="Min. 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-400 hover:text-pink-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-pink-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-pink-200 rounded-xl px-4 py-3 text-sm text-pink-900 placeholder:text-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-400 hover:text-pink-600 transition-colors"
                >
                  {showConfirm ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-bold py-3.5 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "Updating…" : "Update Password"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-pink-600">
              Back to{" "}
              <Link
                to="/login"
                className="text-pink-700 font-bold hover:text-pink-800 transition"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
