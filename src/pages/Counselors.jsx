import React from 'react';
import { useAppContext } from '../AppContext';
import CustomButton from '../component/reusable/CustomButton';
import { counselors } from '../mockData';

const Counselors = () => {
  const { openAddLeadModal } = useAppContext();

  return (
    <div className="block" id="page-counselors">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Counselors</h1>
          <p className="text-sm text-gray-500 mt-1">Team performance and lead assignments</p>
        </div>
        <CustomButton variant="primary" onClick={openAddLeadModal} className="text-xs py-1.5 px-3">
          + Add Counselor
        </CustomButton>
      </div>

      {/* Counselor Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {counselors.map((c, i) => {
          const rate = Math.round((c.registered / c.assigned) * 100);
          return (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm transition-all hover:shadow-md">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3"
                style={{ backgroundColor: c.color }}
              >
                {c.initials}
              </div>
              <div className="text-center mb-4">
                <div className="font-semibold text-gray-900">{c.name}</div>
                <div className="text-xs text-gray-400 mt-1">Senior Counselor</div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-xs font-medium text-gray-500 mb-2">
                  <span>Conversion Rate</span>
                  <span className="font-bold" style={{ color: c.color }}>{rate}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{ width: `${rate}%`, backgroundColor: c.color }}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 p-2 rounded-lg text-center">
                  <div className="text-sm font-bold text-gray-900">{c.assigned}</div>
                  <div className="text-[10px] text-gray-500 font-medium">Assigned</div>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg text-center">
                  <div className="text-sm font-bold text-green-600">{c.registered}</div>
                  <div className="text-[10px] text-gray-500 font-medium">Registered</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Ranking Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Performance Ranking</h2>
          <select className="text-xs border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500">
            <option>June 2025</option>
            <option>May 2025</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3 border-b">Rank</th>
                <th className="px-5 py-3 border-b">Counselor</th>
                <th className="px-5 py-3 border-b text-center">Assigned</th>
                <th className="px-5 py-3 border-b text-center">Registered</th>
                <th className="px-5 py-3 border-b text-center">Conv. Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {counselors.map((c, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-5 py-4 font-medium text-gray-900">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</td>
                  <td className="px-5 py-4 font-medium text-gray-900">{c.name}</td>
                  <td className="px-5 py-4 text-center text-gray-600">{c.assigned}</td>
                  <td className="px-5 py-4 text-center text-green-600 font-bold">{c.registered}</td>
                  <td className="px-5 py-4 text-center text-blue-600 font-bold">{Math.round((c.registered / c.assigned) * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Counselors;