import React from 'react';
import { Link } from 'react-router-dom';

const CandidateRow = ({ candidate }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStageColor = (stage) => {
    const colors = {
      applied: 'bg-blue-100 text-blue-800',
      screen: 'bg-yellow-100 text-yellow-800',
      tech: 'bg-purple-100 text-purple-800',
      offer: 'bg-green-100 text-green-800',
      hired: 'bg-green-200 text-green-900',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
            {candidate.name.split(' ').map(n => n[0]).join('')}
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
      <td className="px-6 py-4">
        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStageColor(candidate.stage)}`}>
          {candidate.stage}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        {candidate.experience} years
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {formatDate(candidate.appliedDate)}
      </td>
      <td className="px-6 py-4 text-sm font-medium">
        <Link
          to={`/candidates/${candidate.id}`}
          className="text-blue-600 hover:text-blue-900 transition-colors"
        >
          View Profile
        </Link>
      </td>
    </tr>
  );
};

export default CandidateRow;
