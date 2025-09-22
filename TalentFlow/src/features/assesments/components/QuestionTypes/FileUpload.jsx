import { GripVertical, Upload, File, X } from 'lucide-react';

const FileUpload = ({ 
  question, 
  onChange, 
  mode = 'builder',
  answer = '',
  onAnswer,
  error 
}) => {
  // Builder Mode
  if (mode === 'builder') {
    return (
      <div className="space-y-4">
        {/* Question Header */}
        <div className="flex items-center space-x-2">
          <GripVertical size={16} className="text-gray-400" />
          <span className="text-sm font-medium text-pink-600 bg-pink-100 px-2 py-1 rounded">
            File Upload
          </span>
        </div>

        {/* Question Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Title {question.required && <span className="text-red-500">*</span>}
          </label>
            <input
              type="text"
              value={question.title || ''}
              onChange={(e) => onChange({ ...question, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder={question.title ? '' : 'Enter your question...'}
            />
        </div>

        {/* Accepted File Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Accepted File Types
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: '.pdf', label: 'PDF' },
              { value: '.doc,.docx', label: 'Word Documents' },
              { value: '.jpg,.jpeg,.png', label: 'Images' },
              { value: '.txt', label: 'Text Files' }
            ].map(type => (
              <label key={type.value} className="flex items-center space-x-2">
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
                  className="text-pink-600 rounded"
                />
                <span className="text-sm text-gray-700">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Max File Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum File Size
          </label>
          <select
            value={question.maxSize || 5}
            onChange={(e) => onChange({ ...question, maxSize: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          >
            <option value={1}>1 MB</option>
            <option value={5}>5 MB</option>
            <option value={10}>10 MB</option>
            <option value={25}>25 MB</option>
          </select>
        </div>

        {/* Settings */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={question.required || false}
              onChange={(e) => onChange({ ...question, required: e.target.checked })}
              className="text-pink-600 rounded"
            />
            <label className="text-sm text-gray-700">Required question</label>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">⚠️ {error}</p>
          </div>
        )}
      </div>
    );
  }

  // Preview Mode
  if (mode === 'preview') {
    return (
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">
          {question.title}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </h4>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
          <Upload className="mx-auto text-gray-400 mb-2" size={32} />
          <p className="text-gray-600">Click to upload or drag and drop</p>
          {question.acceptedTypes && (
            <p className="text-xs text-gray-500 mt-1">
              Accepted: {question.acceptedTypes.join(', ')}
            </p>
          )}
          <p className="text-xs text-gray-500">Max size: {question.maxSize || 5}MB</p>
        </div>
      </div>
    );
  }

  // Simulation Mode - Interactive
  if (mode === 'simulation') {
    return (
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">
          {question.title}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </h4>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-pink-400 hover:bg-pink-50 transition-colors cursor-pointer">
          <input
            type="file"
            accept={question.acceptedTypes?.join(',')}
            onChange={(e) => {
              const file = e.target.files[0];
              onAnswer(file ? file.name : '');
            }}
            className="hidden"
            id={`file-${question.id}`}
          />
          <label htmlFor={`file-${question.id}`} className="cursor-pointer">
            {answer ? (
              <div className="flex items-center justify-center space-x-2">
                <File className="text-pink-600" size={24} />
                <span className="text-gray-700">{answer}</span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onAnswer('');
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div>
                <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-gray-600">Click to upload or drag and drop</p>
                {question.acceptedTypes && (
                  <p className="text-xs text-gray-500 mt-1">
                    Accepted: {question.acceptedTypes.join(', ')}
                  </p>
                )}
                <p className="text-xs text-gray-500">Max size: {question.maxSize || 5}MB</p>
              </div>
            )}
          </label>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">⚠️ {error}</p>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default FileUpload;
