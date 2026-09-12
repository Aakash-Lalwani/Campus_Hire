import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Globe, Mail, User } from 'lucide-react';
import DataTable from '../components/DataTable';
import FilterBar from '../components/FilterBar';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { companiesApi } from '../services/api';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
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

  useEffect(() => {
    fetchCompanies();
  }, [search]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await companiesApi.getAll({ search });
      if (res.success) setCompanies(res.data);
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoading(false);
    }
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

    try {
      if (editingCompany) {
        await companiesApi.update(editingCompany.id, formData);
      } else {
        await companiesApi.create(formData);
      }
      setIsModalOpen(false);
      fetchCompanies();
    } catch (err) {
      setFormError(err.message || 'Failed to save company record.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await companiesApi.delete(deleteId);
      setDeleteId(null);
      fetchCompanies();
    } catch (err) {
      alert(err.message || 'Failed to delete company.');
    }
  };

  const columns = [
    {
      header: 'Company Name',
      accessor: 'name',
      cell: (row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{row.name}</div>
          {row.website && (
            <a href={row.website} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', color: '#2563eb', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
              <Globe size={12} /> {row.website}
            </a>
          )}
        </div>
      ),
    },
    { header: 'Industry', accessor: 'industry' },
    { header: 'Location', accessor: 'location' },
    {
      header: 'Contact Representative',
      accessor: 'contactPerson',
      cell: (row) => (
        <div style={{ fontSize: '0.85rem' }}>
          {row.contactPerson && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 500 }}>
              <User size={13} color="#64748b" /> {row.contactPerson}
            </div>
          )}
          {row.contactEmail && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontSize: '0.78rem' }}>
              <Mail size={12} /> {row.contactEmail}
            </div>
          )}
        </div>
      ),
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
        actionButton={
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add Company
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={companies}
        loading={loading}
        emptyTitle="No Companies Found"
        emptyMessage="Register recruiting companies to post job openings."
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingCompany ? 'Edit Company Information' : 'Add Partner Company'}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit}>
          {formError && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {formError}
            </div>
          )}

          <div className="form-group">
            <label>Company Name *</label>
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
              <label>Industry</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. IT Services, Cloud, Software"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Office Location</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Bangalore / Hyderabad"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Website URL</label>
            <input
              type="url"
              className="form-control"
              placeholder="https://www.company.com"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Contact Person</label>
              <input
                type="text"
                className="form-control"
                placeholder="HR Manager / Recruiter Name"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Contact Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="recruiter@company.com"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {editingCompany ? 'Update Company' : 'Save Company'}
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
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
