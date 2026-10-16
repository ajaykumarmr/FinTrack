import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    // Email validation
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    // Password validation
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      localStorage.setItem(
        "token",
        response.data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      navigate("/dashboard");
    } catch (error: any) {
      const serverMessage =
        error?.response?.data?.message;

      setError(
        serverMessage ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden">

        <div className="grid md:grid-cols-2 min-h-[650px]">

          {/* LEFT SIDE */}
          <div className="hidden md:flex relative bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white p-12 flex-col justify-between overflow-hidden">

            {/* Decorative circles */}
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/10 rounded-full" />

            <div className="absolute -bottom-32 -right-20 w-96 h-96 bg-white/10 rounded-full" />

            {/* Branding */}
            <div className="relative z-10">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-blue-600 text-xl font-bold">
                    ₹
                  </span>
                </div>

                <span className="text-2xl font-bold">
                  FinTrack
                </span>

              </div>

              <h2 className="text-4xl font-bold leading-tight mt-16">
                Take control of
                <br />
                your finances.
              </h2>

              <p className="text-blue-100 text-lg mt-6 max-w-md leading-relaxed">
                Track your income, manage expenses,
                create budgets and understand your
                financial activity in one place.
              </p>

            </div>

            {/* Professional Finance Illustration */}
            <div className="relative z-10 flex justify-center items-center py-8">

              <div className="relative w-72 h-52">

                {/* Large chart card */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-7 shadow-2xl">

                  <div className="flex items-end gap-3 h-full">

                    <div className="w-8 h-16 bg-white/30 rounded-lg" />

                    <div className="w-8 h-24 bg-white/40 rounded-lg" />

                    <div className="w-8 h-20 bg-white/50 rounded-lg" />

                    <div className="w-8 h-32 bg-white/60 rounded-lg" />

                    <div className="w-8 h-40 bg-white/80 rounded-lg" />

                    <div className="w-8 h-44 bg-white rounded-lg" />

                  </div>

                </div>

                {/* Floating decorative circle */}
                <div className="absolute -right-5 -top-5 w-16 h-16 bg-white/20 rounded-full border border-white/20" />

                <div className="absolute -left-5 -bottom-5 w-12 h-12 bg-white/20 rounded-full border border-white/20" />

              </div>

            </div>

            {/* Footer */}
            <p className="relative z-10 text-sm text-blue-100">
              Smart financial tracking made simple.
            </p>

          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center justify-center p-8 sm:p-12">

            <div className="w-full max-w-md">

              {/* Mobile branding */}
              <div className="md:hidden text-center mb-8">

                <div className="flex justify-center items-center gap-2">

                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                    ₹
                  </div>

                  <span className="text-2xl font-bold text-blue-600">
                    FinTrack
                  </span>

                </div>

              </div>

              {/* Header */}
              <div className="mb-8">

                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back
                </h1>

                <p className="text-gray-500 mt-2">
                  Sign in to continue to your FinTrack
                  account.
                </p>

              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              {/* Form */}
              <form
                onSubmit={handleLogin}
                className="space-y-5"
              >

                {/* Email */}
                <div>

                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-gray-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                </div>

                {/* Password */}
                <div>

                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-gray-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                </div>

                {/* Login button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Signing in..."
                    : "Sign in"}
                </button>

              </form>

              {/* Register */}
              <div className="text-center mt-8">

                <p className="text-gray-500">
                  Don't have an account?{" "}

                  <Link
                    to="/register"
                    className="font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Create an account
                  </Link>

                </p>

              </div>

              {/* Security message */}
              <div className="mt-8 pt-6 border-t border-gray-100 text-center">

                <p className="text-xs text-gray-400">
                  Your financial information is protected
                  with secure authentication.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;
