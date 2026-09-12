import React, { useEffect, useState } from 'react';
import { UserCheck, CheckCircle2, XCircle, Clock, Briefcase, Award } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { studentsApi, jobsApi, applicationsApi, interviewsApi } from '../services/api';

export default function StudentPortal() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [currentStudent, setCurrentStudent] = useState(null);
  
  const [openJobs, setOpenJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [myInterviews, setMyInterviews] = useState([]);
  const [eligibilityMap, setEligibilityMap] = useState({});

  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    initPortal();
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      loadStudentPortalData(selectedStudentId);
    }
  }, [selectedStudentId]);

  const initPortal = async () => {
    try {
      setLoading(true);
      const res = await studentsApi.getAll();
      if (res.success && res.data.length > 0) {
        setStudents(res.data);
        setSelectedStudentId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to initialize portal:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentPortalData = async (studentId) => {
    try {
      setLoading(true);
      setActionMessage('');

      const [studentRes, jobsRes, appsRes] = await Promise.all([
        studentsApi.getById(studentId),
        jobsApi.getAll({ status: 'OPEN' }),
        applicationsApi.getAll({ studentId }),
      ]);

      if (studentRes.success) setCurrentStudent(studentRes.data);
      if (jobsRes.success) setOpenJobs(jobsRes.data);
      if (appsRes.success) {
        setMyApplications(appsRes.data);
        
        // Fetch interviews for these applications
        const allInts = [];
        for (const app of appsRes.data) {
          const intRes = await interviewsApi.getAll({ applicationId: app.id });
          if (intRes.success) allInts.push(...intRes.data);
        }
        setMyInterviews(allInts);
      }

      // Check eligibility for each open job
      if (jobsRes.success) {
        const elMap = {};
        for (const job of jobsRes.data) {
          const elRes = await jobsApi.checkEligibility(job.id, studentId);
          if (elRes.success) {
            elMap[job.id] = elRes.data;
          }
        }
        setEligibilityMap(elMap);
      }

    } catch (err) {
      console.error('Failed to load student portal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    try {
      await applicationsApi.apply(parseInt(selectedStudentId), jobId);
      setActionMessage('Application submitted successfully!');
      loadStudentPortalData(selectedStudentId);
    } catch (err) {
      setActionMessage(`Application Error: ${err.message}`);
    }
  };

  if (loading && !currentStudent) return <LoadingSpinner message="Loading Student Portal..." />;

  const hasApplied = (jobId) => myApplications.some((a) => a.jobId === jobId);

  return (
    <div>
      {/* Student Selector Banner */}
      <div className="card" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <UserCheck size={28} color="#2563eb" />
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#1e3a8a' }}>Student Candidate Portal</h3>
              <p style={{ fontSize: '0.85rem', color: '#3b82f6' }}>Select a student profile to view personalized eligible jobs & tracking.</p>
            </div>
          </div>

          <div style={{ minWidth: '240px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e3a8a' }}>Switch Student Profile:</label>
            <select
              className="form-control"
              style={{ backgroundColor: '#ffffff', fontWeight: 600 }}
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.branch} | CGPA: {s.cgpa} | {s.placementStatus})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="card" style={{
          backgroundColor: actionMessage.startsWith('Application Error') ? '#fef2f2' : '#ecfdf5',
          borderColor: actionMessage.startsWith('Application Error') ? '#fca5a5' : '#a7f3d0',
          color: actionMessage.startsWith('Application Error') ? '#991b1b' : '#065f46',
          padding: '0.85rem',
          marginBottom: '1.5rem',
          fontSize: '0.9rem'
        }}>
          {actionMessage}
        </div>
      )}

      {currentStudent && (
        <>
          {/* Profile Overview Card */}
          <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card">
              <div>
                <div className="stat-label">Candidate Name</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{currentStudent.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{currentStudent.email}</div>
              </div>
            </div>
            <div className="stat-card">
              <div>
                <div className="stat-label">Academic Profile</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{currentStudent.branch}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>CGPA: {currentStudent.cgpa} | Backlogs: {currentStudent.backlogs}</div>
              </div>
            </div>
            <div className="stat-card">
              <div>
                <div className="stat-label">Placement Status</div>
                <div style={{ marginTop: '0.4rem' }}>
                  <StatusBadge status={currentStudent.placementStatus} />
                </div>
              </div>
              <Award size={32} color="#10b981" />
            </div>
          </div>

          {/* Section Grid: Eligible Jobs vs Applications Timeline */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '1.5rem' }}>
            {/* Open & Eligible Jobs */}
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Briefcase size={18} color="#2563eb" />
                  <h3 className="card-title">Available Job Drives</h3>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {openJobs.map((job) => {
                  const el = eligibilityMap[job.id];
                  const applied = hasApplied(job.id);

                  return (
                    <div key={job.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', backgroundColor: '#ffffff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{job.role}</div>
                          <div style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 500 }}>{job.companyName}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontWeight: 700, color: '#059669', fontSize: '0.95rem' }}>₹{job.packageLpa} LPA</span>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Min CGPA: {job.minCgpa}</div>
                        </div>
                      </div>

                      {/* Eligibility result indicator */}
                      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {el ? (
                          el.eligible ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#059669', fontSize: '0.82rem', fontWeight: 600 }}>
                              <CheckCircle2 size={16} /> Eligible to Apply
                            </div>
                          ) : (
                            <div style={{ color: '#dc2626', fontSize: '0.78rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                                <XCircle size={15} /> Ineligible:
                              </div>
                              <div style={{ fontSize: '0.75rem', marginTop: '0.1rem', color: '#b91c1c' }}>
                                {el.reasons.join(', ')}
                              </div>
                            </div>
                          )
                        ) : null}

                        {applied ? (
                          <button className="btn btn-secondary btn-sm" disabled style={{ opacity: 0.7 }}>
                            Applied
                          </button>
                        ) : (
                          <button
                            className="btn btn-primary btn-sm"
                            disabled={!el?.eligible}
                            onClick={() => handleApply(job.id)}
                          >
                            Apply Now
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Application Pipeline Status & Upcoming Interviews */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Applications Tracker */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">My Application Progress</h3>
                </div>
                {myApplications.length === 0 ? (
                  <p style={{ fontSize: '0.9rem', color: '#64748b' }}>You have not submitted any job applications yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {myApplications.map((app) => (
                      <div key={app.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{app.jobRole}</div>
                          <div style={{ fontSize: '0.8rem', color: '#2563eb' }}>{app.companyName}</div>
                        </div>
                        <StatusBadge status={app.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Interviews Tracker */}
              <div className="card">
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={18} color="#8b5cf6" />
                    <h3 className="card-title">My Interview Schedule</h3>
                  </div>
                </div>
                {myInterviews.length === 0 ? (
                  <p style={{ fontSize: '0.9rem', color: '#64748b' }}>No interviews currently scheduled.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {myInterviews.map((item) => (
                      <div key={item.id} style={{ padding: '0.85rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{item.round} Round ({item.mode})</span>
                          <StatusBadge status={item.result} />
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Company: {item.companyName}</div>
                        <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.2rem' }}>Time: {item.scheduledAt}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
