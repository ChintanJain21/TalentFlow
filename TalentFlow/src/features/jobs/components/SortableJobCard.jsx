import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import { Edit, Archive, ArchiveRestore, ExternalLink, GripVertical } from 'lucide-react';

const SortableJobCard = ({ job, onEdit, onArchive, isDragging }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isActive,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 ${
        isActive ? 'shadow-lg ring-2 ring-blue-500 ring-opacity-50' : ''
      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
    >
      <div className="flex items-start justify-between">
        {/* Drag Handle */}
        <div 
          {...attributes}
          {...listeners}
          className="flex items-center mr-4 p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          <GripVertical size={20} />
        </div>

        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <Link 
              to={`/jobs/${job.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors"
            >
              {job.title}
            </Link>
            <span className={`px-2 py-1 text-xs rounded-full ${
              job.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {job.status}
            </span>
          </div>
          
          <p className="text-gray-600 mt-1">{job.company} • {job.location}</p>
          
          {job.salary && (
            <p className="text-gray-500 text-sm mt-1">{job.salary}</p>
          )}
          
          <div className="flex items-center space-x-2 mt-3">
            {job.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                {tag}
              </span>
            ))}
            {job.tags.length > 4 && (
              <span className="text-xs text-gray-500">
                +{job.tags.length - 4} more
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <div className="text-right mr-4">
            <p className="text-sm text-gray-500">Order #{job.order}</p>
            <p className="text-sm font-medium">{new Date(job.createdAt).toLocaleDateString()}</p>
          </div>
          
          {/* Action Buttons */}
          <Link
            to={`/jobs/${job.id}`}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="View Details"
          >
            <ExternalLink size={16} />
          </Link>
          
          <button
            onClick={() => onEdit(job)}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit Job"
          >
            <Edit size={16} />
          </button>
          
          <button
            onClick={() => onArchive(job)}
            className={`p-2 transition-colors ${
              job.status === 'active'
                ? 'text-gray-400 hover:text-orange-600'
                : 'text-gray-400 hover:text-green-600'
            }`}
            title={job.status === 'active' ? 'Archive Job' : 'Unarchive Job'}
          >
            {job.status === 'active' ? <Archive size={16} /> : <ArchiveRestore size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SortableJobCard;
