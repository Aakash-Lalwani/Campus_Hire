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
  GraduationCap 
} from 'lucide-react';
import { useRole, ROLES } from '../context/RoleContext';

export default function Sidebar() {
  const { role } = useRole();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Students', path: '/students', icon: Users },
    { label: 'Companies', path: '/companies', icon: Building2 },
    { label: 'Jobs', path: '/jobs', icon: Briefcase },
    { label: 'Applications', path: '/applications', icon: FileText },
    { label: 'Interviews', path: '/interviews', icon: CalendarCheck },
    { label: 'Student Portal', path: '/student-portal', icon: UserCheck },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <GraduationCap size={28} color="#3b82f6" />
        <span className="sidebar-brand">CampusHire</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div>Role: <strong>{role}</strong></div>
        <div style={{ marginTop: '0.2rem', opacity: 0.7 }}>v1.0.0 — Java Servlets & React</div>
      </div>
    </aside>
  );
}
