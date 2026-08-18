import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';
import { FiRefreshCw, FiSearch, FiX, FiLayers } from 'react-icons/fi';

// Reusable Components
import ReusableTable from '../component/reusable/table';
import StatsCard from '../component/reusable/StatsCard';
import CustomButton from '../component/reusable/CustomButton';
import DeleteModal from '../component/reusable/deleteModel';
import AddDepartmentModal from '../component/reusable/department/addDepartmentModel';
import DepartmentDetailsModal from '../component/reusable/department/departmentDetailsModal';

// Services
import {
    getAllDepartments,
    deleteDepartment,
    toggleDepartmentStatus
} from '../Services/department/departmentService';

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

// Initial Mock Data according to user-specified schema
const INITIAL_MOCK_DEPARTMENTS = [
    {
        id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        name: "Admissions",
        code: "ADM",
        description: "Student Admissions & Enrollment Department handling intake and student onboarding",
        active: true,
        userCount: 12,
        hods: [
            {
                id: "hod-101",
                firstName: "Dr. Rajesh",
                lastName: "Sharma",
                email: "rajesh.sharma@university.edu",
                phone: "+91 98765 43210",
                username: "rajesh_sharma",
                profileImage: "",
                active: true,
                locked: false,
                emailVerified: true,
                lastLogin: "2026-08-18T10:44:05.715Z",
                department: "Admissions",
                departments: [
                    {
                        id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                        name: "Admissions",
                        code: "ADM"
                    }
                ],
                hodAccessType: "FULL_ACCESS",
                roles: ["HOD", "ADMIN"],
                permissions: ["MANAGE_USERS", "VIEW_LEADS", "ASSIGN_COUNSELLOR", "EXPORT_REPORTS"],
                createdAt: "2026-08-18T10:44:05.715Z",
                updatedAt: "2026-08-18T10:44:05.715Z"
            }
        ],
        counsellors: [
            {
                id: "coun-201",
                firstName: "Priya",
                lastName: "Verma",
                email: "priya.verma@university.edu",
                phone: "+91 98765 43211",
                username: "priya_v",
                profileImage: "",
                active: true,
                locked: false,
                emailVerified: true,
                lastLogin: "2026-08-18T10:44:05.715Z",
                department: "Admissions",
                departments: [
                    {
                        id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                        name: "Admissions",
                        code: "ADM"
                    }
                ],
                hodAccessType: "COUNSELLOR_ACCESS",
                roles: ["COUNSELLOR"],
                permissions: ["VIEW_LEADS", "CALL_LEADS", "CREATE_FOLLOWUP"],
                createdAt: "2026-08-18T10:44:05.715Z",
                updatedAt: "2026-08-18T10:44:05.715Z"
            },
            {
                id: "coun-202",
                firstName: "Amit",
                lastName: "Patel",
                email: "amit.patel@university.edu",
                phone: "+91 98765 43212",
                username: "amit_p",
                profileImage: "",
                active: true,
                locked: false,
                emailVerified: true,
                lastLogin: "2026-08-18T09:30:00.715Z",
                department: "Admissions",
                departments: [
                    {
                        id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                        name: "Admissions",
                        code: "ADM"
                    }
                ],
                hodAccessType: "COUNSELLOR_ACCESS",
                roles: ["COUNSELLOR"],
                permissions: ["VIEW_LEADS", "CALL_LEADS"],
                createdAt: "2026-08-18T10:44:05.715Z",
                updatedAt: "2026-08-18T10:44:05.715Z"
            }
        ],
        createdAt: "2026-08-18T10:44:05.715Z",
        updatedAt: "2026-08-18T10:44:05.715Z"
    },
    {
        id: "4fa85f64-5717-4562-b3fc-2c963f66afa7",
        name: "Marketing & Outreach",
        code: "MKT",
        description: "Digital campaigns, outreach drives, and brand awareness programs",
        active: true,
        userCount: 8,
        hods: [
            {
                id: "hod-102",
                firstName: "Sunita",
                lastName: "Deshmukh",
                email: "sunita.d@university.edu",
                phone: "+91 98765 43213",
                username: "sunita_d",
                profileImage: "",
                active: true,
                locked: false,
                emailVerified: true,
                lastLogin: "2026-08-18T08:15:00.000Z",
                department: "Marketing & Outreach",
                departments: [
                    {
                        id: "4fa85f64-5717-4562-b3fc-2c963f66afa7",
                        name: "Marketing & Outreach",
                        code: "MKT"
                    }
                ],
                hodAccessType: "FULL_ACCESS",
                roles: ["HOD", "MARKETING_LEAD"],
                permissions: ["CAMPAIGN_MANAGE", "LEAD_EXPORT", "ANALYTICS_VIEW"],
                createdAt: "2026-08-15T08:00:00.000Z",
                updatedAt: "2026-08-17T11:20:00.000Z"
            }
        ],
        counsellors: [
            {
                id: "coun-203",
                firstName: "Rohan",
                lastName: "Kapoor",
                email: "rohan.k@university.edu",
                phone: "+91 98765 43214",
                username: "rohan_k",
                profileImage: "",
                active: true,
                locked: false,
                emailVerified: true,
                lastLogin: "2026-08-18T07:45:00.000Z",
                department: "Marketing & Outreach",
                departments: [
                    {
                        id: "4fa85f64-5717-4562-b3fc-2c963f66afa7",
                        name: "Marketing & Outreach",
                        code: "MKT"
                    }
                ],
                hodAccessType: "COUNSELLOR_ACCESS",
                roles: ["COUNSELLOR", "MARKETING_EXEC"],
                permissions: ["VIEW_LEADS", "CALL_LEADS"],
                createdAt: "2026-08-15T09:00:00.000Z",
                updatedAt: "2026-08-17T12:00:00.000Z"
            }
        ],
        createdAt: "2026-08-15T08:00:00.000Z",
        updatedAt: "2026-08-17T11:20:00.000Z"
    },
    {
        id: "5fa85f64-5717-4562-b3fc-2c963f66afa8",
        name: "Engineering & Tech",
        code: "ENG",
        description: "B.Tech, M.Tech, and specialized technical degree programs counseling",
        active: true,
        userCount: 15,
        hods: [
            {
                id: "hod-103",
                firstName: "Prof. Vikram",
                lastName: "Mehta",
                email: "vikram.m@university.edu",
                phone: "+91 98765 43215",
                username: "vikram_m",
                profileImage: "",
                active: true,
                locked: false,
                emailVerified: true,
                lastLogin: "2026-08-18T11:00:00.000Z",
                department: "Engineering & Tech",
                departments: [
                    {
                        id: "5fa85f64-5717-4562-b3fc-2c963f66afa8",
                        name: "Engineering & Tech",
                        code: "ENG"
                    }
                ],
                hodAccessType: "FULL_ACCESS",
                roles: ["HOD", "FACULTY_HEAD"],
                permissions: ["ALL_ACCESS"],
                createdAt: "2026-08-10T09:00:00.000Z",
                updatedAt: "2026-08-16T14:30:00.000Z"
            }
        ],
        counsellors: [
            {
                id: "coun-204",
                firstName: "Neha",
                lastName: "Gupta",
                email: "neha.g@university.edu",
                phone: "+91 98765 43216",
                username: "neha_g",
                profileImage: "",
                active: true,
                locked: false,
                emailVerified: true,
                lastLogin: "2026-08-18T10:10:00.000Z",
                department: "Engineering & Tech",
                departments: [
                    {
                        id: "5fa85f64-5717-4562-b3fc-2c963f66afa8",
                        name: "Engineering & Tech",
                        code: "ENG"
                    }
                ],
                hodAccessType: "COUNSELLOR_ACCESS",
                roles: ["COUNSELLOR"],
                permissions: ["VIEW_LEADS", "CALL_LEADS", "CREATE_FOLLOWUP"],
                createdAt: "2026-08-10T10:00:00.000Z",
                updatedAt: "2026-08-16T14:30:00.000Z"
            }
        ],
        createdAt: "2026-08-10T09:00:00.000Z",
        updatedAt: "2026-08-16T14:30:00.000Z"
    },
    {
        id: "6fa85f64-5717-4562-b3fc-2c963f66afa9",
        name: "Management & Business",
        code: "MGMT",
        description: "MBA, BBA, Executive Programs, and Corporate Training Admissions",
        active: false,
        userCount: 6,
        hods: [
            {
                id: "hod-104",
                firstName: "Dr. Ananya",
                lastName: "Rao",
                email: "ananya.rao@university.edu",
                phone: "+91 98765 43217",
                username: "ananya_r",
                profileImage: "",
                active: false,
                locked: false,
                emailVerified: true,
                lastLogin: "2026-08-14T14:20:00.000Z",
                department: "Management & Business",
                departments: [
                    {
                        id: "6fa85f64-5717-4562-b3fc-2c963f66afa9",
                        name: "Management & Business",
                        code: "MGMT"
                    }
                ],
                hodAccessType: "FULL_ACCESS",
                roles: ["HOD"],
                permissions: ["VIEW_LEADS", "EXPORT_REPORTS"],
                createdAt: "2026-08-01T08:30:00.000Z",
                updatedAt: "2026-08-14T15:00:00.000Z"
            }
        ],
        counsellors: [],
        createdAt: "2026-08-01T08:30:00.000Z",
        updatedAt: "2026-08-14T15:00:00.000Z"
    }
];

