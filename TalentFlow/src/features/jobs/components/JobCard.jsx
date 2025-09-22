import { Link } from 'react-router-dom';
import { Edit, Archive, ArchiveRestore } from 'lucide-react';

const RegularJobCard = ({ job, onEdit, onArchive }) => {
  // Safe field access with fallbacks
  const jobTags = job?.tags || job?.skills || [];
  const jobCompany = job?.company || job?.department || 'Company';
  const jobSalary = job?.salary ? 
    (typeof job.salary === 'object' ? 
      `$${job.salary.min?.toLocaleString()} - $${job.salary.max?.toLocaleString()}` : 
      job.salary
    ) : null;

  const handleEditClick = (e) => {
    e.preventDefault(); // ✅ Prevent link navigation
    e.stopPropagation();
    onEdit(job);
  };

  const handleArchiveClick = (e) => {
    e.preventDefault(); // ✅ Prevent link navigation
    e.stopPropagation();
    onArchive(job);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
      {/* Main clickable area as Link - REMOVED stopPropagation */}
      <Link
        to={`/jobs/${job.id}`}
        className="p-6 cursor-pointer block"
        style={{ textDecoration: 'none' }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Title and Status */}
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                {job.title || 'Untitled Job'}
              </h3>
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                job.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {job.status || 'active'}
              </span>
            </div>
            
            {/* Company and Location */}
            <p className="text-gray-600 mt-1 text-sm">
              {jobCompany} • {job.location || 'Remote'}
            </p>
            
            {/* Job Type and Experience */}
            <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500">
              {job.type && <span>{job.type}</span>}
              {job.experience && (
                <>
                  <span>•</span>
                  <span>{job.experience}</span>
                </>
              )}
            </div>
            
            {/* Salary */}
            {jobSalary && (
              <p className="text-gray-700 text-sm mt-2 font-medium">{jobSalary}</p>
            )}
            
            {/* Description */}
            {job.description && (
              <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                {job.description.length > 100 ? 
                  `${job.description.substring(0, 100)}...` : 
                  job.description
                }
              </p>
            )}
            
            {/* Tags/Skills */}
            {jobTags.length > 0 && (
              <div className="flex items-center flex-wrap gap-2 mt-3">
                {jobTags.slice(0, 4).map((tag, index) => (
                  <span 
                    key={`${tag}-${index}`} 
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md font-medium"
                  >
                    {tag}
                  </span>
                ))}
                {jobTags.length > 4 && (
                  <span className="text-xs text-gray-500 font-medium">
                    +{jobTags.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Job Info */}
          <div className="text-right ml-4">
            <p className="text-sm text-gray-500">Order #{job.order || 0}</p>
            <p className="text-sm font-medium text-gray-700">
              {job.createdAt ? 
                new Date(job.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: '2-digit'
                }) : 
                'N/A'
              }
            </p>
          </div>
        </div>
      </Link>
      
      {/* Action buttons - separate from clickable area */}
      <div className="px-6 pb-4 flex justify-end space-x-2">
        <button
          onClick={handleEditClick}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
          title="Edit Job"
        >
          <Edit size={16} />
        </button>
        
        <button
          onClick={handleArchiveClick}
          className={`p-2 rounded-md transition-all ${
            job.status === 'active'
              ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'
              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
          }`}
          title={job.status === 'active' ? 'Archive Job' : 'Unarchive Job'}
        >
          {job.status === 'active' ? <Archive size={16} /> : <ArchiveRestore size={16} />}
        </button>
      </div>
    </div>
  );
};

export default RegularJobCard;
