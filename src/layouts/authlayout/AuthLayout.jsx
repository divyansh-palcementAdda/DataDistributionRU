import { Outlet } from "react-router-dom";

// Left panel stats data
const stats = [
  { value: "2,847", label: "Total Leads" },
  { value: "68.4%", label: "Conversion Rate" },
  { value: "342", label: "Registrations" },
  { value: "24", label: "Counselors" },
];

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen w-full">
      {/* ---- Left Panel ---- */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center px-12 py-16 relative overflow-hidden bg-gradient-to-br from-blue-800 via-blue-600 to-blue-400">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -right-16 w-52 h-52 rounded-full bg-white/5" />

        <div className="relative z-10 text-center max-w-md w-full">
          {/* Logo Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
                <path d="M20 28h6v16h-6V28zm9-8h6v24h-6V20zm9 4h6v20h-6V24z" fill="#fff" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">
            Welcome to TechOnly CRM
          </h1>
          <p className="text-sm text-white/75 mb-10">
            Manage your education leads smarter, faster, and more effectively.
          </p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center"
              >
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-white/70 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- Right Panel (page content) ---- */}
      <div className="w-full lg:w-[440px] bg-white flex flex-col items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm">
          {/* Logo top */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              T
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">TechOnly CRM</div>
              <div className="text-xs text-gray-400">Education Lead Management</div>
            </div>
          </div>

          {/* Auth page renders here */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
