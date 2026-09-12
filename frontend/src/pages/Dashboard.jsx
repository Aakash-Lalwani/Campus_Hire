import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Building2, 
  Briefcase, 
  CheckCircle2, 
  TrendingUp, 
  FileText, 
  Calendar,
  Layers,
  PieChart as PieChartIcon,
  BarChart3,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  CartesianGrid
} from 'recharts';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { dashboardApi, applicationsApi, interviewsApi } from '../services/api';

const PIE_COLORS = ['#2563eb', '#0284c7', '#0d9488', '#10b981', '#f59e0b', '#8b5cf6'];
const PACKAGE_COLORS = ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'];

const PACKAGE_RANGES = [
  { label: '< 5 LPA', keyMatch: ['< 5', '<5'] },
  { label: '5–10 LPA', keyMatch: ['5-10', '5–10'] },
  { label: '10–20 LPA', keyMatch: ['10-20', '10–20'] },
  { label: '> 20 LPA', keyMatch: ['> 20', '>20'] }
];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [recentInterviews, setRecentInterviews] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const [statsRes, appsRes, intRes] = await Promise.all([
        dashboardApi.getStats(),
        applicationsApi.getAll(),
        interviewsApi.getAll(),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (appsRes.success && Array.isArray(appsRes.data)) {
        setRecentApps(appsRes.data.slice(0, 6));
      }
      if (intRes.success && Array.isArray(intRes.data)) {
        setRecentInterviews(intRes.data.slice(0, 6));
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to connect to backend service.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'ST';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr.replace(' ', 'T'));
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr.replace(' ', 'T'));
      if (isNaN(d.getTime())) return dateStr;
      return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return dateStr;
    }
  };

  // Map backend package distribution into the 4 guaranteed ranges: < 5 LPA, 5–10 LPA, 10–20 LPA, > 20 LPA
  const packageDistData = PACKAGE_RANGES.map((rangeItem, idx) => {
    const match = (stats?.packageDistribution || []).find((item) => {
      const raw = String(item.label || '').trim().toLowerCase();
      return rangeItem.keyMatch.some((k) => raw.includes(k.toLowerCase()));
    });
    return {
      range: rangeItem.label,
      count: match ? Number(match.count || 0) : 0,
      color: PACKAGE_COLORS[idx % PACKAGE_COLORS.length]
    };
  });

  if (loading) {
    return <LoadingSpinner message="Loading placement intelligence and drive metrics..." />;
  }

  return (
    <div>
      {/* Section 1: Executive SaaS Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Dashboard</h1>
          <p className="page-header-subtitle">
            Placement analytics, corporate recruitment drives, and student pipeline status
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            type="button"
            className="btn btn-secondary btn-sm" 
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            title="Refresh dashboard metrics from backend"
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            <span>{refreshing ? 'Updating...' : 'Sync Live'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="card" style={{ backgroundColor: '#fef2f2', borderColor: '#fca5a5', color: '#991b1b', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} color="#b91c1c" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: '0.875rem' }}>
            <strong>Connection Error:</strong> {error}
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => fetchDashboardData(false)}>
            Retry
          </button>
        </div>
      )}

      {/* Section 2: Six Real KPI Cards */}
      <div className="stat-grid">
        <StatCard 
          label="Total Students" 
          value={stats?.totalStudents ?? 0} 
          icon={Users} 
          color="#2563eb" 
          bg="#eff6ff" 
        />
        <StatCard 
          label="Total Companies" 
          value={stats?.totalCompanies ?? 0} 
          icon={Building2} 
          color="#0284c7" 
          bg="#f0f9ff" 
        />
        <StatCard 
          label="Open Jobs" 
          value={stats?.openJobs ?? 0} 
          icon={Briefcase} 
          color="#d97706" 
          bg="#fffbeb" 
        />
        <StatCard 
          label="Total Applications" 
          value={stats?.totalApplications ?? 0} 
          icon={FileText} 
          color="#6366f1" 
          bg="#eef2ff" 
        />
        <StatCard 
          label="Students Placed" 
          value={stats?.studentsPlaced ?? 0} 
          icon={CheckCircle2} 
          color="#10b981" 
          bg="#ecfdf5" 
        />
        <StatCard 
          label="Placement Rate" 
          value={`${stats?.placementPercentage ?? 0}%`} 
          icon={TrendingUp} 
          color="#8b5cf6" 
          bg="#f5f3ff" 
        />
      </div>

      {/* Section 3: Visual Analytics */}
      {/* Row 3A: Placements by Branch (Rounded Bar) & Applications by Company (Donut) */}
      <div className="dashboard-grid-unequal">
        {/* Chart A: Placements by Branch */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title-group">
              <BarChart3 size={18} color="#2563eb" />
              <div>
                <h2 className="card-title" style={{ fontSize: '1rem', margin: 0 }}>Placement by Branch</h2>
                <div className="card-subtitle">Placed candidates vs registered total per department</div>
              </div>
            </div>
          </div>
          
          {(stats?.placementsByBranch || []).length === 0 ? (
            <EmptyState title="No Branch Data" message="Branch-wise placement statistics will appear once students register." />
          ) : (
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={stats.placementsByBranch} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="branch" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#e2e8f0', 
                      borderRadius: '8px', 
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      fontSize: '0.8rem' 
                    }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />
                  <Bar dataKey="total" name="Total Students" fill="#cbd5e1" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="placed" name="Placed Students" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart B: Applications by Company */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title-group">
              <PieChartIcon size={18} color="#0284c7" />
              <div>
                <h2 className="card-title" style={{ fontSize: '1rem', margin: 0 }}>Applications by Company</h2>
                <div className="card-subtitle">Application volume distributed across recruiters</div>
              </div>
            </div>
          </div>

          {(stats?.applicationsByCompany || []).length === 0 ? (
            <EmptyState title="No Company Applications" message="Application distribution will display when students submit applications." />
          ) : (
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={stats.applicationsByCompany}
                    dataKey="applications"
                    nameKey="company"
                    cx="50%"
                    cy="46%"
                    innerRadius={55}
                    outerRadius={88}
                    paddingAngle={3}
                  >
                    {stats.applicationsByCompany.map((entry, index) => (
                      <Cell key={`company-cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#e2e8f0', 
                      borderRadius: '8px', 
                      fontSize: '0.8rem' 
                    }}
                    formatter={(val, name) => [`${val} applications`, name]}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{ fontSize: '0.75rem', paddingTop: '4px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Row 3B: Chart C - Package Distribution (All 4 Real Ranges: < 5 LPA, 5–10 LPA, 10–20 LPA, > 20 LPA) */}
      <div className="card" style={{ marginTop: '1.5rem', marginBottom: '1.75rem' }}>
        <div className="card-header">
          <div className="card-title-group">
            <Layers size={18} color="#6366f1" />
            <div>
              <h2 className="card-title" style={{ fontSize: '1rem', margin: 0 }}>Package Distribution (CTC Brackets)</h2>
              <div className="card-subtitle">Active opportunities classified into standard compensation tiers</div>
            </div>
          </div>
        </div>

        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={packageDistData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="range" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  borderColor: '#e2e8f0', 
                  borderRadius: '8px', 
                  fontSize: '0.8rem' 
                }}
                formatter={(val) => [`${val} active opportunities`, 'Jobs']}
              />
              <Bar dataKey="count" name="Jobs" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {packageDistData.map((entry, index) => (
                  <Cell key={`pkg-cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 4 Range Summary Pill Row */}
        <div className="chart-summary-bar">
          {packageDistData.map((pkg) => (
            <div key={pkg.range} className="chart-summary-item">
              <span className="chart-summary-dot" style={{ backgroundColor: pkg.color }} />
              <span>{pkg.range}:</span>
              <span className="chart-summary-bold">{pkg.count} {pkg.count === 1 ? 'Job' : 'Jobs'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4 & 5: Recent Applications & Scheduled Interviews */}
      <div className="dashboard-grid-2col">
        {/* Section 4: Recent Applications */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title-group">
              <FileText size={18} color="#2563eb" />
              <div>
                <h2 className="card-title" style={{ fontSize: '1rem', margin: 0 }}>Recent Applications</h2>
                <div className="card-subtitle">Latest candidate submissions from recruitment drives</div>
              </div>
            </div>
          </div>

          {recentApps.length === 0 ? (
            <EmptyState title="No Applications" message="No candidate submissions recorded yet." />
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Role & Recruiter</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApps.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <div className="candidate-cell">
                          <div className="candidate-avatar">
                            {getInitials(app.studentName)}
                          </div>
                          <div className="candidate-info">
                            <span className="candidate-name">{app.studentName || '—'}</span>
                            <span className="candidate-sub">
                              {app.studentBranch} • {app.studentCgpa ? `${app.studentCgpa} CGPA` : '—'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="role-title">{app.jobRole || '—'}</div>
                        <div className="company-sub">{app.companyName || '—'}</div>
                      </td>
                      <td>
                        <span className="text-subtle">{formatDate(app.appliedAt)}</span>
                      </td>
                      <td>
                        <StatusBadge status={app.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 5: Scheduled Interviews */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title-group">
              <Calendar size={18} color="#8b5cf6" />
              <div>
                <h2 className="card-title" style={{ fontSize: '1rem', margin: 0 }}>Scheduled Interviews</h2>
                <div className="card-subtitle">Upcoming rounds, evaluations, and interviewer assignments</div>
              </div>
            </div>
          </div>

          {recentInterviews.length === 0 ? (
            <EmptyState title="No Scheduled Interviews" message="No interview evaluation rounds are scheduled yet." />
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Company & Role</th>
                    <th>Round & Mode</th>
                    <th>Schedule</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInterviews.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="candidate-cell">
                          <div className="candidate-avatar" style={{ background: '#f5f3ff', color: '#8b5cf6', borderColor: '#ddd6fe' }}>
                            {getInitials(item.studentName)}
                          </div>
                          <div className="candidate-info">
                            <span className="candidate-name">{item.studentName || '—'}</span>
                            <span className="candidate-sub">
                              {item.interviewer ? `Panel: ${item.interviewer}` : 'Interviewer TBD'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="role-title">{item.companyName || '—'}</div>
                        <div className="company-sub">{item.jobRole || '—'}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.825rem', color: '#1e293b' }}>
                          {item.round || '—'}
                        </div>
                        <div className="text-subtle" style={{ textTransform: 'capitalize' }}>
                          {item.mode ? item.mode.toLowerCase().replace(/_/g, ' ') : '—'}
                        </div>
                      </td>
                      <td>
                        <span className="text-subtle" style={{ whiteSpace: 'nowrap' }}>
                          {formatDateTime(item.scheduledAt)}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={item.result} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
