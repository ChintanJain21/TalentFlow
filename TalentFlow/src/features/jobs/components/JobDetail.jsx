import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Archive, ArchiveRestore, ClipboardList, Users, MapPin, Building, DollarSign, Calendar, Tag, X, Save, Plus, Eye, CheckCircle, Clock } from 'lucide-react';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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

  useEffect(() => {
    if (id) {
      fetchJobData();
    }
  }, [id]);

  const fetchJobData = async () => {
    setLoading(true);
    try {
      // Fetch job details
      const jobResponse = await fetch(`/api/jobs/${id}`);
      if (!jobResponse.ok) {
        setError(jobResponse.status === 404 ? 'Job not found' : 'Failed to load job');
        return;
      }
      
      const jobData = await jobResponse.json();
      setJob(jobData);
      setEditForm(jobData);

      // Check assessment
      try {
        const assessmentResponse = await fetch(`/api/assessments/${id}`);
        const hasAssessment = assessmentResponse.ok;
        setAssessmentExists(hasAssessment);
      } catch {
        setAssessmentExists(false);
      }

      // Fetch job candidates
      try {
        const candidatesResponse = await fetch(`/api/candidates?jobId=${id}&pageSize=100`);
        if (candidatesResponse.ok) {
          const candidatesData = await candidatesResponse.json();
          const jobCandidates = candidatesData.data || [];
          setCandidates(jobCandidates.slice(0, 5));
          setCandidateCount(jobCandidates.length);
        }
      } catch {
        setCandidates([]);
        setCandidateCount(0);
      }
    } catch (error) {
      setError('Failed to load job');
    } finally {
      setLoading(false);
      setCheckingAssessment(false);
    }
  };

  const handleSaveJob = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          department: editForm.department || editForm.company,
          location: editForm.location,
          description: editForm.description
        })
      });

      if (response.ok) {
        const updatedJob = await response.json();
        setJob(updatedJob);
        setShowEditModal(false);
      }
    } catch (error) {
      alert('Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveToggle = async () => {
    if (!job) return;
    setUpdating(true);
    try {
      const newStatus = job.status === 'active' ? 'archived' : 'active';
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const updatedJob = await response.json();
        setJob(updatedJob);
      }
    } catch (error) {
      alert('Failed to update job status');
    } finally {
      setUpdating(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading job details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <X className="text-red-500" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Job Not Found</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <Link 
            to="/jobs" 
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
          >
            <ArrowLeft size={18} />
            <span>Back to Jobs</span>
          </Link>
        </div>
      </div>
    );
  }

  const AssessmentButton = ({ className = "" }) => {
    if (checkingAssessment) {
      return (
        <button 
          disabled 
          className={`flex items-center space-x-2 px-6 py-3 bg-slate-300 text-slate-500 rounded-xl font-semibold cursor-not-allowed ${className}`}
        >
          <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
          <span>Checking...</span>
        </button>
      );
    }

    return (
      <Link
        to={assessmentExists ? `/assessments/${job.id}` : `/assessments/${job.id}?mode=create`}
        className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:-translate-y-0.5 ${
          assessmentExists
            ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-200 hover:shadow-xl'
            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200 hover:shadow-xl'
        } ${className}`}
      >
        {assessmentExists ? <ClipboardList size={20} /> : <Plus size={20} />}
        <span>{assessmentExists ? 'Manage Assessment' : 'Create Assessment'}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/jobs" 
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Jobs</span>
          </Link>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowEditModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-slate-300 transition-all font-medium text-slate-700"
            >
              <Edit size={16} />
              <span>Edit Job</span>
            </button>
            
            <button 
              onClick={handleArchiveToggle}
              disabled={updating}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all disabled:opacity-50 ${
                job.status === 'active'
                  ? 'bg-orange-100 border border-orange-200 text-orange-700 hover:bg-orange-200'
                  : 'bg-green-100 border border-green-200 text-green-700 hover:bg-green-200'
              }`}
            >
              {updating ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
              ) : (
                job.status === 'active' ? <Archive size={16} /> : <ArchiveRestore size={16} />
              )}
              <span>
                {updating 
                  ? 'Updating...' 
                  : job.status === 'active' 
                  ? 'Archive' 
                  : 'Restore'
                }
              </span>
            </button>

            <Link
              to={`/candidates?jobId=${job.id}`}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-slate-300 transition-all font-medium text-slate-700"
            >
              <Users size={18} />
              <span>View All Candidates ({candidateCount})</span>
            </Link>
            
            <AssessmentButton />
          </div>
        </div>

        {/* Job Hero Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 mb-8">
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                {job.title}
              </h1>
              <span className={`px-4 py-2 text-sm font-semibold rounded-xl ${
                job.status === 'active' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {job.status}
              </span>
              
              {!checkingAssessment && (
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  assessmentExists
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                }`}>
                  {assessmentExists ? '✓ Assessment Ready' : '⚠ No Assessment'}
                </span>
              )}

              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                {candidateCount} Candidates Applied
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center space-x-3 text-slate-600">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                  <Building size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Company</p>
                  <p className="text-lg font-bold text-slate-900">{job.department || job.company}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 text-slate-600">
                <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                  <MapPin size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-lg font-bold text-slate-900">{job.location}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 text-slate-600">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                  <Users size={24} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Applicants</p>
                  <p className="text-lg font-bold text-slate-900">{candidateCount}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 text-slate-600">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                  <Calendar size={24} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Posted</p>
                  <p className="text-lg font-bold text-slate-900">
                    {job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    }) : 'Recent'}
                  </p>
                </div>
              </div>
            </div>

            {job.skills && job.skills.length > 0 && (
              <div className="flex items-center space-x-3 mt-6">
                <Tag size={16} className="text-slate-400" />
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-xl border border-blue-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Description */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Job Description</h2>
              <div className="prose max-w-none text-slate-700 leading-relaxed">
                {job.description || 'No description available.'}
              </div>
            </div>

            {/* Candidates Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Recent Candidates ({candidateCount})</h2>
                {candidateCount > 0 && (
                  <Link
                    to={`/candidates?jobId=${job.id}`}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All →
                  </Link>
                )}
              </div>

              {candidates.length > 0 ? (
                <div className="space-y-4">
                  {candidates.map((candidate) => (
                    <div key={candidate.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-lg">
                            {candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <Link
                            to={`/candidates/${candidate.id}`}
                            className="text-lg font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                          >
                            {candidate.name}
                          </Link>
                          <p className="text-sm text-slate-600">{candidate.email}</p>
                          <p className="text-xs text-slate-500">
                            Applied on {new Date(candidate.appliedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                          candidate.stage === 'hired' ? 'bg-green-100 text-green-800 border border-green-200' :
                          candidate.stage === 'rejected' ? 'bg-red-100 text-red-800 border border-red-200' :
                          candidate.stage === 'offer' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                          candidate.stage === 'tech' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                          candidate.stage === 'screen' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                          'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {candidate.stage}
                        </span>
                      </div>
                    </div>
                  ))}

                  {candidateCount > 5 && (
                    <div className="text-center pt-4 border-t border-slate-200">
                      <Link
                        to={`/candidates?jobId=${job.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View {candidateCount - 5} more candidates →
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <Users className="text-slate-400" size={32} />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No Candidates Yet</h3>
                  <p className="text-slate-600">No one has applied to this position yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <AssessmentButton className="w-full justify-center" />
                
                <Link
                  to={`/candidates?jobId=${job.id}`}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                >
                  <Users size={18} />
                  <span>All Candidates ({candidateCount})</span>
                </Link>

                {assessmentExists && (
                  <Link
                    to={`/assessments/${job.id}`}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                  >
                    <Eye size={18} />
                    <span>Preview Assessment</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Job Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Job Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Job ID</span>
                  <span className="font-bold text-slate-900">#{job.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Status</span>
                  <span className={`font-bold ${
                    job.status === 'active' ? 'text-green-600' : 'text-slate-600'
                  }`}>
                    {job.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Assessment</span>
                  <span className={`font-bold ${
                    assessmentExists ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {checkingAssessment ? 'Checking...' : (assessmentExists ? 'Ready' : 'Not Set')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Applications</span>
                  <span className="font-bold text-blue-600">{candidateCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Type</span>
                  <span className="font-bold text-slate-900">{job.type || 'Full-time'}</span>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-3">
                <CheckCircle className="text-blue-600" size={20} />
                <h4 className="font-bold text-slate-900">Job-Specific View</h4>
              </div>
              <p className="text-blue-700 text-sm leading-relaxed">
                This page shows only candidates who applied specifically to <strong>{job.title}</strong>. 
                Use the assessment tools to evaluate applicants effectively.
              </p>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">Edit Job</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Job Title</label>
                  <input
                    type="text"
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
                    <input
                      type="text"
                      value={editForm.department || editForm.company || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={editForm.location || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    rows="4"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200 bg-slate-50">
                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={saving}
                  className="px-6 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 disabled:opacity-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveJob}
                  disabled={saving}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
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
