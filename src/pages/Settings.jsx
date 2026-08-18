import { Outlet } from 'react-router-dom';

const Settings = () => {
  return (
    <div className="block" id="page-settings">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
      </div>

      {/* Main Content Area */}
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default Settings;