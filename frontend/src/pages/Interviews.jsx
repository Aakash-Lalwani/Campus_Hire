import React, { useEffect, useState } from 'react';
import { Calendar, Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import DataTable from '../components/DataTable';
import FilterBar from '../components/FilterBar';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import { interviewsApi, applicationsApi } from '../services/api';

export default function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resultFilter, setResultFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [formData, setFormData] = useState({
    applicationId: '',
    round: 'TECHNICAL',
    scheduledAt: '2026-08-15 10:00:00',
    mode: 'ONLINE',
    interviewer: '',
    result: 'PENDING',
    remarks: '',
  });
  const [formError, setFormError] = useState('');

  // Delete State
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchInterviews();
    fetchApplications();
  }, [resultFilter]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await interviewsApi.getAll({ result: resultFilter });
      if (res.success) setInterviews(res.data);
    } catch (err) {
      console.error('Failed to fetch interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await applicationsApi.getAll();
      if (res.success) setApplications(res.data);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    }
  };

  const handleOpenSchedule = () => {
    setEditingInterview(null);
    setFormData({
      applicationId: applications.length > 0 ? applications[0].id : '',
      round: 'TECHNICAL',
      scheduledAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      mode: 'ONLINE',
      interviewer: '',
      result: 'PENDING',
      remarks: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (interview) => {
    setEditingInterview(interview);
    setFormData({
      applicationId: interview.applicationId || '',
      round: interview.round || 'TECHNICAL',
      scheduledAt: interview.scheduledAt ? interview.scheduledAt.slice(0, 16) : '',
      mode: interview.mode || 'ONLINE',
      interviewer: interview.interviewer || '',
      result: interview.result || 'PENDING',
      remarks: interview.remarks || '',
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
        applicationId: parseInt(formData.applicationId),
      };

      if (editingInterview) {
        await interviewsApi.update(editingInterview.id, payload);
      } else {
        await interviewsApi.schedule(payload);
      }
      setIsModalOpen(false);
      fetchInterviews();
    } catch (err) {
      setFormError(err.message || 'Failed to save interview record.');
    }
  };

  const handleResultQuickUpdate = async (interview, newResult) => {
    try {
      await interviewsApi.update(interview.id, {
        ...interview,
        result: newResult,
      });
      fetchInterviews();
    } catch (err) {
      alert(err.message || 'Failed to update interview result.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await interviewsApi.delete(deleteId);
      setDeleteId(null);
      fetchInterviews();
    } catch (err) {
      alert(err.message || 'Failed to delete interview schedule.');
    }
  };

  const columns = [
    {
      header: 'Candidate',
      accessor: 'studentName',
      cell: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.studentName}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>App ID #{row.applicationId}</div>
        </div>
      ),
    },
    {
      header: 'Company & Role',
      accessor: 'companyName',
      cell: (row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{row.jobRole}</div>
          <div style={{ fontSize: '0.78rem', color: '#2563eb' }}>{row.companyName}</div>
        </div>
      ),
    },
    {
      header: 'Round & Mode',
      accessor: 'round',
      cell: (row) => (
        <div style={{ fontSize: '0.85rem' }}>
          <strong>{row.round}</strong> ({row.mode})
        </div>
      ),
    },
    {
      header: 'Scheduled Time',
      accessor: 'scheduledAt',
      cell: (row) => <span style={{ fontSize: '0.82rem' }}>{row.scheduledAt}</span>,
    },
    {
      header: 'Interviewer',
      accessor: 'interviewer',
      cell: (row) => <span style={{ fontSize: '0.85rem', color: '#475569' }}>{row.interviewer || 'TBD'}</span>,
    },
    {
      header: 'Result',
      accessor: 'result',
      cell: (row) => <StatusBadge status={row.result} />,
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
          {row.result === 'PENDING' && (
            <>
              <button
                className="btn btn-secondary btn-sm"
                style={{ color: '#059669', borderColor: '#a7f3d0' }}
                onClick={() => handleResultQuickUpdate(row, 'PASSED')}
                title="Mark Passed"
              >
                <CheckCircle size={14} /> Pass
              </button>
              <button
                className="btn btn-secondary btn-sm"
                style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                onClick={() => handleResultQuickUpdate(row, 'FAILED')}
                title="Mark Failed"
              >
                <XCircle size={14} /> Fail
              </button>
            </>
          )}
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
        filters={[
          {
            value: resultFilter,
            onChange: setResultFilter,
            options: [
              { label: 'All Interview Results', value: 'ALL' },
              { label: 'Pending', value: 'PENDING' },
              { label: 'Passed', value: 'PASSED' },
              { label: 'Failed', value: 'FAILED' },
            ],
          },
        ]}
        actionButton={
          <button className="btn btn-primary" onClick={handleOpenSchedule}>
            <Plus size={16} /> Schedule Interview
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={interviews}
        loading={loading}
        emptyTitle="No Interviews Scheduled"
        emptyMessage="Schedule interview rounds for shortlisted student applications."
      />

      {/* Schedule / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingInterview ? 'Update Interview Details' : 'Schedule Interview Round'}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit}>
          {formError && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {formError}
            </div>
          )}

          <div className="form-group">
            <label>Select Student Application *</label>
            <select
              className="form-control"
              required
              disabled={!!editingInterview}
              value={formData.applicationId}
              onChange={(e) => setFormData({ ...formData, applicationId: e.target.value })}
            >
              {applications.map((a) => (
                <option key={a.id} value={a.id}>
                  App #{a.id} — {a.studentName} ({a.companyName} | {a.jobRole})
                </option>
              ))}
            </select>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Interview Round *</label>
              <select
                className="form-control"
                value={formData.round}
                onChange={(e) => setFormData({ ...formData, round: e.target.value })}
              >
                <option value="APTITUDE">APTITUDE</option>
                <option value="TECHNICAL">TECHNICAL</option>
                <option value="HR">HR</option>
              </select>
            </div>
            <div className="form-group">
              <label>Mode *</label>
              <select
                className="form-control"
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
              >
                <option value="ONLINE">ONLINE</option>
                <option value="OFFLINE">OFFLINE</option>
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Scheduled Date & Time *</label>
              <input
                type="datetime-local"
                className="form-control"
                required
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Interviewer Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Senior Tech Lead Name"
                value={formData.interviewer}
                onChange={(e) => setFormData({ ...formData, interviewer: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Interview Result</label>
            <select
              className="form-control"
              value={formData.result}
              onChange={(e) => setFormData({ ...formData, result: e.target.value })}
            >
              <option value="PENDING">PENDING</option>
              <option value="PASSED">PASSED</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>

          <div className="form-group">
            <label>Remarks / Feedback</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Interviewer notes and performance feedback..."
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {editingInterview ? 'Update Schedule' : 'Schedule Interview'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Cancel Interview Schedule"
        message="Are you sure you want to remove this scheduled interview round?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
