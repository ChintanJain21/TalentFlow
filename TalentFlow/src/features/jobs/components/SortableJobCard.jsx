import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import { Edit, Archive, ArchiveRestore, GripVertical, Briefcase, MapPin, Users, Calendar } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

const SortableJobCard = ({ job, onEdit, onArchive }) => {
  const { isDark } = useTheme();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isActive,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

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

  // Status configuration with dark mode support
  const statusConfig = {
    active: { 
      bg: 'bg-green-100 dark:bg-green-900/30', 
      text: 'text-green-800 dark:text-green-300', 
      dot: 'bg-green-500',
      border: 'border-green-200 dark:border-green-700'
    },
    draft: { 
      bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
      text: 'text-yellow-800 dark:text-yellow-300', 
      dot: 'bg-yellow-500',
      border: 'border-yellow-200 dark:border-yellow-700'
    },
    paused: { 
      bg: 'bg-orange-100 dark:bg-orange-900/30', 
      text: 'text-orange-800 dark:text-orange-300', 
      dot: 'bg-orange-500',
      border: 'border-orange-200 dark:border-orange-700'
    },
    closed: { 
      bg: 'bg-gray-100 dark:bg-gray-700', 
      text: 'text-gray-800 dark:text-gray-300', 
      dot: 'bg-gray-500',
      border: 'border-gray-200 dark:border-gray-600'
    }
  };

  const currentStatus = statusConfig[job.status] || statusConfig.active;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-xl transition-all duration-200 overflow-hidden ${
        isActive ? 'shadow-xl ring-4 ring-blue-500 dark:ring-blue-400 ring-opacity-50 scale-102 rotate-1' : ''
      } ${
        isDragging ? 'opacity-90 shadow-2xl' : ''
      }`}
    >
      
      {/* Status Strip */}
      <div className={`h-1 ${currentStatus.dot}`}></div>
      
      <div className="flex">
        {/* Enhanced Drag Handle */}
        <div 
          {...attributes}
          {...listeners}
          className={`flex flex-col items-center justify-center p-4 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 cursor-grab active:cursor-grabbing transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
            isActive ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : ''
          }`}
          title="Drag to reorder"
        >
          <GripVertical size={20} className="transform group-hover:scale-110 transition-transform" />
          <div className="flex space-x-0.5 mt-1">
            <div className="w-1 h-1 bg-current rounded-full opacity-50"></div>
            <div className="w-1 h-1 bg-current rounded-full opacity-50"></div>
          </div>
        </div>

        {/* Main Content Area */}
        <Link
          to={`/jobs/${job.id}`}
          className="flex-1 p-6 cursor-pointer block hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
          style={{ textDecoration: 'none' }}
        >
          <div className="space-y-4">
            
            {/* Header with Title and Status */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Briefcase className="text-blue-600 dark:text-blue-400" size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    {job.title || 'Untitled Job'}
                  </h3>
                  
                  {/* Company and Location */}
                  <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300 mt-1">
                    <div className="flex items-center space-x-1">
                      <Users size={12} />
                      <span className="font-medium">{jobCompany}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin size={12} />
                      <span>{job.location || 'Remote'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Status Badge */}
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${currentStatus.bg} ${currentStatus.text} border ${currentStatus.border}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot} mr-1.5`}></div>
                {job.status?.charAt(0).toUpperCase() + job.status?.slice(1) || 'Active'}
              </span>
            </div>

            {/* Job Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              {/* Salary */}
              {jobSalary && (
                <div className="flex items-center space-x-2 text-sm">
                  <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="font-bold text-green-700 dark:text-green-400">{jobSalary}</span>
                </div>
              )}
              
              {/* Posted Date */}
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <Calendar size={14} />
                <span className="font-medium">
                  {job.createdAt ? 
                    new Date(job.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    }) : 
                    'N/A'
                  }
                </span>
              </div>
            </div>
            
            {/* Skills/Tags */}
            {jobTags.length > 0 && (
              <div className="flex items-center flex-wrap gap-2">
                {jobTags.slice(0, 4).map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md font-medium border border-blue-200 dark:border-blue-700"
                  >
                    {tag}
                  </span>
                ))}
                {jobTags.length > 4 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                    +{jobTags.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>
        </Link>

        {/* Enhanced Action Buttons */}
        <div className="flex flex-col items-center justify-center p-4 space-y-2 border-l border-gray-100 dark:border-gray-700">
          <div className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-1">
            #{job.order || 0}
          </div>
          
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

export default SortableJobCard;
