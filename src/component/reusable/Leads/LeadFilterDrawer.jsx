import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FiX, FiFilter, FiRotateCcw, FiCheck, FiSearch, FiChevronDown } from 'react-icons/fi';
import { DEFAULT_LEAD_FILTERS, countActiveFilters } from '../../../Services/lead/leadFilterModel';
import { usePermissions } from '../../../PermissionContext';
import { canViewLeadField } from '../../../config/leadFieldPermissions';

/**
 * Reusable searchable multi-select dropdown component
 */
const SearchableMultiSelect = ({ label, options = [], selectedIds = [], onChange, placeholder = 'Select...', nameKey = 'name' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter(opt => {
      const name = opt[nameKey] || opt.name || opt.code || '';
      return String(name).toLowerCase().includes(q);
    });
  }, [options, search, nameKey]);

  const toggleOption = (id) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(x => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const selectedCount = selectedIds.length;

  return (
    <div className="filter-select-group" ref={dropdownRef} style={{ position: 'relative', marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '5px' }}>
        {label}
        {selectedCount > 0 && (
          <span style={{ marginLeft: '6px', fontSize: '11px', background: '#EEF2FF', color: '#4F46E5', padding: '1px 6px', borderRadius: '10px', fontWeight: '700' }}>
            {selectedCount}
          </span>
        )}
      </label>

      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          minHeight: '38px',
          border: isOpen ? '1.5px solid #6366F1' : '1px solid #CBD5E1',
          borderRadius: '8px',
          padding: '6px 10px',
          background: '#FFFFFF',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          boxShadow: isOpen ? '0 0 0 3px rgba(99, 102, 241, 0.15)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', flex: 1, minWidth: 0 }}>
          {selectedCount === 0 ? (
            <span style={{ fontSize: '13px', color: '#94A3B8' }}>{placeholder}</span>
          ) : (
            options
              .filter(opt => selectedIds.includes(opt.id))
              .map(opt => (
                <span
                  key={opt.id}
                  style={{
                    background: '#F1F5F9',
                    color: '#1E293B',
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(opt.id);
                  }}
                >
                  {opt[nameKey] || opt.name || opt.code}
                  <span style={{ color: '#94A3B8', cursor: 'pointer', fontSize: '12px' }}>×</span>
                </span>
              ))
          )}
        </div>
        <FiChevronDown style={{ color: '#64748B', flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            zIndex: 99,
            maxHeight: '220px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {options.length > 5 && (
            <div style={{ padding: '8px', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <FiSearch style={{ position: 'absolute', left: '8px', color: '#94A3B8', fontSize: '13px' }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search options..."
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: '100%',
                    padding: '5px 8px 5px 26px',
                    fontSize: '12px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          )}

          <div style={{ overflowY: 'auto', flex: 1, padding: '4px' }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '12px', textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>
                No options found
              </div>
            ) : (
              filteredOptions.map(opt => {
                const isChecked = selectedIds.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOption(opt.id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: isChecked ? '#EEF2FF' : 'transparent',
                      color: isChecked ? '#4F46E5' : '#1E293B',
                      fontSize: '13px',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isChecked) e.currentTarget.style.background = '#F8FAFC';
                    }}
                    onMouseLeave={(e) => {
                      if (!isChecked) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      style={{ cursor: 'pointer', accentColor: '#6366F1' }}
                    />
                    <span style={{ flex: 1, fontWeight: isChecked ? '600' : '400' }}>
                      {opt[nameKey] || opt.name || opt.code}
                    </span>
                    {isChecked && <FiCheck style={{ color: '#4F46E5', fontSize: '14px' }} />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Reusable segmented toggle button group
 */
const SegmentedControl = ({ label, options = [], value, onChange }) => (
  <div style={{ marginBottom: '14px' }}>
    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
      {label}
    </label>
    <div style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '8px', gap: '3px' }}>
      {options.map(opt => {
        const isActive = value === opt.value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1,
              padding: '6px 8px',
              fontSize: '12px',
              fontWeight: isActive ? '600' : '500',
              color: isActive ? '#4F46E5' : '#64748B',
              background: isActive ? '#FFFFFF' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  </div>
);

/**
 * Collapsible section wrapper
 */
const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '14px', marginBottom: '14px' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          padding: '4px 0',
          marginBottom: isOpen ? '10px' : '0',
        }}
      >
        <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', letterSpacing: '0.02em', textTransform: 'uppercase', margin: 0 }}>
          {title}
        </h4>
        <FiChevronDown style={{ color: '#94A3B8', fontSize: '14px', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </div>
      {isOpen && <div>{children}</div>}
    </div>
  );
};

/**
 * LeadFilterDrawer
 * Comprehensive slide-over filter drawer providing full control over all Lead filters.
 */
const LeadFilterDrawer = ({
  isOpen,
  onClose,
  appliedFilters = DEFAULT_LEAD_FILTERS,
  onApply,
  lookups = {},
}) => {
  const { hasPermission } = usePermissions();
  const [draftFilters, setDraftFilters] = useState(() => ({ ...DEFAULT_LEAD_FILTERS, ...appliedFilters }));

  useEffect(() => {
    if (isOpen) {
      setDraftFilters({ ...DEFAULT_LEAD_FILTERS, ...appliedFilters });
    }
  }, [isOpen, appliedFilters]);

  const activeCount = useMemo(() => countActiveFilters(draftFilters), [draftFilters]);

  const handleReset = () => {
    setDraftFilters({ ...DEFAULT_LEAD_FILTERS });
  };

  const handleApply = () => {
    if (onApply) {
      onApply(draftFilters);
    }
    if (onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(3px)',
          transition: 'opacity 0.2s ease',
        }}
      />

      {/* Drawer Panel */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '460px',
          height: '100%',
          background: '#FFFFFF',
          boxShadow: '-4px 0 25px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10000,
          animation: 'slideInRight 0.25s ease-out forwards',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 22px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#FAF5FF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: '#9333EA',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FiFilter style={{ fontSize: '18px' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1E1B4B', margin: 0 }}>
                  Lead Filters
                </h3>
                {activeCount > 0 && (
                  <span
                    style={{
                      background: '#9333EA',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '12px',
                    }}
                  >
                    {activeCount} Active
                  </span>
                )}
              </div>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 0 0' }}>
                Filter lead records and summary metrics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Close Drawer"
          >
            <FiX style={{ fontSize: '20px' }} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>
          {/* Section 1: Basic Filters */}
          <FilterSection title="1. Basic Criteria" defaultOpen={true}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '5px' }}>
                Search Keyword
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <FiSearch style={{ position: 'absolute', left: '10px', color: '#94A3B8' }} />
                <input
                  type="text"
                  value={draftFilters.search}
                  onChange={(e) => setDraftFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Name, email, phone, city, state..."
                  style={{
                    width: '100%',
                    padding: '8px 10px 8px 32px',
                    fontSize: '13px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {canViewLeadField(hasPermission, 'leadSources') && (
              <SearchableMultiSelect
                label="Lead Source"
                options={lookups.sources || []}
                selectedIds={draftFilters.leadSourceIds}
                onChange={(ids) => setDraftFilters(prev => ({ ...prev, leadSourceIds: ids }))}
                placeholder="All Sources"
              />
            )}

            {canViewLeadField(hasPermission, 'courseType') && (
              <SearchableMultiSelect
                label="Course Category (Course Type)"
                options={lookups.courseTypes || []}
                selectedIds={draftFilters.courseTypeIds}
                onChange={(ids) => setDraftFilters(prev => ({ ...prev, courseTypeIds: ids }))}
                placeholder="All Categories"
              />
            )}

            {canViewLeadField(hasPermission, 'course') && (
              <SearchableMultiSelect
                label="Course"
                options={lookups.courses || []}
                selectedIds={draftFilters.courseIds}
                onChange={(ids) => setDraftFilters(prev => ({ ...prev, courseIds: ids }))}
                placeholder="All Courses"
                nameKey="courseName"
              />
            )}

            {canViewLeadField(hasPermission, 'department') && (
              <SearchableMultiSelect
                label="Department"
                options={lookups.departments || []}
                selectedIds={draftFilters.departmentIds}
                onChange={(ids) => setDraftFilters(prev => ({ ...prev, departmentIds: ids }))}
                placeholder="All Departments"
              />
            )}

            {canViewLeadField(hasPermission, 'assignedTo') && (
              <SearchableMultiSelect
                label="Counselor / Assigned User"
                options={(lookups.users || []).map(u => ({
                  id: u.id,
                  name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || u.email,
                }))}
                selectedIds={draftFilters.assignedUserIds}
                onChange={(ids) => setDraftFilters(prev => ({ ...prev, assignedUserIds: ids }))}
                placeholder="All Counselors"
              />
            )}
          </FilterSection>

          {/* Section 2: Academic Filters */}
          {(canViewLeadField(hasPermission, 'board') || canViewLeadField(hasPermission, 'grade')) && (
            <FilterSection title="2. Academic Filters" defaultOpen={false}>
              {canViewLeadField(hasPermission, 'board') && (
                <SearchableMultiSelect
                  label="Education Board"
                  options={lookups.boards || []}
                  selectedIds={draftFilters.boardIds}
                  onChange={(ids) => setDraftFilters(prev => ({ ...prev, boardIds: ids }))}
                  placeholder="All Boards"
                />
              )}

              {canViewLeadField(hasPermission, 'grade') && (
                <SearchableMultiSelect
                  label="Grade"
                  options={lookups.grades || []}
                  selectedIds={draftFilters.gradeIds}
                  onChange={(ids) => setDraftFilters(prev => ({ ...prev, gradeIds: ids }))}
                  placeholder="All Grades"
                />
              )}
            </FilterSection>
          )}

          {/* Section 3: Status & Historical Status (CRITICAL) */}
          {(canViewLeadField(hasPermission, 'currentStatus') || canViewLeadField(hasPermission, 'statusHistory')) && (
            <FilterSection title="3. Lead Status & History" defaultOpen={true}>
              <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', marginBottom: '14px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B', lineHeight: '1.4', marginBottom: '8px' }}>
                  💡 <b>Current Status</b> matches where the lead is now. <b>Historical Status</b> matches leads that ever passed through selected statuses.
                </div>

                {canViewLeadField(hasPermission, 'currentStatus') && (
                  <SearchableMultiSelect
                    label="Current Lead Status"
                    options={lookups.statuses || []}
                    selectedIds={draftFilters.statusIds}
                    onChange={(ids) => setDraftFilters(prev => ({ ...prev, statusIds: ids }))}
                    placeholder="Current Statuses"
                  />
                )}

                {canViewLeadField(hasPermission, 'statusHistory') && (
                  <div style={{ marginTop: canViewLeadField(hasPermission, 'currentStatus') ? '12px' : '0', paddingTop: canViewLeadField(hasPermission, 'currentStatus') ? '12px' : '0', borderTop: canViewLeadField(hasPermission, 'currentStatus') ? '1px dashed #CBD5E1' : 'none' }}>
                    <SearchableMultiSelect
                      label="Historical Lead Status (Pass-Through History)"
                      options={lookups.statuses || []}
                      selectedIds={draftFilters.leadStatusHistoryIds}
                      onChange={(ids) => setDraftFilters(prev => ({ ...prev, leadStatusHistoryIds: ids }))}
                      placeholder="Select historical statuses (e.g. Connected, Follow-Up)"
                    />
                  </div>
                )}
              </div>
            </FilterSection>
          )}

          {/* Section 4: Allocation & Availability */}
          {(canViewLeadField(hasPermission, 'assignedTo') || canViewLeadField(hasPermission, 'leadSources') || canViewLeadField(hasPermission, 'isAvailed')) && (
            <FilterSection title="4. Allocation & Data Type" defaultOpen={true}>
              {canViewLeadField(hasPermission, 'assignedTo') && (
                <SegmentedControl
                  label="Allocation Status"
                  value={draftFilters.allotted}
                  onChange={(val) => setDraftFilters(prev => ({ ...prev, allotted: val }))}
                  options={[
                    { label: 'All Leads', value: null },
                    { label: 'Allotted', value: true },
                    { label: 'Unallotted', value: false },
                  ]}
                />
              )}

              {canViewLeadField(hasPermission, 'leadSources') && (
                <SegmentedControl
                  label="Multi-Source Data"
                  value={draftFilters.multiSource}
                  onChange={(val) => setDraftFilters(prev => ({ ...prev, multiSource: val }))}
                  options={[
                    { label: 'All Data', value: null },
                    { label: 'Multi-Source Only', value: true },
                    { label: 'Single Source', value: false },
                  ]}
                />
              )}

              {canViewLeadField(hasPermission, 'isAvailed') && (
                <SegmentedControl
                  label="Availed Status"
                  value={draftFilters.availed}
                  onChange={(val) => setDraftFilters(prev => ({ ...prev, availed: val }))}
                  options={[
                    { label: 'All', value: null },
                    { label: 'Availed', value: true },
                    { label: 'Unavailed', value: false },
                  ]}
                />
              )}
            </FilterSection>
          )}

          {/* Section 5: Date Filters */}
          <FilterSection title="5. Date Ranges" defaultOpen={false}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '5px' }}>
                Created Date Range
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="date"
                  value={draftFilters.startDate}
                  onChange={(e) => setDraftFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    fontSize: '12px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                  }}
                  title="Created From"
                />
                <input
                  type="date"
                  value={draftFilters.endDate}
                  onChange={(e) => setDraftFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    fontSize: '12px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                  }}
                  title="Created To"
                />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '5px' }}>
                Updated Date Range
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="date"
                  value={draftFilters.updatedFrom}
                  onChange={(e) => setDraftFilters(prev => ({ ...prev, updatedFrom: e.target.value }))}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    fontSize: '12px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                  }}
                  title="Updated From"
                />
                <input
                  type="date"
                  value={draftFilters.updatedTo}
                  onChange={(e) => setDraftFilters(prev => ({ ...prev, updatedTo: e.target.value }))}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    fontSize: '12px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                  }}
                  title="Updated To"
                />
              </div>
            </div>

            {canViewLeadField(hasPermission, 'availedAt') && (
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '5px' }}>
                  Availed Date Range
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="date"
                    value={draftFilters.availedFrom}
                    onChange={(e) => setDraftFilters(prev => ({ ...prev, availedFrom: e.target.value }))}
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      fontSize: '12px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                    }}
                    title="Availed From"
                  />
                  <input
                    type="date"
                    value={draftFilters.availedTo}
                    onChange={(e) => setDraftFilters(prev => ({ ...prev, availedTo: e.target.value }))}
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      fontSize: '12px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                    }}
                    title="Availed To"
                  />
                </div>
              </div>
            )}
          </FilterSection>
        </div>

        {/* Footer Buttons */}
        <div
          style={{
            padding: '16px 22px',
            borderTop: '1px solid #E2E8F0',
            background: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <button
            type="button"
            onClick={handleReset}
            style={{
              background: 'transparent',
              border: '1px solid #CBD5E1',
              padding: '9px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              color: '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F1F5F9'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <FiRotateCcw style={{ fontSize: '14px' }} />
            Reset
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                padding: '9px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#64748B',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              style={{
                background: '#9333EA',
                border: 'none',
                padding: '9px 20px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#FFFFFF',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(147, 51, 234, 0.3)',
                transition: 'transform 0.1s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default LeadFilterDrawer;
