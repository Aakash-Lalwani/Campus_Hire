import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, ShieldCheck, Briefcase } from 'lucide-react';
import DataTable from '../components/DataTable';
import FilterBar from '../components/FilterBar';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import { jobsApi, companiesApi, studentsApi } from '../services/api';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Job Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    companyId: '',
    role: '',
    description: '',
    packageLpa: '4.50',
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

  useEffect(() => {
    fetchJobs();
    fetchCompanies();
    fetchStudents();
  }, [search, statusFilter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await jobsApi.getAll({ search, status: statusFilter });
      if (res.success) setJobs(res.data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await companiesApi.getAll();
      if (res.success) setCompanies(res.data);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await studentsApi.getAll();
      if (res.success) setStudents(res.data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
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
      packageLpa: job.packageLpa !== undefined ? job.packageLpa : '5.00',
      minCgpa: job.minCgpa !== undefined ? job.minCgpa : '6.50',
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

    try {
      const payload = {
        ...formData,
        companyId: parseInt(formData.companyId),
        packageLpa: parseFloat(formData.packageLpa),
        minCgpa: parseFloat(formData.minCgpa),
        maxBacklogs: parseInt(formData.maxBacklogs),
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
      await jobsApi.delete(deleteId);
      setDeleteId(null);
      fetchJobs();
    } catch (err) {
      alert(err.message || 'Failed to delete job opening.');
    }
  };

  const columns = [
    {
      header: 'Role & Company',
      accessor: 'role',
      cell: (row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{row.role}</div>
          <div style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 500 }}>{row.companyName}</div>
        </div>
      ),
    },
    {
      header: 'Package',
      accessor: 'packageLpa',
      cell: (row) => (
        <span style={{ fontWeight: 700, color: '#059669' }}>
          ₹{row.packageLpa ? row.packageLpa.toFixed(2) : '0.00'} LPA
        </span>
      ),
    },
    {
      header: 'Min CGPA / Max Backlogs',
      accessor: 'minCgpa',
      cell: (row) => (
        <div style={{ fontSize: '0.82rem' }}>
          <div>Min CGPA: <strong>{row.minCgpa}</strong></div>
          <div style={{ color: '#64748b' }}>Max Backlogs: {row.maxBacklogs}</div>
        </div>
      ),
    },
    {
      header: 'Allowed Branches',
      accessor: 'allowedBranches',
      cell: (row) => (
        <div style={{ fontSize: '0.8rem', color: '#475569' }}>
          {row.allowedBranches}
        </div>
      ),
    },
    {
      header: 'Deadline',
      accessor: 'applicationDeadline',
      cell: (row) => (
        <span style={{ fontSize: '0.85rem' }}>{row.applicationDeadline}</span>
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
          <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEligibility(row)} style={{ color: '#2563eb' }}>
            <ShieldCheck size={14} /> Check Eligibility
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(row)}>
            <Edit2 size={14} />
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(row.id)}>
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Open Jobs', value: 'OPEN' },
              { label: 'Closed Jobs', value: 'CLOSED' },
            ],
          },
        ]}
        actionButton={
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Post Job Opening
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={jobs}
        loading={loading}
        emptyTitle="No Job Openings Found"
        emptyMessage="Post a new job opening for eligible students to apply."
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingJob ? 'Edit Job Opening' : 'Post New Job Opening'}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit}>
          {formError && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {formError}
            </div>
          )}

          <div className="form-grid">
            <div className="form-group">
              <label>Recruiting Company *</label>
              <select
                className="form-control"
                required
                value={formData.companyId}
                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
              >
                <option value="">Select Company</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Job Role Title *</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="e.g. Programmer Analyst Trainee"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Package (LPA) *</label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                className="form-control"
                required
                value={formData.packageLpa}
                onChange={(e) => setFormData({ ...formData, packageLpa: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Min CGPA Cutoff *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                className="form-control"
                required
                value={formData.minCgpa}
                onChange={(e) => setFormData({ ...formData, minCgpa: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Allowed Branches (comma separated) *</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="CSE,IT,AI-ML,ECE"
                value={formData.allowedBranches}
                onChange={(e) => setFormData({ ...formData, allowedBranches: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Max Backlogs Allowed *</label>
              <input
                type="number"
                min="0"
                className="form-control"
                required
                value={formData.maxBacklogs}
                onChange={(e) => setFormData({ ...formData, maxBacklogs: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Application Deadline *</label>
              <input
                type="date"
                className="form-control"
                required
                value={formData.applicationDeadline}
                onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Job Status</label>
              <select
                className="form-control"
                value={formData.jobStatus}
                onChange={(e) => setFormData({ ...formData, jobStatus: e.target.value })}
              >
                <option value="OPEN">OPEN</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Job Description</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Responsibilities, requirements, and job details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {editingJob ? 'Update Job' : 'Post Job'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Interactive Eligibility Engine Drawer/Modal */}
      <Modal
        isOpen={!!eligibilityJob}
        title={`Eligibility Rules Engine — ${eligibilityJob?.role || ''}`}
        onClose={() => setEligibilityJob(null)}
      >
        <div style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#475569' }}>
          Test whether a student satisfies the CGPA, branch, backlog, and deadline criteria for <strong>{eligibilityJob?.companyName}</strong>.
        </div>

        <div className="form-group">
          <label>Select Candidate Student:</label>
          <select
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
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: '1.25rem' }}
          onClick={handleRunEligibilityTest}
          disabled={checkingEligibility || !selectedStudentId}
        >
          {checkingEligibility ? 'Evaluating Rules...' : 'Run Eligibility Evaluation'}
        </button>

        {eligibilityResult && (
          <div style={{
            padding: '1.25rem',
            borderRadius: '10px',
            backgroundColor: eligibilityResult.eligible ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${eligibilityResult.eligible ? '#a7f3d0' : '#fca5a5'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              {eligibilityResult.eligible ? (
                <CheckCircle2 size={22} color="#059669" />
              ) : (
                <XCircle size={22} color="#dc2626" />
              )}
              <h4 style={{ fontSize: '1rem', color: eligibilityResult.eligible ? '#065f46' : '#991b1b' }}>
                {eligibilityResult.eligible ? 'Candidate ELIGIBLE' : 'Candidate INELIGIBLE'}
              </h4>
            </div>

            {eligibilityResult.eligible ? (
              <p style={{ fontSize: '0.88rem', color: '#047857' }}>
                This student satisfies all academic cutoff, backlog limit, branch match, and deadline requirements for this job.
              </p>
            ) : (
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#991b1b', marginBottom: '0.3rem' }}>
                  Rejection Reasons:
                </p>
                <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#7f1d1d' }}>
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
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
