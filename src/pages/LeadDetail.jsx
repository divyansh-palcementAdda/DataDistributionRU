import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import CustomButton from '../component/reusable/CustomButton';
import ScheduleModal from "../component/reusable/Leads/scheduleModel";
import CallModal from '../component/reusable/CallModal';
import WhatsAppModal from '../component/reusable/WhatsAppModal';
import ReusableTable from '../component/reusable/table';
import { createLeadSchedule, getLeadById } from '../Services/lead/leadService';

const LeadDetail = () => {
  const { id } = useParams();
  const { navTo, showToast } = useAppContext();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [leadDetails, setLeadDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusHistory, setStatusHistory] = useState([]);
  const [statusHistoryLoading, setStatusHistoryLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);

  useEffect(() => {
    if (id) {
      const fetchLead = async () => {
        setLoading(true);
        try {
          const res = await getLeadById(id);
          if (res?.data?.success) {
            setLeadDetails(res.data.data);
          }
        } catch (err) {
          console.error("Failed to fetch lead", err);
        } finally {
          setLoading(false);
        }
      };
      fetchLead();
    }
  }, [id]);

  useEffect(() => {
    // Static data for lead status history (since API is not available yet)
    const staticStatusHistory = [
      {
        status: 'Connected',
        changedAt: '2025-06-15T10:30:00',
        changedBy: { firstName: 'Rahul', lastName: 'Sharma', username: 'rahul.s' },
        remarks: 'Initial contact made via phone call'
      },
      {
        status: 'Interested',
        changedAt: '2025-06-16T14:45:00',
        changedBy: { firstName: 'Rahul', lastName: 'Sharma', username: 'rahul.s' },
        remarks: 'Showed interest in Full Stack Development course'
      },
      {
        status: 'Follow Up',
        changedAt: '2025-06-18T11:00:00',
        changedBy: { firstName: 'Priya', lastName: 'Singh', username: 'priya.s' },
        remarks: 'Scheduled follow-up for course details discussion'
      },
      {
        status: 'Not Connected',
        changedAt: '2025-06-20T16:30:00',
        changedBy: { firstName: 'Amit', lastName: 'Kumar', username: 'amit.k' },
        remarks: 'Call not answered, left voicemail'
      },
      {
        status: 'Hot Lead',
        changedAt: '2025-06-22T09:15:00',
        changedBy: { firstName: 'Rahul', lastName: 'Sharma', username: 'rahul.s' },
        remarks: 'Lead responded positively, ready for enrollment'
      }
    ];
    setStatusHistory(staticStatusHistory);
    setStatusHistoryLoading(false);
  }, [id]);

  // Course database for search
  const courseDatabase = [
    { name: 'BBA', duration: '3 Years', fees: '₹3,00,000', description: 'Bachelor of Business Administration - Management and business fundamentals', eligibility: '12th Commerce with 50%', modules: ['Marketing', 'Finance', 'HR', 'Operations', 'Business Law'] },
    { name: 'BCA', duration: '3 Years', fees: '₹2,50,000', description: 'Bachelor of Computer Applications - Programming and software development', eligibility: '12th with Math/Computer Science', modules: ['Programming', 'Database', 'Web Dev', 'Networking', 'Software Engineering'] },
    { name: 'B.Com', duration: '3 Years', fees: '₹1,50,000', description: 'Bachelor of Commerce - Accounting and finance specialization', eligibility: '12th Commerce', modules: ['Accounting', 'Taxation', 'Auditing', 'Finance', 'Economics'] },
    { name: 'MBA', duration: '2 Years', fees: '₹8,00,000', description: 'Master of Business Administration - Advanced management studies', eligibility: 'Graduate with 50%', modules: ['Strategic Management', 'Leadership', 'Marketing', 'Finance', 'Operations'] },
    { name: 'MCA', duration: '2 Years', fees: '₹4,00,000', description: 'Master of Computer Applications - Advanced software development', eligibility: 'BCA/B.Tech with Math', modules: ['Advanced Programming', 'AI/ML', 'Cloud Computing', 'Cyber Security', 'Project Management'] },
    { name: 'Full Stack Development', duration: '6 Months', fees: '₹45,000', description: 'Complete web development with React, Node.js, and databases', eligibility: 'Basic programming knowledge', modules: ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB'] },
    { name: 'Data Science', duration: '6 Months', fees: '₹55,000', description: 'Machine learning, data analysis, and visualization', eligibility: 'Python and Statistics basics', modules: ['Python', 'Statistics', 'ML', 'Deep Learning', 'Tableau'] },
    { name: 'Digital Marketing', duration: '3 Months', fees: '₹25,000', description: 'SEO, SEM, Social Media, and Content Marketing', eligibility: 'No specific requirement', modules: ['SEO', 'Google Ads', 'Social Media', 'Content Marketing', 'Analytics'] }
  ];

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = courseDatabase.filter(course =>
        course.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses([]);
    }
  }, [searchQuery]);

  const initials = leadDetails?.fullName ? leadDetails.fullName.substring(0, 2).toUpperCase() : 'PK';

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'connected':
        return 'bg-green-100 text-green-700';
      case 'not connected':
        return 'bg-red-100 text-red-700';
      case 'interested':
        return 'bg-blue-100 text-blue-700';
      case 'follow up':
        return 'bg-orange-100 text-orange-700';
      case 'hot lead':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const statusHistoryColumns = [
    {
      key: 'sno',
      header: 'S.No',
      render: (_, __, index) => index + 1
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {value || '-'}
        </span>
      )
    },
    {
      key: 'changedAt',
      header: 'Changed At',
      render: (value) => formatDate(value)
    },
    {
      key: 'changedBy',
      header: 'Changed By',
      render: (value, row) => row?.changedBy?.firstName && row?.changedBy?.lastName
        ? `${row.changedBy.firstName} ${row.changedBy.lastName}`
        : row?.changedBy?.username || '-'
    },
    {
      key: 'remarks',
      header: 'Remarks',
      render: (value) => value || '-'
    }
  ];

  const handleScheduleSubmit = async (formData) => {
    try {
      const response = await createLeadSchedule(id, formData);
      if (response?.data?.success) {
        showToast('Follow-up scheduled successfully');
      } else {
        showToast(response?.data?.message || 'Unable to schedule follow-up');
      }
    } catch (error) {
      console.error('Failed to schedule follow-up', error);
      showToast('Failed to schedule follow-up');
    }
  };

  if (loading) {
    return <div className="p-6">Loading lead details...</div>;
  }

  return (
    <div className="block" id="page-lead-detail">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => navTo('leads')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">Lead Details</h1>

          </div>
        </div>
        <div className="flex gap-2">
          <CustomButton variant="primary" onClick={() => setIsScheduleModalOpen(true)} className="text-xs py-1.5 px-3 flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            Schedule Follow-up
          </CustomButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Lead Info Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm w-full">
            <div className="flex flex-col sm:flex-row items-start gap-5 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900 mb-1">{leadDetails?.fullName || 'Priya Kumar'}</h2>
                <p className="text-sm text-gray-500 mb-3">{leadDetails ? `${leadDetails.phoneNumber} · ${leadDetails.email}` : '+91 98765 43210 · priya.kumar@gmail.com'}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-100 uppercase tracking-wide">🔥 {leadDetails?.currentStatus || 'Hot Lead'}</span>
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-wide">{leadDetails?.courseInterested || 'Full Stack Dev'}</span>
                  <span className="bg-gray-50 text-gray-500 text-[10px] font-medium px-2 py-0.5 rounded-full border border-gray-100">Source: {leadDetails?.source?.name || 'Google Ads'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'City', value: leadDetails?.city || 'Bangalore, KA' },
                { label: 'State', value: leadDetails?.state || 'Karnataka' },
                { label: 'Country', value: leadDetails?.country || 'India' },
                { label: 'Status', value: leadDetails?.currentStatus || 'Professional' },
                { label: 'Lead Date', value: leadDetails?.createdAt ? new Date(leadDetails.createdAt).toLocaleDateString() : 'June 3, 2025' },
                { label: 'Source', value: leadDetails?.source?.name || 'Google Ads' }
              ].map((item, idx) => (
                <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{item.label}</div>
                  <div className="text-xs font-semibold text-gray-800">{item.value}</div>
                </div>
              ))}
            </div>

            {/* Course Info */}
            <div className="mt-5 pt-5 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Course Information</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Interested Course</div>
                  <div className="text-xs font-bold text-blue-600">{leadDetails?.courseInterested || 'Full Stack Development'}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Batch Preference</div>
                  <div className="text-xs font-semibold text-gray-800">Weekend Batch</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Budget</div>
                  <div className="text-xs font-semibold text-gray-800">₹45,000 – ₹60,000</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Start Date Pref.</div>
                  <div className="text-xs font-semibold text-gray-800">July 2025</div>
                </div>
              </div>
            </div>

            {/* Lead Status History */}
            <div className="mt-5 pt-5 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Lead Status History</h3>
              {statusHistoryLoading ? (
                <div className="text-center py-4 text-gray-500 text-sm">Loading status history...</div>
              ) : (
                <ReusableTable
                  columns={statusHistoryColumns}
                  data={statusHistory}
                  emptyMessage="No status history available"
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Course Search Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm w-full sticky top-2">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Info Penal</h3>
              

               <div className="flex gap-2 mb-4">
              <CustomButton 
                variant="primary" 
                onClick={() => window.location.href = `mailto:${leadDetails?.email || 'priya.kumar@gmail.com'}`} 
                className="bg-blue-600 hover:bg-blue-700 py-2 px-4 text-xs flex-1 flex items-center justify-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Email
              </CustomButton>
              <CustomButton variant="secondary" onClick={() => setIsWhatsAppModalOpen(true)} className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 text-xs flex-1 flex items-center justify-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                </svg>
                WhatsApp
              </CustomButton>
            </div>


            {/* Search Box */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search courses (e.g., BBA, MBA, BCA...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute right-3 top-2.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

         
           

            {/* Search Results */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {searchQuery.trim() === '' ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <svg
                    className="mx-auto w-12 h-12 mb-3 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <p>Type a course name to search</p>
                  <p className="text-xs mt-1">Try: BBA, MBA, BCA, MCA, etc.</p>
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <svg
                    className="mx-auto w-12 h-12 mb-3 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p>No courses found for "{searchQuery}"</p>
                </div>
              ) : (
                filteredCourses.map((course, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-bold text-blue-800">{course.name}</h4>
                      <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {course.duration}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{course.description}</p>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <div className="text-[9px] font-bold text-gray-400 uppercase">Fees</div>
                        <div className="text-xs font-semibold text-green-600">{course.fees}</div>
                      </div>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <div className="text-[9px] font-bold text-gray-400 uppercase">Eligibility</div>
                        <div className="text-xs font-semibold text-gray-700">{course.eligibility}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] font-bold text-gray-400 uppercase mb-1">Modules</div>
                      <div className="flex flex-wrap gap-1">
                        {course.modules.map((module, idx) => (
                          <span
                            key={idx}
                            className="bg-white text-gray-600 text-[10px] px-2 py-0.5 rounded border border-gray-200"
                          >
                            {module}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSubmit={handleScheduleSubmit}
      />

      <CallModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        studentData={leadDetails}
      />

      <WhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        studentData={leadDetails}
      />
    </div>
  );
};

export default LeadDetail;
