import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, MapPin, ExternalLink, Eye } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

const CandidateRow = ({ candidate, jobInfo }) => {
  const { isDark } = useTheme();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStageColor = (stage) => {
    const colors = {
      applied: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600',
      screen: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
      tech: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700',
      offer: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700',
      hired: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700',
      rejected: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700'
    };
    return colors[stage] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
  };

  const getStageIcon = (stage) => {
    const icons = {
      applied: '🎯',
      screen: '👋',
      tech: '⚡',
      offer: '🎉',
      hired: '🚀',
      rejected: '💔'
    };
    return icons[stage] || '📋';
  };

  // Fallback job info if not provided
  const safeJobInfo = jobInfo || { 
    title: 'Unknown Job', 
    department: 'Unknown', 
    location: 'Unknown' 
  };

  // Safe candidate data access
  const safeName = candidate?.name || 'Unknown';
  const safeEmail = candidate?.email || 'No email';
  const safeStage = candidate?.stage || 'applied';
  const safeExperience = candidate?.experience || 0;
  const safeAppliedDate = candidate?.appliedDate || candidate?.createdAt;

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      
      {/* Candidate Info */}
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {safeName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="ml-4">
            <div className="text-sm font-bold text-gray-900 dark:text-gray-50">
              {safeName}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {safeEmail}
            </div>
          </div>
        </div>
      </td>

      {/* Job Applied Column */}
      <td className="px-6 py-4">
        <div className="text-sm">
          <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 mb-1">
            <Briefcase size={14} />
            <Link 
              to={`/jobs/${candidate?.jobId || 1}`}
              className="font-bold hover:underline transition-colors hover:text-blue-700 dark:hover:text-blue-300"
            >
              {safeJobInfo.title}
            </Link>
          </div>
          <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Users size={12} />
              <span className="font-medium">{safeJobInfo.department || safeJobInfo.company}</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <MapPin size={12} />
              <span>{safeJobInfo.location}</span>
            </div>
          </div>
        </div>
      </td>

      {/* Stage */}
      <td className="px-6 py-4">
        <span className={`inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-bold rounded-full border ${getStageColor(safeStage)}`}>
          <span>{getStageIcon(safeStage)}</span>
          <span className="capitalize">{safeStage}</span>
        </span>
      </td>

      {/* Experience */}
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{safeExperience}</span>
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-50">
            {safeExperience} year{safeExperience !== 1 ? 's' : ''}
          </span>
        </div>
      </td>

      {/* Applied Date */}
      <td className="px-6 py-4">
        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          {formatDate(safeAppliedDate)}
        </div>
      </td>

      {/* Enhanced Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <Link
            to={`/jobs/${candidate?.jobId || 1}`}
            className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors border border-blue-200 dark:border-blue-800"
          >
            <ExternalLink size={12} />
            <span>Job</span>
          </Link>
          
          <Link
            to={`/candidates/${candidate?.id || 1}`}
            className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
          >
            <Eye size={12} />
            <span>Profile</span>
          </Link>
        </div>
      </td>
    </tr>
  );
};

export default CandidateRow;
