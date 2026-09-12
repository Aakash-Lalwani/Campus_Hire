import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, ShieldCheck, Briefcase, Search, X, AlertCircle, Building2, Calendar, Award } from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { jobsApi, companiesApi, studentsApi } from '../services/api';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [companyFilter, setCompanyFilter] = useState('ALL');

  // Job Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyId: '',
    role: '',
    description: '',
    packageLpa: '5.00',
    minCgpa: '6.50',
    allowedBranches: 'CSE,IT,AI-ML,ECE',
    maxBacklogs: 0,
    applicationDeadline: '2026-11-30',
    jobStatus: 'OPEN',
  });
  const [formError, setFormError] = useState('');

  // Eligibility Modal State
  const [eligibilityJob, setEligibilityJob] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [search, statusFilter, companyFilter]);

  useEffect(() => {
    fetchCompanies();
    fetchStudents();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await jobsApi.getAll({ 
        search: search.trim() || undefined, 
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        companyId: companyFilter !== 'ALL' ? parseInt(companyFilter, 10) : undefined,
      });
      if (res.success && Array.isArray(res.data)) {
        setJobs(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setError(err.message || 'Unable to connect to jobs service.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await companiesApi.getAll();
      if (res.success && Array.isArray(res.data)) setCompanies(res.data);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
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

  const getCompanyInitials = (name) => {
    if (!name) return 'CO';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleOpenAdd = () => {
    setEditingJob(null);
    setFormData({
      companyId: companies.length > 0 ? companies[0].id : '',
      role: '',
      description: '',
      packageLpa: '5.00',
      minCgpa: '6.50',
      allowedBranches: 'CSE,IT,AI-ML,ECE',
      maxBacklogs: 0,
      applicationDeadline: '2026-11-30',
      jobStatus: 'OPEN',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (job) => {
    setEditingJob(job);
    setFormData({
      companyId: job.companyId || '',
      role: job.role || '',
      description: job.description || '',
      packageLpa: job.packageLpa !== undefined ? String(job.packageLpa) : '5.00',
      minCgpa: job.minCgpa !== undefined ? String(job.minCgpa) : '6.50',
      allowedBranches: job.allowedBranches || 'CSE,IT,AI-ML,ECE',
      maxBacklogs: job.maxBacklogs !== undefined ? job.maxBacklogs : 0,
      applicationDeadline: job.applicationDeadline || '2026-11-30',
      jobStatus: job.jobStatus || 'OPEN',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const pkg = parseFloat(formData.packageLpa);
      const cgpa = parseFloat(formData.minCgpa);
      const backlogs = parseInt(formData.maxBacklogs, 10);

      if (isNaN(pkg) || pkg <= 0) throw new Error('Package must be a positive number.');
      if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) throw new Error('Min CGPA must be between 0.00 and 10.00.');
      if (isNaN(backlogs) || backlogs < 0) throw new Error('Max backlogs cannot be negative.');
      if (!formData.companyId) throw new Error('Please select a recruiting company.');
      if (!formData.role.trim()) throw new Error('Job role title is required.');

      const payload = {
        companyId: parseInt(formData.companyId, 10),
        role: formData.role.trim(),
        description: formData.description.trim() || null,
        packageLpa: pkg,
        minCgpa: cgpa,
        allowedBranches: formData.allowedBranches.trim(),
        maxBacklogs: backlogs,
        applicationDeadline: formData.applicationDeadline,
        jobStatus: formData.jobStatus,
      };

      if (editingJob) {
        await jobsApi.update(editingJob.id, payload);
      } else {
        await jobsApi.create(payload);
      }
      setIsModalOpen(false);
      fetchJobs();
    } catch (err) {
      setFormError(err.message || 'Failed to save job opening.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEligibility = (job) => {
    setEligibilityJob(job);
    setSelectedStudentId(students.length > 0 ? students[0].id : '');
    setEligibilityResult(null);
  };

  const handleRunEligibilityTest = async () => {
    if (!eligibilityJob || !selectedStudentId) return;
    try {
      setCheckingEligibility(true);
      const res = await jobsApi.checkEligibility(eligibilityJob.id, selectedStudentId);
      if (res.success) setEligibilityResult(res.data);
    } catch (err) {
      alert(err.message || 'Failed to evaluate eligibility.');
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await jobsApi.delete(deleteId);
      setDeleteId(null);
      fetchJobs();
    } catch (err) {
      alert(err.message || 'Failed to delete job opening.');
    } finally {
      setDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setCompanyFilter('ALL');
  };

  const hasActiveFilters = search.trim() !== '' || statusFilter !== 'ALL' || companyFilter !== 'ALL';

  const columns = [
    {
      header: 'Role & Recruiter',
      accessor: 'role',
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div className="company-avatar">
            {getCompanyInitials(row.companyName)}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.925rem', color: 'var(--text-primary)', lineHeight: 1.25 }}>
              {row.role}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 500 }}>
              {row.companyName}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Compensation',
      accessor: 'packageLpa',
      cell: (row) => (
        <div>
          <span style={{ fontWeight: 700, color: '#059669', fontSize: '0.925rem' }}>
            ₹{row.packageLpa ? row.packageLpa.toFixed(2) : '0.00'} LPA
          </span>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Annual CTC</div>
        </div>
      ),
    },
    {
      header: 'Academic Cutoffs',
      accessor: 'minCgpa',
      cell: (row) => (
        <div style={{ fontSize: '0.8rem' }}>
          <div>Min CGPA: <strong>{row.minCgpa ? row.minCgpa.toFixed(2) : '—'}</strong></div>
          <div style={{ color: 'var(--text-secondary)' }}>Max Backlogs: {row.maxBacklogs ?? 0}</div>
        </div>
      ),
    },
    {
      header: 'Eligible Departments',
      accessor: 'allowedBranches',
      cell: (row) => (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '180px' }}>
          {row.allowedBranches || 'All Branches'}
        </div>
      ),
    },
    {
      header: 'Application Deadline',
      accessor: 'applicationDeadline',
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem', color: 'var(--text-primary)' }}>
          <Calendar size={13} color="#64748b" />
          <span>{formatDate(row.applicationDeadline)}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'jobStatus',
      cell: (row) => <StatusBadge status={row.jobStatus} />,
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
          <button 
            type="button"
            className="btn btn-secondary btn-sm" 
            onClick={() => handleOpenEligibility(row)} 
            style={{ color: 'var(--primary)', borderColor: 'var(--primary-border)' }}
            title="Evaluate candidate eligibility"
          >
            <ShieldCheck size={13} />
            <span>Eligibility</span>
          </button>
          <button 
            type="button"
            className="btn btn-secondary btn-sm" 
            onClick={() => handleOpenEdit(row)}
            title="Edit job opening"
            aria-label={`Edit ${row.role}`}
          >
            <Edit2 size={13} />
          </button>
          <button 
            type="button"
            className="btn btn-danger btn-sm" 
            onClick={() => setDeleteId(row.id)}
            title="Remove job opening"
            aria-label={`Delete ${row.role}`}
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
            <h1 className="page-header-title" style={{ margin: 0 }}>Job Openings</h1>
            {!loading && (
              <span className="badge badge-open" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                {jobs.length} {jobs.length === 1 ? 'Opportunity' : 'Opportunities'}
              </span>
            )}
          </div>
          <p className="page-header-subtitle">
            Corporate placement recruitment drives, hiring criteria, and candidate eligibility rules
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Post Job Opening</span>
        </button>
      </div>

      {/* Connection Error Banner */}
      {error && (
        <div className="card" style={{ backgroundColor: '#fef2f2', borderColor: '#fca5a5', color: '#991b1b', padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} color="#b91c1c" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: '0.875rem' }}>
            <strong>Unable to load jobs:</strong> {error}
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={fetchJobs}>
            Retry
          </button>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="filter-tabs">
        <button
          type="button"
          className={`filter-tab ${statusFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => setStatusFilter('ALL')}
        >
          All Statuses
        </button>
        <button
          type="button"
          className={`filter-tab ${statusFilter === 'OPEN' ? 'active' : ''}`}
          onClick={() => setStatusFilter('OPEN')}
        >
          Open Drives
        </button>
        <button
          type="button"
          className={`filter-tab ${statusFilter === 'CLOSED' ? 'active' : ''}`}
          onClick={() => setStatusFilter('CLOSED')}
        >
          Concluded
        </button>
      </div>

      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '240px', flex: 1, maxWidth: '360px' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.35rem', fontSize: '0.85rem' }}
                placeholder="Search by job role or recruiter..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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

            {/* Company Filter Dropdown */}
            <select
              className="form-control"
              style={{ width: 'auto', minWidth: '160px', fontSize: '0.85rem' }}
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              aria-label="Filter by company"
            >
              <option value="ALL">All Companies</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleResetFilters}
              >
                <X size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table View */}
      {loading ? (
        <LoadingSpinner message="Loading active recruitment drives..." />
      ) : jobs.length === 0 ? (
        <div className="card">
          <EmptyState
            title={hasActiveFilters ? "No Matching Job Openings" : "No Job Drives Posted"}
            message={
              hasActiveFilters
                ? "No job postings match your active search and filter criteria. Try resetting filters."
                : "No corporate job postings are currently active. Click below to announce a new campus placement drive."
            }
            action={
              hasActiveFilters ? (
                <button type="button" className="btn btn-secondary" onClick={handleResetFilters}>
                  Clear All Filters
                </button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
                  <Plus size={15} /> Post First Job
                </button>
              )
            }
          />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={jobs}
          loading={false}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingJob ? 'Edit Job Opening' : 'Post New Placement Drive'}
        onClose={() => !submitting && setIsModalOpen(false)}
        maxWidth="620px"
      >
        <form onSubmit={handleSubmit}>
          {formError && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} color="#b91c1c" />
              <span>{formError}</span>
            </div>
          )}

          {/* Section 1: Role & Company */}
          <div className="modal-section-title">1. Organization & Role</div>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="job-company">Recruiting Company *</label>
              <select
                id="job-company"
                className="form-control"
                required
                value={formData.companyId}
                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
              >
                <option value="">Select Partner Company</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="job-role">Job Role Title *</label>
              <input
                id="job-role"
                type="text"
                className="form-control"
                required
                placeholder="e.g. Graduate Software Engineer"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
            </div>
          </div>

          {/* Section 2: Compensation & Academic Thresholds */}
          <div className="modal-section-title">2. Compensation & Cutoffs</div>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="job-package">Annual Package (LPA) *</label>
              <input
                id="job-package"
                type="number"
                step="0.01"
                min="0.1"
                className="form-control"
                required
                placeholder="6.50"
                value={formData.packageLpa}
                onChange={(e) => setFormData({ ...formData, packageLpa: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="job-cgpa">Minimum CGPA Cutoff *</label>
              <input
                id="job-cgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                className="form-control"
                required
                placeholder="7.00"
                value={formData.minCgpa}
                onChange={(e) => setFormData({ ...formData, minCgpa: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="job-branches">Allowed Branches (comma-separated) *</label>
              <input
                id="job-branches"
                type="text"
                className="form-control"
                required
                placeholder="CSE,IT,AI-ML,ECE"
                value={formData.allowedBranches}
                onChange={(e) => setFormData({ ...formData, allowedBranches: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="job-backlogs">Max Active Backlogs Allowed *</label>
              <input
                id="job-backlogs"
                type="number"
                min="0"
                max="10"
                className="form-control"
                required
                placeholder="0"
                value={formData.maxBacklogs}
                onChange={(e) => setFormData({ ...formData, maxBacklogs: e.target.value })}
              />
            </div>
          </div>

          {/* Section 3: Schedule & Status */}
          <div className="modal-section-title">3. Schedule & Status</div>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="job-deadline">Application Deadline *</label>
              <input
                id="job-deadline"
                type="date"
                className="form-control"
                required
                value={formData.applicationDeadline}
                onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="job-status">Drive Status</label>
              <select
                id="job-status"
                className="form-control"
                value={formData.jobStatus}
                onChange={(e) => setFormData({ ...formData, jobStatus: e.target.value })}
              >
                <option value="OPEN">OPEN (Accepting Applications)</option>
                <option value="CLOSED">CLOSED (Drive Concluded)</option>
              </select>
            </div>
          </div>

          {/* Section 4: Details */}
          <div className="modal-section-title">4. Position Details</div>
          <div className="form-group">
            <label htmlFor="job-description">Role Responsibilities & Description</label>
            <textarea
              id="job-description"
              className="form-control"
              rows={3}
              placeholder="Outline technical responsibilities, skills sought, and hiring process..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0, marginTop: '1.25rem' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : editingJob ? 'Update Job' : 'Post Job'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Interactive Eligibility Engine Modal */}
      <Modal
        isOpen={!!eligibilityJob}
        title={`Eligibility Rules Engine — ${eligibilityJob?.role || ''}`}
        onClose={() => setEligibilityJob(null)}
        maxWidth="540px"
      >
        <div style={{ fontSize: '0.875rem', marginBottom: '1.25rem', color: 'var(--text-secondary)' }}>
          Evaluate whether a candidate meets all 5 academic cutoff, backlog limit, department matching, and deadline criteria for <strong>{eligibilityJob?.companyName}</strong>.
        </div>

        <div className="form-group">
          <label htmlFor="eval-candidate">Select Candidate to Evaluate:</label>
          <select
            id="eval-candidate"
            className="form-control"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.branch} | {s.cgpa} CGPA | {s.backlogs} Backlogs)
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: '1.25rem' }}
          onClick={handleRunEligibilityTest}
          disabled={checkingEligibility || !selectedStudentId}
        >
          <ShieldCheck size={16} />
          <span>{checkingEligibility ? 'Evaluating Rules...' : 'Run Eligibility Check'}</span>
        </button>

        {eligibilityResult && (
          <div style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: eligibilityResult.eligible ? 'var(--success-subtle)' : 'var(--danger-subtle)',
            border: `1px solid ${eligibilityResult.eligible ? 'var(--success-border)' : 'var(--danger-border)'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              {eligibilityResult.eligible ? (
                <CheckCircle2 size={20} color="var(--success)" />
              ) : (
                <XCircle size={20} color="var(--danger)" />
              )}
              <h3 style={{ fontSize: '0.95rem', margin: 0, color: eligibilityResult.eligible ? 'var(--success)' : 'var(--danger)' }}>
                {eligibilityResult.eligible ? 'Candidate is ELIGIBLE' : 'Candidate is INELIGIBLE'}
              </h3>
            </div>

            {eligibilityResult.eligible ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--success)', margin: 0, lineHeight: 1.4 }}>
                This candidate satisfies all academic cutoff, backlog maximum, branch alignment, and drive deadline requirements.
              </p>
            ) : (
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--danger)', marginBottom: '0.35rem' }}>
                  Exact Rejection Reasons:
                </div>
                <ul style={{ paddingLeft: '1.2rem', fontSize: '0.825rem', color: 'var(--danger)', margin: 0 }}>
                  {eligibilityResult.reasons.map((reason, idx) => (
                    <li key={idx} style={{ marginBottom: '0.2rem' }}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Job Opening"
        message="Are you sure you want to remove this job posting? All existing applications for this role will also be removed."
        onConfirm={handleDeleteConfirm}
        onCancel={() => !deleting && setDeleteId(null)}
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        isDanger={true}
      />
    </div>
  );
}
