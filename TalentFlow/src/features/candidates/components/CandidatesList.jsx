import React, { useState, useEffect, useMemo, useRef } from 'react';
import CandidateFilters from './CandidateFilters';
import CandidateRow from './CandidateRow';
import KanbanBoard from './KanbanBoard';

// Stage validation
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
  // Core state
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [activeCandidate, setActiveCandidate] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 50, total: 0, totalPages: 0 });
  const [allCandidates, setAllCandidates] = useState([]);
  
  // Filters
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  
  // 🎨 SAVING ANIMATION STATE
  const [savingCandidate, setSavingCandidate] = useState(null);
  const [savedCandidate, setSavedCandidate] = useState(null);
  
  // Auto-scroll refs
  const dragTimeoutRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const stages = [
    { value: 'all', label: 'All Stages', count: 0 },
    { value: 'applied', label: 'Applied', count: 0, icon: '🎯', color: 'bg-slate-100 text-slate-700' },
    { value: 'screen', label: 'Screening', count: 0, icon: '👋', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'tech', label: 'Technical', count: 0, icon: '⚡', color: 'bg-purple-100 text-purple-700' },
    { value: 'offer', label: 'Offer', count: 0, icon: '🎉', color: 'bg-green-100 text-green-700' },
    { value: 'hired', label: 'Hired', count: 0, icon: '🚀', color: 'bg-blue-100 text-blue-700' },
    { value: 'rejected', label: 'Rejected', count: 0, icon: '💔', color: 'bg-red-100 text-red-700' }
  ];

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

  // API calls
  const fetchAllCandidatesForStats = async () => {
    try {
      const response = await fetch('/api/candidates?page=1&pageSize=2000');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setAllCandidates(data.data || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setAllCandidates([]);
    }
  };

  const fetchCandidates = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pagination.pageSize.toString(),
        ...(search && { search }),
        ...(stageFilter !== 'all' && { stage: stageFilter }),
        ...(jobFilter !== 'all' && { jobId: jobFilter })
      });

      const response = await fetch(`/api/candidates?${params}`);
      const data = await response.json();
      
      setCandidates(data.data || []);
      setPagination({ page: data.page, pageSize: data.pageSize, total: data.total, totalPages: data.totalPages });
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  // 🎨 ENHANCED DRAG HANDLERS WITH ANIMATION
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

    // 🎨 START SAVING ANIMATION
    setSavingCandidate(candidate.id);
    
    // Optimistic update with saving state
    const optimisticCandidate = { ...candidate, stage: targetStage, _saving: true };
    setAllCandidates(prev => prev.map(c => 
      c.id === active.id ? optimisticCandidate : c
    ));

    try {
      const response = await fetch(`/api/candidates/${active.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: targetStage })
      });

      if (response.ok) {
        const updated = await response.json();
        
        // 🎨 SUCCESS ANIMATION
        setSavingCandidate(null);
        setSavedCandidate(updated.id);
        
        // Update with server response
        setAllCandidates(prev => prev.map(c => 
          c.id === active.id ? { ...updated, _justSaved: true } : c
        ));

        // Clear success animation after 2 seconds
        setTimeout(() => {
          setSavedCandidate(null);
          setAllCandidates(prev => prev.map(c => 
            c.id === updated.id ? { ...c, _justSaved: false } : c
          ));
        }, 2000);

      } else {
        // 🚫 ERROR - ROLLBACK
        setSavingCandidate(null);
        setAllCandidates(prev => prev.map(c => 
          c.id === active.id ? { ...candidate, _saving: false } : c
        ));
        alert('Failed to update candidate stage. Please try again.');
      }
    } catch (error) {
      // 🚫 ERROR - ROLLBACK
      setSavingCandidate(null);
      setAllCandidates(prev => prev.map(c => 
        c.id === active.id ? { ...candidate, _saving: false } : c
      ));
      alert('Network error. Please try again.');
    }
  };

  // Effects
  useEffect(() => {
    fetchAllCandidatesForStats();
  }, []);

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidates</h1>
          <p className="text-gray-600">Manage candidate applications ({stageStats.all} total)</p>
        </div>
        
        {/* View Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { mode: 'list', label: '📋 List' },
            { mode: 'kanban', label: '🎯 Kanban' }
          ].map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === mode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <CandidateFilters
        search={search}
        setSearch={setSearch}
        stageFilter={stageFilter}
        setStageFilter={setStageFilter}
        jobFilter={jobFilter}
        setJobFilter={setJobFilter}
        stagesWithCounts={stagesWithCounts}
        viewMode={viewMode}
        showStageFilter={viewMode === 'list'}
        totalCandidates={stageStats.all}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        {stagesWithCounts.slice(1).map(stage => (
          <div 
            key={stage.value} 
            className={`bg-white rounded-lg shadow-sm border p-4 text-center cursor-pointer hover:shadow-md transition-shadow ${
              stageFilter === stage.value && viewMode === 'list' ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => viewMode === 'list' && setStageFilter(stage.value)}
          >
            <div className="text-2xl font-bold text-gray-900">{stage.count}</div>
            <div className="text-sm text-gray-600 flex items-center justify-center">
              <span className="mr-1">{stage.icon}</span>
              {stage.label}
            </div>
          </div>
        ))}
      </div>

      {/* 🎨 SAVING NOTIFICATION */}
      {savingCandidate && (
        <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center animate-slideIn">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-3"></div>
          <span className="font-medium">Saving changes...</span>
        </div>
      )}

      {/* 🎉 SUCCESS NOTIFICATION */}
      {savedCandidate && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center animate-slideIn">
          <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center mr-3">
            <span className="text-green-500 text-xs">✓</span>
          </div>
          <span className="font-medium">Candidate updated successfully!</span>
        </div>
      )}

      {/* Content */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading candidates...</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No candidates found.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Candidate', 'Stage', 'Experience', 'Applied', 'Actions'].map(header => (
                        <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {candidates.map(candidate => (
                      <CandidateRow key={candidate.id} candidate={candidate} />
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="bg-white px-4 py-3 border-t flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing {(pagination.page - 1) * pagination.pageSize + 1} to {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} results
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => fetchCandidates(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchCandidates(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading Kanban board...</p>
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
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CandidatesList;
