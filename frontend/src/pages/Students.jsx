import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, X, AlertCircle, RefreshCw, GraduationCap } from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { studentsApi } from '../services/api';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    branch: 'CSE',
    cgpa: '8.00',
    graduationYear: 2026,
    backlogs: 0,
    skills: '',
    placementStatus: 'NOT_PLACED',
  });
  const [formError, setFormError] = useState('');

  // Delete Dialog State
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [search, branchFilter, statusFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentsApi.getAll({
        search: search.trim() || undefined,
        branch: branchFilter !== 'ALL' ? branchFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      if (res.success && Array.isArray(res.data)) {
        setStudents(res.data);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
      setError(err.message || 'Unable to connect to students service.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setBranchFilter('ALL');
    setStatusFilter('ALL');
  };

  const getInitials = (name) => {
    if (!name) return 'ST';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      branch: 'CSE',
      cgpa: '8.00',
      graduationYear: 2026,
      backlogs: 0,
      skills: '',
      placementStatus: 'NOT_PLACED',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name || '',
      email: student.email || '',
      phone: student.phone || '',
      branch: student.branch || 'CSE',
      cgpa: student.cgpa !== undefined ? String(student.cgpa) : '8.00',
      graduationYear: student.graduationYear || 2026,
      backlogs: student.backlogs !== undefined ? student.backlogs : 0,
      skills: student.skills || '',
      placementStatus: student.placementStatus || 'NOT_PLACED',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const parsedCgpa = parseFloat(formData.cgpa);
      const parsedGradYear = parseInt(formData.graduationYear, 10);
      const parsedBacklogs = parseInt(formData.backlogs, 10);

      if (isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10) {
        throw new Error('CGPA must be a valid number between 0.00 and 10.00.');
      }
      if (isNaN(parsedGradYear) || parsedGradYear < 2000 || parsedGradYear > 2100) {
        throw new Error('Please enter a valid graduation year.');
      }
      if (isNaN(parsedBacklogs) || parsedBacklogs < 0) {
        throw new Error('Backlogs cannot be negative.');
      }

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        branch: formData.branch,
        cgpa: parsedCgpa,
        graduationYear: parsedGradYear,
        backlogs: parsedBacklogs,
        skills: formData.skills.trim() || null,
        placementStatus: formData.placementStatus,
      };

      if (editingStudent) {
        await studentsApi.update(editingStudent.id, payload);
      } else {
        await studentsApi.create(payload);
      }

      setIsModalOpen(false);
      fetchStudents();
    } catch (err) {
      setFormError(err.message || 'Failed to save student record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await studentsApi.delete(deleteId);
      setDeleteId(null);
      fetchStudents();
    } catch (err) {
      alert(err.message || 'Failed to delete student record.');
    } finally {
      setDeleting(false);
    }
  };

  const hasActiveFilters = search.trim() !== '' || branchFilter !== 'ALL' || statusFilter !== 'ALL';

  const columns = [
    {
      header: 'Student',
      accessor: 'name',
      cell: (row) => (
        <div className="candidate-cell">
          <div className="candidate-avatar">
            {getInitials(row.name)}
          </div>
          <div className="candidate-info">
            <span className="candidate-name">{row.name}</span>
            <span className="candidate-sub">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Branch',
      accessor: 'branch',
      cell: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
          {row.branch}
        </span>
      ),
    },
    {
      header: 'CGPA',
      accessor: 'cgpa',
      cell: (row) => (
        <span className={`cgpa-pill ${row.cgpa >= 8.5 ? 'cgpa-pill-high' : ''}`}>
          {row.cgpa ? row.cgpa.toFixed(2) : '0.00'}
        </span>
      ),
    },
    {
      header: 'Backlogs',
      accessor: 'backlogs',
      cell: (row) => (
        <span className={`backlog-badge ${row.backlogs > 0 ? 'backlog-active' : 'backlog-zero'}`}>
          {row.backlogs === 0 ? '0' : `${row.backlogs} Active`}
        </span>
      ),
    },
    {
      header: 'Grad Year',
      accessor: 'graduationYear',
      cell: (row) => (
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          {row.graduationYear || '—'}
        </span>
      ),
    },
    {
      header: 'Placement Status',
      accessor: 'placementStatus',
      cell: (row) => <StatusBadge status={row.placementStatus} />,
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
          <button 
            type="button"
            className="btn btn-secondary btn-sm" 
            onClick={() => handleOpenEdit(row)}
            title="Edit student profile"
            aria-label={`Edit ${row.name}`}
          >
            <Edit2 size={13} />
            <span>Edit</span>
          </button>
          <button 
            type="button"
            className="btn btn-danger btn-sm" 
            onClick={() => setDeleteId(row.id)}
            title="Delete student profile"
            aria-label={`Delete ${row.name}`}
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
            <h1 className="page-header-title" style={{ margin: 0 }}>Students</h1>
            {!loading && (
              <span className="badge badge-open" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                {students.length} {students.length === 1 ? 'Candidate' : 'Candidates'}
              </span>
            )}
          </div>
          <p className="page-header-subtitle">
            Student roster, academic records, and corporate placement eligibility tracking
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Add Student</span>
        </button>
      </div>

      {/* Connection Error Banner */}
      {error && (
        <div className="card" style={{ backgroundColor: '#fef2f2', borderColor: '#fca5a5', color: '#991b1b', padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} color="#b91c1c" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: '0.875rem' }}>
            <strong>Unable to load students:</strong> {error}
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={fetchStudents}>
            Retry
          </button>
        </div>
      )}

      {/* Filter Bar */}
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
                placeholder="Search by student name or email..."
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

            {/* Branch Filter */}
            <select
              className="form-control"
              style={{ width: 'auto', minWidth: '130px', fontSize: '0.85rem' }}
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              aria-label="Filter by branch"
            >
              <option value="ALL">All Branches</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="AI-ML">AI-ML</option>
              <option value="ECE">ECE</option>
            </select>

            {/* Placement Status Filter */}
            <select
              className="form-control"
              style={{ width: 'auto', minWidth: '150px', fontSize: '0.85rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by placement status"
            >
              <option value="ALL">All Placement Statuses</option>
              <option value="NOT_PLACED">Not Placed</option>
              <option value="PLACED">Placed</option>
              <option value="HIGHER_STUDIES">Higher Studies</option>
            </select>

            {/* Reset Filters Action */}
            {hasActiveFilters && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleResetFilters}
                title="Reset all search and filter criteria"
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
        <LoadingSpinner message="Loading registered students..." />
      ) : students.length === 0 ? (
        <div className="card">
          <EmptyState
            title={hasActiveFilters ? "No Matching Students Found" : "No Students Registered"}
            message={
              hasActiveFilters
                ? "No student records match the active search and filter criteria. Try resetting filters."
                : "No students have been registered in the platform yet. Add candidates to start tracking placement eligibility."
            }
            action={
              hasActiveFilters ? (
                <button type="button" className="btn btn-secondary" onClick={handleResetFilters}>
                  Clear All Filters
                </button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
                  <Plus size={15} /> Add First Student
                </button>
              )
            }
          />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={students}
          loading={false}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingStudent ? 'Edit Student Profile' : 'Register New Student'}
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

          {/* Group 1: Personal Information */}
          <div className="modal-section-title">1. Personal Information</div>
          <div className="form-group">
            <label htmlFor="student-name">Full Name *</label>
            <input
              id="student-name"
              type="text"
              className="form-control"
              required
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="student-email">Email Address *</label>
              <input
                id="student-email"
                type="email"
                className="form-control"
                required
                placeholder="john.doe@college.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="student-phone">Phone Number</label>
              <input
                id="student-phone"
                type="text"
                className="form-control"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          {/* Group 2: Academic Profile */}
          <div className="modal-section-title">2. Academic Credentials</div>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="student-branch">Department / Branch *</label>
              <select
                id="student-branch"
                className="form-control"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              >
                <option value="CSE">CSE — Computer Science</option>
                <option value="IT">IT — Information Technology</option>
                <option value="AI-ML">AI-ML — Artificial Intelligence & ML</option>
                <option value="ECE">ECE — Electronics & Communication</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="student-cgpa">Cumulative CGPA (0.00 – 10.00) *</label>
              <input
                id="student-cgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                className="form-control"
                required
                placeholder="8.50"
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="student-grad-year">Graduation Year *</label>
              <input
                id="student-grad-year"
                type="number"
                min="2020"
                max="2035"
                className="form-control"
                required
                placeholder="2026"
                value={formData.graduationYear}
                onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="student-backlogs">Active Backlogs *</label>
              <input
                id="student-backlogs"
                type="number"
                min="0"
                max="50"
                className="form-control"
                required
                placeholder="0"
                value={formData.backlogs}
                onChange={(e) => setFormData({ ...formData, backlogs: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="student-skills">Technical Skills (comma-separated)</label>
            <input
              id="student-skills"
              type="text"
              className="form-control"
              placeholder="e.g. Java, Spring Boot, React, MySQL, Docker"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            />
          </div>

          {/* Group 3: Placement Status */}
          <div className="modal-section-title">3. Placement Status</div>
          <div className="form-group">
            <label htmlFor="student-status">Current Placement Standing</label>
            <select
              id="student-status"
              className="form-control"
              value={formData.placementStatus}
              onChange={(e) => setFormData({ ...formData, placementStatus: e.target.value })}
            >
              <option value="NOT_PLACED">NOT PLACED (Actively Seeking)</option>
              <option value="PLACED">PLACED (Offer Accepted)</option>
              <option value="HIGHER_STUDIES">HIGHER STUDIES (Opted Out)</option>
            </select>
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
              {submitting ? 'Saving...' : editingStudent ? 'Update Profile' : 'Register Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Student Record"
        message="This will permanently remove this student record. All associated applications and interview records will also be removed."
        onConfirm={handleDeleteConfirm}
        onCancel={() => !deleting && setDeleteId(null)}
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        isDanger={true}
      />
    </div>
  );
}
