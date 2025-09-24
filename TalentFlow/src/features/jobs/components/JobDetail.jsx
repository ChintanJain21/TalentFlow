import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Archive, ArchiveRestore, Users, MapPin, Building, Calendar, Tag, X, Save, ClipboardList, Plus, CheckCircle } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { db } from '../../../db/database';

const JobDetail = () => {
  const { isDark } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();

  // State management
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [assessmentExists, setAssessmentExists] = useState(false);
  const [checkingAssessment, setCheckingAssessment] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [candidateCount, setCandidateCount] = useState(0);

  // Reusable CSS classes
  const styles = {
    pageContainer: "min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors",
    card: "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors",
    button: {
      primary: "px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all",
      secondary: "px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:shadow-md transition-all",
    },
    text: {
      title: "text-gray-900 dark:text-gray-50",
      subtitle: "text-gray-600 dark:text-gray-400",
    }
  };

  useEffect(() => {
    if (id) fetchJobData();
  }, [id]);

  // ✅ SIMPLE - Try API first, fallback to IndexedDB
  const fetchWithFallback = async (apiCall, fallbackCall) => {
    try {
      return await apiCall();
    } catch (error) {
      console.warn('API failed, using IndexedDB fallback:', error.message);
      return await fallbackCall();
    }
  };

  // ✅ UPDATED - fetchJobData with MSW + IndexedDB fallback
  const fetchJobData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const jobId = parseInt(id);
      if (isNaN(jobId)) {
        setError('Invalid job ID');
        return;
      }

      console.log('🔍 Fetching job data:', jobId);

      const result = await fetchWithFallback(
        // Try MSW API first
        async () => {
          // Fetch job details
          const jobResponse = await fetch(`/api/jobs/${jobId}`);
          if (jobResponse.status === 404) {
            throw new Error('Job not found');
          }
          if (!jobResponse.ok) throw new Error(`HTTP ${jobResponse.status}`);

          // Fetch candidates for this job
          const candidatesResponse = await fetch(`/api/candidates?jobId=${jobId}&page=1&pageSize=2000`);
          const candidatesData = candidatesResponse.ok ? await candidatesResponse.json() : { data: [] };

          // Fetch assessments for this job
          const assessmentsResponse = await fetch(`/api/assessments/${jobId}`);
          const assessmentData = assessmentsResponse.ok ? await assessmentsResponse.json() : null;

          const jobData = await jobResponse.json();
          const jobCandidates = candidatesData.data || [];

          console.log('✅ Job data loaded via MSW API:', {
            job: jobData.title,
            candidates: jobCandidates.length,
            assessment: !!assessmentData
          });

          return {
            job: jobData,
            candidates: jobCandidates,
            assessmentExists: !!assessmentData
          };
        },
        // Fallback to IndexedDB
        async () => {
          // Fetch job from IndexedDB
          const jobData = await db.jobs.get(jobId);
          if (!jobData) {
            throw new Error('Job not found');
          }

          // Fetch candidates for this job
          const jobCandidates = await db.candidates
            .where('jobId')
            .equals(jobId)
            .toArray();

          // Check if assessment exists for this job
          const jobAssessments = await db.assessments
            .where('jobId')
            .equals(jobId)
            .toArray();

          console.log('✅ Job data loaded from IndexedDB:', {
            job: jobData.title,
            candidates: jobCandidates.length,
            assessments: jobAssessments.length
          });

          return {
            job: jobData,
            candidates: jobCandidates,
            assessmentExists: jobAssessments.length > 0
          };
        }
      );

      setJob(result.job);
      setEditForm(result.job);
      setCandidates(result.candidates.slice(0, 5)); // Show first 5 candidates
      setCandidateCount(result.candidates.length);
      setAssessmentExists(result.assessmentExists);

    } catch (error) {
      console.error('❌ Error fetching job data:', error);
      setError(error.message || 'Failed to load job');
    } finally {
      setLoading(false);
      setCheckingAssessment(false);
    }
  };

  // ✅ UPDATED - handleSaveJob with MSW + IndexedDB fallback
  const handleSaveJob = async () => {
    setSaving(true);
    try {
      const updateData = {
        title: editForm.title,
        department: editForm.department || editForm.company,
        location: editForm.location,
        description: editForm.description,
        updatedAt: new Date().toISOString()
      };

      const updatedJob = await fetchWithFallback(
        // Try MSW API first
        async () => {
          const response = await fetch(`/api/jobs/${job.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
          });

          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          
          console.log('✅ Job updated via MSW API');
          return await response.json();
        },
        // Fallback to IndexedDB
        async () => {
          await db.jobs.update(job.id, updateData);
          const result = await db.jobs.get(job.id);
          console.log('✅ Job updated via IndexedDB');
          return result;
        }
      );

      setJob(updatedJob);
      setShowEditModal(false);
      
    } catch (error) {
      console.error('❌ Failed to update job:', error);
      alert('Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  // ✅ UPDATED - handleArchiveToggle with MSW + IndexedDB fallback
  const handleArchiveToggle = async () => {
    if (!job) return;
    setUpdating(true);
    
    try {
      const newStatus = job.status === 'active' ? 'archived' : 'active';
      
      const updatedJob = await fetchWithFallback(
        // Try MSW API first
        async () => {
          const response = await fetch(`/api/jobs/${job.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              status: newStatus,
              updatedAt: new Date().toISOString()
            }),
          });

          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          
          console.log('✅ Job status updated via MSW API:', newStatus);
          return await response.json();
        },
        // Fallback to IndexedDB
        async () => {
          await db.jobs.update(job.id, {
            status: newStatus,
            updatedAt: new Date().toISOString()
          });

          const result = await db.jobs.get(job.id);
          console.log('✅ Job status updated via IndexedDB:', newStatus);
          return result;
        }
      );

      setJob(updatedJob);
      
    } catch (error) {
      console.error('❌ Failed to update job status:', error);
      alert('Failed to update job status');
    } finally {
      setUpdating(false);
    }
  };

  const getStageColor = (stage) => {
    const colors = {
      hired: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700',
      rejected: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700',
      offer: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-700',
      tech: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700',
      screen: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
      interview: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700',
      default: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700'
    };
    return colors[stage] || colors.default;
  };

  // Loading state
  if (loading) {
    return (
      <div className={`${styles.pageContainer} flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className={styles.text.subtitle}>Loading job details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !job) {
    return (
      <div className={`${styles.pageContainer} flex items-center justify-center`}>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <X className="text-red-500" size={40} />
          </div>
          <h2 className={`text-2xl font-bold ${styles.text.title} mb-3`}>Job Not Found</h2>
          <p className={`${styles.text.subtitle} mb-6`}>{error}</p>
          <Link to="/jobs" className={`${styles.button.primary} inline-flex items-center space-x-2`}>
            <ArrowLeft size={18} />
            <span>Back to Jobs</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/jobs" 
            className={`flex items-center space-x-2 ${styles.text.subtitle} hover:${styles.text.title} transition-colors group`}
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Jobs</span>
          </Link>
          
          <div className="flex items-center space-x-3">
            <button onClick={() => setShowEditModal(true)} className={`${styles.button.secondary} flex items-center space-x-2`}>
              <Edit size={16} />
              <span>Edit Job</span>
            </button>
            
            <button 
              onClick={handleArchiveToggle}
              disabled={updating}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all border disabled:opacity-50 ${
                job.status === 'active'
                  ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50'
                  : 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
              }`}
            >
              {updating ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
              ) : (
                job.status === 'active' ? <Archive size={16} /> : <ArchiveRestore size={16} />
              )}
              <span>{updating ? 'Updating...' : job.status === 'active' ? 'Archive' : 'Restore'}</span>
            </button>

            <Link to={`/candidates?jobId=${job.id}`} className={`${styles.button.secondary} flex items-center space-x-2`}>
              <Users size={18} />
              <span>Candidates ({candidateCount})</span>
            </Link>
            
            {/* Single Assessment Button */}
            {checkingAssessment ? (
              <button disabled className={`${styles.button.primary} opacity-50 cursor-not-allowed flex items-center space-x-2`}>
                <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                <span>Checking...</span>
              </button>
            ) : (
              <Link
                to={assessmentExists ? `/assessments/${job.id}` : `/assessments/${job.id}?mode=create`}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  assessmentExists
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {assessmentExists ? <ClipboardList size={20} /> : <Plus size={20} />}
                <span>{assessmentExists ? 'Manage Assessment' : 'Create Assessment'}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Job Hero */}
        <div className={`${styles.card} p-8 mb-8`}>
          <div className="flex items-center space-x-4 mb-6">
            <h1 className={`text-4xl font-bold ${styles.text.title}`}>{job.title}</h1>
            <span className={`px-4 py-2 text-sm font-medium rounded-xl border ${
              job.status === 'active' 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'
            }`}>
              {job.status}
            </span>
            
            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${
              assessmentExists
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700'
                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700'
            }`}>
              {checkingAssessment ? 'Checking...' : (assessmentExists ? '✓ Assessment Ready' : '⚠ No Assessment')}
            </span>

            <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
              {candidateCount} Applications
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Building, label: 'Department', value: job.department || job.company || 'N/A', color: 'blue' },
              { icon: MapPin, label: 'Location', value: job.location || 'N/A', color: 'green' },
              { icon: Users, label: 'Applicants', value: candidateCount, color: 'purple' },
              { icon: Calendar, label: 'Posted', value: job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent', color: 'orange' }
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-12 h-12 bg-${item.color}-100 dark:bg-${item.color}-900/30 rounded-xl flex items-center justify-center`}>
                  <item.icon size={24} className={`text-${item.color}-600 dark:text-${item.color}-400`} />
                </div>
                <div>
                  <p className={`text-sm font-medium ${styles.text.subtitle}`}>{item.label}</p>
                  <p className={`text-lg font-bold ${styles.text.title}`}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {job.skills && job.skills.length > 0 && (
            <div className="flex items-center space-x-3 mt-6">
              <Tag size={16} className="text-gray-400 dark:text-gray-500" />
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium rounded-xl border border-blue-200 dark:border-blue-700">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Job Description */}
          <div className="lg:col-span-2 space-y-6">
            <div className={`${styles.card} p-6`}>
              <h2 className={`text-xl font-bold ${styles.text.title} mb-4`}>Job Description</h2>
              <div className={`${styles.text.subtitle} leading-relaxed`}>
                {job.description || 'No description available.'}
              </div>
            </div>

            {/* Candidates Section */}
            <div className={`${styles.card} p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${styles.text.title}`}>Recent Candidates ({candidateCount})</h2>
                {candidateCount > 0 && (
                  <Link to={`/candidates?jobId=${job.id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium">
                    View All →
                  </Link>
                )}
              </div>

              {candidates.length > 0 ? (
                <div className="space-y-4">
                  {candidates.map((candidate) => (
                    <div key={candidate.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                            {candidate.name ? candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'NA'}
                          </span>
                        </div>
                        <div>
                          <Link to={`/candidates/${candidate.id}`} className={`text-lg font-bold ${styles.text.title} hover:text-blue-600 transition-colors`}>
                            {candidate.name || 'Unknown'}
                          </Link>
                          <p className={styles.text.subtitle}>{candidate.email || 'No email'}</p>
                          <p className="text-xs text-gray-500">Applied on {new Date(candidate.appliedDate || candidate.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStageColor(candidate.stage || 'applied')}`}>
                        {candidate.stage || 'applied'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <Users className="text-gray-400 dark:text-gray-500" size={32} />
                  </div>
                  <h3 className={`text-lg font-medium ${styles.text.title} mb-2`}>No Candidates Yet</h3>
                  <p className={styles.text.subtitle}>No one has applied to this position yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className={`${styles.card} p-6`}>
              <h3 className={`text-lg font-bold ${styles.text.title} mb-4`}>Job Statistics</h3>
              <div className="space-y-4">
                {[
                  { label: 'Job ID', value: `#${job.id}` },
                  { label: 'Status', value: job.status },
                  { label: 'Assessment', value: checkingAssessment ? 'Checking...' : (assessmentExists ? 'Ready' : 'Not Set') },
                  { label: 'Applications', value: candidateCount },
                  { label: 'Type', value: job.type || 'Full-time' }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className={styles.text.subtitle}>{item.label}</span>
                    <span className={`font-bold ${styles.text.title}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-3">
                <CheckCircle className="text-blue-600 dark:text-blue-400" size={20} />
                <h4 className={`font-bold ${styles.text.title}`}>Job-Specific View</h4>
              </div>
              <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
                This page shows only candidates who applied specifically to <strong>{job.title}</strong>. 
                Use the assessment tools to evaluate applicants effectively.
              </p>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className={`text-xl font-bold ${styles.text.title}`}>Edit Job</h2>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
                <div>
                  <label className={`block text-sm font-bold ${styles.text.title} mb-2`}>Job Title</label>
                  <input
                    type="text"
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-bold ${styles.text.title} mb-2`}>Department</label>
                    <input
                      type="text"
                      value={editForm.department || editForm.company || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-bold ${styles.text.title} mb-2`}>Location</label>
                    <input
                      type="text"
                      value={editForm.location || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-bold ${styles.text.title} mb-2`}>Description</label>
                  <textarea
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    rows="4"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={saving}
                  className={`${styles.button.secondary} disabled:opacity-50`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveJob}
                  disabled={saving}
                  className={`${styles.button.primary} disabled:opacity-50 flex items-center space-x-2`}
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                  ) : (
                    <Save size={16} />
                  )}
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetail;
