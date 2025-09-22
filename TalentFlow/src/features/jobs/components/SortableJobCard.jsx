import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import { Edit, Archive, ArchiveRestore, GripVertical } from 'lucide-react';

const SortableJobCard = ({ job, onEdit, onArchive }) => {
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

  const jobTags = job?.tags || job?.skills || [];
  const jobCompany = job?.company || job?.department || 'Company';

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
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 ${
        isActive ? 'shadow-lg ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="flex">
        {/* Drag Handle */}
        <div 
          {...attributes}
          {...listeners}
          className="flex items-center p-4 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={20} />
        </div>

        {/* Main clickable content as Link - REMOVED stopPropagation */}
        <Link
          to={`/jobs/${job.id}`}
          className="flex-1 p-6 cursor-pointer block"
          style={{ textDecoration: 'none' }}
        >
          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
          <p className="text-gray-600 text-sm mt-1">{jobCompany} • {job.location}</p>
          
          {jobTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {jobTags.slice(0, 3).map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </Link>

        {/* Action buttons */}
        <div className="flex items-center p-4 space-x-2">
          <button onClick={handleEditClick} className="p-2 text-gray-400 hover:text-blue-600 rounded">
            <Edit size={16} />
          </button>
          <button onClick={handleArchiveClick} className="p-2 text-gray-400 hover:text-orange-600 rounded">
            <Archive size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SortableJobCard;
