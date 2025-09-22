import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, MapPin } from 'lucide-react'; // Add icons

const CandidateRow = ({ candidate, jobInfo }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStageColor = (stage) => {
    const colors = {
      applied: 'bg-blue-100 text-blue-800 border-blue-200',
      screen: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      tech: 'bg-purple-100 text-purple-800 border-purple-200',
      offer: 'bg-green-100 text-green-800 border-green-200',
      hired: 'bg-green-200 text-green-900 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // ✅ Fallback job info if not provided
  const safeJobInfo = jobInfo || { 
    title: 'Unknown Job', 
    department: 'Unknown', 
    location: 'Unknown' 
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Candidate Info */}
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
            {candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {candidate.name}
            </div>
            <div className="text-sm text-gray-500">
              {candidate.email}
            </div>
          </div>
        </div>
      </td>

      {/* ✅ NEW: Job Applied Column */}
      <td className="px-6 py-4">
        <div className="text-sm">
          <div className="flex items-center space-x-1 text-blue-600 mb-1">
            <Briefcase size={14} />
            <Link 
              to={`/jobs/${candidate.jobId}`}
              className="font-medium hover:underline"
            >
              {safeJobInfo.title}
            </Link>
          </div>
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Users size={12} />
              <span>{safeJobInfo.department || safeJobInfo.company}</span>
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
        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStageColor(candidate.stage)}`}>
          {candidate.stage}
        </span>
      </td>

      {/* Experience */}
      <td className="px-6 py-4 text-sm text-gray-900">
        {candidate.experience} years
      </td>

      {/* Applied Date */}
      <td className="px-6 py-4 text-sm text-gray-500">
        {formatDate(candidate.appliedDate)}
      </td>

      {/* ✅ ENHANCED Actions */}
      <td className="px-6 py-4 text-sm">
        <div className="flex items-center space-x-3">
          <Link
            to={`/jobs/${candidate.jobId}`}
            className="text-blue-600 hover:text-blue-900 transition-colors"
          >
            View Job
          </Link>
          <span className="text-gray-300">•</span>
          <Link
            to={`/candidates/${candidate.id}`}
            className="text-blue-600 hover:text-blue-900 transition-colors font-medium"
          >
            View Profile
          </Link>
        </div>
      </td>
    </tr>
  );
};

export default CandidateRow;
