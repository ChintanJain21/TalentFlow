import { useState, useEffect } from 'react';
import { Plus, Search, Grid3X3, ArrowUpDown, AlertCircle, ChevronLeft, ChevronRight, Briefcase, Target, Archive } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useTheme } from '../../../contexts/ThemeContext';
import { db } from '../../../db/database'; // ✅ ADD THIS IMPORT
import Modal from '../../../components/ui/Modal';
import JobForm from './JobForm';
import SortableJobCard from './SortableJobCard';
import RegularJobCard from './JobCard';

const JobsBoard = () => {
  const { isDark } = useTheme();
  
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

  // ✅ FIXED - IndexedDB only fetchJobs
  const fetchJobs = async (page = 1, search = '', status = '', pageSize = 12) => {
    setLoading(true);
    try {
      console.log(`🔍 fetchJobs: page=${page}, search="${search}", status="${status}" - USING INDEXEDDB`);
      
      // Get all jobs from IndexedDB
      let query = db.jobs.orderBy('order');
      let allJobs = await query.toArray();
      
      // Apply status filter
      if (status && status !== '' && status !== 'all') {
        allJobs = allJobs.filter(job => job.status === status);
      }
      
      // Apply search filter
      if (search && search.trim() !== '') {
        const searchLower = search.toLowerCase();
        allJobs = allJobs.filter(job => 
          job.title.toLowerCase().includes(searchLower) ||
          job.description.toLowerCase().includes(searchLower) ||
          job.department.toLowerCase().includes(searchLower) ||
          (job.skills && job.skills.some(skill => skill.toLowerCase().includes(searchLower)))
        );
      }
      
      // Calculate pagination
      const total = allJobs.length;
      const totalPages = Math.ceil(total / pageSize);
      const startIndex = (page - 1) * pageSize;
      const paginatedJobs = allJobs.slice(startIndex, startIndex + pageSize);
      
      console.log(`✅ fetchJobs result: ${paginatedJobs.length} jobs (page ${page}/${totalPages})`);
      
      setJobs(paginatedJobs);
      setPagination({ page, pageSize, total, totalPages });
      
    } catch (error) {
      console.error('❌ fetchJobs error:', error);
      showNotification('error', 'Failed to load jobs from database.');
      setJobs([]);
      setPagination({ page: 1, pageSize: 12, total: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED - IndexedDB reorder
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
      // Update order in IndexedDB
      const updatedJobs = optimisticJobs.map((job, index) => ({
        ...job,
        order: index + 1
      }));
      
      await db.transaction('rw', db.jobs, async () => {
        for (const job of updatedJobs) {
          await db.jobs.update(job.id, { order: job.order });
        }
      });
      
      showNotification('success', 'Jobs reordered successfully!');
    } catch (error) {
      console.error('Reorder failed:', error);
      setJobs(jobs); // Revert changes
      showNotification('error', 'Reorder failed. Changes reverted.');
    }
  };

  // ✅ FIXED - IndexedDB job creation
  const handleCreateJob = async (jobData) => {
    setFormLoading(true);
    try {
      // Get max order
      const maxOrderJob = await db.jobs.orderBy('order').last();
      const newOrder = (maxOrderJob?.order || 0) + 1;
      
      const newJob = {
        ...jobData,
        order: newOrder,
        createdAt: new Date().toISOString()
      };
      
      await db.jobs.add(newJob);
      
      setShowCreateModal(false);
      await fetchJobs(pagination.page, filters.search, filters.status, reorderMode ? 50 : 12);
      showNotification('success', 'Job created successfully!');
    } catch (error) {
      console.error('Create job failed:', error);
      showNotification('error', 'Failed to create job. Please try again.');
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  // ✅ FIXED - IndexedDB job editing
  const handleEditJob = async (jobData) => {
    setFormLoading(true);
    try {
      await db.jobs.update(editingJob.id, {
        ...jobData,
        updatedAt: new Date().toISOString()
      });
      
      setEditingJob(null);
      await fetchJobs(pagination.page, filters.search, filters.status, reorderMode ? 50 : 12);
      showNotification('success', 'Job updated successfully!');
    } catch (error) {
      console.error('Update job failed:', error);
      showNotification('error', 'Failed to update job. Please try again.');
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  // ✅ FIXED - IndexedDB archive/unarchive
  const handleArchiveToggle = async (job) => {
    const newStatus = job.status === 'active' ? 'archived' : 'active';
    try {
      await db.jobs.update(job.id, { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      await fetchJobs(pagination.page, filters.search, filters.status, reorderMode ? 50 : 12);
      showNotification('success', `Job ${newStatus === 'active' ? 'activated' : 'archived'} successfully!`);
    } catch (error) {
      console.error('Archive toggle failed:', error);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50 mb-2">
                Jobs Board
              </h1>
              <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-300">
                <span className="font-medium">Manage your job postings</span>
                <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-bold">{stats.active} active</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                  <span className="font-bold">{stats.archived} archived</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setReorderMode(!reorderMode)}
                className={`px-5 py-3 rounded-xl font-bold transition-all duration-200 flex items-center space-x-2 border-2 ${
                  reorderMode
                    ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500 shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm hover:shadow-md'
                }`}
              >
                <ArrowUpDown size={18} />
                <span>{reorderMode ? 'Exit Reorder' : 'Reorder Jobs'}</span>
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                disabled={reorderMode}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 flex items-center space-x-2 border-2 ${
                  reorderMode
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-300 dark:border-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                <Plus size={20} />
                <span>Create Job</span>
              </button>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-2 border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-bold uppercase tracking-wide">Total Jobs</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-50 mt-2">{stats.total}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center">
                  <Grid3X3 className="text-gray-600 dark:text-gray-300" size={28} />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-2 border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 dark:text-green-400 text-sm font-bold uppercase tracking-wide">Active Jobs</p>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-300 mt-2">{stats.active}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-2xl flex items-center justify-center">
                  <Target className="text-green-600 dark:text-green-400" size={28} />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-2 border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-bold uppercase tracking-wide">Archived Jobs</p>
                  <p className="text-3xl font-bold text-gray-700 dark:text-gray-300 mt-2">{stats.archived}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center">
                  <Archive className="text-gray-600 dark:text-gray-300" size={28} />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-2 border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="Search jobs by title, department, or skills..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100 font-medium"
              >
                <option value="">All Status</option>
                <option value="active">Active Only</option>
                <option value="archived">Archived Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Enhanced Notifications */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 max-w-sm mx-auto mb-4 p-4 rounded-xl shadow-xl animate-in slide-in-from-right duration-300 border-2 ${
            notification.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200' :
            notification.type === 'error' ? 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200' :
            'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200'
          }`}>
            <div className="flex items-center space-x-3">
              {notification.type === 'success' && <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>}
              {notification.type === 'error' && <AlertCircle size={18} />}
              {notification.type === 'info' && <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>}
              <span className="font-bold">{notification.message}</span>
            </div>
          </div>
        )}

        {/* Enhanced Reorder Banner */}
        {reorderMode && (
          <div className="mb-6 bg-gradient-to-r from-orange-500 to-amber-500 dark:from-orange-600 dark:to-amber-600 text-white rounded-2xl p-6 shadow-xl border-2 border-orange-400">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <ArrowUpDown size={28} />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-1">Reorder Mode Active</h3>
                <p className="text-orange-100 font-medium">Drag and drop jobs to reorder them. Changes are saved automatically.</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300 font-bold text-lg">Loading jobs...</p>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-3xl mx-auto mb-6 flex items-center justify-center">
              <Briefcase className="text-gray-400 dark:text-gray-500" size={48} />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">
              {filters.search || filters.status ? 'No jobs found' : 'No jobs yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto font-medium">
              {filters.search || filters.status 
                ? 'Try adjusting your search criteria or filters to find what you\'re looking for.' 
                : 'Get started by creating your first job posting to attract top talent.'
              }
            </p>
            {!filters.search && !filters.status && !reorderMode && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 border-2 border-blue-600"
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

            {/* ✅ FIXED - IndexedDB pagination */}
            {pagination.totalPages > 1 && !reorderMode && (
              <div className="flex justify-center mt-12">
                <div className="flex items-center space-x-2">
                  {/* Previous Button */}
                  {pagination.page > 1 && (
                    <button
                      onClick={() => fetchJobs(pagination.page - 1, filters.search, filters.status, 12)}
                      className="w-12 h-12 rounded-xl font-bold transition-all bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center hover:shadow-md"
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
                        onClick={() => fetchJobs(pageNum, filters.search, filters.status, 12)}
                        className={`w-12 h-12 rounded-xl font-bold transition-all border-2 ${
                          isCurrent
                            ? 'bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500 shadow-lg'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600 hover:shadow-md'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Next Button */}
                  {pagination.page < pagination.totalPages && (
                    <button
                      onClick={() => fetchJobs(pagination.page + 1, filters.search, filters.status, 12)}
                      className="w-12 h-12 rounded-xl font-bold transition-all bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center hover:shadow-md"
                    >
                      <ChevronRight size={18} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Enhanced Page Info */}
            {pagination.totalPages > 1 && !reorderMode && (
              <div className="text-center mt-6">
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  Showing <span className="font-bold text-gray-900 dark:text-gray-100">{((pagination.page - 1) * pagination.pageSize) + 1}</span> to <span className="font-bold text-gray-900 dark:text-gray-100">{Math.min(pagination.page * pagination.pageSize, pagination.total)}</span> of <span className="font-bold text-gray-900 dark:text-gray-100">{pagination.total}</span> jobs
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                  Page <span className="font-bold">{pagination.page}</span> of <span className="font-bold">{pagination.totalPages}</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Modals */}
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
