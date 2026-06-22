import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../Services/auth/login";
import { getRolePermissions } from "../../Services/role/roleService";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      toast.warning("Please fill in all fields.");
      return;
    }
    setLoading(true);

    try {
      const payload = {
        emailOrUsername: form.email,
        password: form.password,
      };
      const response = await login(payload);

      if (response && response.status === 200) {
        // Success
        setLoading(false);
        toast.success("Login successful!");
        localStorage.setItem('accessToken', response.data.data.accessToken);
        localStorage.setItem('refreshToken', response.data.data.refreshToken);

        // Fetch permissions using roleId
        const roleId = response.data.data.role?.id;
        if (roleId) {
          try {
            const permissionsResponse = await getRolePermissions(roleId);
            if (permissionsResponse && permissionsResponse.status === 200) {
              localStorage.setItem('permissions', JSON.stringify(permissionsResponse.data.data || permissionsResponse.data));
            }
          } catch (err) {
            console.error("Failed to fetch permissions:", err);
          }
        }

        navigate("/dashboard");
      } else {
        // Error handling
        setLoading(false);
        const errMsg = response?.response?.data?.message || response?.message || "Login failed. Please try again.";
        setError(errMsg);
        toast.error(errMsg);
      }
    } catch (err) {
      setLoading(false);
      setError("An error occurred during login.");
      toast.error("An error occurred during login.");
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h2>
      <p className="text-sm text-gray-500 mb-7">
        Enter your credentials to access the dashboard
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Email address
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="admin@techonly.com"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPass ? (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Remember me + Forgot */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="accent-blue-600" />
            <span className="text-xs text-gray-600">Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-xs text-blue-600 font-medium hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

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
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
            </svg>
          )}
          {loading ? "Signing in…" : "Sign in to Dashboard"}
        </button>
      </form>

      <p className="text-center text-xs text-gray-500 mt-5">
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="text-blue-600 font-medium hover:underline">
          Create account
        </Link>
      </p>
    </>
  );
};

export default Login;
