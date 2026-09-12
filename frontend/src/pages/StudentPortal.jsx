import React, { useEffect, useState } from 'react';
import { UserCheck, CheckCircle2, XCircle, Clock, Briefcase, Award, Calendar, AlertCircle, ArrowRight, Video, Building2 } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { studentsApi, jobsApi, applicationsApi, interviewsApi } from '../services/api';

const MAIN_STAGES = ['APPLIED', 'SHORTLISTED', 'APTITUDE', 'TECHNICAL', 'HR', 'SELECTED'];

export default function StudentPortal() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [currentStudent, setCurrentStudent] = useState(null);
  
  const [openJobs, setOpenJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [myInterviews, setMyInterviews] = useState([]);
  const [eligibilityMap, setEligibilityMap] = useState({});

  const [loading, setLoading] = useState(true);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

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
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setStudents(res.data);
        setSelectedStudentId(String(res.data[0].id));
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
      setActionMessage(null);

      const [studentRes, jobsRes, appsRes] = await Promise.all([
        studentsApi.getById(studentId),
        jobsApi.getAll({ status: 'OPEN' }),
        applicationsApi.getAll({ studentId: parseInt(studentId, 10) }),
      ]);

      if (studentRes.success) setCurrentStudent(studentRes.data);
      if (jobsRes.success && Array.isArray(jobsRes.data)) setOpenJobs(jobsRes.data);
      
      if (appsRes.success && Array.isArray(appsRes.data)) {
        setMyApplications(appsRes.data);
        
        // Fetch interviews for candidate applications
        const allInts = [];
        for (const app of appsRes.data) {
          try {
            const intRes = await interviewsApi.getAll({ applicationId: app.id });
            if (intRes.success && Array.isArray(intRes.data)) {
              allInts.push(...intRes.data);
            }
          } catch {
            // Ignore individual fetch failure
          }
        }
        setMyInterviews(allInts);
      }

      // Check real eligibility for each open job against the selected student
      if (jobsRes.success && Array.isArray(jobsRes.data)) {
        const elMap = {};
        for (const job of jobsRes.data) {
          try {
            const elRes = await jobsApi.checkEligibility(job.id, studentId);
            if (elRes.success) {
              elMap[job.id] = elRes.data;
            }
          } catch {
            // Ignore error per job
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
      setApplyingJobId(jobId);
      setActionMessage(null);
      await applicationsApi.apply(parseInt(selectedStudentId, 10), jobId);
      setActionMessage({ type: 'success', text: 'Application submitted successfully to corporate recruiter!' });
      loadStudentPortalData(selectedStudentId);
    } catch (err) {
      setActionMessage({ type: 'error', text: `Application Failed: ${err.message}` });
    } finally {
      setApplyingJobId(null);
    }
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

  const getCompanyInitials = (name) => {
    if (!name) return 'CO';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const hasApplied = (jobId) => myApplications.some((a) => a.jobId === jobId);

  const renderPipelineStepper = (currentStatus) => {
    const isRejected = currentStatus === 'REJECTED';

    return (
      <div className="pipeline-stepper" style={{ marginTop: '0.5rem' }}>
        {MAIN_STAGES.map((st, idx) => {
          const isCurrent = currentStatus === st;
          const currentIndex = MAIN_STAGES.indexOf(currentStatus);
          const isPast = currentIndex > -1 && idx < currentIndex && !isRejected;

          return (
            <React.Fragment key={st}>
              <span className={`pipeline-step ${isCurrent ? 'active' : isPast ? 'completed' : ''}`}>
                {st}
              </span>
              {idx < MAIN_STAGES.length - 1 && (
                <span className="pipeline-arrow">
                  <ArrowRight size={10} />
                </span>
              )}
            </React.Fragment>
          );
        })}

        {isRejected && (
          <span className="pipeline-step rejected" style={{ marginLeft: '0.4rem' }}>
            TERMINAL: REJECTED
          </span>
        )}
      </div>
    );
  };

  if (loading && !currentStudent) {
    return <LoadingSpinner message="Loading candidate placement portal..." />;
  }

  return (
    <div>
      {/* Header & Candidate Selector Banner */}
      <div className="card" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--primary-border)', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <UserCheck size={24} />
            </div>
            <div>
              <h1 className="page-header-title" style={{ fontSize: '1.35rem', margin: 0 }}>Candidate Placement Portal</h1>
              <p className="page-header-subtitle">Personalized drive eligibility evaluation, instant applications, and interview status</p>
            </div>
          </div>

          <div style={{ minWidth: '260px' }}>
            <label htmlFor="portal-student-switcher" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
              Switch Candidate Profile:
            </label>
            <select
              id="portal-student-switcher"
              className="form-control"
              style={{ fontWeight: 600, fontSize: '0.85rem' }}
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              aria-label="Select student profile"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.branch} • {s.cgpa} CGPA • {s.placementStatus})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionMessage && (
        <div className="card" style={{
          backgroundColor: actionMessage.type === 'error' ? '#fef2f2' : '#ecfdf5',
          borderColor: actionMessage.type === 'error' ? '#fca5a5' : '#a7f3d0',
          color: actionMessage.type === 'error' ? '#991b1b' : '#065f46',
          padding: '0.85rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          fontSize: '0.875rem'
        }}>
          {actionMessage.type === 'error' ? <AlertCircle size={18} color="#b91c1c" /> : <CheckCircle2 size={18} color="#059669" />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {currentStudent && (
        <>
          {/* Profile Overview Row */}
          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.75rem' }}>
            <div className="stat-card">
              <div className="stat-card-accent-bar" style={{ backgroundColor: 'var(--primary)' }} />
              <div className="stat-card-body">
                <div className="stat-label">Candidate Name</div>
                <div className="stat-value" style={{ fontSize: '1.25rem' }}>{currentStudent.name}</div>
                <div className="candidate-sub" style={{ marginTop: '0.2rem' }}>{currentStudent.email}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-accent-bar" style={{ backgroundColor: '#0284c7' }} />
              <div className="stat-card-body">
                <div className="stat-label">Department & Batch</div>
                <div className="stat-value" style={{ fontSize: '1.25rem' }}>{currentStudent.branch}</div>
                <div className="candidate-sub" style={{ marginTop: '0.2rem' }}>Class of {currentStudent.graduationYear || 2026}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-accent-bar" style={{ backgroundColor: '#059669' }} />
              <div className="stat-card-body">
                <div className="stat-label">Academic Scores</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                  <span className={`cgpa-pill ${currentStudent.cgpa >= 8.5 ? 'cgpa-pill-high' : ''}`}>
                    {currentStudent.cgpa ? currentStudent.cgpa.toFixed(2) : '0.00'} CGPA
                  </span>
                  <span className={`backlog-badge ${currentStudent.backlogs > 0 ? 'backlog-active' : 'backlog-zero'}`}>
                    {currentStudent.backlogs === 0 ? '0 Backlogs' : `${currentStudent.backlogs} Backlogs`}
                  </span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-accent-bar" style={{ backgroundColor: '#8b5cf6' }} />
              <div className="stat-card-body">
                <div className="stat-label">Placement Standing</div>
                <div style={{ marginTop: '0.35rem' }}>
                  <StatusBadge status={currentStudent.placementStatus} />
                </div>
              </div>
              <div className="stat-icon" style={{ backgroundColor: '#f5f3ff', color: '#8b5cf6' }}>
                <Award size={22} />
              </div>
            </div>
          </div>

          {/* 2-Column Portal Layout: Available Drives vs My Applications Tracker */}
          <div className="dashboard-grid-2col">
            {/* Left Column: Available Job Drives */}
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-header">
                <div className="card-title-group">
                  <Briefcase size={18} color="var(--primary)" />
                  <div>
                    <h2 className="card-title" style={{ fontSize: '1rem', margin: 0 }}>Available Placement Drives</h2>
                    <div className="card-subtitle">Active opportunities with live eligibility matching</div>
                  </div>
                </div>
                <span className="badge badge-open">
                  {openJobs.length} Open
                </span>
              </div>

              {openJobs.length === 0 ? (
                <EmptyState title="No Active Drives" message="There are no open placement opportunities at this time." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {openJobs.map((job) => {
                    const el = eligibilityMap[job.id];
                    const applied = hasApplied(job.id);
                    const isSubmitting = applyingJobId === job.id;

                    return (
                      <div key={job.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.15rem', backgroundColor: '#ffffff', transition: 'var(--transition)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                            <div className="company-avatar">
                              {getCompanyInitials(job.companyName)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                                {job.role}
                              </div>
                              <div style={{ fontSize: '0.825rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.15rem' }}>
                                {job.companyName}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                                Allowed: {job.allowedBranches}
                              </div>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontWeight: 800, color: '#059669', fontSize: '1rem' }}>
                              ₹{job.packageLpa ? job.packageLpa.toFixed(2) : '0.00'} LPA
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Min CGPA: {job.minCgpa ? job.minCgpa.toFixed(2) : '—'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end', marginTop: '0.2rem' }}>
                              <Calendar size={11} />
                              <span>{formatDate(job.applicationDeadline)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Live Eligibility Check Feedback & Action */}
                        <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                          {el ? (
                            el.eligible ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--success)', fontSize: '0.82rem', fontWeight: 600 }}>
                                <CheckCircle2 size={16} />
                                <span>You are Eligible to Apply</span>
                              </div>
                            ) : (
                              <div style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                                  <XCircle size={15} /> Ineligible:
                                </div>
                                <div style={{ fontSize: '0.75rem', marginTop: '0.15rem', color: '#b91c1c' }}>
                                  {el.reasons.join(', ')}
                                </div>
                              </div>
                            )
                          ) : (
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Checking criteria...</div>
                          )}

                          <div>
                            {applied ? (
                              <button type="button" className="btn btn-secondary btn-sm" disabled style={{ opacity: 0.8, cursor: 'default' }}>
                                <CheckCircle2 size={13} color="var(--success)" />
                                <span>Applied</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                disabled={!el?.eligible || isSubmitting}
                                onClick={() => handleApply(job.id)}
                              >
                                {isSubmitting ? 'Submitting...' : 'Apply Now'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Applications Tracker & Interview Schedules */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Applications Tracker Card */}
              <div className="card" style={{ marginBottom: 0 }}>
                <div className="card-header">
                  <div className="card-title-group">
                    <Award size={18} color="var(--primary)" />
                    <div>
                      <h2 className="card-title" style={{ fontSize: '1rem', margin: 0 }}>My Application Progress</h2>
                      <div className="card-subtitle">Real-time status in the corporate recruitment pipeline</div>
                    </div>
                  </div>
                  <span className="badge badge-open">
                    {myApplications.length} {myApplications.length === 1 ? 'Drive' : 'Drives'}
                  </span>
                </div>

                {myApplications.length === 0 ? (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '1rem 0' }}>
                    You have not submitted applications to any placement drives yet.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {myApplications.map((app) => (
                      <div key={app.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-primary)' }}>
                              {app.jobRole}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                              {app.companyName}
                            </div>
                          </div>
                          <StatusBadge status={app.status} />
                        </div>

                        {renderPipelineStepper(app.status)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Interview Schedule Card */}
              <div className="card" style={{ marginBottom: 0 }}>
                <div className="card-header">
                  <div className="card-title-group">
                    <Clock size={18} color="#8b5cf6" />
                    <div>
                      <h2 className="card-title" style={{ fontSize: '1rem', margin: 0 }}>My Interview Schedule</h2>
                      <div className="card-subtitle">Assigned rounds, modality, and panel evaluations</div>
                    </div>
                  </div>
                  <span className="badge badge-open">
                    {myInterviews.length} {myInterviews.length === 1 ? 'Session' : 'Sessions'}
                  </span>
                </div>

                {myInterviews.length === 0 ? (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '1rem 0' }}>
                    No interview evaluation rounds are currently scheduled.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {myInterviews.map((item) => (
                      <div key={item.id} style={{ padding: '0.9rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                              {item.round} Round
                            </span>
                            <span className="location-pill">
                              {item.mode === 'ONLINE' ? <Video size={12} color="#0284c7" /> : <Building2 size={12} color="#64748b" />}
                              <span style={{ textTransform: 'capitalize' }}>{item.mode ? item.mode.toLowerCase() : 'Online'}</span>
                            </span>
                          </div>
                          <StatusBadge status={item.result} />
                        </div>

                        <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                          {item.companyName} — {item.jobRole}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          <Clock size={12} />
                          <span>{formatDateTime(item.scheduledAt)}</span>
                        </div>

                        {item.interviewer && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            Panel: {item.interviewer}
                          </div>
                        )}
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
