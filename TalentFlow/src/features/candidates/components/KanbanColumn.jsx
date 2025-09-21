import React, { useState, useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanCard from './KanbanCard';

const KanbanColumn = ({ 
  stage, 
  candidates = [], 
  isValidDropTarget = true, 
  isDragActive = false 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const CARDS_PER_PAGE = 5;

  const { setNodeRef } = useDroppable({
    id: stage.value,
  });

  const safeCandidates = Array.isArray(candidates) ? 
    candidates.filter(candidate => candidate && candidate.id) : 
    [];

  // 🎯 PAGINATION LOGIC
  const totalCandidates = safeCandidates.length;
  const totalPages = Math.ceil(totalCandidates / CARDS_PER_PAGE);
  
  const visibleCandidates = useMemo(() => {
    if (isExpanded) {
      return safeCandidates; // Show all when expanded
    }
    const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
    const endIndex = startIndex + CARDS_PER_PAGE;
    return safeCandidates.slice(0, endIndex); // Show accumulated cards
  }, [safeCandidates, currentPage, isExpanded]);

  const hasMore = currentPage < totalPages && !isExpanded;
  const canLoadMore = totalCandidates > CARDS_PER_PAGE;

  const loadMore = () => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) setCurrentPage(totalPages); // Show all
  };

  const getColumnClasses = () => {
    let baseClasses = "flex flex-col w-80 bg-white rounded-2xl transition-all duration-300 border shadow-sm";
    
    if (isDragActive) {
      if (isValidDropTarget) {
        baseClasses += " border-green-300 bg-green-50/30 shadow-lg ring-2 ring-green-200/50 scale-[1.02]";
      } else {
        baseClasses += " border-red-300 bg-red-50/30 opacity-60 scale-[0.98]";
      }
    } else {
      baseClasses += ` ${stage.borderColor} hover:shadow-md hover:scale-[1.01]`;
    }
    
    return baseClasses;
  };

  return (
    <div 
      ref={setNodeRef}
      className={getColumnClasses()}
    >
      {/* Modern Header */}
      <div className={`px-5 py-4 ${stage.lightColor} border-b ${stage.borderColor} rounded-t-2xl`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-9 h-9 ${stage.color} rounded-xl flex items-center justify-center text-white text-sm mr-3 shadow-sm`}>
              {stage.icon}
            </div>
            <div>
              <h3 className={`font-bold text-gray-900 text-base`}>{stage.label}</h3>
              <p className="text-xs text-gray-500">
                {isExpanded || totalCandidates <= CARDS_PER_PAGE 
                  ? `${totalCandidates} total`
                  : `${visibleCandidates.length} of ${totalCandidates}`
                }
              </p>
            </div>
          </div>
          
          {/* Count Badge */}
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1.5 ${stage.color} text-white rounded-lg text-sm font-bold shadow-sm`}>
              {totalCandidates}
            </div>
            
            {/* Drop Indicator */}
            {isDragActive && (
              <div className="animate-pulse">
                {isValidDropTarget ? (
                  <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-sm">✓</span>
                  </div>
                ) : (
                  <div className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-sm">✕</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cards Container with Custom Scrolling */}
      <div className="flex-1 relative">
        <div className={`p-4 space-y-3 ${
          isExpanded 
            ? 'max-h-[calc(100vh-250px)] overflow-y-auto' 
            : 'min-h-[400px]'
        } custom-scrollbar`}>
          
          <SortableContext items={visibleCandidates.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {visibleCandidates.map((candidate, index) => (
              <div
                key={candidate.id}
                className="animate-fadeIn"
                style={{
                  animationDelay: `${(index % CARDS_PER_PAGE) * 50}ms`,
                  animationFillMode: 'both'
                }}
              >
                <KanbanCard 
                  candidate={candidate} 
                  stageColor={stage.color}
                  lightColor={stage.lightColor}
                />
              </div>
            ))}
          </SortableContext>
          
          {/* Load More & Expand Controls */}
          {canLoadMore && (
            <div className="pt-2 space-y-2">
              {/* Load More Button */}
              {hasMore && !isExpanded && (
                <button
                  onClick={loadMore}
                  className={`w-full py-3 ${stage.lightColor} ${stage.textColor} rounded-xl border-2 border-dashed ${stage.borderColor} hover:${stage.color} hover:text-white transition-all duration-200 text-sm font-medium flex items-center justify-center space-x-2 group`}
                >
                  <span>Load More ({totalCandidates - visibleCandidates.length})</span>
                  <svg className="w-4 h-4 transform group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
              )}
              
              {/* View All / Collapse Toggle */}
              {totalCandidates > CARDS_PER_PAGE && (
                <button
                  onClick={toggleExpanded}
                  className={`w-full py-2 text-xs font-medium ${stage.textColor} hover:${stage.color} hover:text-white transition-colors rounded-lg border ${stage.borderColor} hover:bg-current`}
                >
                  {isExpanded ? '🔼 Collapse' : `📋 View All ${totalCandidates}`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Elegant Empty State */}
        {totalCandidates === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className={`w-20 h-20 ${stage.lightColor} rounded-3xl flex items-center justify-center mb-4 border-2 border-dashed ${stage.borderColor}`}>
              <span className={`text-3xl opacity-40`}>{stage.icon}</span>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-2">No candidates in {stage.label.toLowerCase()}</p>
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              {isDragActive && isValidDropTarget 
                ? "Drop candidates here" 
                : "Candidates will appear here when they reach this stage"
              }
            </p>
          </div>
        )}
      </div>

      {/* Progress Indicator for Large Lists */}
      {isExpanded && totalCandidates > 10 && (
        <div className={`px-4 py-2 ${stage.lightColor} border-t ${stage.borderColor} rounded-b-2xl`}>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Showing all candidates</span>
            <button
              onClick={() => {
                const container = document.querySelector(`[data-stage="${stage.value}"] .custom-scrollbar`);
                container?.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ↑ Back to top
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanColumn;
