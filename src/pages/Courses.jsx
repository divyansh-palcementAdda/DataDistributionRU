import React from 'react';
import { useAppContext } from '../AppContext';
import CustomButton from '../component/reusable/CustomButton';
import { courses } from '../mockData';

const Courses = () => {
  const { openAddLeadModal } = useAppContext();

  return (
    <div className="block" id="page-courses">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Courses</h1>
          <p className="text-sm text-gray-500 mt-1">Manage course catalog and enrollment data</p>
        </div>
        <CustomButton variant="primary" onClick={openAddLeadModal} className="text-xs py-1.5 px-3">
          + Add Course
        </CustomButton>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="courses-grid">
        {courses.map((c, i) => (
          <div 
            key={i} 
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm transition-all hover:shadow-md border-t-[3px]" 
            style={{ borderTopColor: c.color }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">{c.icon}</div>
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md uppercase tracking-wider">{c.growth}</span>
            </div>
            <div className="font-bold text-gray-900 mb-1">{c.name}</div>
            <div className="text-xs text-gray-500 mb-5">
              Total Revenue: <strong className="text-gray-800">{c.revenue}</strong>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-50 p-2 rounded-lg text-center">
                <div className="text-sm font-bold" style={{ color: c.color }}>{c.enrolled}</div>
                <div className="text-[10px] text-gray-400 font-medium leading-none mt-1">Enrolled</div>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg text-center">
                <div className="text-sm font-bold text-blue-600">{c.active}</div>
                <div className="text-[10px] text-gray-400 font-medium leading-none mt-1">Active</div>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg text-center">
                <div className="text-sm font-bold text-green-600">{c.completed}</div>
                <div className="text-[10px] text-gray-400 font-medium leading-none mt-1">Done</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;