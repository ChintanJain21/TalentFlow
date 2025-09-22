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
  const CARDS_PER_PAGE = 5;

  const { setNodeRef } = useDroppable({
    id: stage.value,
  });

  const safeCandidates = Array.isArray(candidates) ? 
    candidates.filter(candidate => candidate && candidate.id) : 
    [];

  // 📊 PAGINATION CALCULATIONS
  const totalCandidates = safeCandidates.length;
  const totalPages = Math.ceil(totalCandidates / CARDS_PER_PAGE);
  const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
  const endIndex = startIndex + CARDS_PER_PAGE;
  const visibleCandidates = safeCandidates.slice(startIndex, endIndex);
  
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // 📄 PAGE NAVIGATION
  const goToNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset to page 1 when candidates change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [candidates.length]);

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
                {totalCandidates > 0 
                  ? `${startIndex + 1}-${Math.min(endIndex, totalCandidates)} of ${totalCandidates}`
                  : '0 candidates'
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

      {/* Cards Container - Fixed Height */}
      <div className="flex-1 p-4 space-y-3 h-[400px] overflow-hidden">
        {totalCandidates > 0 ? (
          <>
            {/* Cards */}
            <SortableContext items={visibleCandidates.map(c => c.id)} strategy={verticalListSortingStrategy}>
              {visibleCandidates.map((candidate, index) => (
                <div
                  key={candidate.id}
                  className="animate-fadeIn"
                  style={{
                    animationDelay: `${index * 50}ms`,
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
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className={`w-20 h-20 ${stage.lightColor} rounded-3xl flex items-center justify-center mb-4 border-2 border-dashed ${stage.borderColor}`}>
              <span className={`text-3xl opacity-40`}>{stage.icon}</span>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-2">No candidates in {stage.label.toLowerCase()}</p>
            <p className="text-xs text-gray-400 text-center leading-relaxed max-w-32">
              {isDragActive && isValidDropTarget 
                ? "Drop candidates here" 
                : "Candidates will appear here when they reach this stage"
              }
            </p>
          </div>
        )}
      </div>

      {/* 📄 PAGINATION FOOTER (Only show if more than 5 candidates) */}
      {totalCandidates > CARDS_PER_PAGE && (
        <div className={`px-4 py-3 ${stage.lightColor} border-t ${stage.borderColor} rounded-b-2xl`}>
          <div className="flex items-center justify-between">
            {/* Page Info */}
            <div className="text-xs text-gray-600">
              Page {currentPage} of {totalPages}
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center space-x-1">
              {/* Previous Button */}
              <button
                onClick={goToPrevPage}
                disabled={!hasPrevPage}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                  hasPrevPage 
                    ? `${stage.color} text-white hover:opacity-80` 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Page Numbers (show up to 3 pages) */}
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage <= 2) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 1) {
                    pageNum = totalPages - 2 + i;
                  } else {
                    pageNum = currentPage - 1 + i;
                  }

                  if (pageNum < 1 || pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
                        pageNum === currentPage
                          ? `${stage.color} text-white`
                          : `text-gray-600 hover:${stage.lightColor}`
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={goToNextPage}
                disabled={!hasNextPage}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                  hasNextPage 
                    ? `${stage.color} text-white hover:opacity-80` 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Quick Jump (for columns with many candidates) */}
          {totalPages > 5 && (
            <div className="mt-2 flex items-center justify-center">
              <select
                value={currentPage}
                onChange={(e) => goToPage(parseInt(e.target.value))}
                className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {Array.from({ length: totalPages }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Page {i + 1}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KanbanColumn;
