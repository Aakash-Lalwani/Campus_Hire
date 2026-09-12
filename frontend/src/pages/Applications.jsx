import React, { useEffect, useState } from 'react';
import { Plus, Trash2, ArrowRight, FileText, CheckCircle2, XCircle, AlertCircle, Search, X, Building2 } from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { applicationsApi, studentsApi, jobsApi } from '../services/api';

const STATUS_PIPELINE = ['APPLIED', 'SHORTLISTED', 'APTITUDE', 'TECHNICAL', 'HR', 'SELECTED', 'REJECTED'];
const MAIN_STAGES = ['APPLIED', 'SHORTLISTED', 'APTITUDE', 'TECHNICAL', 'HR', 'SELECTED'];

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [students, setStudents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // New Application Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [applyError, setApplyError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  useEffect(() => {
    fetchStudents();
    fetchJobs();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await applicationsApi.getAll({ 
        status: statusFilter !== 'ALL' ? statusFilter : undefined 
      });
      if (res.success && Array.isArray(res.data)) {
        setApplications(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setError(err.message || 'Unable to connect to applications service.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await studentsApi.getAll();
      if (res.success && Array.isArray(res.data)) setStudents(res.data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await jobsApi.getAll({ status: 'OPEN' });
      if (res.success && Array.isArray(res.data)) setJobs(res.data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr.replace(' ', 'T'));
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getInitials = (name) => {
    if (!name) return 'ST';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleOpenApplyModal = () => {
    setSelectedStudentId(students.length > 0 ? String(students[0].id) : '');
    setSelectedJobId(jobs.length > 0 ? String(jobs[0].id) : '');
    setApplyError('');
    setIsApplyModalOpen(true);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyError('');
    setSubmitting(true);

    try {
      if (!selectedStudentId || !selectedJobId) {
        throw new Error('Please select both a candidate student and an active job opening.');
      }
      await applicationsApi.apply(parseInt(selectedStudentId, 10), parseInt(selectedJobId, 10));
      setIsApplyModalOpen(false);
      fetchApplications();
    } catch (err) {
      setApplyError(err.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await applicationsApi.updateStatus(appId, newStatus);
      fetchApplications();
    } catch (err) {
      alert(err.message || 'Failed to update application pipeline stage.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await applicationsApi.delete(deleteId);
      setDeleteId(null);
      fetchApplications();
    } catch (err) {
      alert(err.message || 'Failed to delete application.');
    } finally {
      setDeleting(false);
    }
  };

  // Filter applications by search query if present
  const filteredApplications = applications.filter((app) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (app.studentName && app.studentName.toLowerCase().includes(q)) ||
      (app.jobRole && app.jobRole.toLowerCase().includes(q)) ||
      (app.companyName && app.companyName.toLowerCase().includes(q)) ||
      (app.studentBranch && app.studentBranch.toLowerCase().includes(q))
    );
  });

  const renderStageStepper = (currentStatus) => {
    const isRejected = currentStatus === 'REJECTED';

    return (
      <div className="pipeline-stepper">
        {MAIN_STAGES.map((st, idx) => {
          const isCurrent = currentStatus === st;
          const currentIndex = MAIN_STAGES.indexOf(currentStatus);
          const isPast = currentIndex > -1 && idx < currentIndex && !isRejected;

          return (
            <React.Fragment key={st}>
              <span className={`pipeline-step ${isCurrent ? 'active' : isPast ? 'completed' : ''}`}>
                {st}
              </span>
              {idx < MAIN_STAGES.length - 1 && (
                <span className="pipeline-arrow">
                  <ArrowRight size={10} />
                </span>
              )}
            </React.Fragment>
          );
        })}

        {isRejected && (
          <span className="pipeline-step rejected" style={{ marginLeft: '0.4rem' }}>
            TERMINAL: REJECTED
          </span>
        )}
      </div>
    );
  };

  const columns = [
    {
      header: 'Applicant Student',
      accessor: 'studentName',
      cell: (row) => (
        <div className="candidate-cell">
          <div className="candidate-avatar">
            {getInitials(row.studentName)}
          </div>
          <div className="candidate-info">
            <span className="candidate-name">{row.studentName || '—'}</span>
            <span className="candidate-sub">
              {row.studentBranch} • {row.studentCgpa ? `${row.studentCgpa} CGPA` : '—'}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Role & Company',
      accessor: 'jobRole',
      cell: (row) => (
        <div>
          <div className="role-title">{row.jobRole}</div>
          <div className="company-sub" style={{ color: 'var(--primary)', fontWeight: 500 }}>
            {row.companyName}
          </div>
        </div>
      ),
    },
    {
      header: 'Applied Date',
      accessor: 'appliedAt',
      cell: (row) => <span className="text-subtle">{formatDate(row.appliedAt)}</span>,
    },
    {
      header: 'Recruitment Stage',
      accessor: 'status',
      cell: (row) => (
        <div>
          <StatusBadge status={row.status} />
        </div>
      ),
    },
    {
      header: 'Advance Pipeline Stage',
      align: 'right',
      cell: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem' }}>
          <select
            className="form-control"
            style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.8rem', fontWeight: 600 }}
            value={row.status}
            onChange={(e) => handleStatusChange(row.id, e.target.value)}
            aria-label={`Advance pipeline for ${row.studentName}`}
          >
            {STATUS_PIPELINE.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          <button 
            type="button"
            className="btn btn-danger btn-sm" 
            onClick={() => setDeleteId(row.id)}
            title="Withdraw application"
            aria-label={`Withdraw application for ${row.studentName}`}
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Header Section */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 className="page-header-title" style={{ margin: 0 }}>Applications</h1>
            {!loading && (
              <span className="badge badge-open" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                {applications.length} {applications.length === 1 ? 'Submission' : 'Submissions'}
              </span>
            )}
          </div>
          <p className="page-header-subtitle">
            Applicant Tracking System (ATS), recruitment pipeline progression, and candidate stages
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleOpenApplyModal}>
          <Plus size={16} />
          <span>Submit Application</span>
        </button>
      </div>

      {/* Connection Error Banner */}
      {error && (
        <div className="card" style={{ backgroundColor: '#fef2f2', borderColor: '#fca5a5', color: '#991b1b', padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} color="#b91c1c" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: '0.875rem' }}>
            <strong>Unable to load applications:</strong> {error}
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={fetchApplications}>
            Retry
          </button>
        </div>
      )}

      {/* Pipeline Stepper Filter Tabs */}
      <div className="filter-tabs">
        <button
          type="button"
          className={`filter-tab ${statusFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => setStatusFilter('ALL')}
        >
          All Stages
        </button>
        {STATUS_PIPELINE.map((st) => (
          <button
            key={st}
            type="button"
            className={`filter-tab ${statusFilter === st ? 'active' : ''}`}
            onClick={() => setStatusFilter(st)}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Search Input Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: '260px', flex: 1, maxWidth: '400px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.35rem', fontSize: '0.85rem' }}
              placeholder="Search by student, role, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search applications"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {search && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setSearch('')}
            >
              <X size={13} />
              <span>Clear Search</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table View */}
      {loading ? (
        <LoadingSpinner message="Loading candidate applications..." />
      ) : filteredApplications.length === 0 ? (
        <div className="card">
          <EmptyState
            title={statusFilter !== 'ALL' || search ? "No Matching Applications Found" : "No Applications Submitted"}
            message={
              statusFilter !== 'ALL' || search
                ? "No student applications match the active stage or search query. Try resetting filters."
                : "No applications have been recorded yet. Submit a new application to initiate the candidate pipeline."
            }
            action={
              statusFilter !== 'ALL' || search ? (
                <button type="button" className="btn btn-secondary" onClick={() => { setStatusFilter('ALL'); setSearch(''); }}>
                  Clear Filters
                </button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={handleOpenApplyModal}>
                  <Plus size={15} /> Submit Application
                </button>
              )
            }
          />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredApplications}
          loading={false}
        />
      )}

      {/* New Application Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        title="Submit Candidate Job Application"
        onClose={() => !submitting && setIsApplyModalOpen(false)}
        maxWidth="520px"
      >
        <form onSubmit={handleApplySubmit}>
          {applyError && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} color="#b91c1c" />
              <span>{applyError}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="select-candidate">Select Candidate Student *</label>
            <select
              id="select-candidate"
              className="form-control"
              required
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              <option value="">Choose Student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.branch} | {s.cgpa} CGPA | {s.placementStatus})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="select-job">Select Open Recruitment Drive *</label>
            <select
              id="select-job"
              className="form-control"
              required
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
            >
              <option value="">Choose Open Position</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.companyName} — {j.role} (₹{j.packageLpa} LPA)
                </option>
              ))}
            </select>
          </div>

          <div className="modal-footer" style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0, marginTop: '1.25rem' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setIsApplyModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Withdraw Application"
        message="Are you sure you want to withdraw this application record? Associated interview rounds will also be deleted."
        onConfirm={handleDeleteConfirm}
        onCancel={() => !deleting && setDeleteId(null)}
        confirmText={deleting ? 'Withdrawing...' : 'Withdraw'}
        isDanger={true}
      />
    </div>
  );
}
