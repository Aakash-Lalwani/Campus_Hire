import React from 'react';
import { useLocation } from 'react-router-dom';
import { useRole, ROLES } from '../context/RoleContext';
import { User } from 'lucide-react';

export default function Topbar() {
  const location = useLocation();
  const { role, setRole } = useRole();

  const getPageTitle = (path) => {
    switch (path) {
      case '/': return 'Dashboard & Placement Overview';
      case '/students': return 'Student Profiles & Placement Status';
      case '/companies': return 'Recruiting Companies';
      case '/jobs': return 'Job Openings & Eligibility Rules';
      case '/applications': return 'Application Tracking Pipeline';
      case '/interviews': return 'Scheduled Interview Rounds';
      case '/student-portal': return 'Student Application Portal';
      default: return 'CampusHire Placement System';
    }
  };

  return (
    <header className="topbar">
      <div className="page-header">
        <h1>{getPageTitle(location.pathname)}</h1>
      </div>

      <div className="topbar-actions">
        <div className="role-selector">
          <label htmlFor="role-select">Demo Role:</label>
          <select
            id="role-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value={ROLES.OFFICER}>{ROLES.OFFICER}</option>
            <option value={ROLES.STUDENT}>{ROLES.STUDENT}</option>
            <option value={ROLES.RECRUITER}>{ROLES.RECRUITER}</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
          <User size={16} color="#64748b" />
          <span style={{ fontWeight: 600, color: '#334155' }}>Demo User</span>
        </div>
      </div>
    </header>
  );
}
