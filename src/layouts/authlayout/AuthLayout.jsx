import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen w-full">
      {/* ---- Left Panel ---- */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center px-12 py-16 relative overflow-hidden bg-gradient-to-br from-blue-800 via-blue-600 to-blue-400">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -right-16 w-52 h-52 rounded-full bg-white/5" />

        <div className="relative z-10 text-center max-w-md w-full flex flex-col items-center">
          <img
            src="https://ru-website-bucket.s3.ap-south-1.amazonaws.com/images/svg/logoblack.svg"
            alt="Data Distribute System logo"
            className="w-50 h-28 mb-6 object-contain"
          />
          <h1 className="text-3xl font-bold text-white">
            Data Distribution System
          </h1>
        </div>
      </div>

      {/* ---- Right Panel (page content) ---- */}
      <div className="w-full lg:w-[440px] bg-white flex flex-col items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm">
          {/* Logo top */}
          <div className="flex items-center gap-3 mb-8">
            <img
              src="https://ru-website-bucket.s3.ap-south-1.amazonaws.com/images/svg/logoblack.svg"
              alt="Data Distribute System logo"
              className="w-11 h-11 flex-shrink-0 object-contain"
            />
            <div>
              <div className="text-lg font-bold text-gray-900">Data Distribute System</div>
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
