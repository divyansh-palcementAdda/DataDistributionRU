import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiLayers, FiUsers, FiUser, FiCalendar, FiEdit } from 'react-icons/fi';
import { getDepartmentById } from '../Services/department/departmentService';
import {
    getLeadStatusBreakdown,
    getLeadSourceBreakdown,
    getGradeBreakdown,
    getBoardBreakdown,
    getCourseTypesBreakdown,
} from '../Services/cards/cardService';
import LeadCards from '../component/reusable/DashBoards/leadCards';
import LeadSource from '../component/reusable/DashBoards/leadSource';
import CategorywiseCard from '../component/reusable/DashBoards/categorywiseCard';
import BoardWiseCard from '../component/reusable/DashBoards/BoardWiseCard';
import GradWiseCard from '../component/reusable/DashBoards/gradWiseCard';
import ReusableTable from '../component/reusable/table';

// Format Date Helper
const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return isoString;
    }
};

// Table columns for the breakdown data
const TABLE_COLUMNS = [
    {
        key: 'name',
        header: 'Name',
        sortable: true,
    },
    {
        key: 'code',
        header: 'Code',
        sortable: true,
        render: (val) => (
            <span className="inline-block bg-gray-100 text-gray-700 text-xs font-mono px-2 py-0.5 rounded">
                {val || '-'}
            </span>
        ),
    },
    {
        key: 'count',
        header: 'Count',
        sortable: true,
        render: (val) => (
            <span className="font-semibold text-gray-900">
                {val !== undefined && val !== null ? val.toLocaleString() : '0'}
            </span>
        ),
    },
    {
        key: 'percentage',
        header: 'Percentage',
        sortable: true,
        render: (val) => {
            const pct = val !== undefined && val !== null ? Number(val) : 0;
            return (
                <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 min-w-[60px]">
                        <div
                            className="h-1.5 rounded-full bg-indigo-500"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                    </div>
                    <span className="text-xs font-medium text-gray-600 w-12 text-right">
                        {pct.toFixed(1)}%
                    </span>
                </div>
            );
        },
    },
];

// Helper: fetch table data based on selected card
const fetchTableData = async (selectedCard, departmentId) => {
    const baseParams = { departmentId };

    if (!selectedCard) return [];

    try {
        let res;
        switch (selectedCard.type) {
            case 'leadStatus':
                res = await getLeadStatusBreakdown({ ...baseParams, status: selectedCard.value });
                break;
            case 'leadSource':
                res = await getLeadSourceBreakdown({ ...baseParams, sourceKey: selectedCard.value });
                break;
            case 'courseType':
                res = await getCourseTypesBreakdown({ ...baseParams, courseTypeKey: selectedCard.value });
                break;
            case 'board':
                res = await getBoardBreakdown({ ...baseParams, boardKey: selectedCard.value });
                break;
            case 'grade':
                res = await getGradeBreakdown({ ...baseParams, gradeKey: selectedCard.value });
                break;
            default:
                return [];
        }
        return res?.data?.data || res?.data || [];
    } catch (err) {
        console.error('Failed to fetch table data', err);
        return [];
    }
};

const DepartmentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [department, setDepartment] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Dashboard card data
    const [dashData, setDashData] = useState({ leadStatus: [], leadSource: [], courseType: [], board: [], grade: [] });

    // Filter / table state
    const [selectedCard, setSelectedCard] = useState(null);
    const [tableData, setTableData] = useState([]);
    const [tableLoading, setTableLoading] = useState(false);

    useEffect(() => {
        if (!id) return;
        const fetchDepartmentDetails = async () => {
            setLoading(true);
            try {
                const res = await getDepartmentById(id);
                setDepartment(res?.data || res);
            } catch (err) {
                console.error("Error fetching department details:", err);
                setError(err?.message || err?.data?.message || "Failed to fetch department details");
                toast.error("Failed to load department details");
            } finally {
                setLoading(false);
            }
        };
        fetchDepartmentDetails();
    }, [id]);

    // Fetch dashboard breakdown data for this department
    useEffect(() => {
        if (!id) return;
        const fetchDashboardData = async () => {
            const params = { departmentId: id };
            try {
                const [statusRes, sourceRes, courseTypeRes, boardRes, gradeRes] = await Promise.all([
                    getLeadStatusBreakdown(params).catch(() => null),
                    getLeadSourceBreakdown(params).catch(() => null),
                    getCourseTypesBreakdown(params).catch(() => null),
                    getBoardBreakdown(params).catch(() => null),
                    getGradeBreakdown(params).catch(() => null),
                ]);
                const toArr = (res) => res?.data?.data || res?.data || [];
                setDashData({
                    leadStatus: toArr(statusRes),
                    leadSource: toArr(sourceRes),
                    courseType: toArr(courseTypeRes),
                    board: toArr(boardRes),
                    grade: toArr(gradeRes),
                });
            } catch (err) {
                console.error('Dashboard data fetch failed', err);
            }
        };
        fetchDashboardData();
    }, [id]);

    // Fetch table data when a card is selected
    useEffect(() => {
        if (!selectedCard) { setTableData([]); return; }
        setTableLoading(true);
        fetchTableData(selectedCard, id).then((data) => {
            setTableData(data);
            setTableLoading(false);
        });
    }, [selectedCard, id]);

    // Card click handler
    const handleCardClick = (card) => {
        setSelectedCard((prev) =>
            prev?.type === card.type && prev?.value === card.value ? null : card
        );
    };

    const handleEdit = () => {
        navigate('/department', { state: { editDepartment: department } });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                <span className="ml-2 text-gray-600 font-medium">Loading department details...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex justify-between items-center shadow-sm">
                    <span>{error}</span>
                    <button 
                        onClick={() => navigate('/department')} 
                        className="text-sm font-semibold underline hover:text-red-800"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!department) {
        return (
            <div className="p-6">
                <div className="bg-gray-50 border border-gray-200 text-gray-600 px-4 py-3 rounded-xl flex justify-between items-center shadow-sm">
                    <span>Department not found</span>
                    <button 
                        onClick={() => navigate('/department')} 
                        className="text-sm font-semibold underline hover:text-gray-800"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
            {/* Page Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={() => navigate('/department')}
                        style={{
                            padding: '8px',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            backgroundColor: '#FFFFFF',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#F1F5F9'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#FFFFFF'}
                    >
                        <FiArrowLeft style={{ color: '#64748B', fontSize: '16px' }} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                            Department Details
                        </h1>
                        <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748B' }}>
                            View comprehensive department information
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleEdit}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid #2563EB',
                        backgroundColor: '#2563EB',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#1D4ED8'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#2563EB'}
                >
                    <FiEdit style={{ fontSize: '14px' }} />
                    Edit Department
                </button>
            </div>

            {/* Dashboard Cards */}
            <div style={{ marginBottom: '24px' }}>
                <LeadCards
                    onCardClick={handleCardClick}
                    selectedCard={selectedCard}
                />
                <LeadSource
                    data={dashData.leadSource}
                    onCardClick={handleCardClick}
                    selectedCard={selectedCard}
                />
                <CategorywiseCard
                    data={dashData.courseType}
                    onCardClick={handleCardClick}
                    selectedCard={selectedCard}
                />
                <BoardWiseCard
                    data={dashData.board}
                    onCardClick={handleCardClick}
                    selectedCard={selectedCard}
                />
                <GradWiseCard
                    data={dashData.grade}
                    onCardClick={handleCardClick}
                    selectedCard={selectedCard}
                />
            </div>

            {/* Main Details Card */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        fontWeight: '700',
                        flexShrink: 0,
                    }}>
                        {department.name ? department.name.substring(0, 2).toUpperCase() : 'DP'}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', margin: '0 0 8px 0' }}>
                            {department.name}
                        </h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                            <span style={{
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '11px',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                backgroundColor: department.active ? '#DCFCE7' : '#F1F5F9',
                                color: department.active ? '#15803D' : '#64748B',
                                border: `1px solid ${department.active ? '#BBF7D0' : '#E2E8F0'}`,
                            }}>
                                {department.active ? 'Active' : 'Inactive'}
                            </span>
                            <span style={{
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '11px',
                                fontWeight: '600',
                                backgroundColor: '#EFF6FF',
                                color: '#1D4ED8',
                                border: '1px solid #DBEAFE',
                            }}>
                                {department.code}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    {/* Description */}
                    <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <FiLayers style={{ color: '#64748B', fontSize: '14px' }} />
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                Description
                            </span>
                        </div>
                        <p style={{ fontSize: '14px', color: '#334155', margin: 0, lineHeight: '1.5' }}>
                            {department.description || 'No description provided'}
                        </p>
                    </div>

                    {/* User Count */}
                    <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <FiUsers style={{ color: '#64748B', fontSize: '14px' }} />
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                Total Users
                            </span>
                        </div>
                        <p style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                            {department.userCount || (department.hods?.length || 0) + (department.counsellors?.length || 0)}
                        </p>
                    </div>

                    {/* Created Date */}
                    <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <FiCalendar style={{ color: '#64748B', fontSize: '14px' }} />
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                Created Date
                            </span>
                        </div>
                        <p style={{ fontSize: '14px', color: '#334155', margin: 0 }}>
                            {formatDate(department.createdAt)}
                        </p>
                    </div>

                    {/* Last Updated */}
                    <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <FiEdit style={{ color: '#64748B', fontSize: '14px' }} />
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                Last Updated
                            </span>
                        </div>
                        <p style={{ fontSize: '14px', color: '#334155', margin: 0 }}>
                            {formatDate(department.updatedAt)}
                        </p>
                    </div>
                </div>
            </div>

            {/* HODs Section */}
            {department.hods && department.hods.length > 0 && (
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiUser style={{ color: '#7C3AED', fontSize: '18px' }} />
                        Heads of Department ({department.hods.length})
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                        {department.hods.map((hod, index) => (
                            <div key={hod.id || index} style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        backgroundColor: '#7C3AED',
                                        color: '#FFFFFF',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '14px',
                                        fontWeight: '700',
                                    }}>
                                        {hod.firstName?.[0] || 'H'}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', color: '#1E293B', fontSize: '14px' }}>
                                            {hod.firstName} {hod.lastName}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748B' }}>
                                            {hod.email}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    <span style={{
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        fontSize: '10px',
                                        fontWeight: '600',
                                        backgroundColor: '#F5F3FF',
                                        color: '#6D28D9',
                                        border: '1px solid #E9D5FF',
                                    }}>
                                        {hod.hodAccessType || 'FULL_ACCESS'}
                                    </span>
                                    {hod.active && (
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '10px',
                                            fontWeight: '600',
                                            backgroundColor: '#DCFCE7',
                                            color: '#15803D',
                                            border: '1px solid #BBF7D0',
                                        }}>
                                            Active
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Counsellors Section */}
            {department.counsellors && department.counsellors.length > 0 && (
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiUsers style={{ color: '#2563EB', fontSize: '18px' }} />
                        Counsellors ({department.counsellors.length})
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                        {department.counsellors.map((counsellor, index) => (
                            <div key={counsellor.id || index} style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        backgroundColor: '#2563EB',
                                        color: '#FFFFFF',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '14px',
                                        fontWeight: '700',
                                    }}>
                                        {counsellor.firstName?.[0] || 'C'}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', color: '#1E293B', fontSize: '14px' }}>
                                            {counsellor.firstName} {counsellor.lastName}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748B' }}>
                                            {counsellor.email}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {counsellor.active && (
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '10px',
                                            fontWeight: '600',
                                            backgroundColor: '#DCFCE7',
                                            color: '#15803D',
                                            border: '1px solid #BBF7D0',
                                        }}>
                                            Active
                                        </span>
                                    )}
                                    {counsellor.roles && counsellor.roles.length > 0 && (
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '10px',
                                            fontWeight: '600',
                                            backgroundColor: '#DBEAFE',
                                            color: '#1D4ED8',
                                            border: '1px solid #BFDBFE',
                                        }}>
                                            {counsellor.roles[0]}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* No Staff Message */}
            {(!department.hods || department.hods.length === 0) && (!department.counsellors || department.counsellors.length === 0) && (
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px dashed #E2E8F0', padding: '32px', textAlign: 'center' }}>
                    <FiUsers style={{ color: '#CBD5E1', fontSize: '32px', marginBottom: '12px' }} />
                    <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
                        No staff members assigned to this department yet
                    </p>
                </div>
            )}

            {/* Filtered Table */}
            {selectedCard && (
                <div style={{ marginTop: '24px' }}>
                    {/* Table Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '4px', height: '20px', backgroundColor: '#6366F1', borderRadius: '2px' }} />
                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}>
                                {selectedCard.label}
                            </h3>
                            <span style={{ fontSize: '12px', color: '#9CA3AF', backgroundColor: '#F3F4F6', padding: '2px 8px', borderRadius: '9999px' }}>
                                {tableData.length} records
                            </span>
                        </div>
                        <button
                            onClick={() => setSelectedCard(null)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '12px',
                                color: '#6B7280',
                                padding: '6px 10px',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                backgroundColor: 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.color = '#EF4444';
                                e.target.style.backgroundColor = '#FEF2F2';
                                e.target.style.borderColor = '#FECACA';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.color = '#6B7280';
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.borderColor = '#E5E7EB';
                            }}
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                            Clear Filter
                        </button>
                    </div>

                    {/* Loading spinner */}
                    {tableLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '160px', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                            <div style={{ 
                                width: '28px', 
                                height: '28px', 
                                borderRadius: '50%', 
                                border: '2px solid #E5E7EB',
                                borderTop: '2px solid #6366F1',
                                animation: 'spin 1s linear infinite'
                            }} />
                            <span style={{ marginLeft: '8px', fontSize: '14px', color: '#6B7280' }}>Loading data...</span>
                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        </div>
                    ) : (
                        <ReusableTable
                            columns={TABLE_COLUMNS}
                            data={tableData}
                            emptyMessage={`No data found for "${selectedCard.label}"`}
                        />
                    )}
                </div>
            )}

            {/* Hint when no card selected */}
            {!selectedCard && (
                <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px dashed #E5E7EB', color: '#9CA3AF' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '12px', opacity: 0.5 }}>
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                   <p className="text-sm font-medium">No Data</p>
                </div>
            )}
        </div>
    );
};

export default DepartmentDetails;