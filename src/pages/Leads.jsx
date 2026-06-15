import { useState, useMemo } from 'react';
import { leads, statusConfig } from '../mockData';
import { useAppContext } from '../AppContext';

const PAGE_SIZE = 20;

const STATUSES = [
  { value: '', label: 'All Status' },
  { value: 'raw', label: 'Raw Lead' },
  { value: 'connected', label: 'Connected' },
  { value: 'interested', label: 'Interested' },
  { value: 'hot', label: 'Hot Lead' },
  { value: 'registered', label: 'Registered' },
  { value: 'cold', label: 'Cold Lead' },
  { value: 'notinterested', label: 'Not Interested' },
  { value: 'bad', label: 'Bad Lead' },
];

const COUNSELORS = ['All Counselors', 'Rahul Singh', 'Neha Joshi', 'Priya Patel', 'Vikram Das'];
const COURSES = ['All Courses', 'Full Stack Dev', 'Data Science', 'UI/UX Design', 'DevOps'];

/* ── Score badge colour ── */
const scoreBg = (score) => {
  if (score >= 80) return { background: 'var(--success-light)', color: 'var(--success)' };
  if (score >= 50) return { background: '#FFF7ED', color: '#EA580C' };
  return { background: 'var(--danger-light)', color: 'var(--danger)' };
};

const Leads = () => {
  const { openAddLeadModal, navTo } = useAppContext();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCounselor, setFilterCounselor] = useState('All Counselors');
  const [filterCourse, setFilterCourse] = useState('All Courses');
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);

  /* ── Filtered leads ── */
  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch =
        !search ||
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.phone.includes(search);
      const matchStatus = !filterStatus || l.status === filterStatus;
      const matchCounselor =
        filterCounselor === 'All Counselors' || l.counselor === filterCounselor;
      const matchCourse =
        filterCourse === 'All Courses' ||
        l.course.toLowerCase().includes(filterCourse.toLowerCase());
      return matchSearch && matchStatus && matchCounselor && matchCourse;
    });
  }, [search, filterStatus, filterCounselor, filterCourse]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ── Select all on current page ── */
  const allChecked =
    paginated.length > 0 && paginated.every((l) => selectedIds.includes(l.id));

  const toggleAll = () => {
    const pageIds = paginated.map((l) => l.id);
    if (allChecked) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...pageIds])]);
    }
  };

  const toggleOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const resetPage = () => setPage(1);

  return (
    <div>
      {/* ── Page Header ── */}
      <div
        className="page-header"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--gray-900)' }}>
            All Leads
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '4px' }}>
            Manage and track all your education leads
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Export */}
          <button
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Export
          </button>
          {/* Add Lead */}
          <button
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={openAddLeadModal}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Lead
          </button>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div
        className="filter-bar"
        style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}
      >
        <input
          type="text"
          className="form-control"
          placeholder="Search leads…"
          style={{ maxWidth: '240px' }}
          value={search}
          onChange={(e) => { setSearch(e.target.value); resetPage(); }}
        />
        <select
          className="form-control"
          style={{ maxWidth: '140px' }}
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); resetPage(); }}
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          className="form-control"
          style={{ maxWidth: '160px' }}
          value={filterCounselor}
          onChange={(e) => { setFilterCounselor(e.target.value); resetPage(); }}
        >
          {COUNSELORS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          className="form-control"
          style={{ maxWidth: '160px' }}
          value={filterCourse}
          onChange={(e) => { setFilterCourse(e.target.value); resetPage(); }}
        >
          {COURSES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button
          className="btn btn-ghost btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="11" y1="18" x2="13" y2="18" />
          </svg>
          Filters
        </button>
      </div>

      {/* ── Table Card ── */}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    aria-label="Select all leads on this page"
                  />
                </th>
                <th>Lead</th>
                <th>Course</th>
                <th>Source</th>
                <th>Status</th>
                <th>Counselor</th>
                <th>Follow-up</th>
                <th>Score</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      textAlign: 'center',
                      padding: '32px',
                      color: 'var(--gray-400)',
                      fontSize: '13px',
                    }}
                  >
                    No leads match your filters.
                  </td>
                </tr>
              ) : (
                paginated.map((lead) => {
                  const sc = statusConfig[lead.status];
                  return (
                    <tr key={lead.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(lead.id)}
                          onChange={() => toggleOne(lead.id)}
                          aria-label={`Select ${lead.name}`}
                        />
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>
                          {lead.name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>
                          {lead.phone}
                        </div>
                      </td>
                      <td style={{ color: 'var(--gray-700)' }}>{lead.course}</td>
                      <td style={{ color: 'var(--gray-500)', fontSize: '12px' }}>
                        {lead.source}
                      </td>
                      <td>
                        <span className={`badge ${sc?.cls}`}>{sc?.label}</span>
                      </td>
                      <td style={{ color: 'var(--gray-700)' }}>{lead.counselor}</td>
                      <td style={{ color: 'var(--gray-500)', fontSize: '12px' }}>
                        {lead.followup}
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '20px',
                            ...scoreBg(lead.score),
                          }}
                        >
                          {lead.score}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: '12px' }}
                          onClick={() => navTo('lead-detail')}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid var(--gray-100)',
          }}
        >
          <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
            Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} leads
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              aria-label="Previous page"
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setPage(p)}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </button>
            ))}
            <button
              className="btn btn-secondary btn-sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Next page"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leads;
