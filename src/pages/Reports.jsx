import React, { useState } from 'react';
import CustomButton from '../component/reusable/CustomButton';
import { funnelData, counselors, courses } from '../mockData';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, LineElement, PointElement);

// Chart data and options (adapted from techonly-crm.html)
const sourceChartData = {
  labels: ['Google Ads', 'Facebook', 'Instagram', 'Referral', 'Website', 'Walk-in'],
  datasets: [{
    data: [38, 24, 18, 12, 6, 2],
    backgroundColor: ['#2563EB', '#7C3AED', '#EC4899', '#F59E0B', '#22C55E', '#64748B'],
    borderWidth: 0,
  }],
};

const sourceChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { font: { size: 10 }, padding: 8, boxWidth: 10 },
    },
  },
};

const regTrendChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [{
    label: 'Registrations',
    data: [42, 58, 71, 65, 88, 94],
    borderColor: '#2563EB',
    backgroundColor: 'rgba(37,99,235,.1)',
    fill: true,
    tension: 0.4,
    pointRadius: 4,
    pointBackgroundColor: '#2563EB',
  }],
};

const regTrendChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: 'rgba(0,0,0,.05)' } },
  },
};

const counselorPerfChartData = {
  labels: counselors.map(c => c.name.split(' ')[0]),
  datasets: [
    {
      label: 'Assigned',
      data: counselors.map(c => c.assigned),
      backgroundColor: 'rgba(37,99,235,.2)',
      borderColor: '#2563EB',
      borderWidth: 1.5,
      borderRadius: 4,
    },
    {
      label: 'Registered',
      data: counselors.map(c => c.registered),
      backgroundColor: 'rgba(34,197,94,.7)',
      borderColor: '#22C55E',
      borderWidth: 1.5,
      borderRadius: 4,
    },
  ],
};

const counselorPerfChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: { font: { size: 11 } },
    },
  },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: 'rgba(0,0,0,.05)' } },
  },
};

const Reports = () => {
  const [timeRange, setTimeRange] = useState('Last 30 days');

  return (
    <div className="block" id="page-reports">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Insights across leads, conversions, and counselor performance</p>
        </div>
        <div className="flex gap-2">
          <select
            className="form-select w-full max-w-[140px] text-xs border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>This Year</option>
          </select>
          <CustomButton variant="secondary" size="sm" className="flex items-center gap-1.5 text-xs py-1.5 px-3">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Export PDF
          </CustomButton>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Lead Conversion Funnel</h2>
            <p className="text-xs text-gray-500 mt-1">June 2025</p>
          </div>
          <div className="p-5">
            {funnelData.map((f, index) => (
              <div key={index} className="flex items-center gap-3 mb-2 last:mb-0">
                <div className="text-xs text-gray-600 w-24 text-right">{f.label}</div>
                <div className="flex-1 h-7 bg-gray-100 rounded-md overflow-hidden">
                  <div className="h-full flex items-center pl-2 rounded-md text-xs font-semibold text-white transition-all duration-500" style={{ width: `${f.pct}%`, backgroundColor: f.color }}>
                    {f.val}
                  </div>
                </div>
                <div className="text-xs font-semibold text-gray-700 w-9 text-right">{f.pct}%</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Lead Sources</h2>
            <p className="text-xs text-gray-500 mt-1">Where leads are coming from</p>
          </div>
          <div className="p-5 relative h-56">
            <Doughnut data={sourceChartData} options={sourceChartOptions} />
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden md:col-span-2">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Registration Trends</h2>
            <p className="text-xs text-gray-500 mt-1">Monthly registrations — 2025</p>
          </div>
          <div className="p-5 relative h-56">
            <Line data={regTrendChartData} options={regTrendChartOptions} />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Course Popularity</h2>
          </div>
          <div className="p-5">
            {courses.map((c, index) => (
              <div key={index} className="mb-3 last:mb-0">
                <div className="flex justify-between text-xs text-gray-700 mb-1">
                  <span>{c.name}</span>
                  <span className="font-semibold">{c.enrolled}</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.round(c.enrolled / 847 * 100)}%`, backgroundColor: c.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Counselor Performance Chart */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Counselor Performance — June 2025</h2>
        </div>
        <div className="p-5 relative h-56">
          <Bar data={counselorPerfChartData} options={counselorPerfChartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Reports;