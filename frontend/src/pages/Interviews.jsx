import React, { useEffect, useState } from 'react';
import { Calendar, Plus, Edit2, Trash2, CheckCircle, XCircle, AlertCircle, Clock, Video, Building2, User, Search, X } from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { interviewsApi, applicationsApi } from '../services/api';

export default function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resultFilter, setResultFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
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
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchInterviews();
  }, [resultFilter]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await interviewsApi.getAll({ 
        result: resultFilter !== 'ALL' ? resultFilter : undefined 
      });
      if (res.success && Array.isArray(res.data)) {
        setInterviews(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch interviews:', err);
      setError(err.message || 'Unable to connect to interview service.');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await applicationsApi.getAll();
      if (res.success && Array.isArray(res.data)) setApplications(res.data);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'ST';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr.replace(' ', 'T'));
      if (isNaN(d.getTime())) return dateStr;
      return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return dateStr;
    }
  };

  const handleOpenSchedule = () => {
    setEditingInterview(null);
    setFormData({
      applicationId: applications.length > 0 ? String(applications[0].id) : '',
      round: 'TECHNICAL',
      scheduledAt: '2026-11-20T10:00',
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
    let schedValue = '';
    if (interview.scheduledAt) {
      schedValue = interview.scheduledAt.replace(' ', 'T').slice(0, 16);
    }

    setFormData({
      applicationId: interview.applicationId ? String(interview.applicationId) : '',
      round: interview.round || 'TECHNICAL',
      scheduledAt: schedValue,
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
    setSubmitting(true);

    try {
      if (!formData.applicationId) {
        throw new Error('Please select an active student application.');
      }
      if (!formData.scheduledAt) {
        throw new Error('Please specify scheduled date and time.');
      }

      // Convert local datetime input back to standard backend pattern YYYY-MM-DD HH:mm:ss
      let formattedDate = formData.scheduledAt.replace('T', ' ');
      if (formattedDate.length === 16) {
        formattedDate += ':00';
      }

      const payload = {
        applicationId: parseInt(formData.applicationId, 10),
        round: formData.round,
        scheduledAt: formattedDate,
        mode: formData.mode,
        interviewer: formData.interviewer.trim() || null,
        result: formData.result,
        remarks: formData.remarks.trim() || null,
      };

      if (editingInterview) {
        await interviewsApi.update(editingInterview.id, payload);
      } else {
        await interviewsApi.schedule(payload);
      }
      setIsModalOpen(false);
      fetchInterviews();
    } catch (err) {
      setFormError(err.message || 'Failed to save interview schedule.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResultQuickUpdate = async (interview, newResult) => {
    try {
      await interviewsApi.update(interview.id, {
        applicationId: interview.applicationId,
        round: interview.round,
        scheduledAt: interview.scheduledAt,
        mode: interview.mode,
        interviewer: interview.interviewer,
        result: newResult,
        remarks: interview.remarks,
      });
      fetchInterviews();
    } catch (err) {
      alert(err.message || 'Failed to update interview result.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await interviewsApi.delete(deleteId);
      setDeleteId(null);
      fetchInterviews();
    } catch (err) {
      alert(err.message || 'Failed to delete interview schedule.');
    } finally {
      setDeleting(false);
    }
  };

  // Search filter
  const filteredInterviews = interviews.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (item.studentName && item.studentName.toLowerCase().includes(q)) ||
      (item.companyName && item.companyName.toLowerCase().includes(q)) ||
      (item.jobRole && item.jobRole.toLowerCase().includes(q)) ||
      (item.interviewer && item.interviewer.toLowerCase().includes(q)) ||
      (item.round && item.round.toLowerCase().includes(q))
    );
  });

  const columns = [
    {
      header: 'Candidate',
      accessor: 'studentName',
      cell: (row) => (
        <div className="candidate-cell">
          <div className="candidate-avatar" style={{ background: '#f5f3ff', color: '#8b5cf6', borderColor: '#ddd6fe' }}>
            {getInitials(row.studentName)}
          </div>
          <div className="candidate-info">
            <span className="candidate-name">{row.studentName || '—'}</span>
            <span className="candidate-sub">App #{row.applicationId}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Company & Role',
      accessor: 'companyName',
      cell: (row) => (
        <div>
          <div className="role-title">{row.companyName}</div>
          <div className="company-sub" style={{ color: 'var(--primary)', fontWeight: 500 }}>
            {row.jobRole}
          </div>
        </div>
      ),
    },
    {
      header: 'Round & Mode',
      accessor: 'round',
      cell: (row) => (
        <div style={{ fontSize: '0.825rem' }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{row.round}</div>
          <div className="location-pill" style={{ marginTop: '0.15rem' }}>
            {row.mode === 'ONLINE' ? <Video size={12} color="#0284c7" /> : <Building2 size={12} color="#64748b" />}
            <span style={{ textTransform: 'capitalize' }}>{row.mode ? row.mode.toLowerCase() : 'Online'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Scheduled Time',
      accessor: 'scheduledAt',
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
          <Clock size={13} color="#64748b" />
          <span>{formatDateTime(row.scheduledAt)}</span>
        </div>
      ),
    },
    {
      header: 'Interviewer Panel',
      accessor: 'interviewer',
      cell: (row) => (
        <div style={{ fontSize: '0.825rem' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {row.interviewer || 'Panel TBD'}
          </div>
          {row.remarks && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {row.remarks}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Evaluation',
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
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ color: '#059669', borderColor: '#a7f3d0' }}
                onClick={() => handleResultQuickUpdate(row, 'PASSED')}
                title="Mark Candidate Passed"
                aria-label="Pass round"
              >
                <CheckCircle size={13} />
                <span>Pass</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                onClick={() => handleResultQuickUpdate(row, 'FAILED')}
                title="Mark Candidate Failed"
                aria-label="Fail round"
              >
                <XCircle size={13} />
                <span>Fail</span>
              </button>
            </>
          )}
          <button 
            type="button"
            className="btn btn-secondary btn-sm" 
            onClick={() => handleOpenEdit(row)}
            title="Edit interview schedule"
            aria-label="Edit interview"
          >
            <Edit2 size={13} />
          </button>
          <button 
            type="button"
            className="btn btn-danger btn-sm" 
            onClick={() => setDeleteId(row.id)}
            title="Cancel interview schedule"
            aria-label="Cancel interview"
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
            <h1 className="page-header-title" style={{ margin: 0 }}>Interviews</h1>
            {!loading && (
              <span className="badge badge-open" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                {interviews.length} {interviews.length === 1 ? 'Round' : 'Rounds'}
              </span>
            )}
          </div>
          <p className="page-header-subtitle">
            Recruitment evaluation stages, interviewer panels, schedules, and assessment outcomes
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleOpenSchedule}>
          <Plus size={16} />
          <span>Schedule Interview</span>
        </button>
      </div>

      {/* Connection Error Banner */}
      {error && (
        <div className="card" style={{ backgroundColor: '#fef2f2', borderColor: '#fca5a5', color: '#991b1b', padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} color="#b91c1c" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: '0.875rem' }}>
            <strong>Unable to load interviews:</strong> {error}
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={fetchInterviews}>
            Retry
          </button>
        </div>
      )}

      {/* Result Filter Tabs */}
      <div className="filter-tabs">
        <button
          type="button"
          className={`filter-tab ${resultFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => setResultFilter('ALL')}
        >
          All Rounds
        </button>
        <button
          type="button"
          className={`filter-tab ${resultFilter === 'PENDING' ? 'active' : ''}`}
          onClick={() => setResultFilter('PENDING')}
        >
          Upcoming (Pending)
        </button>
        <button
          type="button"
          className={`filter-tab ${resultFilter === 'PASSED' ? 'active' : ''}`}
          onClick={() => setResultFilter('PASSED')}
        >
          Passed
        </button>
        <button
          type="button"
          className={`filter-tab ${resultFilter === 'FAILED' ? 'active' : ''}`}
          onClick={() => setResultFilter('FAILED')}
        >
          Failed
        </button>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: '260px', flex: 1, maxWidth: '400px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.35rem', fontSize: '0.85rem' }}
              placeholder="Search by candidate, company, role, or panel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search interviews"
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
        <LoadingSpinner message="Loading interview evaluation schedules..." />
      ) : filteredInterviews.length === 0 ? (
        <div className="card">
          <EmptyState
            title={resultFilter !== 'ALL' || search ? "No Matching Interviews Found" : "No Interviews Scheduled"}
            message={
              resultFilter !== 'ALL' || search
                ? "No interview sessions match your active filter or search query. Try clearing filters."
                : "No interview evaluation rounds are currently scheduled. Schedule an evaluation round for an applicant."
            }
            action={
              resultFilter !== 'ALL' || search ? (
                <button type="button" className="btn btn-secondary" onClick={() => { setResultFilter('ALL'); setSearch(''); }}>
                  Clear Filters
                </button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={handleOpenSchedule}>
                  <Plus size={15} /> Schedule First Interview
                </button>
              )
            }
          />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredInterviews}
          loading={false}
        />
      )}

      {/* Schedule / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingInterview ? 'Update Interview Details' : 'Schedule Interview Evaluation'}
        onClose={() => !submitting && setIsModalOpen(false)}
        maxWidth="600px"
      >
        <form onSubmit={handleSubmit}>
          {formError && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} color="#b91c1c" />
              <span>{formError}</span>
            </div>
          )}

          {/* Section 1: Candidate Application */}
          <div className="modal-section-title">1. Candidate Application</div>
          <div className="form-group">
            <label htmlFor="interview-app">Select Student Application *</label>
            <select
              id="interview-app"
              className="form-control"
              required
              disabled={!!editingInterview}
              value={formData.applicationId}
              onChange={(e) => setFormData({ ...formData, applicationId: e.target.value })}
            >
              <option value="">Choose Candidate Application</option>
              {applications.map((a) => (
                <option key={a.id} value={a.id}>
                  App #{a.id} — {a.studentName} ({a.companyName} | {a.jobRole})
                </option>
              ))}
            </select>
          </div>

          {/* Section 2: Round & Mode */}
          <div className="modal-section-title">2. Round & Modality</div>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="interview-round">Evaluation Round *</label>
              <select
                id="interview-round"
                className="form-control"
                value={formData.round}
                onChange={(e) => setFormData({ ...formData, round: e.target.value })}
              >
                <option value="APTITUDE">APTITUDE (Screening)</option>
                <option value="TECHNICAL">TECHNICAL (Coding & Architecture)</option>
                <option value="HR">HR (Behavioral & Cultural)</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="interview-mode">Interview Mode *</label>
              <select
                id="interview-mode"
                className="form-control"
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
              >
                <option value="ONLINE">ONLINE (Video Conference)</option>
                <option value="OFFLINE">OFFLINE (Campus / Office)</option>
              </select>
            </div>
          </div>

          {/* Section 3: Schedule & Panel */}
          <div className="modal-section-title">3. Schedule & Panel</div>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="interview-time">Scheduled Date & Time *</label>
              <input
                id="interview-time"
                type="datetime-local"
                className="form-control"
                required
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="interview-panel">Interviewer / Panel Name</label>
              <input
                id="interview-panel"
                type="text"
                className="form-control"
                placeholder="e.g. David Miller (Engineering Manager)"
                value={formData.interviewer}
                onChange={(e) => setFormData({ ...formData, interviewer: e.target.value })}
              />
            </div>
          </div>

          {/* Section 4: Evaluation & Feedback */}
          <div className="modal-section-title">4. Assessment Outcome</div>
          <div className="form-group">
            <label htmlFor="interview-result">Current Result</label>
            <select
              id="interview-result"
              className="form-control"
              value={formData.result}
              onChange={(e) => setFormData({ ...formData, result: e.target.value })}
            >
              <option value="PENDING">PENDING (Awaiting Evaluation)</option>
              <option value="PASSED">PASSED (Cleared Round)</option>
              <option value="FAILED">FAILED (Not Selected)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="interview-remarks">Interviewer Remarks & Notes</label>
            <textarea
              id="interview-remarks"
              className="form-control"
              rows={3}
              placeholder="Candidate strengths, code evaluation, and feedback..."
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
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
              {submitting ? 'Saving...' : editingInterview ? 'Update Interview' : 'Schedule Interview'}
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
        onCancel={() => !deleting && setDeleteId(null)}
        confirmText={deleting ? 'Cancelling...' : 'Cancel Interview'}
        isDanger={true}
      />
    </div>
  );
}
