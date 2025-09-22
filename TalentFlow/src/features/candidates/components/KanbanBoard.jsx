import React, { useRef, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Users, TrendingUp, AlertCircle } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';

const KanbanBoard = ({ 
  candidatesByStage,
  activeCandidate,
  onDragStart,
  onDragOver,
  onDragEnd,
  getValidDropTargets,
  jobs = [],
  getJobInfo
}) => {
  const { isDark } = useTheme();
  const scrollContainerRef = useRef(null);
  const dragTimeoutRef = useRef(null);

  // Enhanced stage definitions with dark mode support
  const stages = [
    { 
      value: 'applied', 
      label: 'Applied', 
      icon: '🎯',
      color: 'bg-gray-500',
      lightColor: 'bg-gray-50 dark:bg-gray-800',
      textColor: 'text-gray-700 dark:text-gray-300',
      borderColor: 'border-gray-200 dark:border-gray-700',
      gradient: 'from-gray-500 to-gray-600'
    },
    { 
      value: 'screen', 
      label: 'Screening', 
      icon: '👋',
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50 dark:bg-amber-900/10',
      textColor: 'text-amber-700 dark:text-amber-300',
      borderColor: 'border-amber-200 dark:border-amber-700',
      gradient: 'from-amber-500 to-orange-500'
    },
    { 
      value: 'tech', 
      label: 'Technical', 
      icon: '⚡',
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50 dark:bg-purple-900/10',
      textColor: 'text-purple-700 dark:text-purple-300',
      borderColor: 'border-purple-200 dark:border-purple-700',
      gradient: 'from-purple-500 to-violet-600'
    },
    { 
      value: 'offer', 
      label: 'Offer', 
      icon: '🎉',
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50 dark:bg-emerald-900/10',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      borderColor: 'border-emerald-200 dark:border-emerald-700',
      gradient: 'from-emerald-500 to-green-600'
    },
    { 
      value: 'hired', 
      label: 'Hired', 
      icon: '🚀',
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50 dark:bg-blue-900/10',
      textColor: 'text-blue-700 dark:text-blue-300',
      borderColor: 'border-blue-200 dark:border-blue-700',
      gradient: 'from-blue-500 to-cyan-600'
    },
    { 
      value: 'rejected', 
      label: 'Rejected', 
      icon: '💔',
      color: 'bg-red-500',
      lightColor: 'bg-red-50 dark:bg-red-900/10',
      textColor: 'text-red-700 dark:text-red-300',
      borderColor: 'border-red-200 dark:border-red-700',
      gradient: 'from-red-500 to-pink-600'
    }
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Smooth auto-scroll during drag
  const handleAutoScroll = (clientX) => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const scrollThreshold = 100;
    const scrollSpeed = 15;

    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }

    if (clientX - containerRect.left < scrollThreshold) {
      const scroll = () => {
        container.scrollBy({ left: -scrollSpeed, behavior: 'auto' });
        dragTimeoutRef.current = setTimeout(scroll, 16);
      };
      scroll();
    } else if (containerRect.right - clientX < scrollThreshold) {
      const scroll = () => {
        container.scrollBy({ left: scrollSpeed, behavior: 'auto' });
        dragTimeoutRef.current = setTimeout(scroll, 16);
      };
      scroll();
    }
  };

  // Enhanced drag handlers
  const enhancedDragStart = (event) => {
    onDragStart(event);
    document.body.style.cursor = 'grabbing';
  };

  const enhancedDragOver = (event) => {
    if (event.activatorEvent?.clientX) {
      handleAutoScroll(event.activatorEvent.clientX);
    }
    onDragOver(event);
  };

  const enhancedDragEnd = (event) => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
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
      <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-bold">Loading Kanban board...</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Organizing candidates by stage</p>
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
      <div className="flex items-center justify-center h-96 bg-red-50 dark:bg-red-900/20 rounded-2xl border-2 border-red-200 dark:border-red-800 transition-colors">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 text-lg font-bold">Data Structure Error</p>
          <p className="text-red-500 dark:text-red-500 text-sm mt-2">Unable to load candidate stages</p>
        </div>
      </div>
    );
  }

  const totalCandidates = Object.values(candidatesByStage).flat().length;

  return (
    <div className="w-full">
      
      {/* Enhanced Summary Stats */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Pipeline Overview</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Candidate hiring funnel</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl border border-blue-200 dark:border-blue-800">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
              {totalCandidates} Total
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-6 gap-4">
          {stages.map((stage) => {
            const count = candidatesByStage[stage.value]?.length || 0;
            const percentage = totalCandidates > 0 ? Math.round((count / totalCandidates) * 100) : 0;
            
            return (
              <div key={stage.value} className="text-center group cursor-pointer">
                <div className={`w-14 h-14 bg-gradient-to-r ${stage.gradient} rounded-xl flex items-center justify-center text-white text-lg mx-auto mb-3 shadow-md group-hover:shadow-lg transform group-hover:scale-105 transition-all`}>
                  {stage.icon}
                </div>
                <div className="font-bold text-2xl text-gray-900 dark:text-gray-50">{count}</div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{stage.label}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500">{percentage}%</div>
              </div>
            );
          })}
        </div>

        {/* Pipeline Progress Bar */}
        <div className="mt-6 bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div className="flex h-full">
            {stages.slice(0, -1).map((stage, index) => {
              const count = candidatesByStage[stage.value]?.length || 0;
              const percentage = totalCandidates > 0 ? (count / totalCandidates) * 100 : 0;
              
              return (
                <div
                  key={stage.value}
                  className={`bg-gradient-to-r ${stage.gradient} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              );
            })}
          </div>
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
          className="flex gap-6 overflow-x-auto pb-6 px-1"
          style={{
            scrollBehavior: activeCandidate ? 'auto' : 'smooth',
            scrollbarWidth: 'thin'
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
                  columnIndex={index}
                  jobs={jobs}
                  getJobInfo={getJobInfo}
                />
              </div>
            );
          })}
        </div>

        {/* Enhanced Drag Overlay */}
        <DragOverlay 
          dropAnimation={{ 
            duration: 300, 
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' 
          }}
        >
          {activeCandidate ? (
            <div className="transform rotate-2 scale-110 shadow-2xl opacity-90">
              <KanbanCard 
                candidate={activeCandidate} 
                isOverlay={true}
                stageColor="bg-indigo-500"
                lightColor="bg-indigo-50 dark:bg-indigo-900/20"
                jobs={jobs}
                getJobInfo={getJobInfo}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Enhanced Scroll Hint */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl border border-blue-200 dark:border-blue-800 text-sm">
          <span>💡</span>
          <span className="font-medium">Tip:</span>
          <span>Drag candidates near screen edges to auto-scroll • Drag to any valid stage</span>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .kanban-scroll::-webkit-scrollbar {
          height: 8px;
        }
        .kanban-scroll::-webkit-scrollbar-track {
          background: ${isDark ? '#374151' : '#f3f4f6'};
          border-radius: 4px;
        }
        .kanban-scroll::-webkit-scrollbar-thumb {
          background: ${isDark ? '#6b7280' : '#d1d5db'};
          border-radius: 4px;
        }
        .kanban-scroll::-webkit-scrollbar-thumb:hover {
          background: ${isDark ? '#9ca3af' : '#9ca3af'};
        }
      `}</style>
    </div>
  );
};

export default KanbanBoard;
