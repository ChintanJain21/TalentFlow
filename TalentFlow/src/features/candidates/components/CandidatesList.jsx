import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { List, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { db } from '../../../db/database'; // ✅ ADD THIS IMPORT
import CandidateFilters from './CandidateFilters';
import CandidateRow from './CandidateRow';
import KanbanBoard from './KanbanBoard';

// Stage validation (keep existing)
const getStageOrder = () => ['applied', 'screen', 'tech', 'offer', 'hired'];

const isValidStageTransition = (fromStage, toStage) => {
  const stageOrder = getStageOrder();
  const fromIndex = stageOrder.indexOf(fromStage);
  const toIndex = stageOrder.indexOf(toStage);
  
  if (fromStage === 'hired' || fromStage === 'rejected') return false;
  if (toStage === 'rejected') return fromStage !== 'rejected' && fromStage !== 'hired';
  if (fromIndex === -1 || toIndex === -1) return false;
  
  return toIndex >= fromIndex;
};

const getValidDropTargets = (candidateStage) => {
  if (!candidateStage) return [];
  const stageOrder = getStageOrder();
  const currentIndex = stageOrder.indexOf(candidateStage);
  if (candidateStage === 'hired' || candidateStage === 'rejected') return [];
  const validStages = stageOrder.slice(currentIndex);
  validStages.push('rejected');
  return validStages;
};

const CandidatesList = () => {
  const { isDark } = useTheme();
  const [searchParams] = useSearchParams();
  
  // Core state
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [activeCandidate, setActiveCandidate] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 50, total: 0, totalPages: 0 });
  const [allCandidates, setAllCandidates] = useState([]);
  
  // Filters - Enhanced URL params support
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [stageFilter, setStageFilter] = useState(searchParams.get('stage') || 'all');
  const [jobFilter, setJobFilter] = useState(searchParams.get('jobId') || 'all');
  
  // Saving animation state
  const [savingCandidate, setSavingCandidate] = useState(null);
  const [savedCandidate, setSavedCandidate] = useState(null);
  
  // Auto-scroll refs
  const dragTimeoutRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const stages = [
    { 
      value: 'all', 
      label: 'All Stages', 
      count: 0, 
      icon: '📊',
      color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
      border: 'border-gray-200 dark:border-gray-600'
    },
    { 
      value: 'applied', 
      label: 'Applied', 
      count: 0, 
      icon: '🎯', 
      color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
      border: 'border-gray-200 dark:border-gray-600'
    },
    { 
      value: 'screen', 
      label: 'Screening', 
      count: 0, 
      icon: '👋', 
      color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
      border: 'border-yellow-200 dark:border-yellow-700'
    },
    { 
      value: 'tech', 
      label: 'Technical', 
      count: 0, 
      icon: '⚡', 
      color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
      border: 'border-purple-200 dark:border-purple-700'
    },
    { 
      value: 'offer', 
      label: 'Offer', 
      count: 0, 
      icon: '🎉', 
      color: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
      border: 'border-green-200 dark:border-green-700'
    },
    { 
      value: 'hired', 
      label: 'Hired', 
      count: 0, 
      icon: '🚀', 
      color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-700'
    },
    { 
      value: 'rejected', 
      label: 'Rejected', 
      count: 0, 
      icon: '💔', 
      color: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300',
      border: 'border-red-200 dark:border-red-700'
    }
  ];

  // Helper functions for job info
  const getJobInfo = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    return job || { title: 'Unknown Job', department: 'Unknown', location: 'Unknown' };
  };

  const getFilteredJobTitle = () => {
    if (jobFilter === 'all') return null;
    const job = getJobInfo(parseInt(jobFilter));
    return job.title;
  };

  // Stats calculation
  const stageStats = useMemo(() => {
    if (!allCandidates?.length) {
      return { all: 0, applied: 0, screen: 0, tech: 0, offer: 0, hired: 0, rejected: 0 };
    }
    const stats = { all: allCandidates.length, applied: 0, screen: 0, tech: 0, offer: 0, hired: 0, rejected: 0 };
    allCandidates.forEach(candidate => {
      if (candidate?.stage && stats.hasOwnProperty(candidate.stage)) {
        stats[candidate.stage]++;
      }
    });
    return stats;
  }, [allCandidates]);

  const stagesWithCounts = stages.map(stage => ({ ...stage, count: stageStats[stage.value] || 0 }));

  // Kanban data
  const candidatesByStage = useMemo(() => {
    const emptyStructure = { applied: [], screen: [], tech: [], offer: [], hired: [], rejected: [] };
    if (!allCandidates?.length) return emptyStructure;

    const filtered = allCandidates.filter(candidate => {
      if (!candidate?.name || !candidate?.email) return false;
      return !search || 
        candidate.name.toLowerCase().includes(search.toLowerCase()) ||
        candidate.email.toLowerCase().includes(search.toLowerCase());
    });

    const stageGroups = { ...emptyStructure };
    filtered.forEach(candidate => {
      if (candidate.stage && stageGroups.hasOwnProperty(candidate.stage)) {
        stageGroups[candidate.stage].push(candidate);
      } else {
        stageGroups.applied.push({ ...candidate, stage: 'applied' });
      }
    });

    return stageGroups;
  }, [allCandidates, search]);

  // Auto-scroll during drag
  const handleAutoScroll = (clientX) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const scrollThreshold = 120;
    const scrollSpeed = 8;

    if (dragTimeoutRef.current) clearTimeout(dragTimeoutRef.current);

    if (clientX - containerRect.left < scrollThreshold && container.scrollLeft > 0) {
      const scroll = () => {
        if (container.scrollLeft > 0) {
          container.scrollBy({ left: -scrollSpeed, behavior: 'auto' });
          dragTimeoutRef.current = setTimeout(scroll, 16);
        }
      };
      scroll();
    } else if (containerRect.right - clientX < scrollThreshold && 
               container.scrollLeft < container.scrollWidth - container.clientWidth) {
      const scroll = () => {
        if (container.scrollLeft < container.scrollWidth - container.clientWidth) {
          container.scrollBy({ left: scrollSpeed, behavior: 'auto' });
          dragTimeoutRef.current = setTimeout(scroll, 16);
        }
      };
      scroll();
    }
  };

  // ✅ FIXED - IndexedDB API calls
  const fetchAllCandidatesForStats = async () => {
    try {
      console.log('🔍 Fetching all candidates from IndexedDB...');
      
      let query = db.candidates.toCollection();
      
      // Apply job filter if specified
      if (jobFilter !== 'all') {
        const jobId = parseInt(jobFilter);
        query = db.candidates.where('jobId').equals(jobId);
      }
      
      const candidatesData = await query.toArray();
      console.log('✅ Candidates loaded:', candidatesData.length);
      
      setAllCandidates(candidatesData);
    } catch (error) {
      console.error('❌ Error fetching candidates:', error);
      setAllCandidates([]);
    }
  };

  const fetchJobs = async () => {
    try {
      console.log('🔍 Fetching jobs from IndexedDB...');
      const jobsData = await db.jobs.toArray();
      console.log('✅ Jobs loaded:', jobsData.length);
      setJobs(jobsData);
    } catch (error) {
      console.error('❌ Error fetching jobs:', error);
      setJobs([]);
    }
  };

  const fetchCandidates = async (page = 1) => {
    setLoading(true);
    try {
      console.log('🔍 Fetching paginated candidates...', { page, search, stageFilter, jobFilter });
      
      // Start with all candidates
      let query = db.candidates.toCollection();
      
      // Apply filters
      if (jobFilter !== 'all') {
        const jobId = parseInt(jobFilter);
        query = db.candidates.where('jobId').equals(jobId);
      }
      
      let filteredCandidates = await query.toArray();
      
      // Apply search filter
      if (search) {
        filteredCandidates = filteredCandidates.filter(candidate =>
          candidate.name.toLowerCase().includes(search.toLowerCase()) ||
          candidate.email.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      // Apply stage filter
      if (stageFilter !== 'all') {
        filteredCandidates = filteredCandidates.filter(candidate => 
          candidate.stage === stageFilter
        );
      }
      
      // Sort by application date (newest first)
      filteredCandidates.sort((a, b) => 
        new Date(b.appliedDate || b.createdAt) - new Date(a.appliedDate || a.createdAt)
      );
      
      // Calculate pagination
      const total = filteredCandidates.length;
      const totalPages = Math.ceil(total / pagination.pageSize);
      const startIndex = (page - 1) * pagination.pageSize;
      const paginatedCandidates = filteredCandidates.slice(startIndex, startIndex + pagination.pageSize);
      
      console.log('✅ Paginated candidates loaded:', {
        total,
        page,
        pageSize: pagination.pageSize,
        totalPages,
        currentPageSize: paginatedCandidates.length
      });
      
      setCandidates(paginatedCandidates);
      setPagination({ page, pageSize: pagination.pageSize, total, totalPages });
      
    } catch (error) {
      console.error('❌ Error fetching candidates:', error);
      setCandidates([]);
      setPagination({ page: 1, pageSize: 50, total: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED - IndexedDB drag handlers
  const handleDragStart = (event) => {
    if (!event?.active?.id || !allCandidates) return;
    const candidate = allCandidates.find(c => c.id === event.active.id);
    setActiveCandidate(candidate);
    document.body.style.cursor = 'grabbing';
  };

  const handleDragOver = (event) => {
    const { activatorEvent } = event;
    if (activatorEvent?.clientX && viewMode === 'kanban') {
      handleAutoScroll(activatorEvent.clientX);
    }
  };

    // ✅ FIXED - Add timeline support to handleDragEnd
  const handleDragEnd = async (event) => {
    // Cleanup
    if (dragTimeoutRef.current) clearTimeout(dragTimeoutRef.current);
    document.body.style.cursor = '';
    setActiveCandidate(null);
    
    const { active, over } = event;
    if (!active || !over || !allCandidates) return;

    const candidate = allCandidates.find(c => c.id === active.id);
    if (!candidate) return;

    // Determine target stage
    let targetStage = null;
    const stageKeys = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];
    
    if (stageKeys.includes(over.id)) {
      targetStage = over.id;
    } else {
      const overCandidate = allCandidates.find(c => c.id === over.id);
      if (overCandidate) targetStage = overCandidate.stage;
    }

    if (!targetStage || candidate.stage === targetStage) return;

    // Validate transition
    if (!isValidStageTransition(candidate.stage, targetStage)) {
      const errorMessages = {
        hired: '🔒 Hired candidates cannot be moved.',
        rejected: '🔒 Rejected candidates cannot be moved.',
        default: '📈 Candidates can only move forward or be rejected.'
      };
      
      const message = errorMessages[candidate.stage] || 
                     (targetStage === 'hired' && candidate.stage !== 'offer' 
                      ? '📋 Only candidates with offers can be hired.' 
                      : errorMessages.default);
      
      alert(`❌ Invalid Move!\n\n${message}`);
      return;
    }

    // Saving animation
    setSavingCandidate(candidate.id);
    
    // Optimistic update
    const optimisticCandidate = { ...candidate, stage: targetStage, _saving: true };
    setAllCandidates(prev => prev.map(c => 
      c.id === active.id ? optimisticCandidate : c
    ));

    try {
      // ✅ ADD: Helper function to get stage display names
      const getStageDisplayName = (stage) => {
        const stageNames = {
          'applied': 'Applied',
          'screen': 'Screening',
          'tech': 'Technical Interview',
          'offer': 'Offer',
          'hired': 'Hired',
          'rejected': 'Rejected'
        };
        return stageNames[stage] || stage;
      };

      // ✅ ADD: Create timeline entry for stage change
      const timelineEntry = {
        id: Date.now(),
        type: 'stage_change',
        title: `Moved to ${getStageDisplayName(targetStage)}`,
        description: `Stage changed from ${getStageDisplayName(candidate.stage)} to ${getStageDisplayName(targetStage)}`,
        timestamp: new Date().toISOString(),
        user: 'HR Team', // You can make this dynamic based on logged-in user
        metadata: {
          previousStage: candidate.stage,
          newStage: targetStage,
          changedBy: 'HR Team',
          changeMethod: 'drag_drop'
        }
      };

      // ✅ FIXED - Update in IndexedDB with timeline
      await db.candidates.update(active.id, {
        stage: targetStage,
        timeline: [...(candidate.timeline || []), timelineEntry], // ✅ ADD timeline entry
        updatedAt: new Date().toISOString()
      });

      // Get updated candidate
      const updatedCandidate = await db.candidates.get(active.id);
      
      // Success animation
      setSavingCandidate(null);
      setSavedCandidate(updatedCandidate.id);
      
      // Update with IndexedDB response
      setAllCandidates(prev => prev.map(c => 
        c.id === active.id ? { ...updatedCandidate, _justSaved: true } : c
      ));

      console.log('✅ Candidate stage updated with timeline entry:', { 
        id: active.id, 
        newStage: targetStage,
        timelineEntry
      });

      // Clear success animation
      setTimeout(() => {
        setSavedCandidate(null);
        setAllCandidates(prev => prev.map(c => 
          c.id === updatedCandidate.id ? { ...c, _justSaved: false } : c
        ));
      }, 2000);

    } catch (error) {
      console.error('❌ Failed to update candidate stage:', error);
      
      // Rollback
      setSavingCandidate(null);
      setAllCandidates(prev => prev.map(c => 
        c.id === active.id ? { ...candidate, _saving: false } : c
      ));
      alert('Failed to update candidate stage. Please try again.');
    }
  };


  // Effects
  useEffect(() => {
    fetchJobs();
    fetchAllCandidatesForStats();
  }, []);

  useEffect(() => {
    fetchAllCandidatesForStats();
  }, [jobFilter]);

  useEffect(() => {
    if (viewMode === 'list') fetchCandidates(1);
  }, [search, stageFilter, jobFilter, viewMode]);

  useEffect(() => {
    return () => {
      if (dragTimeoutRef.current) clearTimeout(dragTimeoutRef.current);
      document.body.style.cursor = '';
    };
  }, []);

  const isKanbanReady = allCandidates?.length > 0 && candidatesByStage;
  const filteredJobTitle = getFilteredJobTitle();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      
      {/* Enhanced Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-2">Candidates</h1>
          {filteredJobTitle ? (
            <p className="text-gray-600 dark:text-gray-400">
              Showing candidates for <span className="font-bold text-blue-600 dark:text-blue-400">{filteredJobTitle}</span> ({stageStats.all} total)
            </p>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">Manage candidate applications ({stageStats.all} total)</p>
          )}
        </div>
        
        {/* Enhanced View Toggle */}
        <div className="flex bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-200 dark:border-gray-700">
          {[
            { mode: 'list', label: 'List', icon: List },
            { mode: 'kanban', label: 'Kanban', icon: LayoutGrid }
          ].map(({ mode, label, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === mode 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Filters */}
      <CandidateFilters
        search={search}
        setSearch={setSearch}
        stageFilter={stageFilter}
        setStageFilter={setStageFilter}
        jobFilter={jobFilter}
        setJobFilter={setJobFilter}
        jobs={jobs}
        stagesWithCounts={stagesWithCounts}
        viewMode={viewMode}
        showStageFilter={viewMode === 'list'}
        totalCandidates={stageStats.all}
      />

      {/* Enhanced Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        {stagesWithCounts.slice(1).map(stage => (
          <div 
            key={stage.value} 
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 p-4 text-center cursor-pointer hover:shadow-md transition-all transform hover:-translate-y-0.5 ${
              stageFilter === stage.value && viewMode === 'list' 
                ? `ring-2 ring-blue-500 dark:ring-blue-400 ${stage.border}` 
                : `border-gray-200 dark:border-gray-700 ${stage.border}`
            }`}
            onClick={() => viewMode === 'list' && setStageFilter(stage.value)}
          >
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">{stage.count}</div>
            <div className={`text-sm font-medium flex items-center justify-center mt-1 ${stage.color}`}>
              <span className="mr-1">{stage.icon}</span>
              {stage.label}
            </div>
          </div>
        ))}
      </div>

      {/* Notifications */}
      {savingCandidate && (
        <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-3"></div>
          <span className="font-medium">Saving changes...</span>
        </div>
      )}

      {savedCandidate && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center">
          <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center mr-3">
            <span className="text-green-500 text-xs">✓</span>
          </div>
          <span className="font-medium">Candidate updated successfully!</span>
        </div>
      )}

      {/* Content */}
      {viewMode === 'list' ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading candidates...</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-50 mb-2">No Candidates Found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filteredJobTitle 
                  ? `No candidates found for ${filteredJobTitle}.`
                  : 'No candidates match your current filters.'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      {['Candidate', 'Job Applied', 'Stage', 'Experience', 'Applied', 'Actions'].map(header => (
                        <th key={header} className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {candidates.map(candidate => (
                      <CandidateRow 
                        key={candidate.id} 
                        candidate={candidate} 
                        jobInfo={getJobInfo(candidate.jobId)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Enhanced Pagination */}
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{(pagination.page - 1) * pagination.pageSize + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(pagination.page * pagination.pageSize, pagination.total)}</span> of{' '}
                    <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => fetchCandidates(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ChevronLeft size={16} />
                    <span>Previous</span>
                  </button>
                  <span className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => fetchCandidates(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div>
          {!isKanbanReady ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Loading Kanban board...</p>
            </div>
          ) : (
            <KanbanBoard
              candidatesByStage={candidatesByStage}
              activeCandidate={activeCandidate}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              getValidDropTargets={getValidDropTargets}
              scrollContainerRef={scrollContainerRef}
              savingCandidate={savingCandidate}
              savedCandidate={savedCandidate}
              jobs={jobs}
              getJobInfo={getJobInfo}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CandidatesList;
