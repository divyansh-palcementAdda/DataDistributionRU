import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ReusableTable from '../component/reusable/table';

const DatasegregationDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleBack = () => {
    navigate('/data-segregation');
  };

  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={handleBack}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">Data Segregation Details</h1>
            <p className="text-sm text-gray-500">ID: {id}</p>
          </div>
        </div>
        <ReusableTable 
          columns={[]}
          data={[]}
        />
      </div>
  )
}

export default DatasegregationDetail