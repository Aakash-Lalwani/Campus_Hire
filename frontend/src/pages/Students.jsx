import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, UserPlus } from 'lucide-react';
import DataTable from '../components/DataTable';
import FilterBar from '../components/FilterBar';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import { studentsApi } from '../services/api';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
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

  useEffect(() => {
    fetchStudents();
  }, [search, branchFilter, statusFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await studentsApi.getAll({
        search,
        branch: branchFilter,
        status: statusFilter,
      });
      if (res.success) setStudents(res.data);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
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
      cgpa: student.cgpa !== undefined ? student.cgpa : '8.00',
      graduationYear: student.graduationYear || 2026,
      backlogs: student.backlogs || 0,
      skills: student.skills || '',
      placementStatus: student.placementStatus || 'NOT_PLACED',
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
        cgpa: parseFloat(formData.cgpa),
        graduationYear: parseInt(formData.graduationYear),
        backlogs: parseInt(formData.backlogs),
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
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await studentsApi.delete(deleteId);
      setDeleteId(null);
      fetchStudents();
    } catch (err) {
      alert(err.message || 'Failed to delete student.');
    }
  };

  const columns = [
    {
      header: 'Student Name',
      accessor: 'name',
      cell: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.name}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{row.email} • {row.phone || 'No phone'}</div>
        </div>
      ),
    },
    { header: 'Branch', accessor: 'branch' },
    {
      header: 'CGPA',
      accessor: 'cgpa',
      cell: (row) => (
        <span style={{ fontWeight: 600, color: row.cgpa >= 8.0 ? '#059669' : '#334155' }}>
          {row.cgpa ? row.cgpa.toFixed(2) : '0.00'}
        </span>
      ),
    },
    {
      header: 'Backlogs',
      accessor: 'backlogs',
      cell: (row) => (
        <span style={{ color: row.backlogs > 0 ? '#dc2626' : '#64748b', fontWeight: row.backlogs > 0 ? 600 : 400 }}>
          {row.backlogs}
        </span>
      ),
    },
    {
      header: 'Skills',
      accessor: 'skills',
      cell: (row) => (
        <div style={{ fontSize: '0.82rem', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#475569' }}>
          {row.skills || 'N/A'}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'placementStatus',
      cell: (row) => <StatusBadge status={row.placementStatus} />,
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(row)}>
            <Edit2 size={14} /> Edit
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
            value: branchFilter,
            onChange: setBranchFilter,
            options: [
              { label: 'All Branches', value: 'ALL' },
              { label: 'CSE', value: 'CSE' },
              { label: 'IT', value: 'IT' },
              { label: 'AI-ML', value: 'AI-ML' },
              { label: 'ECE', value: 'ECE' },
            ],
          },
          {
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Placement Statuses', value: 'ALL' },
              { label: 'Not Placed', value: 'NOT_PLACED' },
              { label: 'Placed', value: 'PLACED' },
              { label: 'Higher Studies', value: 'HIGHER_STUDIES' },
            ],
          },
        ]}
        actionButton={
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add Student
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        emptyTitle="No Students Found"
        emptyMessage="Try adjusting your search criteria or register a new student."
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingStudent ? 'Edit Student Record' : 'Register New Student'}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit}>
          {formError && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {formError}
            </div>
          )}

          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              className="form-control"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                className="form-control"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                className="form-control"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Branch *</label>
              <select
                className="form-control"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              >
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="AI-ML">AI-ML</option>
                <option value="ECE">ECE</option>
              </select>
            </div>
            <div className="form-group">
              <label>CGPA (0.00 - 10.00) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                className="form-control"
                required
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Graduation Year *</label>
              <input
                type="number"
                className="form-control"
                required
                value={formData.graduationYear}
                onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Active Backlogs *</label>
              <input
                type="number"
                min="0"
                className="form-control"
                required
                value={formData.backlogs}
                onChange={(e) => setFormData({ ...formData, backlogs: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Technical Skills (comma separated)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Java, React, SQL, Python"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Placement Status</label>
            <select
              className="form-control"
              value={formData.placementStatus}
              onChange={(e) => setFormData({ ...formData, placementStatus: e.target.value })}
            >
              <option value="NOT_PLACED">NOT PLACED</option>
              <option value="PLACED">PLACED</option>
              <option value="HIGHER_STUDIES">HIGHER STUDIES</option>
            </select>
          </div>

          <div className="modal-footer" style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {editingStudent ? 'Update Student' : 'Save Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Student Record"
        message="Are you sure you want to delete this student? All associated applications and interview records will also be removed."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
