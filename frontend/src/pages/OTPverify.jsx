
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Wallet, ArrowLeft, Loader2, Mail } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";


const OTPVerify = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  useEffect(() => {
    if (!email) {
      navigate("/signup");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Please enter 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/otp/verify`, { email, otp });


      if (response.data.success) {
        toast.success("Email verified successfully! ");

        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem(
            "user",
            JSON.stringify(response.data.user)
          );

          navigate("/dashboard", { replace: true });
        } else {
          // fallback (if token not returned)
          navigate("/login", { replace: true });
        }
      }
    } catch (error) {
      console.error("OTP verify error:", error);
      toast.error(
        error.response?.data?.message || "Invalid or expired OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);

    try {
      const response = await axios.post(`${API_URL}/api/otp/resend`, { email });


      if (response.data.success) {
        toast.success("New OTP sent! 📧");
        setTimer(60);
        setCanResend(false);
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error(
        error.response?.data?.message || "Failed to resend OTP"
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to signup
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl"
        >
          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Finance Tracker
            </span>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Verify Your Email
            </h1>
            <p className="text-gray-400 text-sm">
              We sent a 6-digit code to
            </p>
            <p className="text-blue-400 font-medium">{email}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Enter OTP
              </label>
              <input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value.replace(/\D/g, "").slice(0, 6)
                  )
                }
                required
                maxLength={6}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-center text-2xl tracking-widest focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </button>
          </form>

          {/* Resend */}
          <div className="mt-6 text-center">
            {canResend ? (
              <button
                onClick={handleResendOTP}
                disabled={resending}
                className="text-blue-400 font-medium hover:text-blue-300 disabled:opacity-50"
              >
                {resending ? "Sending..." : "Resend OTP"}
              </button>
            ) : (
              <p className="text-sm text-gray-400">
                Resend OTP in{" "}
                <span className="text-blue-400 font-medium">
                  {timer}s
                </span>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OTPVerify;
