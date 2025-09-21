import React, { useRef, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';

const KanbanBoard = ({ 
  candidatesByStage,
  activeCandidate,
  onDragStart,
  onDragOver,
  onDragEnd,
  getValidDropTargets
}) => {
  const scrollContainerRef = useRef(null);
  const dragTimeoutRef = useRef(null);

  // 🔧 FIXED STAGE ORDER - Rejected at the end
  const stages = [
    { 
      value: 'applied', 
      label: 'Applied', 
      icon: '📝',
      color: 'bg-slate-500',
      lightColor: 'bg-slate-50',
      textColor: 'text-slate-700',
      borderColor: 'border-slate-200'
    },
    { 
      value: 'screen', 
      label: 'Screening', 
      icon: '📞',
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200'
    },
    { 
      value: 'tech', 
      label: 'Technical', 
      icon: '💻',
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200'
    },
    { 
      value: 'offer', 
      label: 'Offer', 
      icon: '🎯',
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200'
    },
    { 
      value: 'hired', 
      label: 'Hired', 
      icon: '🎉',
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200'
    },
    { 
      value: 'rejected', 
      label: 'Rejected', 
      icon: '❌',
      color: 'bg-red-500',
      lightColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200'
    }
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // 🚀 SMOOTH AUTO-SCROLL DURING DRAG
  const handleAutoScroll = (clientX) => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const scrollThreshold = 100; // pixels from edge to trigger scroll
    const scrollSpeed = 15; // pixels per frame

    // Clear existing timeout
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }

    // Left edge scrolling
    if (clientX - containerRect.left < scrollThreshold) {
      const scroll = () => {
        container.scrollBy({ left: -scrollSpeed, behavior: 'auto' });
        dragTimeoutRef.current = setTimeout(scroll, 16); // ~60fps
      };
      scroll();
    }
    // Right edge scrolling  
    else if (containerRect.right - clientX < scrollThreshold) {
      const scroll = () => {
        container.scrollBy({ left: scrollSpeed, behavior: 'auto' });
        dragTimeoutRef.current = setTimeout(scroll, 16);
      };
      scroll();
    }
  };

  // 🔧 ENHANCED DRAG HANDLERS
  const enhancedDragStart = (event) => {
    onDragStart(event);
    // Add visual feedback
    document.body.style.cursor = 'grabbing';
  };

  const enhancedDragOver = (event) => {
    // Handle auto-scroll
    if (event.activatorEvent?.clientX) {
      handleAutoScroll(event.activatorEvent.clientX);
    }
    
    onDragOver(event);
  };

  const enhancedDragEnd = (event) => {
    // Clear auto-scroll
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
    
    // Reset cursor
    document.body.style.cursor = '';
    
    onDragEnd(event);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
      document.body.style.cursor = '';
    };
  }, []);

  // Safety checks
  if (!candidatesByStage || typeof candidatesByStage !== 'object') {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-2xl">
        <div className="text-center">
          <div className="animate-bounce text-5xl mb-4">🔄</div>
          <p className="text-gray-600 text-lg font-medium">Loading Kanban board...</p>
          <p className="text-gray-500 text-sm mt-2">Organizing candidates by stage</p>
        </div>
      </div>
    );
  }

  const requiredStages = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];
  const hasValidStructure = requiredStages.every(stage => 
    candidatesByStage.hasOwnProperty(stage) && Array.isArray(candidatesByStage[stage])
  );

  if (!hasValidStructure) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 rounded-2xl border-2 border-red-200">
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-red-600 text-lg font-medium">Data Structure Error</p>
          <p className="text-red-500 text-sm mt-2">Unable to load candidate stages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Summary Stats */}
      <div className="mb-6 bg-white rounded-2xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Pipeline Overview</h2>
          <div className="text-sm text-gray-500">
            Total: {Object.values(candidatesByStage).flat().length} candidates
          </div>
        </div>
        
        <div className="grid grid-cols-6 gap-4">
          {stages.map((stage) => {
            const count = candidatesByStage[stage.value]?.length || 0;
            return (
              <div key={stage.value} className="text-center">
                <div className={`w-12 h-12 ${stage.color} rounded-xl flex items-center justify-center text-white text-lg mx-auto mb-2 shadow-sm`}>
                  {stage.icon}
                </div>
                <div className="font-bold text-lg text-gray-900">{count}</div>
                <div className="text-xs text-gray-500">{stage.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={enhancedDragStart}
        onDragOver={enhancedDragOver}
        onDragEnd={enhancedDragEnd}
      >
        {/* Enhanced Horizontal Scrolling Kanban */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-6 px-1 kanban-scroll"
          style={{
            scrollBehavior: activeCandidate ? 'auto' : 'smooth' // Smooth when not dragging
          }}
        >
          {stages.map((stage, index) => {
            const stageCandidates = candidatesByStage[stage.value] || [];
            const validCandidates = Array.isArray(stageCandidates) ? 
              stageCandidates.filter(candidate => candidate && typeof candidate === 'object' && candidate.id) :
              [];
            
            const isValidTarget = activeCandidate && getValidDropTargets ? 
              getValidDropTargets(activeCandidate.stage).includes(stage.value) : 
              true;
              
            return (
              <div key={stage.value} data-stage={stage.value} className="flex-shrink-0">
                <KanbanColumn
                  stage={stage}
                  candidates={validCandidates}
                  isValidDropTarget={isValidTarget}
                  isDragActive={!!activeCandidate}
                  columnIndex={index} // For debugging
                />
              </div>
            );
          })}
        </div>

        {/* Enhanced Drag Overlay with Better Visual */}
        <DragOverlay 
          dropAnimation={{ 
            duration: 300, 
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' 
          }}
        >
          {activeCandidate ? (
            <div className="transform rotate-2 scale-110 shadow-2xl">
              <KanbanCard 
                candidate={activeCandidate} 
                isOverlay={true}
                stageColor="bg-indigo-500"
                lightColor="bg-indigo-50"
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Scroll Hint */}
      <div className="mt-4 text-center text-sm text-gray-500">
        💡 <span className="font-medium">Tip:</span> Drag candidates near screen edges to auto-scroll horizontally
      </div>
    </div>
  );
};

export default KanbanBoard;
