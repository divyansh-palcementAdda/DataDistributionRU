import React, { useState } from 'react';
import CustomButton from '../CustomButton';
import { 
  FiX, 
  FiMail, 
  FiPhone, 
  FiClock, 
  FiShield, 
  FiUserCheck, 
  FiUsers, 
  FiCheckCircle, 
  FiXCircle 
} from 'react-icons/fi';

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

const formatDateTime = (isoString) => {
  if (!isoString) return '—';
  try {
    const date = new Date(isoString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
};

const DepartmentDetailsModal = ({
  isOpen,
  onClose,
  department,
  onEdit,
}) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'hods' | 'counsellors'

  if (!isOpen || !department) return null;

  const hods = department.hods || [];
  const counsellors = department.counsellors || [];
  const totalUsers = department.userCount || hods.length + counsellors.length;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 110,
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '750px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
          border: '1px solid #E2E8F0',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F8FAFC',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                fontSize: '14px',
                fontWeight: '700',
                border: '1px solid #BFDBFE',
              }}
            >
              {department.code || 'DEPT'}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>
                {department.name}
              </h2>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: department.active ? '#16A34A' : '#64748B',
                  marginTop: '2px',
                }}
              >
                {department.active ? <FiCheckCircle /> : <FiXCircle />}
                {department.active ? 'Active Department' : 'Inactive Department'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'none',
              color: '#64748B',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
            }}
          >
            <FiX />
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #E2E8F0',
            padding: '0 24px',
            backgroundColor: '#FFFFFF',
            gap: '24px',
          }}
        >
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '12px 0',
              border: 'none',
              background: 'none',
              fontSize: '13px',
              fontWeight: '600',
              color: activeTab === 'overview' ? '#2563EB' : '#64748B',
              borderBottom: activeTab === 'overview' ? '2px solid #2563EB' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            Department Overview
          </button>

          <button
            onClick={() => setActiveTab('hods')}
            style={{
              padding: '12px 0',
              border: 'none',
              background: 'none',
              fontSize: '13px',
              fontWeight: '600',
              color: activeTab === 'hods' ? '#2563EB' : '#64748B',
              borderBottom: activeTab === 'hods' ? '2px solid #2563EB' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>HODs</span>
            <span
              style={{
                backgroundColor: '#F5F3FF',
                color: '#7C3AED',
                padding: '1px 6px',
                borderRadius: '10px',
                fontSize: '11px',
              }}
            >
              {hods.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('counsellors')}
            style={{
              padding: '12px 0',
              border: 'none',
              background: 'none',
              fontSize: '13px',
              fontWeight: '600',
              color: activeTab === 'counsellors' ? '#2563EB' : '#64748B',
              borderBottom: activeTab === 'counsellors' ? '2px solid #2563EB' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Counsellors / Staff</span>
            <span
              style={{
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                padding: '1px 6px',
                borderRadius: '10px',
                fontSize: '11px',
              }}
            >
              {counsellors.length}
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', flexGrow: 1, overflowY: 'auto' }}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    padding: '14px 16px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                    Department ID
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#0F172A', marginTop: '4px', wordBreak: 'break-all' }}>
                    {department.id}
                  </div>
                </div>

                <div
                  style={{
                    padding: '14px 16px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                    Total Users
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#2563EB', marginTop: '4px' }}>
                    {totalUsers} Members
                  </div>
                </div>

                <div
                  style={{
                    padding: '14px 16px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                    Created At
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#334155', marginTop: '4px' }}>
                    {formatDateTime(department.createdAt)}
                  </div>
                </div>

                <div
                  style={{
                    padding: '14px 16px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                    Last Updated
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#334155', marginTop: '4px' }}>
                    {formatDateTime(department.updatedAt)}
                  </div>
                </div>
              </div>

              {/* Description Box */}
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                  Department Description
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#1E293B', lineHeight: 1.6 }}>
                  {department.description || 'No detailed description provided.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: HODs */}
          {activeTab === 'hods' && (
            <div>
              {hods.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>
                  No Head of Department (HOD) assigned.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {hods.map((hod, i) => (
                    <div
                      key={hod.id || i}
                      style={{
                        padding: '18px',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '50%',
                              backgroundColor: '#7C3AED',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '16px',
                              fontWeight: '700',
                            }}
                          >
                            {hod.firstName?.[0] || 'H'}
                          </div>
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>
                              {hod.firstName} {hod.lastName}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>@{hod.username || 'username'}</div>
                          </div>
                        </div>

                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            backgroundColor: '#F5F3FF',
                            color: '#7C3AED',
                            fontSize: '11px',
                            fontWeight: '700',
                            border: '1px solid #DDD6FE',
                          }}
                        >
                          {hod.hodAccessType || 'FULL_ACCESS'}
                        </span>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                          gap: '12px',
                          marginTop: '16px',
                          paddingTop: '14px',
                          borderTop: '1px solid #F1F5F9',
                          fontSize: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                          <FiMail style={{ color: '#64748B' }} />
                          <span>{hod.email || '—'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                          <FiPhone style={{ color: '#64748B' }} />
                          <span>{hod.phone || '—'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                          <FiClock style={{ color: '#64748B' }} />
                          <span>Last Login: {formatDate(hod.lastLogin)}</span>
                        </div>
                      </div>

                      {/* Roles & Permissions */}
                      <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {hod.roles?.map((r, ri) => (
                          <span
                            key={ri}
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: '#EFF6FF',
                              color: '#2563EB',
                              fontSize: '10px',
                              fontWeight: '700',
                            }}
                          >
                            {r}
                          </span>
                        ))}
                        {hod.permissions?.map((p, pi) => (
                          <span
                            key={pi}
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: '#F1F5F9',
                              color: '#475569',
                              fontSize: '10px',
                              fontWeight: '500',
                            }}
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COUNSELLORS */}
          {activeTab === 'counsellors' && (
            <div>
              {counsellors.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>
                  No counsellors or staff assigned.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {counsellors.map((coun, i) => (
                    <div
                      key={coun.id || i}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '10px',
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: '#2563EB',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            fontWeight: '700',
                          }}
                        >
                          {coun.firstName?.[0] || 'C'}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
                            {coun.firstName} {coun.lastName}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>
                            {coun.email} • {coun.phone || 'No Phone'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: '#EFF6FF',
                            color: '#2563EB',
                            fontSize: '11px',
                            fontWeight: '600',
                          }}
                        >
                          {coun.hodAccessType || 'COUNSELLOR'}
                        </span>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: coun.active ? '#F0FDF4' : '#F1F5F9',
                            color: coun.active ? '#16A34A' : '#64748B',
                            fontSize: '11px',
                            fontWeight: '600',
                          }}
                        >
                          {coun.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            backgroundColor: '#F8FAFC',
            borderBottomLeftRadius: '16px',
            borderBottomRightRadius: '16px',
          }}
        >
          {onEdit && (
            <CustomButton
              variant="secondary"
              onClick={() => {
                onClose();
                onEdit(department);
              }}
            >
              Edit Department
            </CustomButton>
          )}
          <CustomButton variant="primary" onClick={onClose}>
            Close
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDetailsModal;
