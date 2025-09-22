import { GripVertical, Upload, File, X, AlertCircle, Settings, FileText, Image, FileIcon } from 'lucide-react';
import { useTheme } from '../../../../contexts/ThemeContext';

const FileUpload = ({ 
  question, 
  onChange, 
  mode = 'builder',
  answer = '',
  onAnswer,
  error 
}) => {
  const { isDark } = useTheme();

  const getFileTypeIcon = (fileTypes) => {
    if (!fileTypes || fileTypes.length === 0) return FileIcon;
    
    if (fileTypes.some(type => type.includes('.pdf'))) return FileText;
    if (fileTypes.some(type => type.includes('image') || type.includes('.jpg') || type.includes('.png'))) return Image;
    if (fileTypes.some(type => type.includes('.doc'))) return FileText;
    return FileIcon;
  };

  const getFileTypeColor = (fileTypes) => {
    if (!fileTypes || fileTypes.length === 0) return 'text-gray-400';
    
    if (fileTypes.some(type => type.includes('.pdf'))) return 'text-red-500';
    if (fileTypes.some(type => type.includes('image') || type.includes('.jpg') || type.includes('.png'))) return 'text-green-500';
    if (fileTypes.some(type => type.includes('.doc'))) return 'text-blue-500';
    return 'text-gray-400';
  };

  // Builder Mode
  if (mode === 'builder') {
    return (
      <div className="space-y-6">
        
        {/* Enhanced Question Header */}
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
            <GripVertical size={14} className="text-gray-400 dark:text-gray-500" />
          </div>
          <span className="inline-flex items-center space-x-2 text-sm font-bold text-pink-700 dark:text-pink-300 bg-pink-100 dark:bg-pink-900/30 px-3 py-1.5 rounded-lg border border-pink-200 dark:border-pink-700">
            <Upload size={14} />
            <span>File Upload</span>
          </span>
        </div>

        {/* Enhanced Question Title */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
            Question Title {question.required && <span className="text-red-500 dark:text-red-400">*</span>}
          </label>
          <input
            type="text"
            value={question.title || ''}
            onChange={(e) => onChange({ ...question, title: e.target.value })}
            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400 focus:border-pink-500 dark:focus:border-pink-400 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="What file would you like candidates to upload?"
          />
        </div>

        {/* Enhanced Accepted File Types */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
            Accepted File Types
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { value: '.pdf', label: 'PDF Documents', icon: FileText, color: 'text-red-500' },
              { value: '.doc,.docx', label: 'Word Documents', icon: FileText, color: 'text-blue-500' },
              { value: '.jpg,.jpeg,.png', label: 'Images (JPG, PNG)', icon: Image, color: 'text-green-500' },
              { value: '.txt', label: 'Text Files', icon: FileIcon, color: 'text-gray-500' }
            ].map(type => {
              const IconComponent = type.icon;
              return (
                <label key={type.value} className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-all group">
                  <input
                    type="checkbox"
                    checked={(question.acceptedTypes || []).includes(type.value)}
                    onChange={(e) => {
                      const currentTypes = question.acceptedTypes || [];
                      const newTypes = e.target.checked 
                        ? [...currentTypes, type.value]
                        : currentTypes.filter(t => t !== type.value);
                      onChange({ ...question, acceptedTypes: newTypes });
                    }}
                    className="w-4 h-4 text-pink-600 dark:text-pink-400 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-pink-500 dark:focus:ring-pink-400"
                  />
                  <IconComponent size={18} className={`${type.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{type.label}</span>
                </label>
              );
            })}
          </div>
          
          {(!question.acceptedTypes || question.acceptedTypes.length === 0) && (
            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle size={16} className="text-amber-600 dark:text-amber-400" />
                <p className="text-amber-700 dark:text-amber-300 text-sm">Select at least one file type to enable uploads</p>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Max File Size */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
            Maximum File Size
          </label>
          <select
            value={question.maxSize || 5}
            onChange={(e) => onChange({ ...question, maxSize: parseInt(e.target.value) })}
            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400 focus:border-pink-500 dark:focus:border-pink-400 transition-all text-gray-900 dark:text-gray-100"
          >
            <option value={1}>1 MB - Small files only</option>
            <option value={5}>5 MB - Standard documents</option>
            <option value={10}>10 MB - Large documents</option>
            <option value={25}>25 MB - High-resolution files</option>
            <option value={50}>50 MB - Very large files</option>
          </select>
        </div>

        {/* Enhanced Settings */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex items-center space-x-3">
              <Settings size={18} className="text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Required Question</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Candidates must upload a file to continue</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={question.required || false}
              onChange={(e) => onChange({ ...question, required: e.target.checked })}
              className="w-4 h-4 text-pink-600 dark:text-pink-400 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-pink-500 dark:focus:ring-pink-400"
            />
          </div>
        </div>

        {/* Enhanced Error Display */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-center space-x-3">
              <AlertCircle size={18} className="text-red-600 dark:text-red-400" />
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Preview Mode
  if (mode === 'preview') {
    const FileTypeIcon = getFileTypeIcon(question.acceptedTypes);
    
    return (
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-50">
          {question.title}
          {question.required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
        </h4>
        
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center bg-gray-50 dark:bg-gray-800 transition-colors">
          <FileTypeIcon className={`mx-auto mb-3 ${getFileTypeColor(question.acceptedTypes)} dark:text-gray-400`} size={40} />
          <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">File upload disabled in preview mode</p>
          {question.acceptedTypes && question.acceptedTypes.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
              Accepted: {question.acceptedTypes.join(', ')}
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-500">Max size: {question.maxSize || 5}MB</p>
        </div>
      </div>
    );
  }

  // Simulation Mode - Interactive
  if (mode === 'simulation') {
    const FileTypeIcon = getFileTypeIcon(question.acceptedTypes);
    
    return (
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-50">
          {question.title}
          {question.required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
        </h4>
        
        <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          answer 
            ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20' 
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-pink-400 dark:hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20'
        }`}>
          <input
            type="file"
            accept={question.acceptedTypes?.join(',')}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                // Check file size
                const maxSizeBytes = (question.maxSize || 5) * 1024 * 1024;
                if (file.size > maxSizeBytes) {
                  alert(`File size exceeds ${question.maxSize || 5}MB limit`);
                  return;
                }
                onAnswer(file.name);
              } else {
                onAnswer('');
              }
            }}
            className="hidden"
            id={`file-${question.id}`}
          />
          
          <label htmlFor={`file-${question.id}`} className="cursor-pointer block">
            {answer ? (
              <div className="space-y-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                  <File className="text-green-600 dark:text-green-400" size={24} />
                </div>
                <div>
                  <p className="font-bold text-green-700 dark:text-green-300 mb-1">File uploaded successfully!</p>
                  <p className="text-sm text-green-600 dark:text-green-400">{answer}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAnswer('');
                  }}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm font-medium"
                >
                  <X size={16} />
                  <span>Remove file</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                  <FileTypeIcon className={`${getFileTypeColor(question.acceptedTypes)} dark:text-gray-400`} size={24} />
                </div>
                <div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {question.acceptedTypes && question.acceptedTypes.length > 0 && (
                      <span className="block mb-1">Accepted: {question.acceptedTypes.join(', ')}</span>
                    )}
                    <span>Max size: {question.maxSize || 5}MB</span>
                  </p>
                </div>
              </div>
            )}
          </label>
        </div>

        {/* Enhanced Error Display */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-center space-x-3">
              <AlertCircle size={18} className="text-red-600 dark:text-red-400" />
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default FileUpload;
