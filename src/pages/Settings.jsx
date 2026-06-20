import React, { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import CustomButton from '../component/reusable/CustomButton';
import CustomInput from '../component/reusable/CustomInput';
import ReusableTable from '../component/reusable/table';
import { getAllUser } from '../Services/user/user';
import AddUserModal from '../component/reusable/user/addUser';
const Settings = () => {
  const { showToast, openAddLeadModal } = useAppContext();
  const [activeTab, setActiveTab] = useState('st-users');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  useEffect(() => {
    if (activeTab === 'st-users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await getAllUser();
      console.log('API Response for getAllUser:', res.data);
      
      let usersArray = [];
      const responseData = res.data;
      
      if (responseData?.data?.content && Array.isArray(responseData.data.content)) {
        usersArray = responseData.data.content;
      } else if (responseData?.data && Array.isArray(responseData.data)) {
        usersArray = responseData.data;
      } else if (responseData?.content && Array.isArray(responseData.content)) {
        usersArray = responseData.content;
      } else if (Array.isArray(responseData)) {
        usersArray = responseData;
      }

      setUsers(usersArray);
    } catch (error) {
      console.error('Failed to fetch users', error);
      showToast('Failed to fetch users', 'error');
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const roles = [
    { name: 'Admin', perms: ['All access', 'User management', 'Reports', 'Settings', 'Lead management'], color: '#2563EB' },
    { name: 'Manager', perms: ['View all leads', 'Counselor management', 'Reports', 'Assign leads'], color: '#7C3AED' },
    { name: 'Counselor', perms: ['View assigned leads', 'Update lead status', 'Add follow-ups', 'View own reports'], color: '#16A34A' },
  ];

  const notifs = [
    { label: 'New lead assigned', on: true },
    { label: 'Follow-up due reminder', on: true },
    { label: 'Lead status changes', on: true },
    { label: 'Registration completed', on: true },
    { label: 'Missed follow-ups', on: false },
    { label: 'Daily summary report', on: false },
  ];

  const menuItems = [
    { id: 'st-users', label: 'User Management' },
    { id: 'st-roles', label: 'Roles & Permissions' },
    { id: 'st-notif', label: 'Notifications' },
    { id: 'st-crm', label: 'CRM Config' },
  ];

  const userColumns = [
    {
      header: 'Name',
      key: 'name',
      render: (_, u) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">
            {u.name ? u.name.split(' ').map(n => n[0]).join('') : (u.firstName ? u.firstName[0] : 'U')}
          </div>
          <span className="font-medium text-gray-900">{u.name || (u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.firstName) || 'Unknown'}</span>
        </div>
      )
    },
    { header: 'Email', key: 'email', render: (val) => <span className="text-gray-500">{val}</span> },
    {
      header: 'Role',
      key: 'roles',
      render: (roles) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${roles && (roles.includes('SUPER_ADMIN') || roles.includes('ADMIN')) ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
          {roles ? roles.join(', ').replace(/_/g, ' ') : 'User'}
        </span>
      )
    },
    {
      header: 'Status',
      key: 'active',
      render: (active) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
          {active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Last Active',
      key: 'lastLogin',
      render: (_, u) => (
        <span className="text-gray-400">
          {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : (u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A')}
        </span>
      )
    }
  ];

  return (
    <div className="block" id="page-settings">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage users, roles, and CRM configuration</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Settings Tabs */}
        <div className="flex flex-row gap-2 border-b border-gray-100 pb-4 overflow-x-auto">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all whitespace-nowrap ${activeTab === item.id
                  ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.label}
            </div>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'st-users' && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-fadeIn">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">User Management</h2>
                <CustomButton variant="primary" onClick={() => setIsAddUserModalOpen(true)} className="text-xs py-1.5 px-3">
                  + Invite User
                </CustomButton>
              </div>
              <div className="p-4">
                <ReusableTable
                  columns={userColumns}
                  data={Array.isArray(users) ? users : []}
                  onEdit={() => console.log('Edit User')}
                  onDelete={() => showToast('User removed')}
                />
              </div>
            </div>
          )}

          {activeTab === 'st-roles' && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm animate-fadeIn">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">Roles & Permissions</h2>
              <div className="flex flex-col gap-3">
                {roles.map((r, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-blue-200 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }}></div>
                        <span className="font-bold text-gray-800 text-sm">{r.name}</span>
                      </div>
                      <button className="text-xs text-blue-600 font-medium hover:underline">Edit Permissions</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {r.perms.map((p, idx) => (
                        <span key={idx} className="bg-gray-50 text-gray-500 text-[10px] font-medium px-2 py-1 rounded-md border border-gray-100">
                          ✓ {p}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'st-notif' && (
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
          )}

          {activeTab === 'st-crm' && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm animate-fadeIn">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">CRM Configuration</h2>
              <div className="flex flex-col gap-4">
                <CustomInput label="Organization Name" defaultValue="TechOnly Education Pvt. Ltd." />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Default Lead Assignment</label>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Round Robin</option>
                    <option>Manual</option>
                    <option>Load Balanced</option>
                  </select>
                </div>
                <CustomInput label="Follow-up Reminder (hours before)" type="number" defaultValue={2} />
                <CustomInput label="Auto Bad Lead After (days unreachable)" type="number" defaultValue={14} />
                <CustomButton variant="primary" onClick={() => showToast('Settings saved!')} className="mt-2">
                  Save Configuration
                </CustomButton>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <AddUserModal 
        isOpen={isAddUserModalOpen} 
        onClose={() => setIsAddUserModalOpen(false)} 
        onSuccess={fetchUsers} 
      />
    </div>
  );
};

export default Settings;