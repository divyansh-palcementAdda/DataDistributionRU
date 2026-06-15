import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const OTP_LENGTH = 6;

const OtpVerify = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return; // only digits
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    setError("");
    // Auto-focus next
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!paste) return;
    const updated = [...otp];
    paste.split("").forEach((char, i) => { updated[i] = char; });
    setOtp(updated);
    inputRefs.current[Math.min(paste.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleResend = () => {
    setOtp(Array(OTP_LENGTH).fill(""));
    setError("");
    setTimer(60);
    setCanResend(false);
    // TODO: call resend API
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }
    setLoading(true);
    // TODO: connect real API
    setTimeout(() => {
      setLoading(false);
      navigate("/reset-password");
    }, 1200);
  };

  return (
    <>
      {/* Back */}
      <Link
        to="/forgot-password"
        className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 mb-6 transition"
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </Link>

      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
        <svg width="22" height="22" fill="none" stroke="#2563EB" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-1">Verify OTP</h2>
      <p className="text-sm text-gray-500 mb-7">
        We&apos;ve sent a 6-digit code to your email. Enter it below to continue.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* OTP boxes */}
        <div className="flex gap-2 justify-between" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className={`w-11 h-12 text-center text-lg font-bold border rounded-lg outline-none transition
                ${digit ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-300 text-gray-800"}
                focus:border-blue-500 focus:ring-2 focus:ring-blue-100`}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Resend */}
        <div className="text-center text-xs text-gray-500">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              className="text-blue-600 font-medium hover:underline"
            >
              Resend OTP
            </button>
          ) : (
            <span>
              Resend OTP in{" "}
              <span className="font-semibold text-gray-700">{timer}s</span>
            </span>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium text-sm py-2.5 rounded-lg transition"
        >
          {loading ? (
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : (
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          {loading ? "Verifying…" : "Verify OTP"}
        </button>
      </form>
    </>
  );
};

export default OtpVerify;
