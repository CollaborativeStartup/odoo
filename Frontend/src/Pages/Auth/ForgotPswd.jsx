import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

const ForgotPswd = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setSubmitted(true);
  };

  const handleBackToLogin = () => {
    setSubmitted(false);
    setEmail("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {!submitted ? (
          <div className="bg-zinc-900 rounded-2xl p-8 shadow-2xl border border-zinc-800">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Forgot Password?
              </h1>
              <p className="text-zinc-400">
                No worries, we'll send you reset instructions.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-zinc-300 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-11 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-lg shadow-blue-500/20"
              >
                Reset Password
              </button>
            </form>

            <button
              onClick={handleBackToLogin}
              className="w-full mt-4 flex items-center justify-center gap-2 text-zinc-400 hover:text-white transition py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-2xl p-8 shadow-2xl border border-zinc-800 text-center">
            <div className="mb-6 flex justify-center">
              <div className="bg-green-500/10 p-4 rounded-full">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">
              Check Your Email
            </h2>
            <p className="text-zinc-400 mb-2">
              We sent a password reset link to
            </p>
            <p className="text-white font-medium mb-6">{email}</p>
            <p className="text-sm text-zinc-500 mb-8">
              Didn't receive the email? Check your spam folder or try another
              email address.
            </p>

            <button
              onClick={handleBackToLogin}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default ForgotPswd;
