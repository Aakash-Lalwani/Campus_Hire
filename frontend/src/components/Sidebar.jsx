import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Briefcase, 
  FileText, 
  CalendarCheck, 
  UserCheck, 
  GraduationCap,
  X,
  ShieldCheck
} from 'lucide-react';
import { useRole, ROLES } from '../context/RoleContext';

export default function Sidebar({ isOpen, onClose }) {
  const { role } = useRole();

  const platformNavItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Students', path: '/students', icon: Users },
    { label: 'Companies', path: '/companies', icon: Building2 },
    { label: 'Jobs / Drives', path: '/jobs', icon: Briefcase },
    { label: 'Applications', path: '/applications', icon: FileText },
    { label: 'Interviews', path: '/interviews', icon: CalendarCheck },
  ];

  const candidateNavItems = [
    { label: 'Student Portal', path: '/student-portal', icon: UserCheck },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={onClose}
          aria-hidden="true" 
        />
      )}

      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`} aria-label="Main Navigation">
        <div className="sidebar-header">
          <div className="sidebar-logo-badge">
            <GraduationCap size={22} color="#ffffff" />
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-title">CampusHire</span>
            <span className="sidebar-brand-subtitle">Placement SaaS</span>
          </div>
          {isOpen && (
            <button 
              onClick={onClose}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              aria-label="Close navigation"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Placement Platform</div>
          {platformNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <div className="nav-item-icon">
                  <Icon size={18} />
                </div>
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div className="nav-section-title" style={{ marginTop: '0.75rem' }}>Candidate Experience</div>
          {candidateNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <div className="nav-item-icon">
                  <Icon size={18} />
                </div>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-role-card">
            <ShieldCheck size={18} color="#3b82f6" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="role-info-title">{role}</span>
              <span className="role-info-sub">Active Workspace</span>
            </div>
            <div className="role-avatar-dot" style={{ marginLeft: 'auto' }} />
          </div>
          <div style={{ marginTop: '0.65rem', fontSize: '0.68rem', color: '#475569', textAlign: 'center' }}>
            CampusHire Enterprise v2.0
          </div>
        </div>
      </aside>
    </>
  );
}
