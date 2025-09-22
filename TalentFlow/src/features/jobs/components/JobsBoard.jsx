import { useState, useEffect } from 'react';
import { Plus, Search, Grid3X3, ArrowUpDown, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import Modal from '../../../components/ui/Modal';
import JobForm from './JobForm';
import SortableJobCard from './SortableJobCard';
import RegularJobCard from './JobCard';

const JobsBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reorderMode, setReorderMode] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [notification, setNotification] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 12, total: 0, totalPages: 0 });

  // Drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  // Notification helper
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), type === 'error' ? 5000 : 3000);
  };

  // ✅ SIMPLIFIED fetchJobs - For initial load and search only
  const fetchJobs = async (page = 1, search = '', status = '', pageSize = 12) => {
    setLoading(true);
    try {
      console.log(`🔍 fetchJobs: page=${page}, search="${search}", status="${status}"`);
      
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(search && { search }),
        ...(status && { status }),
        sort: 'order',
        _t: Date.now().toString()
      });

      const response = await fetch(`/api/jobs?${params}`);
      if (!response.ok) throw new Error('Failed to fetch jobs');
      
      const data = await response.json();
      console.log(`✅ fetchJobs result:`, { page: data.page, total: data.total, dataLength: data.data?.length });
      
      setJobs(data.data || []);
      setPagination({
        page: data.page,
        pageSize: pageSize,
        total: data.total,
        totalPages: data.totalPages
      });
      
    } catch (error) {
      console.error('❌ fetchJobs error:', error);
      showNotification('error', 'Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Drag end handler
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = jobs.findIndex(job => job.id === active.id);
    const newIndex = jobs.findIndex(job => job.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const optimisticJobs = arrayMove(jobs, oldIndex, newIndex);
    setJobs(optimisticJobs);
    showNotification('info', 'Reordering...');

    try {
      const response = await fetch(`/api/jobs/${active.id}/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromOrder: oldIndex, toOrder: newIndex })
      });

      if (!response.ok) throw new Error('Reorder failed');
      showNotification('success', 'Jobs reordered successfully!');
    } catch (error) {
      setJobs(jobs);
      showNotification('error', 'Reorder failed. Changes reverted.');
    }
  };

  // Job creation
  const handleCreateJob = async (jobData) => {
    setFormLoading(true);
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      });

      if (!response.ok) throw new Error('Failed to create job');
      
      setShowCreateModal(false);
      await fetchJobs(pagination.page, filters.search, filters.status, reorderMode ? 50 : 12);
      showNotification('success', 'Job created successfully!');
    } catch (error) {
      showNotification('error', 'Failed to create job. Please try again.');
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  // Job editing
  const handleEditJob = async (jobData) => {
    setFormLoading(true);
    try {
      const response = await fetch(`/api/jobs/${editingJob.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      });

      if (!response.ok) throw new Error('Failed to update job');
      
      setEditingJob(null);
      await fetchJobs(pagination.page, filters.search, filters.status, reorderMode ? 50 : 12);
      showNotification('success', 'Job updated successfully!');
    } catch (error) {
      showNotification('error', 'Failed to update job. Please try again.');
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  // Job archive/unarchive
  const handleArchiveToggle = async (job) => {
    const newStatus = job.status === 'active' ? 'archived' : 'active';
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update job');
      
      await fetchJobs(pagination.page, filters.search, filters.status, reorderMode ? 50 : 12);
      showNotification('success', `Job ${newStatus === 'active' ? 'activated' : 'archived'} successfully!`);
    } catch (error) {
      showNotification('error', 'Failed to update job status.');
    }
  };

  // Effects
  useEffect(() => { 
    fetchJobs(1, '', '', 12);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchJobs(1, filters.search, filters.status, reorderMode ? 50 : 12);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [filters.search, filters.status]);

  useEffect(() => { 
    const newPageSize = reorderMode ? 50 : 12;
    setPagination(prev => ({ ...prev, page: 1, pageSize: newPageSize }));
    fetchJobs(1, filters.search, filters.status, newPageSize);
  }, [reorderMode]);

  const stats = {
    total: pagination.total,
    active: jobs.filter(job => job.status === 'active').length,
    archived: jobs.filter(job => job.status === 'archived').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                Jobs Board
              </h1>
              <p className="text-slate-600 mt-2 flex items-center space-x-4">
                <span>Manage your job postings</span>
                <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>{stats.active} active</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                  <span>{stats.archived} archived</span>
                </span>
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setReorderMode(!reorderMode)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                  reorderMode
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 hover:bg-orange-600'
                    : 'bg-white text-slate-700 shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300'
                }`}
              >
                <ArrowUpDown size={18} />
                <span>{reorderMode ? 'Exit Reorder' : 'Reorder'}</span>
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                disabled={reorderMode}
                className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                  reorderMode
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transform hover:-translate-y-0.5'
                }`}
              >
                <Plus size={20} />
                <span>Create Job</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Total Jobs</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                  <Grid3X3 className="text-slate-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Active Jobs</p>
                  <p className="text-3xl font-bold text-green-700 mt-1">{stats.active}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-green-500 rounded-lg"></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Archived Jobs</p>
                  <p className="text-3xl font-bold text-slate-700 mt-1">{stats.archived}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-slate-400 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search jobs by title, department, or skills..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="active">Active Only</option>
                <option value="archived">Archived Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 max-w-sm mx-auto mb-4 p-4 rounded-xl shadow-lg animate-in slide-in-from-right duration-300 ${
            notification.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
            notification.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
            'bg-blue-50 border border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center space-x-3">
              {notification.type === 'success' && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
              {notification.type === 'error' && <AlertCircle size={16} />}
              {notification.type === 'info' && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>}
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        )}

        {/* Reorder Banner */}
        {reorderMode && (
          <div className="mb-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <ArrowUpDown size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Reorder Mode Active</h3>
                <p className="text-orange-100">Drag and drop jobs to reorder them. Changes are saved automatically with 10% simulated failure rate for testing.</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium">Loading jobs...</p>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <Grid3X3 className="text-slate-400" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              {filters.search || filters.status ? 'No jobs found' : 'No jobs yet'}
            </h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              {filters.search || filters.status 
                ? 'Try adjusting your search criteria or filters to find what you\'re looking for.' 
                : 'Get started by creating your first job posting to attract top talent.'
              }
            </p>
            {!filters.search && !filters.status && !reorderMode && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Create Your First Job
              </button>
            )}
          </div>
        ) : (
          <div>
            {reorderMode ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext items={jobs.map(job => job.id)} strategy={verticalListSortingStrategy}>
                  <div className="grid gap-6">
                    {jobs.map((job) => (
                      <SortableJobCard
                        key={job.id}
                        job={job}
                        onEdit={setEditingJob}
                        onArchive={handleArchiveToggle}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="grid gap-6">
                {jobs.map((job) => (
                  <RegularJobCard
                    key={job.id}
                    job={job}
                    onEdit={setEditingJob}
                    onArchive={handleArchiveToggle}
                  />
                ))}
              </div>
            )}

            {/* ✅ COMPLETELY FIXED PAGINATION WITH DIRECT API CALLS */}
            {pagination.totalPages > 1 && !reorderMode && (
              <div className="flex justify-center mt-12">
                <div className="flex items-center space-x-2">
                  {/* Previous Button */}
                  {pagination.page > 1 && (
                    <button
                      onClick={async () => {
                        const newPage = pagination.page - 1;
                        console.log(`◀️ PREV: ${pagination.page} → ${newPage}`);
                        setLoading(true);
                        
                        try {
                          const params = new URLSearchParams({
                            page: newPage.toString(),
                            pageSize: '12',
                            ...(filters.search && { search: filters.search }),
                            ...(filters.status && { status: filters.status }),
                            sort: 'order',
                            _t: Date.now().toString()
                          });

                          const response = await fetch(`/api/jobs?${params}`);
                          const data = await response.json();
                          
                          console.log(`✅ PREV RESULT:`, { 
                            page: data.page, 
                            dataLength: data.data?.length,
                            jobIds: data.data?.map(j => j.id)
                          });
                          
                          setJobs(data.data || []);
                          setPagination({
                            page: data.page,
                            pageSize: 12,
                            total: data.total,
                            totalPages: data.totalPages
                          });
                        } catch (error) {
                          console.error('❌ PREV ERROR:', error);
                          showNotification('error', 'Failed to load previous page');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                      className="w-12 h-12 rounded-xl font-semibold transition-all bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 flex items-center justify-center hover:shadow-md disabled:opacity-50"
                    >
                      <ChevronLeft size={18} />
                    </button>
                  )}

                  {/* Page Numbers */}
                  {[...Array(Math.min(pagination.totalPages, 7))].map((_, i) => {
                    let pageNum;
                    
                    if (pagination.totalPages <= 7) {
                      pageNum = i + 1;
                    } else {
                      const current = pagination.page;
                      const total = pagination.totalPages;
                      
                      if (current <= 4) {
                        pageNum = i + 1;
                      } else if (current >= total - 3) {
                        pageNum = total - 6 + i;
                      } else {
                        pageNum = current - 3 + i;
                      }
                    }
                    
                    if (pageNum < 1 || pageNum > pagination.totalPages) return null;
                    
                    const isCurrent = pageNum === pagination.page;
                    
                    return (
                      <button
                        key={`page-${pageNum}`}
                        onClick={async () => {
                          if (pageNum === pagination.page || loading) return;
                          
                          console.log(`🔘 PAGE ${pageNum} CLICKED (from ${pagination.page})`);
                          setLoading(true);
                          
                          try {
                            const params = new URLSearchParams({
                              page: pageNum.toString(),
                              pageSize: '12',
                              ...(filters.search && { search: filters.search }),
                              ...(filters.status && { status: filters.status }),
                              sort: 'order',
                              _t: Date.now().toString()
                            });

                            const response = await fetch(`/api/jobs?${params}`);
                            const data = await response.json();
                            
                            console.log(`✅ PAGE ${pageNum} RESULT:`, {
                              page: data.page,
                              total: data.total,
                              dataLength: data.data?.length,
                              firstJob: data.data?.[0]?.title,
                              jobIds: data.data?.map(j => j.id)
                            });
                            
                            setJobs(data.data || []);
                            setPagination({
                              page: data.page,
                              pageSize: 12,
                              total: data.total,
                              totalPages: data.totalPages
                            });
                          } catch (error) {
                            console.error(`❌ PAGE ${pageNum} ERROR:`, error);
                            showNotification('error', `Failed to load page ${pageNum}`);
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={loading}
                        className={`w-12 h-12 rounded-xl font-semibold transition-all disabled:opacity-50 ${
                          isCurrent
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                            : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 hover:shadow-md'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Next Button */}
                  {pagination.page < pagination.totalPages && (
                    <button
                      onClick={async () => {
                        const newPage = pagination.page + 1;
                        console.log(`▶️ NEXT: ${pagination.page} → ${newPage}`);
                        setLoading(true);
                        
                        try {
                          const params = new URLSearchParams({
                            page: newPage.toString(),
                            pageSize: '12',
                            ...(filters.search && { search: filters.search }),
                            ...(filters.status && { status: filters.status }),
                            sort: 'order',
                            _t: Date.now().toString()
                          });

                          const response = await fetch(`/api/jobs?${params}`);
                          const data = await response.json();
                          
                          console.log(`✅ NEXT RESULT:`, { 
                            page: data.page, 
                            dataLength: data.data?.length,
                            jobIds: data.data?.map(j => j.id)
                          });
                          
                          setJobs(data.data || []);
                          setPagination({
                            page: data.page,
                            pageSize: 12,
                            total: data.total,
                            totalPages: data.totalPages
                          });
                        } catch (error) {
                          console.error('❌ NEXT ERROR:', error);
                          showNotification('error', 'Failed to load next page');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                      className="w-12 h-12 rounded-xl font-semibold transition-all bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 flex items-center justify-center hover:shadow-md disabled:opacity-50"
                    >
                      <ChevronRight size={18} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Page Info */}
            {pagination.totalPages > 1 && !reorderMode && (
              <div className="text-center mt-4">
                <p className="text-sm text-slate-600">
                  Showing {((pagination.page - 1) * pagination.pageSize) + 1} to {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} jobs
                  <span className="ml-2 text-slate-400">• Page {pagination.page} of {pagination.totalPages}</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Job" size="lg">
          <JobForm onSubmit={handleCreateJob} onCancel={() => setShowCreateModal(false)} isLoading={formLoading} />
        </Modal>

        <Modal isOpen={!!editingJob} onClose={() => setEditingJob(null)} title="Edit Job" size="lg">
          <JobForm job={editingJob} onSubmit={handleEditJob} onCancel={() => setEditingJob(null)} isLoading={formLoading} />
        </Modal>
      </div>
    </div>
  );
};

export default JobsBoard;
