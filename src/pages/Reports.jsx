import React, { useState } from 'react';
import { usePermissions } from '../PermissionContext';
import CustomButton from '../component/reusable/CustomButton';

// Mock data for Data Breakdown Matrix
const categoryData = [
  { name: 'Engineering', total: 450, converted: 135, pending: 225, dropped: 90, conversionRate: 30 },
  { name: 'Management', total: 300, converted: 90, pending: 150, dropped: 60, conversionRate: 30 },
  { name: 'Applied Sciences', total: 250, converted: 75, pending: 125, dropped: 50, conversionRate: 30 },
  { name: 'Humanities', total: 150, converted: 45, pending: 75, dropped: 30, conversionRate: 30 },
  { name: 'Medical', total: 100, converted: 30, pending: 50, dropped: 20, conversionRate: 30 },
];

const boardData = [
  { name: 'CBSE', total: 500, converted: 150, pending: 250, dropped: 100, conversionRate: 30 },
  { name: 'ICSE', total: 350, converted: 105, pending: 175, dropped: 70, conversionRate: 30 },
  { name: 'State Boards', total: 300, converted: 90, pending: 150, dropped: 60, conversionRate: 30 },
  { name: 'IB', total: 100, converted: 30, pending: 50, dropped: 20, conversionRate: 30 },
];

const sourceData = [
  { name: 'Google Ads', total: 375, converted: 112, pending: 188, dropped: 75, conversionRate: 30 },
  { name: 'Meta', total: 300, converted: 90, pending: 150, dropped: 60, conversionRate: 30 },
  { name: 'Organic', total: 250, converted: 75, pending: 125, dropped: 50, conversionRate: 30 },
  { name: 'College Fairs', total: 200, converted: 60, pending: 100, dropped: 40, conversionRate: 30 },
  { name: 'Walk-ins', total: 125, converted: 38, pending: 62, dropped: 25, conversionRate: 30 },
];

const courseData = [
  { name: 'B.Tech CS', total: 250, converted: 75, pending: 125, dropped: 50, conversionRate: 30 },
  { name: 'MBA', total: 200, converted: 60, pending: 100, dropped: 40, conversionRate: 30 },
  { name: 'B.Sc', total: 180, converted: 54, pending: 90, dropped: 36, conversionRate: 30 },
  { name: 'B.Com', total: 150, converted: 45, pending: 75, dropped: 30, conversionRate: 30 },
  { name: 'BBA', total: 125, converted: 38, pending: 62, dropped: 25, conversionRate: 30 },
  { name: 'M.Tech', total: 100, converted: 30, pending: 50, dropped: 20, conversionRate: 30 },
  { name: 'PhD', total: 75, converted: 23, pending: 38, dropped: 14, conversionRate: 30 },
  { name: 'Other', total: 170, converted: 50, pending: 85, dropped: 35, conversionRate: 30 },
];

const userData = [
  { name: 'John Doe', total: 280, converted: 84, pending: 140, dropped: 56, conversionRate: 30 },
  { name: 'Jane Smith', total: 245, converted: 74, pending: 122, dropped: 49, conversionRate: 30 },
  { name: 'Bob Johnson', total: 210, converted: 63, pending: 105, dropped: 42, conversionRate: 30 },
  { name: 'Alice Brown', total: 195, converted: 58, pending: 98, dropped: 39, conversionRate: 30 },
  { name: 'Charlie Wilson', total: 175, converted: 52, pending: 88, dropped: 35, conversionRate: 30 },
  { name: 'Diana Davis', total: 145, converted: 44, pending: 72, dropped: 29, conversionRate: 30 },
];

const Reports = () => {
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState('category');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('name');

  const getTabData = () => {
    switch (activeTab) {
      case 'category': return categoryData;
      case 'board': return boardData;
      case 'source': return sourceData;
      case 'course': return courseData;
      case 'status': return userData;
      default: return categoryData;
    }
  };

  const filteredData = getTabData().filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortOption === 'name') return a.name.localeCompare(b.name);
    if (sortOption === 'total') return b.total - a.total;
    if (sortOption === 'converted') return b.converted - a.converted;
    if (sortOption === 'conversionRate') return b.conversionRate - a.conversionRate;
    return 0;
  });

  const getTotalRow = () => {
    const data = sortedData;
    return {
      name: 'Total Pipeline',
      total: data.reduce((sum, item) => sum + item.total, 0),
      converted: data.reduce((sum, item) => sum + item.converted, 0),
      pending: data.reduce((sum, item) => sum + item.pending, 0),
      dropped: data.reduce((sum, item) => sum + item.dropped, 0),
      conversionRate: data.length > 0 ? Math.round(data.reduce((sum, item) => sum + item.converted, 0) / data.reduce((sum, item) => sum + item.total, 0) * 100) : 0,
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6" id="page-reports">
      {/* Main Data Breakdown Workspace */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Data Breakdown Matrix</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-48"
                />
                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="name">Sort by Name</option>
                <option value="total">Sort by Total</option>
                <option value="converted">Sort by Converted</option>
                <option value="conversionRate">Sort by Rate</option>
              </select>
              {hasPermission('REPORT_EXPORT') && (
                <CustomButton variant="secondary" size="sm" className="flex items-center gap-1.5 text-xs py-2 px-3">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  Export CSV
                </CustomButton>
              )}
            </div>
          </div>
        </div>

        {/* Segmented Tabs */}
        <div className="px-6 pt-4 border-b border-slate-200">
          <div className="flex gap-1">
            {[
              { id: 'category', label: 'Category-wise' },
              { id: 'board', label: 'Specialization-wise' },
              { id: 'source', label: 'Lead Source-wise' },
              { id: 'course', label: 'Course-wise' },
              { id: 'status', label: 'User-wise' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Name / Item</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Total Leads</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Converted</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Pending</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Not Interested / Dropped</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Conversion Rate (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedData.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 text-center">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-slate-700">{item.total.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-green-600 font-semibold">{item.converted.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-amber-600 font-semibold">{item.pending.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-red-600">{item.dropped.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                          style={{ width: `${item.conversionRate}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{item.conversionRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {(() => {
                const total = getTotalRow();
                return (
                  <tr className="bg-slate-100 font-semibold">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 text-center">{total.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-slate-900">{total.total.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-green-700">{total.converted.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-amber-700">{total.pending.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-red-700">{total.dropped.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-slate-900">{total.conversionRate}%</td>
                  </tr>
                );
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;