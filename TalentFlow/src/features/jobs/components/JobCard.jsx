import { Link } from 'react-router-dom';
import { Edit, Archive, ArchiveRestore, Briefcase, MapPin, DollarSign, Users } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

const RegularJobCard = ({ job, onEdit, onArchive }) => {
  const { isDark } = useTheme();

  // Safe field access with fallbacks
  const jobTags = job?.tags || job?.skills || [];
  const jobCompany = job?.company || job?.department || 'Company';
  const jobSalary = job?.salary ? 
    (typeof job.salary === 'object' ? 
      `$${job.salary.min?.toLocaleString()} - $${job.salary.max?.toLocaleString()}` : 
      job.salary
    ) : null;

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(job);
  };

  const handleArchiveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onArchive(job);
  };

  const statusConfig = {
    active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', dot: 'bg-green-500' },
    draft: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', dot: 'bg-yellow-500' },
    paused: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-300', dot: 'bg-orange-500' },
    closed: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-300', dot: 'bg-gray-500' }
  };

  const currentStatus = statusConfig[job.status] || statusConfig.active;

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 overflow-hidden">
      
      {/* Status Strip */}
      <div className={`h-1 ${currentStatus.dot}`}></div>
      
      {/* Main clickable area as Link */}
      <Link
        to={`/jobs/${job.id}`}
        className="p-6 cursor-pointer block hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        style={{ textDecoration: 'none' }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            
            {/* Header with Title and Status */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Briefcase className="text-blue-600 dark:text-blue-400" size={16} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                    {job.title || 'Untitled Job'}
                  </h3>
                </div>
                
                {/* Company and Location */}
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center space-x-1">
                    <Users size={14} />
                    <span className="font-medium">{jobCompany}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin size={14} />
                    <span>{job.location || 'Remote'}</span>
                  </div>
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${currentStatus.bg} ${currentStatus.text} border border-current border-opacity-20`}>
                  <div className={`w-2 h-2 rounded-full ${currentStatus.dot} mr-2`}></div>
                  {job.status?.charAt(0).toUpperCase() + job.status?.slice(1) || 'Active'}
                </span>
              </div>
            </div>

            {/* Job Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              
              {/* Job Type and Experience */}
              {(job.type || job.experience) && (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Details</p>
                  <div className="flex flex-wrap gap-2">
                    {job.type && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-md font-medium">
                        {job.type}
                      </span>
                    )}
                    {job.experience && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-md font-medium">
                        {job.experience}
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Salary */}
              {jobSalary && (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Salary</p>
                  <div className="flex items-center space-x-1 text-green-700 dark:text-green-400 font-bold">
                    <DollarSign size={14} />
                    <span>{jobSalary}</span>
                  </div>
                </div>
              )}
              
              {/* Posted Date */}
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Posted</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
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
            
            {/* Description */}
            {job.description && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                  {job.description.length > 150 ? 
                    `${job.description.substring(0, 150)}...` : 
                    job.description
                  }
                </p>
              </div>
            )}
            
            {/* Skills/Tags */}
            {jobTags.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Skills Required</p>
                <div className="flex items-center flex-wrap gap-2">
                  {jobTags.slice(0, 5).map((tag, index) => (
                    <span 
                      key={`${tag}-${index}`} 
                      className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full font-bold border border-blue-200 dark:border-blue-700"
                    >
                      {tag}
                    </span>
                  ))}
                  {jobTags.length > 5 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-bold px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                      +{jobTags.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
      
      {/* Action buttons with strong styling */}
      <div className="px-6 pb-4 flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-4">
        <div className="text-xs font-bold text-gray-400 dark:text-gray-500">
          Order #{job.order || 0}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleEditClick}
            className="group/btn p-2.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
            title="Edit Job"
          >
            <Edit size={16} className="transform group-hover/btn:scale-110 transition-transform" />
          </button>
          
          <button
            onClick={handleArchiveClick}
            className={`group/btn p-2.5 rounded-lg transition-all duration-200 border border-transparent ${
              job.status === 'active'
                ? 'text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:border-orange-200 dark:hover:border-orange-700'
                : 'text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 hover:border-green-200 dark:hover:border-green-700'
            }`}
            title={job.status === 'active' ? 'Archive Job' : 'Unarchive Job'}
          >
            {job.status === 'active' ? 
              <Archive size={16} className="transform group-hover/btn:scale-110 transition-transform" /> : 
              <ArchiveRestore size={16} className="transform group-hover/btn:scale-110 transition-transform" />
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegularJobCard;
