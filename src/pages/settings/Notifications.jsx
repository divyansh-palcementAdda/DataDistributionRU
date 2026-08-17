import { useAppContext } from '../../AppContext';

const Notifications = () => {
  const { showToast } = useAppContext();

  const notifs = [
    { label: 'New lead allotted', on: true },
    { label: 'Follow-up due reminder', on: true },
    { label: 'Lead status changes', on: true },
    { label: 'Registration completed', on: true },
    { label: 'Missed follow-ups', on: false },
    { label: 'Daily summary report', on: false },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm animate-fadeIn">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">Notification Settings</h2>
      <div className="divide-y divide-gray-100">
        {notifs.map((n, i) => (
          <div key={i} className="flex items-center justify-between py-3">
            <span className="text-xs text-gray-700 font-medium">{n.label}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked={n.on} onChange={() => showToast('Preference saved')} />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;