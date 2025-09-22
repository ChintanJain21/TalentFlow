import React, { useState, useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ChevronLeft, ChevronRight, MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import KanbanCard from './KanbanCard';

const KanbanColumn = ({ 
  stage, 
  candidates = [], 
  isValidDropTarget = true, 
  isDragActive = false,
  jobs = [],
  getJobInfo
}) => {
  const { isDark } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const CARDS_PER_PAGE = 5;

  const { setNodeRef } = useDroppable({
    id: stage.value,
  });

  const safeCandidates = Array.isArray(candidates) ? 
    candidates.filter(candidate => candidate && candidate.id) : 
    [];

  // Pagination calculations
  const totalCandidates = safeCandidates.length;
  const totalPages = Math.ceil(totalCandidates / CARDS_PER_PAGE);
  const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
  const endIndex = startIndex + CARDS_PER_PAGE;
  const visibleCandidates = safeCandidates.slice(startIndex, endIndex);
  
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // Page navigation
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
    let baseClasses = "flex flex-col w-80 bg-white dark:bg-gray-800 rounded-2xl transition-all duration-300 border shadow-sm";
    
    if (isDragActive) {
      if (isValidDropTarget) {
        baseClasses += " border-green-300 dark:border-green-600 bg-green-50/30 dark:bg-green-900/20 shadow-lg ring-2 ring-green-200/50 dark:ring-green-500/30 scale-[1.02]";
      } else {
        baseClasses += " border-red-300 dark:border-red-600 bg-red-50/30 dark:bg-red-900/20 opacity-60 scale-[0.98]";
      }
    } else {
      baseClasses += ` border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-xl hover:scale-[1.01]`;
    }
    
    return baseClasses;
  };

  const getHeaderClasses = () => {
    return `px-5 py-4 ${stage.lightColor} border-b border-gray-200 dark:border-gray-700 rounded-t-2xl`;
  };

  const getFooterClasses = () => {
    return `px-4 py-3 ${stage.lightColor} border-t border-gray-200 dark:border-gray-700 rounded-b-2xl`;
  };

  return (
    <div 
      ref={setNodeRef}
      className={getColumnClasses()}
    >
      
      {/* Enhanced Header */}
      <div className={getHeaderClasses()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-9 h-9 bg-gradient-to-r ${stage.gradient || stage.color} rounded-xl flex items-center justify-center text-white text-sm mr-3 shadow-md`}>
              {stage.icon}
            </div>
            <div>
              <h3 className={`font-bold text-gray-900 dark:text-gray-50 text-base`}>{stage.label}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {totalCandidates > 0 
                  ? `${startIndex + 1}-${Math.min(endIndex, totalCandidates)} of ${totalCandidates}`
                  : '0 candidates'
                }
              </p>
            </div>
          </div>
          
          {/* Count Badge and Drop Indicator */}
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1.5 bg-gradient-to-r ${stage.gradient || stage.color} text-white rounded-lg text-sm font-bold shadow-md`}>
              {totalCandidates}
            </div>
            
            {/* Enhanced Drop Indicator */}
            {isDragActive && (
              <div className="animate-pulse">
                {isValidDropTarget ? (
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <XCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cards Container - Fixed Height with Better Scrolling */}
      <div className="flex-1 p-4 space-y-3 h-[400px] overflow-hidden">
        {totalCandidates > 0 ? (
          <>
            {/* Cards with Fade-in Animation */}
            <SortableContext items={visibleCandidates.map(c => c.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
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
                      jobs={jobs}
                      getJobInfo={getJobInfo}
                    />
                  </div>
                ))}
              </div>
            </SortableContext>
          </>
        ) : (
          /* Enhanced Empty State */
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className={`w-20 h-20 ${stage.lightColor} rounded-3xl flex items-center justify-center mb-4 border-2 border-dashed border-gray-300 dark:border-gray-600`}>
              <span className={`text-3xl opacity-40`}>{stage.icon}</span>
            </div>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">
              No candidates in {stage.label.toLowerCase()}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center leading-relaxed max-w-32">
              {isDragActive && isValidDropTarget 
                ? "Drop candidates here" 
                : "Candidates will appear here when they reach this stage"
              }
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Pagination Footer */}
      {totalCandidates > CARDS_PER_PAGE && (
        <div className={getFooterClasses()}>
          <div className="flex items-center justify-between">
            
            {/* Enhanced Page Info */}
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </div>

            {/* Enhanced Navigation Controls */}
            <div className="flex items-center space-x-1">
              
              {/* Previous Button */}
              <button
                onClick={goToPrevPage}
                disabled={!hasPrevPage}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all transform hover:scale-105 ${
                  hasPrevPage 
                    ? `bg-gradient-to-r ${stage.gradient || stage.color} text-white hover:shadow-md shadow-sm` 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Enhanced Page Numbers */}
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
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all transform hover:scale-105 ${
                        pageNum === currentPage
                          ? `bg-gradient-to-r ${stage.gradient || stage.color} text-white shadow-md`
                          : `text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700`
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Show more pages indicator */}
              {totalPages > 3 && currentPage < totalPages - 1 && (
                <div className="flex items-center justify-center w-8 h-8">
                  <MoreHorizontal className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </div>
              )}

              {/* Next Button */}
              <button
                onClick={goToNextPage}
                disabled={!hasNextPage}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all transform hover:scale-105 ${
                  hasNextPage 
                    ? `bg-gradient-to-r ${stage.gradient || stage.color} text-white hover:shadow-md shadow-sm` 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Enhanced Quick Jump for Many Pages */}
          {totalPages > 5 && (
            <div className="mt-3 flex items-center justify-center">
              <select
                value={currentPage}
                onChange={(e) => goToPage(parseInt(e.target.value))}
                className="text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100 font-medium"
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

      {/* Custom Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default KanbanColumn;
