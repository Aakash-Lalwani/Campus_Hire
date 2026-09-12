import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Building2, 
  Briefcase, 
  CheckCircle, 
  TrendingUp, 
  FileText, 
  Calendar 
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
  Legend 
} from 'recharts';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { dashboardApi, applicationsApi, interviewsApi } from '../services/api';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [recentInterviews, setRecentInterviews] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, appsRes, intRes] = await Promise.all([
        dashboardApi.getStats(),
        applicationsApi.getAll({ size: 5 }),
        interviewsApi.getAll({ size: 5 }),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (appsRes.success) setRecentApps(appsRes.data.slice(0, 5));
      if (intRes.success) setRecentInterviews(intRes.data.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading Campus Placement Statistics..." />;

  return (
    <div>
      {error && (
        <div className="card" style={{ backgroundColor: '#fef2f2', borderColor: '#fca5a5', color: '#991b1b', padding: '1rem', marginBottom: '1.5rem' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Top Stats Cards */}
      <div className="stat-grid">
        <StatCard label="Total Registered Students" value={stats?.totalStudents || 0} icon={Users} color="#2563eb" bg="#eff6ff" />
        <StatCard label="Partner Companies" value={stats?.totalCompanies || 0} icon={Building2} color="#06b6d4" bg="#ecfeff" />
        <StatCard label="Active Open Jobs" value={stats?.openJobs || 0} icon={Briefcase} color="#f59e0b" bg="#fffbe6" />
        <StatCard label="Students Placed" value={stats?.studentsPlaced || 0} icon={CheckCircle} color="#10b981" bg="#ecfdf5" />
        <StatCard label="Placement Rate" value={`${stats?.placementPercentage || 0}%`} icon={TrendingUp} color="#8b5cf6" bg="#f3e8ff" />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Placements by Branch Bar Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Placements by Branch</h3>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={stats?.placementsByBranch || []}>
                <XAxis dataKey="branch" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                <Legend />
                <Bar dataKey="total" name="Total Students" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="placed" name="Placed" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Applications by Company Pie Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Applications by Company</h3>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={stats?.applicationsByCompany || []}
                  dataKey="applications"
                  nameKey="company"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  label={({ company, percent }) => `${company} (${(percent * 100).toFixed(0)}%)`}
                >
                  {(stats?.applicationsByCompany || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Applications */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="#2563eb" />
              <h3 className="card-title">Recent Student Applications</h3>
            </div>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Company & Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentApps.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{app.studentName}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{app.studentBranch} ({app.studentCgpa} CGPA)</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{app.jobRole}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{app.companyName}</div>
                    </td>
                    <td><StatusBadge status={app.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming & Recent Interviews */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="#8b5cf6" />
              <h3 className="card-title">Scheduled Interview Rounds</h3>
            </div>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Round & Company</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {recentInterviews.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.studentName}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Interviewer: {item.interviewer}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{item.round} ({item.mode})</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.companyName}</div>
                    </td>
                    <td><StatusBadge status={item.result} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
