import { useState, useEffect } from 'react';
import { Plus, Search, Filter, ChevronLeft, ChevronRight, Edit, Archive, ArchiveRestore, ExternalLink, GripVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import Modal from '../../../components/ui/Modal';
import JobForm from './JobForm';
import SortableJobCard from './SortableJobCard';
import RegularJobCard from './JobCard';

const JobsBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragDropMode, setDragDropMode] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [error, setError] = useState(null);

  const [formLoading, setFormLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10, // Normal pagination size
    total: 0,
    totalPages: 0
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchJobs = async (
  page = pagination.page, 
  search = filters.search, 
  status = filters.status,
  retryCount = 0
) => {
  const maxRetries = 3;
  
  setLoading(true);
  try {
    const currentPageSize = dragDropMode ? 25 : pagination.pageSize; // Dynamic page size
    
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: currentPageSize.toString(),
      ...(search && { search }),
      ...(status && { status }),
      sort: 'order' // Always sort by order
    });

    const response = await fetch(`/api/jobs?${params}`);
    
    // 🚀 RETRY LOGIC FOR 500 ERRORS
    if (response.status === 500 && retryCount < maxRetries) {
      console.log(`🔄 Server error (500), retrying... (${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
      return fetchJobs(page, search, status, retryCount + 1);
    }
    
    // 🚀 HANDLE OTHER HTTP ERRORS
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch jobs`);
    }
    
    const data = await response.json();
    
    // Sort by order to maintain drag & drop sequence
    const sortedJobs = (data.data || []).sort((a, b) => a.order - b.order);
    setJobs(sortedJobs);
    setPagination(prev => ({
      ...prev,
      page: data.page,
      total: data.total,
      totalPages: data.totalPages,
      pageSize: currentPageSize
    }));
    
    // Clear any previous errors on success
    setError(null);
    
    console.log(`✅ Fetched ${sortedJobs.length} jobs (Page ${data.page} of ${data.totalPages})`);
    
  } catch (error) {
    console.error('Error fetching jobs:', error);
    
    // 🚀 RETRY ON NETWORK ERRORS
    if (retryCount < maxRetries) {
      console.log(`🔄 Network error, retrying... (${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1))); // Longer delay for network errors
      return fetchJobs(page, search, status, retryCount + 1);
    }
    
    // 🚀 SET ERROR STATE AFTER ALL RETRIES FAILED
    const errorMessage = retryCount >= maxRetries 
      ? `Failed to load jobs after ${maxRetries} attempts. Please try again.`
      : 'Failed to load jobs. Please try again.';
    
    setError(errorMessage);
    
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchJobs();
  }, []);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchJobs(1, filters.search, filters.status);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters.search, filters.status]);

  // Update when drag drop mode changes
  useEffect(() => {
    fetchJobs(1, filters.search, filters.status);
  }, [dragDropMode]);

  // Drag & Drop Handlers
  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = async (event) => {
    setIsDragging(false);
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = jobs.findIndex(job => job.id === active.id);
    const newIndex = jobs.findIndex(job => job.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Optimistic update
    const newJobs = arrayMove(jobs, oldIndex, newIndex);
    setJobs(newJobs);

    try {
      // API call to persist the reorder
      const response = await fetch(`/api/jobs/${active.id}/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromIndex: oldIndex,
          toIndex: newIndex
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reorder jobs');
      }

      console.log('✅ Job reordered successfully');
    } catch (error) {
      console.error('❌ Reorder failed, rolling back:', error);
      
      // Rollback on failure
      setJobs(jobs);
      
      // Show user feedback
      alert('Failed to reorder jobs. Changes have been reverted.');
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchJobs(newPage, filters.search, filters.status);
  };

  const handleDragDropToggle = () => {
    const newDragDropMode = !dragDropMode;
    setDragDropMode(newDragDropMode);
    
    // Reset to page 1 when switching modes
    setPagination(prev => ({ 
      ...prev, 
      pageSize: newDragDropMode ? 25 : 10, 
      page: 1 
    }));
  };

  const handleCreateJob = () => {
    setShowCreateModal(true);
  };

  const handleCreateJobSubmit = async (jobData) => {
    setFormLoading(true);
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      });

      if (!response.ok) throw new Error('Failed to create job');

      await fetchJobs(pagination.page); // Refresh the current page
      setShowCreateModal(false);
      console.log('✅ Job created successfully!');
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to create job. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
  };

  const handleEditJobSubmit = async (jobData) => {
    setFormLoading(true);
    try {
      const response = await fetch(`/api/jobs/${editingJob.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      });

      if (!response.ok) throw new Error('Failed to update job');

      await fetchJobs(pagination.page); // Refresh the current page
      setEditingJob(null);
      console.log('✅ Job updated successfully!');
    } catch (error) {
      console.error('Error updating job:', error);
      alert('Failed to update job. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleArchiveToggle = async (job) => {
    try {
      const newStatus = job.status === 'active' ? 'archived' : 'active';
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update job status');

      await fetchJobs(pagination.page); // Refresh the current page
    } catch (error) {
      console.error('Error updating job status:', error);
      alert('Failed to update job status. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs Board</h1>
          <p className="text-gray-600">
            {dragDropMode 
              ? `Drag and drop to reorder • ${pagination.total} total jobs`
              : `Manage your job postings • ${pagination.total} total jobs`
            }
          </p>
        </div>
        
        <button 
          onClick={handleCreateJob}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg border-2 border-blue-600"
        >
          <Plus size={20} />
          <span className="font-medium">Create Job</span>
        </button>
      </div>

      {/* Filters & Mode Toggle */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search jobs..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        
        {/* Drag & Drop Mode Toggle */}
        <button
          onClick={handleDragDropToggle}
          className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
            dragDropMode 
              ? 'bg-blue-100 text-blue-700 border-blue-300' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <GripVertical size={16} />
          <span>{dragDropMode ? 'Exit Reorder' : 'Reorder Jobs'}</span>
        </button>
      </div>

      {/* Drag & Drop Instructions */}
      {dragDropMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-blue-800">
            <GripVertical size={16} />
            <span className="text-sm font-medium">
              Drag and drop jobs using the grip handle to reorder them. Changes are saved automatically.
            </span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

     {/* Jobs List */}
{!loading && (
  <>
    {dragDropMode ? (
      // Draggable Jobs List - WITH DndContext
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext 
          items={jobs.map(job => job.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className={`grid gap-4 ${isDragging ? 'select-none' : ''}`}>
            {jobs.map((job) => (
              <SortableJobCard
                key={job.id}
                job={job}
                onEdit={handleEditJob}
                onArchive={handleArchiveToggle}
                isDragging={isDragging}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    ) : (
      // Regular Jobs List - NO drag & drop, create a regular JobCard
      <div className="grid gap-4">
        {jobs.map((job) => (
          <RegularJobCard
            key={job.id}
            job={job}
            onEdit={handleEditJob}
            onArchive={handleArchiveToggle}
          />
        ))}
      </div>
    )}
  </>
)}


      {/* No Jobs State */}
      {jobs.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
          <p className="text-gray-500 mt-2">
            {filters.search || filters.status 
              ? 'Try adjusting your search or filters.' 
              : 'Get started by creating your first job posting.'
            }
          </p>
          {!filters.search && !filters.status && (
            <button 
              onClick={handleCreateJob}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg"
            >
              Create Your First Job
            </button>
          )}
        </div>
      )}

      {/* Pagination - Normal Mode */}
      {pagination.totalPages > 1 && !dragDropMode && (
        <div className="flex items-center justify-between bg-white px-6 py-4 border border-gray-200 rounded-lg">
          <div>
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">{((pagination.page - 1) * pagination.pageSize) + 1}</span>
              {' '}to{' '}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.pageSize, pagination.total)}
              </span>
              {' '}of{' '}
              <span className="font-medium">{pagination.total}</span>
              {' '}jobs
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="flex items-center px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            
            {/* Page Numbers */}
            <div className="flex space-x-1">
              {[...Array(Math.min(pagination.totalPages, 5))].map((_, index) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = index + 1;
                } else {
                  // Smart pagination for many pages
                  if (pagination.page <= 3) {
                    pageNum = index + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + index;
                  } else {
                    pageNum = pagination.page - 2 + index;
                  }
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 text-sm rounded-lg ${
                      pagination.page === pageNum
                        ? 'bg-primary text-white'
                        : 'text-gray-500 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="flex items-center px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Drag & Drop Mode Info */}
      {dragDropMode && (
        <div className="flex items-center justify-between bg-white px-6 py-4 border border-gray-200 rounded-lg">
          <div>
            <p className="text-sm text-gray-700">
              Showing all <span className="font-medium">{pagination.total}</span> jobs for drag & drop reordering
            </p>
          </div>
          <button
            onClick={handleDragDropToggle}
            className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            Exit Reorder Mode
          </button>
        </div>
      )}

      {/* Create Job Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Job"
        size="lg"
      >
        <JobForm
          onSubmit={handleCreateJobSubmit}
          onCancel={() => setShowCreateModal(false)}
          isLoading={formLoading}
        />
      </Modal>

      {/* Edit Job Modal */}
      <Modal
        isOpen={!!editingJob}
        onClose={() => setEditingJob(null)}
        title="Edit Job"
        size="lg"
      >
        <JobForm
          job={editingJob}
          onSubmit={handleEditJobSubmit}
          onCancel={() => setEditingJob(null)}
          isLoading={formLoading}
        />
      </Modal>
    </div>
  );
};

export default JobsBoard;
