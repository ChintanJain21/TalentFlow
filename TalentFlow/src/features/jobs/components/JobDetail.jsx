import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Archive, ArchiveRestore, MapPin, Building, DollarSign, Calendar, Tag, X, Save } from 'lucide-react';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // ADD THIS
  const [editForm, setEditForm] = useState({}); // ADD THIS
  const [saving, setSaving] = useState(false); // ADD THIS
const [error, setError] = useState(null);

  


  useEffect(() => {
  if (id) {
    setLoading(true);
    
    const fetchJob = async (retryCount = 0) => {
      const maxRetries = 3;
      
      try {
        const response = await fetch('/api/jobs?pageSize=100');
        
        // 🚀 RETRY LOGIC FOR 500 ERRORS
        if (response.status === 500 && retryCount < maxRetries) {
          console.log(`🔄 Server error fetching jobs, retrying... (${retryCount + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
          return fetchJob(retryCount + 1);
        }
        
        // 🚀 CHECK RESPONSE STATUS
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch jobs`);
        }
        
        const data = await response.json();
        const foundJob = data.data.find(j => j.id === parseInt(id));
        
        if (foundJob) {
          setJob(foundJob);
          setEditForm(foundJob); // Initialize edit form
          console.log(`✅ Found job: ${foundJob.title}`);
        } else {
          console.warn(`❌ Job with ID ${id} not found in ${data.data.length} jobs`);
          navigate('/jobs', { replace: true });
        }
        
      } catch (error) {
        console.error('Error fetching job:', error);
        
        // 🚀 RETRY ON NETWORK ERRORS
        if (retryCount < maxRetries) {
          console.log(`🔄 Network error, retrying... (${retryCount + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
          return fetchJob(retryCount + 1);
        }
        
        // Only navigate after all retries failed
        console.error(`❌ All ${maxRetries} retries failed, navigating back to jobs`);
        navigate('/jobs', { replace: true });
        
      } finally {
        setLoading(false);
      }
    };

    fetchJob(); // Call the function
  }
}, [id, navigate]);


  const handleEditJob = () => {
    setEditForm({ ...job }); // Reset form to current job data
    setShowEditModal(true); // OPEN MODAL
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditForm({ ...job }); // Reset form
  };

  const handleSaveJob = async () => {
    setSaving(true);
    
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          company: editForm.company,
          location: editForm.location,
          description: editForm.description,
          salary: editForm.salary,
          tags: editForm.tags
        })
      });

      if (response.ok) {
        const updatedJob = await response.json();
        setJob(updatedJob);
        setShowEditModal(false);
        alert('Job updated successfully!');
        console.log('✅ Job updated:', updatedJob.title);
      } else {
        throw new Error('Failed to update job');
      }
    } catch (error) {
      console.error('❌ Error updating job:', error);
      alert('Failed to update job. Please try again.');
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
        
        const action = newStatus === 'archived' ? 'archived' : 'restored';
        alert(`Job successfully ${action}!`);
        console.log(`✅ Job ${action}:`, updatedJob.title);
      } else {
        throw new Error('Failed to update job status');
      }
    } catch (error) {
      console.error('❌ Error updating job:', error);
      alert('Failed to update job status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Job not found</h2>
        <p className="text-gray-600 mt-2">The job you're looking for doesn't exist.</p>
        <Link to="/jobs" className="text-primary hover:underline mt-4 inline-block">
          Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link 
          to="/jobs" 
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Jobs</span>
        </Link>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleEditJob}
            disabled={updating}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Edit size={16} />
            <span>Edit Job</span>
          </button>
          
          <button 
            onClick={handleArchiveToggle}
            disabled={updating}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
              job.status === 'active'
                ? 'border border-orange-300 text-orange-700 hover:bg-orange-50'
                : 'border border-green-300 text-green-700 hover:bg-green-50'
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
        </div>
      </div>

      {/* Job Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              <span className={`px-3 py-1 text-sm rounded-full ${
                job.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {job.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center space-x-2 text-gray-600">
                <Building size={18} />
                <span>{job.company}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin size={18} />
                <span>{job.location}</span>
              </div>
              
              {job.salary && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <DollarSign size={18} />
                  <span>{job.salary}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar size={18} />
                <span>{new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Tag size={16} className="text-gray-400" />
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
            <div className="prose max-w-none text-gray-600">
              <p>{job.description}</p>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              {job.requirements.map((requirement, index) => (
                <li key={index}>{requirement}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Job ID</span>
                <span className="font-medium">#{job.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`font-medium ${
                  job.status === 'active' ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {job.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created</span>
                <span className="font-medium">{new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order</span>
                <span className="font-medium">#{job.order}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <Link
                to={`/assessments/${job.id}`}
                className="block w-full px-4 py-2 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Manage Assessment
              </Link>
              
              <Link
                to={`/candidates?jobId=${job.id}`}
                className="block w-full px-4 py-2 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View Candidates
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit Job</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                <input
                  type="text"
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <input
                  type="text"
                  value={editForm.company || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={editForm.location || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salary</label>
                <input
                  type="text"
                  value={editForm.salary || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, salary: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={handleCloseModal}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveJob}
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
  );
};

export default JobDetail;
