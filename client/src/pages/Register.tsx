import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setMessage("");

    // Name validation
    if (name.trim().length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    // Email validation
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    // Password validation
    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError(
        "Password must contain at least one uppercase letter."
      );
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError(
        "Password must contain at least one lowercase letter."
      );
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError(
        "Password must contain at least one number."
      );
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError(
        "Password must contain at least one special character."
      );
      return;
    }

    // Confirm password
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      setMessage(
        response.data.message ||
          "Account created successfully."
      );

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error: any) {
      const serverMessage =
        error?.response?.data?.message;

      setError(
        serverMessage ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden">

        <div className="grid md:grid-cols-2 min-h-[700px]">

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
                Start tracking
                <br />
                your finances.
              </h2>

              <p className="text-blue-100 text-lg mt-6 max-w-md leading-relaxed">
                Create your FinTrack account and
                manage your income, expenses and
                budgets from one simple dashboard.
              </p>

            </div>

            {/* Illustration */}
            <div className="relative z-10 flex justify-center items-center py-8">

              <div className="relative w-72 h-52">

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

                <div className="absolute -right-5 -top-5 w-16 h-16 bg-white/20 rounded-full border border-white/20" />

                <div className="absolute -left-5 -bottom-5 w-12 h-12 bg-white/20 rounded-full border border-white/20" />

              </div>

            </div>

            <p className="relative z-10 text-sm text-blue-100">
              Smart financial tracking made simple.
            </p>

          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center justify-center p-8 sm:p-12">

            <div className="w-full max-w-md">

              {/* Mobile branding */}
              <div className="md:hidden text-center mb-7">

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
              <div className="mb-7">

                <h1 className="text-3xl font-bold text-gray-900">
                  Create your account
                </h1>

                <p className="text-gray-500 mt-2">
                  Join FinTrack and start managing
                  your finances.
                </p>

              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              {/* Success */}
              {message && (
                <div className="mb-5 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
                  {message}

                  <p className="mt-1 text-xs">
                    Redirecting to login...
                  </p>
                </div>
              )}

              {/* Form */}
              <form
                onSubmit={handleRegister}
                className="space-y-4"
              >

                {/* Name */}
                <div>

                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Full name
                  </label>

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                </div>

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
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    required
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                  <p className="text-xs text-gray-400 mt-2">
                    8+ characters with uppercase,
                    lowercase, number and special
                    character.
                  </p>

                </div>

                {/* Confirm password */}
                <div>

                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Confirm password
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    required
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Creating account..."
                    : "Create account"}
                </button>

              </form>

              {/* Login link */}
              <div className="text-center mt-7">

                <p className="text-gray-500">
                  Already have an account?{" "}

                  <Link
                    to="/login"
                    className="font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Sign in
                  </Link>

                </p>

              </div>

              {/* Security */}
              <div className="mt-7 pt-5 border-t border-gray-100 text-center">

                <p className="text-xs text-gray-400">
                  Your information is protected with
                  secure authentication.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Register;