const CARD_PALETTES = [
    { bg: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' },
    { bg: 'linear-gradient(135deg, #059669 0%, #047857 100%)' },
    { bg: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' },
    { bg: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)' },
];

const Department = () => {
    // State
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Pagination & Sorting for ReusableTable
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [sortBy, setSortBy] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [departmentToDelete, setDepartmentToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setCurrentPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch departments data
    const fetchDepartments = useCallback(async () => {
        setLoading(true);
        try {
            const activeParam = statusFilter === 'ACTIVE' ? true : statusFilter === 'INACTIVE' ? false : undefined;
            const res = await getAllDepartments({
                page: currentPage - 1,
                size: rowsPerPage,
                sortBy: sortBy || 'name',
                sortDirection: sortDirection ? sortDirection.toUpperCase() : 'ASC',
                search: debouncedSearch || '',
                active: activeParam
            });

            const dataObj = res?.data || res;
            if (dataObj && (dataObj.content || Array.isArray(dataObj))) {
                const list = dataObj.content || (Array.isArray(dataObj) ? dataObj : []);
                setDepartments(list);
                setTotalPages(dataObj.totalPages ?? Math.max(1, Math.ceil(list.length / rowsPerPage)));
                setTotalElements(dataObj.totalElements ?? list.length);
            } else {
                setDepartments([]);
                setTotalPages(0);
                setTotalElements(0);
            }
        } catch (err) {
            console.error("Error fetching departments:", err);
            toast.error(err?.message || err?.data?.message || "Failed to fetch departments");
            setDepartments([]);
            setTotalPages(0);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, rowsPerPage, sortBy, sortDirection, debouncedSearch, statusFilter]);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    // Statistics calculation for StatsCards
    const stats = useMemo(() => {
        const total = totalElements || departments.length;
        const active = departments.filter((d) => d.active).length;
        const totalHods = departments.reduce((acc, d) => acc + (d.hods?.length || 0), 0);
        const totalCounsellors = departments.reduce((acc, d) => acc + (d.counsellors?.length || 0), 0);
        const totalUsers = departments.reduce((acc, d) => acc + (d.userCount || 0), 0);

        return { total, active, totalHods, totalCounsellors, totalUsers };
    }, [departments, totalElements]);

    // Status toggle handler
    const handleToggleStatus = async (dept) => {
        const updatedStatus = !dept.active;
        try {
            setDepartments((prev) =>
                prev.map((item) => (item.id === dept.id ? { ...item, active: updatedStatus } : item))
            );
            await toggleDepartmentStatus(dept.id);
            toast.success(`Department "${dept.name}" is now ${updatedStatus ? 'Active' : 'Inactive'}`);
            fetchDepartments();
        } catch (error) {
            toast.error(error?.message || "Failed to toggle status");
            fetchDepartments();
        }
    };

    // Delete Handler
    const handleDeleteConfirm = async () => {
        if (!departmentToDelete) return;
        try {
            setIsDeleting(true);
            await deleteDepartment(departmentToDelete.id);
            toast.success(`Department "${departmentToDelete.name}" deleted successfully`);
            setIsDeleteModalOpen(false);
            setDepartmentToDelete(null);
            fetchDepartments();
        } catch (error) {
            const errorMsg = error?.message || error?.data?.message || (typeof error === 'string' ? error : "Failed to delete department");
            toast.error(errorMsg);
        } finally {
            setIsDeleting(false);
        }
    };

    // Modal Submit Handlers
    const handleModalSubmit = () => {
        setIsAddModalOpen(false);
        setEditData(null);
        fetchDepartments();
    };

    // Table Columns Definition
    const columns = [
        {
            key: "sno",
            header: "S.No",
            sortable: false,
            render: (_, row, index) => (
                <span style={{ fontWeight: '500', color: '#64748B' }}>
                    {(currentPage - 1) * rowsPerPage + index + 1}
                </span>
            )
        },
        {
            key: "name",
            header: "Department & Code",
            sortable: true,
            render: (_, row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '600', color: '#0F172A', fontSize: '13px' }}>
                        {row.name}
                    </span>
                    <span
                        style={{
                            padding: '2px 7px',
                            borderRadius: '4px',
                            backgroundColor: '#EFF6FF',
                            color: '#1D4ED8',
                            fontSize: '11px',
                            fontWeight: '700',
                            border: '1px solid #DBEAFE',
                            letterSpacing: '0.04em',
                        }}
                    >
                        {row.code}
                    </span>
                </div>
            )
        },
        {
            key: "description",
            header: "Description",
            sortable: true,
            render: (value) => (
                <span
                    style={{
                        color: '#64748B',
                        fontSize: '13px',
                        maxWidth: '240px',
                        display: 'inline-block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}
                    title={value}
                >
                    {value || '—'}
                </span>
            )
        },
        {
            key: "hods",
            header: "Head of Dept (HOD)",
            sortable: false,
            render: (_, row) => {
                const firstHod = row.hods?.[0];
                const count = row.hods?.length || 0;
                if (!firstHod) {
                    return <span style={{ color: '#94A3B8', fontSize: '12px', fontStyle: 'italic' }}>No HOD</span>;
                }
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                            style={{
                                width: '26px',
                                height: '26px',
                                borderRadius: '50%',
                                backgroundColor: '#7C3AED',
                                color: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                fontWeight: '700',
                                flexShrink: 0,
                            }}
                        >
                            {firstHod.firstName?.[0] || 'H'}
                        </div>
                        <div>
                            <div style={{ fontWeight: '600', color: '#1E293B', fontSize: '12px' }}>
                                {firstHod.firstName} {firstHod.lastName}
                            </div>
                            <span
                                style={{
                                    fontSize: '10px',
                                    color: '#6D28D9',
                                    backgroundColor: '#F5F3FF',
                                    padding: '1px 5px',
                                    borderRadius: '3px',
                                    fontWeight: '600',
                                }}
                            >
                                {firstHod.hodAccessType || 'FULL_ACCESS'}
                            </span>
                            {count > 1 && (
                                <span style={{ fontSize: '11px', color: '#64748B', marginLeft: '4px' }}>
                                    +{count - 1}
                                </span>
                            )}
                        </div>
                    </div>
                );
            }
        },
        {
            key: "counsellors",
            header: "Counsellors",
            sortable: false,
            render: (_, row) => {
                const counCount = row.counsellors?.length || 0;
                if (counCount === 0) {
                    return <span style={{ color: '#94A3B8', fontSize: '12px', fontStyle: 'italic' }}>None</span>;
                }
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {row.counsellors?.slice(0, 3).map((c, i) => (
                                <div
                                    key={c.id || i}
                                    title={`${c.firstName} ${c.lastName}`}
                                    style={{
                                        width: '22px',
                                        height: '22px',
                                        borderRadius: '50%',
                                        backgroundColor: ['#2563EB', '#059669', '#D97706'][i % 3],
                                        color: '#FFFFFF',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '9px',
                                        fontWeight: '700',
                                        border: '2px solid #FFFFFF',
                                        marginLeft: i === 0 ? '0' : '-6px',
                                    }}
                                >
                                    {c.firstName?.[0] || 'C'}
                                </div>
                            ))}
                        </div>
                        <span
                            style={{
                                padding: '2px 7px',
                                borderRadius: '10px',
                                backgroundColor: '#F1F5F9',
                                color: '#334155',
                                fontSize: '11px',
                                fontWeight: '600',
                            }}
                        >
                            {counCount} Counsellor{counCount > 1 ? 's' : ''}
                        </span>
                    </div>
                );
            }
        },
        {
            key: "userCount",
            header: "Total Users",
            sortable: true,
            render: (value, row) => (
                <span
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        fontWeight: '600',
                        color: '#334155',
                        fontSize: '12px',
                    }}
                >
                    {value || (row.hods?.length || 0) + (row.counsellors?.length || 0)}
                </span>
            )
        },
        {
            key: "active",
            header: "Status",
            sortable: true,
            render: (value, row) => {
                const isActive = row.active === true || value === 'ACTIVE' || value === true;
                return (
                    <span
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: isActive ? '#DCFCE7' : '#F1F5F9',
                            color: isActive ? '#15803D' : '#64748B',
                            border: `1px solid ${isActive ? '#BBF7D0' : '#E2E8F0'}`,
                        }}
                    >
                        <span
                            style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: isActive ? '#16A34A' : '#94A3B8',
                            }}
                        />
                        {isActive ? 'Active' : 'Inactive'}
                    </span>
                );
            }
        },
        {
            key: "createdAt",
            header: "Created Date",
            sortable: true,
            render: (value) => (
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                    {formatDate(value)}
                </span>
            )
        }
    ];

    return (
        <div
            style={{
                padding: '24px',
                backgroundColor: '#F8FAFC',
                minHeight: '100vh',
                fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                color: '#0F172A',
            }}
        >
            {/* ── Page Header ── */}
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    marginBottom: '20px',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                        style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '10px',
                            backgroundColor: '#EFF6FF',
                            color: '#2563EB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                        }}
                    >
                        <FiLayers />
                    </div>
                    <div>
                        <h1
                            style={{
                                fontSize: '22px',
                                fontWeight: '700',
                                color: '#0F172A',
                                margin: 0,
                                letterSpacing: '-0.02em',
                            }}
                        >
                            Department Management
                        </h1>
                        <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748B' }}>
                            Manage departments, HODs, counselor allocations, and staff permissions
                        </p>
                    </div>
                </div>

                {/* Action Buttons using CustomButton */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CustomButton
                        variant="ghost"
                        onClick={() => {
                            fetchDepartments();
                            toast.info('Refreshing departments...');
                        }}
                        className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-sm"
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                            <FiRefreshCw style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                            <span>Refresh</span>
                        </div>
                    </CustomButton>

                    <CustomButton
                        variant="primary"
                        onClick={() => {
                            setEditData(null);
                            setIsAddModalOpen(true);
                        }}
                        className="shadow-sm hover:shadow-md"
                    >
                        + Add Department
                    </CustomButton>
                </div>
            </div>

            {/* ── Stats Overview using StatsCard ── */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '16px',
                    marginBottom: '24px',
                }}
            >
                <StatsCard
                    title="Total Departments"
                    value={stats.total}
                    unit="depts"
                    percentage={100}
                    palette={CARD_PALETTES[0]}
                />
                <StatsCard
                    title="Active Departments"
                    value={stats.active}
                    unit="active"
                    percentage={stats.total ? Math.round((stats.active / stats.total) * 100) : 0}
                    palette={CARD_PALETTES[1]}
                />
                <StatsCard
                    title="Assigned HODs"
                    value={stats.totalHods}
                    unit="heads"
                    percentage={stats.total ? Math.min(100, Math.round((stats.totalHods / stats.total) * 100)) : 0}
                    palette={CARD_PALETTES[2]}
                />
                <StatsCard
                    title="Total Counsellors"
                    value={stats.totalCounsellors}
                    unit="staff"
                    percentage={stats.totalUsers ? Math.round((stats.totalCounsellors / stats.totalUsers) * 100) : 0}
                    palette={CARD_PALETTES[3]}
                />
            </div>

            {/* ── Search & Filter Controls ── */}
            <div
                style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    padding: '14px 18px',
                    marginBottom: '16px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}
            >
                {/* Search input with clear button */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        padding: '0 12px',
                        width: '100%',
                        maxWidth: '340px',
                    }}
                >
                    <FiSearch style={{ color: '#94A3B8', fontSize: '15px', marginRight: '8px' }} />
                    <input
                        type="text"
                        placeholder="Search department, code, HOD..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        style={{
                            width: '100%',
                            padding: '8px 0',
                            border: 'none',
                            outline: 'none',
                            fontSize: '13px',
                            color: '#0F172A',
                            backgroundColor: 'transparent',
                        }}
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            style={{
                                border: 'none',
                                background: 'none',
                                color: '#94A3B8',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                            }}
                        >
                            <FiX />
                        </button>
                    )}
                </div>

                {/* Filter dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>Status:</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            style={{
                                padding: '6px 12px',
                                fontSize: '13px',
                                borderRadius: '6px',
                                border: '1px solid #CBD5E1',
                                backgroundColor: '#FFFFFF',
                                color: '#334155',
                                outline: 'none',
                                cursor: 'pointer',
                                fontWeight: '500',
                            }}
                        >
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active Only</option>
                            <option value="INACTIVE">Inactive Only</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* ── Main Reusable Table ── */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <ReusableTable
                    columns={columns}
                    data={departments}
                    isServerSide={true}
                    totalElements={totalElements}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    rowsPerPage={rowsPerPage}
                    onPageChange={setCurrentPage}
                    onRowsPerPageChange={(newSize) => {
                        setRowsPerPage(newSize);
                        setCurrentPage(1);
                    }}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSort={(col, dir) => {
                        setSortBy(col);
                        setSortDirection(dir);
                        setCurrentPage(1);
                    }}
                    emptyMessage={loading ? "Loading departments..." : "No departments found"}
                    onView={(row) => {
                        setSelectedDepartment(row);
                        setIsDetailsModalOpen(true);
                    }}
                    onEdit={(row) => {
                        setEditData(row);
                        setIsAddModalOpen(true);
                    }}
                    onDelete={(row) => {
                        setDepartmentToDelete(row);
                        setIsDeleteModalOpen(true);
                    }}
                />
            </div>

            {/* ── Reusable Modals ── */}
            {/* 1. Add / Edit Department Modal */}
            <AddDepartmentModal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setEditData(null);
                }}
                initialData={editData}
                onSubmit={handleModalSubmit}
            />

            {/* 2. Department Details View Modal */}
            <DepartmentDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedDepartment(null);
                }}
                department={selectedDepartment}
                onEdit={(dept) => {
                    setIsDetailsModalOpen(false);
                    setEditData(dept);
                    setIsAddModalOpen(true);
                }}
            />

            {/* 3. Reusable Delete Confirmation Modal */}
            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDepartmentToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Delete Department"
                message={`Are you sure you want to delete "${departmentToDelete?.name}" (${departmentToDelete?.code})? This will unlink assigned members.`}
                isLoading={isDeleting}
            />
        </div>
    );
};

export default Department;
