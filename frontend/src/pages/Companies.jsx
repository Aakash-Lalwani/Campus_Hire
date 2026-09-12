import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Globe, Mail, User, MapPin, Search, X, AlertCircle, Building2, ExternalLink } from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { companiesApi } from '../services/api';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    location: '',
    website: '',
    contactPerson: '',
    contactEmail: '',
  });
  const [formError, setFormError] = useState('');

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, [search]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await companiesApi.getAll({
        search: search.trim() || undefined,
      });
      if (res.success && Array.isArray(res.data)) {
        setCompanies(res.data);
      }
    } catch (err) {
      console.error('Failed to load companies:', err);
      setError(err.message || 'Unable to connect to company service.');
    } finally {
      setLoading(false);
    }
  };

  const getCompanyInitials = (name) => {
    if (!name) return 'CO';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleOpenAdd = () => {
    setEditingCompany(null);
    setFormData({
      name: '',
      industry: '',
      location: '',
      website: '',
      contactPerson: '',
      contactEmail: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name || '',
      industry: company.industry || '',
      location: company.location || '',
      website: company.website || '',
      contactPerson: company.contactPerson || '',
      contactEmail: company.contactEmail || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (!formData.name.trim()) {
        throw new Error('Company name is required.');
      }

      const payload = {
        name: formData.name.trim(),
        industry: formData.industry.trim() || null,
        location: formData.location.trim() || null,
        website: formData.website.trim() || null,
        contactPerson: formData.contactPerson.trim() || null,
        contactEmail: formData.contactEmail.trim() || null,
      };

      if (editingCompany) {
        await companiesApi.update(editingCompany.id, payload);
      } else {
        await companiesApi.create(payload);
      }

      setIsModalOpen(false);
      fetchCompanies();
    } catch (err) {
      setFormError(err.message || 'Failed to save company record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await companiesApi.delete(deleteId);
      setDeleteId(null);
      fetchCompanies();
    } catch (err) {
      alert(err.message || 'Failed to delete company.');
    } finally {
      setDeleting(false);
    }
  };

  const formatWebsiteUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  };

  const cleanDisplayUrl = (url) => {
    if (!url) return '';
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  };

  const columns = [
    {
      header: 'Company',
      accessor: 'name',
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div className="company-avatar">
            {getCompanyInitials(row.name)}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.925rem', color: 'var(--text-primary)', lineHeight: 1.25 }}>
              {row.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {row.industry || 'General Industry'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Location',
      accessor: 'location',
      cell: (row) => (
        <div className="location-pill">
          <MapPin size={13} color="#64748b" style={{ flexShrink: 0 }} />
          <span>{row.location || 'Pan India / Remote'}</span>
        </div>
      ),
    },
    {
      header: 'Contact Representative',
      accessor: 'contactPerson',
      cell: (row) => (
        <div style={{ fontSize: '0.825rem' }}>
          {row.contactPerson ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              <User size={13} color="#64748b" />
              <span>{row.contactPerson}</span>
            </div>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>Representative TBD</span>
          )}
          {row.contactEmail && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '0.15rem' }}>
              <Mail size={12} color="#94a3b8" />
              <span>{row.contactEmail}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Website',
      accessor: 'website',
      cell: (row) => row.website ? (
        <a 
          href={formatWebsiteUrl(row.website)} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="website-link"
          title={`Visit ${cleanDisplayUrl(row.website)}`}
        >
          <Globe size={13} />
          <span>{cleanDisplayUrl(row.website)}</span>
          <ExternalLink size={11} style={{ opacity: 0.7 }} />
        </a>
      ) : (
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
      ),
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
            title="Edit company information"
            aria-label={`Edit ${row.name}`}
          >
            <Edit2 size={13} />
            <span>Edit</span>
          </button>
          <button 
            type="button"
            className="btn btn-danger btn-sm" 
            onClick={() => setDeleteId(row.id)}
            title="Remove partner company"
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
            <h1 className="page-header-title" style={{ margin: 0 }}>Companies</h1>
            {!loading && (
              <span className="badge badge-open" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                {companies.length} {companies.length === 1 ? 'Partner' : 'Partners'}
              </span>
            )}
          </div>
          <p className="page-header-subtitle">
            Corporate recruiters, hiring organizations, and recruitment drive partnerships
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Add Company</span>
        </button>
      </div>

      {/* Connection Error Banner */}
      {error && (
        <div className="card" style={{ backgroundColor: '#fef2f2', borderColor: '#fca5a5', color: '#991b1b', padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} color="#b91c1c" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: '0.875rem' }}>
            <strong>Unable to load companies:</strong> {error}
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={fetchCompanies}>
            Retry
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: '260px', flex: 1, maxWidth: '420px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.35rem', fontSize: '0.85rem' }}
              placeholder="Search by company name, industry, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search companies"
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

      {/* Main Content View */}
      {loading ? (
        <LoadingSpinner message="Loading partner companies..." />
      ) : companies.length === 0 ? (
        <div className="card">
          <EmptyState
            title={search ? "No Matching Companies" : "No Partner Companies"}
            message={
              search
                ? `No recruiters match "${search}". Try checking the spelling or clear the filter.`
                : "No partner recruitment companies have been added yet. Register your first corporate partner."
            }
            action={
              search ? (
                <button type="button" className="btn btn-secondary" onClick={() => setSearch('')}>
                  Clear Search
                </button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
                  <Plus size={15} /> Add First Company
                </button>
              )
            }
          />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={companies}
          loading={false}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingCompany ? 'Edit Company Information' : 'Add Partner Company'}
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

          {/* Section 1: Organization Details */}
          <div className="modal-section-title">1. Organization Details</div>
          <div className="form-group">
            <label htmlFor="company-name">Company Name *</label>
            <input
              id="company-name"
              type="text"
              className="form-control"
              required
              placeholder="e.g. Google, Microsoft, Infosys"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="company-industry">Industry Sector</label>
              <input
                id="company-industry"
                type="text"
                className="form-control"
                placeholder="e.g. Cloud Computing, FinTech"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="company-location">Office Location</label>
              <input
                id="company-location"
                type="text"
                className="form-control"
                placeholder="e.g. Bangalore, Hyderabad"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="company-website">Official Website URL</label>
            <input
              id="company-website"
              type="text"
              className="form-control"
              placeholder="https://www.example.com"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>

          {/* Section 2: Contact Information */}
          <div className="modal-section-title">2. Recruitment Contact Representative</div>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="company-contact-person">Contact Person Name</label>
              <input
                id="company-contact-person"
                type="text"
                className="form-control"
                placeholder="e.g. Sarah Jenkins (Campus Recruiter)"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="company-contact-email">Contact Email Address</label>
              <input
                id="company-contact-email"
                type="email"
                className="form-control"
                placeholder="recruitment@example.com"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              />
            </div>
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
              {submitting ? 'Saving...' : editingCompany ? 'Update Company' : 'Save Company'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Company"
        message="Are you sure you want to remove this company? All associated job openings, applications, and interviews will also be deleted."
        onConfirm={handleDeleteConfirm}
        onCancel={() => !deleting && setDeleteId(null)}
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        isDanger={true}
      />
    </div>
  );
}
