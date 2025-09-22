import React from 'react';
import { Link } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ExternalLink, Lock, Briefcase, MapPin, DollarSign } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

const KanbanCard = ({ 
  candidate, 
  isOverlay = false, 
  stageColor = 'bg-blue-500', 
  lightColor = 'bg-blue-50 dark:bg-blue-900/20',
  jobs = [],
  getJobInfo
}) => {
  const { isDark } = useTheme();

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

  // Get job info if available
  const jobInfo = getJobInfo ? getJobInfo(candidate.jobId) : null;

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
    let baseClasses = "group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-200 dark:border-gray-700 p-4 transition-all duration-300";
    
    if (isMovable) {
      baseClasses += " cursor-grab active:cursor-grabbing hover:shadow-lg dark:hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-1";
    } else {
      baseClasses += " opacity-75 cursor-not-allowed";
    }
    
    if (isDragging) {
      baseClasses += " shadow-xl dark:shadow-2xl ring-2 ring-blue-400/50 dark:ring-blue-500/50";
    }
    
    if (isOverlay) {
      baseClasses += " shadow-2xl dark:shadow-3xl scale-105 rotate-3";
    }
    
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
            <h4 className="font-bold text-gray-900 dark:text-gray-50 text-sm truncate">
              {candidateName}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {candidateEmail}
            </p>
          </div>
        </div>
        
        {/* Status Icons */}
        <div className="flex items-center space-x-2">
          {/* Lock Icon for Final Stages */}
          {!isMovable && (
            <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 border border-gray-200 dark:border-gray-600">
              <Lock className="w-3 h-3 text-gray-400 dark:text-gray-500" />
            </div>
          )}
          
          {/* Drag Handle */}
          {isMovable && !candidate._saving && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
          )}
        </div>
      </div>

      {/* Job Information */}
      {jobInfo && (
        <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-1 text-xs">
            <Briefcase className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-blue-600 dark:text-blue-400 truncate">
              {jobInfo.title}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {jobInfo.department || jobInfo.company}
          </div>
        </div>
      )}

      {/* Key Information */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center text-gray-600 dark:text-gray-400 space-x-1">
            <span className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
              <span className="text-xs font-bold">{candidateExperience}</span>
            </span>
            <span>years exp</span>
          </div>
          <div className="flex items-center space-x-1 font-bold text-gray-900 dark:text-gray-50">
            <DollarSign className="w-3 h-3" />
            <span>{formatSalary(candidateSalary)}</span>
          </div>
        </div>
        
        <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 space-x-1">
          <MapPin className="w-3 h-3" />
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
                className={`px-2 py-1 ${lightColor} text-xs font-medium rounded-md border border-gray-200/50 dark:border-gray-600/50 text-gray-700 dark:text-gray-300`}
              >
                {skill}
              </span>
            ))}
            {candidateSkills.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-md border border-gray-200 dark:border-gray-600">
                +{candidateSkills.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {new Date(candidateAppliedDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })}
        </div>
        
        <Link
          to={`/candidates/${candidate.id}`}
          className="inline-flex items-center space-x-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <span>View</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Saving Indicator */}
      {candidate._saving && (
        <div className="absolute -top-2 -right-2 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Success Indicator */}
      {candidate._justSaved && (
        <div className="absolute -top-2 -right-2 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
          <span className="text-white text-sm font-bold">✓</span>
        </div>
      )}

      {/* Saving Overlay */}
      {candidate._saving && (
        <div className="absolute inset-0 bg-blue-50/80 dark:bg-blue-900/80 rounded-xl flex items-center justify-center backdrop-blur-[1px]">
          <div className="flex items-center space-x-2 bg-blue-500 text-white px-3 py-1.5 rounded-full shadow-lg">
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-medium">Saving...</span>
          </div>
        </div>
      )}

      {/* Success Flash */}
      {candidate._justSaved && (
        <div className="absolute inset-0 bg-green-50/80 dark:bg-green-900/80 rounded-xl flex items-center justify-center backdrop-blur-[1px] animate-pulse">
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
