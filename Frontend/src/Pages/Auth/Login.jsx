import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, DollarSign } from "lucide-react";
import axios from "axios";
import { setCredentials } from "../../redux/authSlice";
import {BASE_URL} from "../../config/urlconfig";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Make API call to login endpoint
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: formData.email,
        password: formData.password,
      });

      // Dispatch credentials to Redux store
      dispatch(setCredentials({
        user: response.data.user,
        token: response.data.token,
      }));

      // Navigate based on user role
      const role = response.data.user.role;
      if (role === 1) {
        navigate("/admin/dashboard");
      } else if (role === 2) {
        navigate("/manager/dashboard");
      } else {
        navigate("/employee/dashboard");
      }
      
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data.message;
        
        if (status === 404) {
          setErrors({ email: "User not found" });
        } else if (status === 401) {
          setErrors({ password: "Invalid credentials" });
        } else {
          setErrors({ general: message || "Login failed" });
        }
      } else if (error.request) {
        setErrors({ 
          general: "Network error. Please check your connection." 
        });
      } else {
        setErrors({ 
          general: "An unexpected error occurred. Please try again." 
        });
      }
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-end p-4 bg-cover bg-center" style={{ backgroundImage: 'url(https://d1ss4nmhr4m5he.cloudfront.net/wp-content/uploads/sites/3/2024/10/27141427/What-are-Business-Expenses.jpg)' }}>
      <div className="w-full max-w-sm mr-8 md:mr-16 lg:mr-24">
        <div className="border-4 border-black rounded-3xl p-8 bg-black">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" strokeWidth={3} />
              </div>
              <h1 className="text-2xl font-bold text-white">SpendWise</h1>
            </div>
          </div>

          <div className="space-y-6">
            {errors.general && (
              <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-xl">
                <p className="text-sm">{errors.general}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setErrors({ ...errors, email: "", general: "" });
                }}
                className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                placeholder="Enter your email"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    setErrors({ ...errors, password: "", general: "" });
                  }}
                  className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black transition"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div className="flex justify-center pt-8">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-white border-2 border-black hover:bg-black hover:text-white text-black font-medium px-12 py-2 rounded-full transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </div>
          </div>

          <div className="mt-8 space-y-3 text-center">
            <p className="text-white text-sm">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="font-semibold underline hover:text-gray-300 transition"
              >
                Signup
              </a>
            </p>
            <div className="relative">
              <a
                href="/forgot-password"
                className="text-white text-sm hover:text-gray-300 transition inline-block"
              >
                Forgot password?
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;