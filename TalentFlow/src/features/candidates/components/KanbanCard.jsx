import React from 'react';
import { Link } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const KanbanCard = ({ candidate, isOverlay = false, stageColor = 'bg-blue-500', lightColor = 'bg-blue-50' }) => {
  if (!candidate || typeof candidate !== 'object') {
    return null;
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: candidate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  const isMovable = candidate.stage !== 'hired' && candidate.stage !== 'rejected';

  // Safe field access
  const candidateName = candidate.name || 'Unknown';
  const candidateEmail = candidate.email || '';
  const candidateExperience = candidate.experience || 0;
  const candidateSalary = candidate.salary || 0;
  const candidateLocation = candidate.location || 'Not specified';
  const candidateSkills = Array.isArray(candidate.skills) ? candidate.skills : [];
  const candidateAppliedDate = candidate.appliedDate || new Date().toISOString();

  const getInitials = (name) => {
    return name.split(' ')
      .map(n => n[0] || '')
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const formatSalary = (salary) => {
    if (salary >= 1000000) return `$${(salary / 1000000).toFixed(1)}M`;
    if (salary >= 1000) return `$${(salary / 1000).toFixed(0)}k`;
    return `$${salary}`;
  };

  // 🎨 SAVING STATE CLASSES
  const getSavingClasses = () => {
    if (candidate._saving) {
      return 'saving-candidate';
    }
    if (candidate._justSaved) {
      return 'saved-candidate';
    }
    return '';
  };

  const getCardClasses = () => {
    let baseClasses = "group relative bg-white rounded-xl shadow-sm border-2 border-gray-200 p-4 transition-all duration-300";
    
    if (isMovable) {
      baseClasses += " cursor-grab active:cursor-grabbing hover:shadow-lg hover:border-gray-300 hover:-translate-y-1";
    } else {
      baseClasses += " opacity-75 cursor-not-allowed";
    }
    
    if (isDragging) {
      baseClasses += " shadow-xl ring-2 ring-blue-400/50";
    }
    
    if (isOverlay) {
      baseClasses += " shadow-2xl scale-105 rotate-3";
    }
    
    // 🎨 ADD SAVING CLASSES
    baseClasses += ` ${getSavingClasses()}`;
    
    return baseClasses;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isMovable ? listeners : {})}
      className={getCardClasses()}
    >
      {/* Header with Avatar and Name */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center flex-1 min-w-0">
          <div className={`w-10 h-10 ${stageColor} rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0`}>
            {getInitials(candidateName)}
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm truncate">
              {candidateName}
            </h4>
            <p className="text-xs text-gray-500 truncate">
              {candidateEmail}
            </p>
          </div>
        </div>
        
        {/* Status Icons */}
        <div className="flex items-center space-x-2">
          {/* Lock Icon for Final Stages */}
          {!isMovable && (
            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs">🔒</span>
            </div>
          )}
          
          {/* Drag Handle */}
          {isMovable && !candidate._saving && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM7 8a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM7 14a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM13 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM13 8a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM13 14a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"></path>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Key Information */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center text-gray-600">
            <span className="mr-1">💼</span>
            <span>{candidateExperience}y exp</span>
          </div>
          <div className="font-semibold text-gray-900">
            {formatSalary(candidateSalary)}
          </div>
        </div>
        
        <div className="flex items-center text-xs text-gray-600">
          <span className="mr-1">📍</span>
          <span className="truncate">{candidateLocation.split(',')[0]}</span>
        </div>
      </div>

      {/* Skills Tags */}
      {candidateSkills.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {candidateSkills.slice(0, 3).map((skill, index) => (
              <span 
                key={index} 
                className={`px-2 py-1 ${lightColor} text-xs font-medium rounded-md border border-gray-200/50`}
              >
                {skill}
              </span>
            ))}
            {candidateSkills.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md border border-gray-200">
                +{candidateSkills.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          {new Date(candidateAppliedDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })}
        </div>
        
        <Link
          to={`/candidates/${candidate.id}`}
          className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          View →
        </Link>
      </div>

      {/* 🎨 SAVING INDICATOR */}
      {candidate._saving && (
        <div className="absolute -top-2 -right-2 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* 🎉 SUCCESS INDICATOR */}
      {candidate._justSaved && (
        <div className="absolute -top-2 -right-2 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
          <span className="text-white text-sm font-bold">✓</span>
        </div>
      )}

      {/* 🎨 SAVING OVERLAY */}
      {candidate._saving && (
        <div className="absolute inset-0 bg-blue-50/80 rounded-xl flex items-center justify-center backdrop-blur-[1px]">
          <div className="flex items-center space-x-2 bg-blue-500 text-white px-3 py-1.5 rounded-full shadow-lg">
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-medium">Saving...</span>
          </div>
        </div>
      )}

      {/* 🎉 SUCCESS FLASH */}
      {candidate._justSaved && (
        <div className="absolute inset-0 bg-green-50/80 rounded-xl flex items-center justify-center backdrop-blur-[1px] animate-pulse">
          <div className="flex items-center space-x-2 bg-green-500 text-white px-3 py-1.5 rounded-full shadow-lg">
            <span className="text-sm">✓</span>
            <span className="text-xs font-medium">Saved!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanCard;
