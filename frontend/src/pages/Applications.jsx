import React, { useEffect, useState } from 'react';
import { Plus, Trash2, ArrowRight } from 'lucide-react';
import DataTable from '../components/DataTable';
import FilterBar from '../components/FilterBar';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import { applicationsApi, studentsApi, jobsApi } from '../services/api';

const STATUS_PIPELINE = ['APPLIED', 'SHORTLISTED', 'APTITUDE', 'TECHNICAL', 'HR', 'SELECTED', 'REJECTED'];

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [students, setStudents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // New Application Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [applyError, setApplyError] = useState('');

  // Delete State
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchApplications();
    fetchStudents();
    fetchJobs();
  }, [statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await applicationsApi.getAll({ status: statusFilter });
      if (res.success) setApplications(res.data);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
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

  const fetchJobs = async () => {
    try {
      const res = await jobsApi.getAll({ status: 'OPEN' });
      if (res.success) setJobs(res.data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    }
  };

  const handleOpenApplyModal = () => {
    setSelectedStudentId(students.length > 0 ? students[0].id : '');
    setSelectedJobId(jobs.length > 0 ? jobs[0].id : '');
    setApplyError('');
    setIsApplyModalOpen(true);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyError('');
    try {
      await applicationsApi.apply(parseInt(selectedStudentId), parseInt(selectedJobId));
      setIsApplyModalOpen(false);
      fetchApplications();
    } catch (err) {
      setApplyError(err.message || 'Failed to submit application.');
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await applicationsApi.updateStatus(appId, newStatus);
      fetchApplications();
    } catch (err) {
      alert(err.message || 'Failed to update application status.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await applicationsApi.delete(deleteId);
      setDeleteId(null);
      fetchApplications();
    } catch (err) {
      alert(err.message || 'Failed to delete application.');
    }
  };

  const columns = [
    {
      header: 'Applicant Student',
      accessor: 'studentName',
      cell: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.studentName}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{row.studentBranch} • {row.studentCgpa} CGPA</div>
        </div>
      ),
    },
    {
      header: 'Job Role & Company',
      accessor: 'jobRole',
      cell: (row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{row.jobRole}</div>
          <div style={{ fontSize: '0.78rem', color: '#2563eb' }}>{row.companyName}</div>
        </div>
      ),
    },
    {
      header: 'Current Pipeline Stage',
      accessor: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Applied Date',
      accessor: 'appliedAt',
      cell: (row) => <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{row.appliedAt || 'Recent'}</span>,
    },
    {
      header: 'Advance Pipeline Stage',
      align: 'right',
      cell: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem' }}>
          <select
            className="form-control"
            style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
            value={row.status}
            onChange={(e) => handleStatusChange(row.id, e.target.value)}
          >
            {STATUS_PIPELINE.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

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
        filters={[
          {
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Pipeline Stages', value: 'ALL' },
              { label: 'Applied', value: 'APPLIED' },
              { label: 'Shortlisted', value: 'SHORTLISTED' },
              { label: 'Aptitude Round', value: 'APTITUDE' },
              { label: 'Technical Round', value: 'TECHNICAL' },
              { label: 'HR Round', value: 'HR' },
              { label: 'Selected', value: 'SELECTED' },
              { label: 'Rejected', value: 'REJECTED' },
            ],
          },
        ]}
        actionButton={
          <button className="btn btn-primary" onClick={handleOpenApplyModal}>
            <Plus size={16} /> Submit New Application
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={applications}
        loading={loading}
        emptyTitle="No Applications Found"
        emptyMessage="No student applications currently exist in this recruitment stage."
      />

      {/* New Application Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        title="Submit Student Job Application"
        onClose={() => setIsApplyModalOpen(false)}
      >
        <form onSubmit={handleApplySubmit}>
          {applyError && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {applyError}
            </div>
          )}

          <div className="form-group">
            <label>Select Student *</label>
            <select
              className="form-control"
              required
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.branch} | {s.cgpa} CGPA | {s.placementStatus})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Select Job Opening *</label>
            <select
              className="form-control"
              required
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.companyName} — {j.role} (₹{j.packageLpa} LPA)
                </option>
              ))}
            </select>
          </div>

          <div className="modal-footer" style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsApplyModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Submit Application</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Withdraw Application"
        message="Are you sure you want to remove this application record?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
