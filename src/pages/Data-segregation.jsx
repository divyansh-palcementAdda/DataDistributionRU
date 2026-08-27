import React, { useState, useEffect, useCallback } from 'react';
import { FiDatabase, FiEye, FiChevronDown } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import CategorywiseCard from '../component/reusable/DashBoards/categorywiseCard';
import BreakdownModal from '../component/reusable/BreakdownModal';

const Datasegregation = () => {
  const navigate = useNavigate();
  // const { hasPermission } = usePermissions();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalTitle, setModalTitle] = useState('');

  const handleView = (id) => {
    navigate(`/data-segregation-details/${id}`);
  };

  const handleShowBreakdown = (title, data) => {
    setModalTitle(title);
    setModalData(data);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalData(null);
    setModalTitle('');
  };
  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[10px] bg-blue-50 text-xl text-blue-600">
          <FiDatabase />
        </div>

        <div>
          <h1 className="m-0 text-[22px] font-bold tracking-[-0.02em] text-slate-900">
            Data Segregation
          </h1>

          <p className="mt-[2px] mb-0 text-[13px] text-slate-500">
            Manage and organize data based on departments, categories, and other criteria
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mt-2 p-2">
         <CategorywiseCard />
      </div>
   

      {/* Custom Data Segregation Table */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Data Breakdown
        </h2>
        
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead>
              {/* Main Header Row */}
              <tr className="bg-slate-50 border-b-2 border-gray-200">
                <th className="px-4 py-4 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">
                  S.No
                </th>
                <th className="px-4 py-4 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">
                  Lead Source
                </th>
                <th className="px-4 py-4 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">
                  Board
                </th>
                <th className="px-4 py-4 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">
                  Grades Wise
                </th>
              
              </tr>
            </thead>
            <tbody>
              {/* Row 1 */}
              <tr className="border-b border-gray-200 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-4 font-semibold text-slate-800">1</td>
                <td className="px-4 py-4">
                  <div>
                    <div className="font-semibold text-slate-800 mb-1">Google</div>
                    <div className="flex gap-3 text-xs mb-2">
                      <span className="text-green-600">Assign: 150</span>
                      <span className="text-red-600">Albeit: 25</span>
                      <span className="text-amber-500">Not Assign: 45</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView('google')}
                        className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                      >
                        <FiEye size={14} />
                        View
                      </button>
                      <button
                        onClick={() => handleShowBreakdown('Google', {
                          connected: 120,
                          notConnected: 30,
                          assign: 150,
                          albeit: 25,
                          notAssign: 45
                        })}
                        className="text-slate-600 hover:text-slate-800 text-xs flex items-center gap-1"
                      >
                        <FiChevronDown size={14} />
                        Show Breakdown
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div>
                    <div className="font-semibold text-slate-800 mb-1">CBSE</div>
                    <div className="flex gap-3 text-xs mb-2">
                      <span className="text-green-600">Assign: 200</span>
                      <span className="text-red-600">Albeit: 30</span>
                      <span className="text-amber-500">Not Assign: 50</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleView('cbse')}
                        className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                      >
                        <FiEye size={14} />
                        View
                      </button>
                      <button 
                        onClick={() => handleShowBreakdown('CBSE', {
                          connected: 170,
                          notConnected: 30,
                          assign: 200,
                          albeit: 30,
                          notAssign: 50
                        })}
                        className="text-slate-600 hover:text-slate-800 text-xs flex items-center gap-1"
                      >
                        <FiChevronDown size={14} />
                        Show Breakdown
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div>
                    <div className="font-semibold text-slate-800 mb-1">A Grade</div>
                    <div className="flex gap-3 text-xs mb-2">
                      <span className="text-green-600">Assign: 180</span>
                      <span className="text-red-600">Albeit: 20</span>
                      <span className="text-amber-500">Not Assign: 35</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleView('a-grade')}
                        className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                      >
                        <FiEye size={14} />
                        View
                      </button>
                      <button 
                        onClick={() => handleShowBreakdown('A Grade', {
                          connected: 145,
                          notConnected: 35,
                          assign: 180,
                          albeit: 20,
                          notAssign: 35
                        })}
                        className="text-slate-600 hover:text-slate-800 text-xs flex items-center gap-1"
                      >
                        <FiChevronDown size={14} />
                        Show Breakdown
                      </button>
                    </div>
                  </div>
                </td>
              </tr>

              {/* Row 2 */}
              <tr className="border-b border-gray-200 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-4 font-semibold text-slate-800">2</td>
                <td className="px-4 py-4">
                  <div>
                    <div className="font-semibold text-slate-800 mb-1">Instagram</div>
                    <div className="flex gap-3 text-xs mb-2">
                      <span className="text-green-600">Assign: 95</span>
                      <span className="text-red-600">Albeit: 15</span>
                      <span className="text-amber-500">Not Assign: 30</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleView('instagram')}
                        className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                      >
                        <FiEye size={14} />
                        View
                      </button>
                      <button 
                        onClick={() => handleShowBreakdown('Instagram', {
                          connected: 70,
                          notConnected: 25,
                          assign: 95,
                          albeit: 15,
                          notAssign: 30
                        })}
                        className="text-slate-600 hover:text-slate-800 text-xs flex items-center gap-1"
                      >
                        <FiChevronDown size={14} />
                        Show Breakdown
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div>
                    <div className="font-semibold text-slate-800 mb-1">MP Board</div>
                    <div className="flex gap-3 text-xs mb-2">
                      <span className="text-green-600">Assign: 85</span>
                      <span className="text-red-600">Albeit: 12</span>
                      <span className="text-amber-500">Not Assign: 25</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleView('mp-board')}
                        className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                      >
                        <FiEye size={14} />
                        View
                      </button>
                      <button 
                        onClick={() => handleShowBreakdown('MP Board', {
                          connected: 60,
                          notConnected: 25,
                          assign: 85,
                          albeit: 12,
                          notAssign: 25
                        })}
                        className="text-slate-600 hover:text-slate-800 text-xs flex items-center gap-1"
                      >
                        <FiChevronDown size={14} />
                        Show Breakdown
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div>
                    <div className="font-semibold text-slate-800 mb-1">B Grade</div>
                    <div className="flex gap-3 text-xs mb-2">
                      <span className="text-green-600">Assign: 110</span>
                      <span className="text-red-600">Albeit: 22</span>
                      <span className="text-amber-500">Not Assign: 38</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleView('b-grade')}
                        className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                      >
                        <FiEye size={14} />
                        View
                      </button>
                      <button 
                        onClick={() => handleShowBreakdown('B Grade', {
                          connected: 72,
                          notConnected: 38,
                          assign: 110,
                          albeit: 22,
                          notAssign: 38
                        })}
                        className="text-slate-600 hover:text-slate-800 text-xs flex items-center gap-1"
                      >
                        <FiChevronDown size={14} />
                        Show Breakdown
                      </button>
                    </div>
                  </div>
                </td>
              </tr>

              {/* Row 3 */}
              <tr className="border-b border-gray-200 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-4 font-semibold text-slate-800">3</td>
                <td className="px-4 py-4">
                  <div>
                    <div className="font-semibold text-slate-800 mb-1">WhatsApp</div>
                    <div className="flex gap-3 text-xs mb-2">
                      <span className="text-green-600">Assign: 120</span>
                      <span className="text-red-600">Albeit: 18</span>
                      <span className="text-amber-500">Not Assign: 40</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleView('whatsapp')}
                        className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                      >
                        <FiEye size={14} />
                        View
                      </button>
                      <button 
                        onClick={() => handleShowBreakdown('WhatsApp', {
                          connected: 95,
                          notConnected: 25,
                          assign: 120,
                          albeit: 18,
                          notAssign: 40
                        })}
                        className="text-slate-600 hover:text-slate-800 text-xs flex items-center gap-1"
                      >
                        <FiChevronDown size={14} />
                        Show Breakdown
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div>
                    <div className="font-semibold text-slate-800 mb-1">Other Board</div>
                    <div className="flex gap-3 text-xs mb-2">
                      <span className="text-green-600">Assign: 65</span>
                      <span className="text-red-600">Albeit: 10</span>
                      <span className="text-amber-500">Not Assign: 20</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleView('other-board')}
                        className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                      >
                        <FiEye size={14} />
                        View
                      </button>
                      <button 
                        onClick={() => handleShowBreakdown('Other Board', {
                          connected: 45,
                          notConnected: 20,
                          assign: 65,
                          albeit: 10,
                          notAssign: 20
                        })}
                        className="text-slate-600 hover:text-slate-800 text-xs flex items-center gap-1"
                      >
                        <FiChevronDown size={14} />
                        Show Breakdown
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div>
                    <div className="font-semibold text-slate-800 mb-1">C Grade</div>
                    <div className="flex gap-3 text-xs mb-2">
                      <span className="text-green-600">Assign: 75</span>
                      <span className="text-red-600">Albeit: 15</span>
                      <span className="text-amber-500">Not Assign: 28</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleView('c-grade')}
                        className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                      >
                        <FiEye size={14} />
                        View
                      </button>
                      <button 
                        onClick={() => handleShowBreakdown('C Grade', {
                          connected: 47,
                          notConnected: 28,
                          assign: 75,
                          albeit: 15,
                          notAssign: 28
                        })}
                        className="text-slate-600 hover:text-slate-800 text-xs flex items-center gap-1"
                      >
                        <FiChevronDown size={14} />
                        Show Breakdown
                      </button>
                    </div>
                  </div>
                </td>
              </tr>

              {/* Row 4 */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-4 font-semibold text-slate-800">4</td>
                <td className="px-4 py-4">
                  <div>
                    <div className="font-semibold text-slate-800 mb-1">Facebook</div>
                    <div className="flex gap-3 text-xs mb-2">
                      <span className="text-green-600">Assign: 80</span>
                      <span className="text-red-600">Albeit: 12</span>
                      <span className="text-amber-500">Not Assign: 25</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleView('facebook')}
                        className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                      >
                        <FiEye size={14} />
                        View
                      </button>
                      <button 
                        onClick={() => handleShowBreakdown('Facebook', {
                          connected: 55,
                          notConnected: 25,
                          assign: 80,
                          albeit: 12,
                          notAssign: 25
                        })}
                        className="text-slate-600 hover:text-slate-800 text-xs flex items-center gap-1"
                      >
                        <FiChevronDown size={14} />
                        Show Breakdown
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div>
                    <div className="font-semibold text-slate-800 mb-1">ICSE</div>
                    <div className="flex gap-3 text-xs mb-2">
                      <span className="text-green-600">Assign: 90</span>
                      <span className="text-red-600">Albeit: 14</span>
                      <span className="text-amber-500">Not Assign: 22</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleView('icse')}
                        className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                      >
                        <FiEye size={14} />
                        View
                      </button>
                      <button 
                        onClick={() => handleShowBreakdown('ICSE', {
                          connected: 68,
                          notConnected: 22,
                          assign: 90,
                          albeit: 14,
                          notAssign: 22
                        })}
                        className="text-slate-600 hover:text-slate-800 text-xs flex items-center gap-1"
                      >
                        <FiChevronDown size={14} />
                        Show Breakdown
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div>
                    <div className="font-semibold text-slate-800 mb-1">D Grade</div>
                    <div className="flex gap-3 text-xs mb-2">
                      <span className="text-green-600">Assign: 50</span>
                      <span className="text-red-600">Albeit: 10</span>
                      <span className="text-amber-500">Not Assign: 18</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleView('d-grade')}
                        className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                      >
                        <FiEye size={14} />
                        View
                      </button>
                      <button 
                        onClick={() => handleShowBreakdown('D Grade', {
                          connected: 32,
                          notConnected: 18,
                          assign: 50,
                          albeit: 10,
                          notAssign: 18
                        })}
                        className="text-slate-600 hover:text-slate-800 text-xs flex items-center gap-1"
                      >
                        <FiChevronDown size={14} />
                        Show Breakdown
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Breakdown Modal */}
      <BreakdownModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={modalTitle}
        data={modalData}
      />
     
    </div>
  );
};

export default Datasegregation;