import React from 'react';
import { useLocation } from 'react-router-dom';
import { useRole, ROLES } from '../context/RoleContext';
import { Menu, Bell, ChevronRight } from 'lucide-react';

export default function Topbar({ onToggleSidebar }) {
  const location = useLocation();
  const { role, setRole } = useRole();

  const getPageMeta = (path) => {
    switch (path) {
      case '/': 
        return { section: 'Overview', title: 'Placement Analytics & KPI Dashboard' };
      case '/students': 
        return { section: 'Directory', title: 'Student Profiles & Eligibility Status' };
      case '/companies': 
        return { section: 'Corporate Partners', title: 'Recruiting Companies & Drives' };
      case '/jobs': 
        return { section: 'Placement Drives', title: 'Job Opportunities & Eligibility Criteria' };
      case '/applications': 
        return { section: 'Recruitment Funnel', title: 'Application Tracking & Pipeline' };
      case '/interviews': 
        return { section: 'Evaluation', title: 'Scheduled Interviews & Assessment Outcomes' };
      case '/student-portal': 
        return { section: 'Candidate Workspace', title: 'Student Application & Progress Portal' };
      default: 
        return { section: 'Platform', title: 'CampusHire Enterprise' };
    }
  };

  const meta = getPageMeta(location.pathname);

  return (
    <header className="topbar" role="banner">
      <div className="topbar-left">
        <button 
          className="mobile-menu-toggle"
          onClick={onToggleSidebar}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="topbar-title-block">
          <div className="topbar-breadcrumbs" aria-label="Breadcrumbs">
            <span>CampusHire</span>
            <ChevronRight size={12} />
            <span>{meta.section}</span>
          </div>
          <h1 className="topbar-title">{meta.title}</h1>
        </div>
      </div>

      <div className="topbar-actions">
        {/* Role Selector Pill */}
        <div className="role-pill">
          <span className="role-pill-label">Role:</span>
          <select
            id="role-select"
            className="role-pill-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            aria-label="Switch active demo role"
          >
            <option value={ROLES.OFFICER}>{ROLES.OFFICER}</option>
            <option value={ROLES.STUDENT}>{ROLES.STUDENT}</option>
            <option value={ROLES.RECRUITER}>{ROLES.RECRUITER}</option>
          </select>
        </div>

        {/* Notifications Icon Button */}
        <button 
          style={{
            background: 'none',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '0.45rem',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)'
          }} />
        </button>

        {/* User Profile Badge */}
        <div className="user-profile-badge">
          <div className="user-avatar-circle" aria-hidden="true">
            {role.substring(0, 2).toUpperCase()}
          </div>
          <span className="user-meta-name">{role}</span>
        </div>
      </div>
    </header>
  );
}
