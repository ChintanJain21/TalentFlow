import { useState, useRef } from 'react';
import { GripVertical, Upload, File, X, CheckCircle } from 'lucide-react';

const FileUpload = ({ 
  question, 
  onChange, 
  mode = 'builder',
  answer = null,
  onAnswer,
  error 
}) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const allowedTypes = question.validation?.allowedTypes || ['pdf', 'doc', 'docx', 'txt'];
  const maxSize = question.validation?.maxSize || '5MB';

  // Helper to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper to check file type
  const isValidFileType = (file) => {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    return allowedTypes.includes(fileExtension);
  };

  // Helper to check file size (convert maxSize string to bytes)
  const isValidFileSize = (file) => {
    const maxSizeBytes = parseFloat(maxSize) * (maxSize.includes('MB') ? 1024 * 1024 : 1024);
    return file.size <= maxSizeBytes;
  };

  const handleFileSelect = (files) => {
    const file = files[0];
    if (!file) return;

    if (!isValidFileType(file)) {
      alert(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
      return;
    }

    if (!isValidFileSize(file)) {
      alert(`File too large. Maximum size: ${maxSize}`);
      return;
    }

    // For demo purposes, we'll store file info (in real app, you'd upload to server)
    const fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      id: Date.now().toString()
    };

    onAnswer?.(fileInfo);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files);
  };

  const removeFile = () => {
    onAnswer?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Builder Mode
  if (mode === 'builder') {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <GripVertical size={16} className="text-gray-400" />
          <span className="text-sm font-medium text-pink-600 bg-pink-100 px-2 py-1 rounded">
            File Upload
          </span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Title {question.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={question.title || ''}
            onChange={(e) => onChange({ ...question, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your question..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instructions
          </label>
          <textarea
            value={question.instructions || ''}
            onChange={(e) => onChange({ ...question, instructions: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="2"
            placeholder="Additional instructions for file upload..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum File Size
            </label>
            <select
              value={maxSize}
              onChange={(e) => onChange({ 
                ...question, 
                validation: { 
                  ...question.validation, 
                  maxSize: e.target.value 
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="1MB">1 MB</option>
              <option value="5MB">5 MB</option>
              <option value="10MB">10 MB</option>
              <option value="25MB">25 MB</option>
              <option value="50MB">50 MB</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allowed File Types
            </label>
            <div className="space-y-2">
              {['pdf', 'doc', 'docx', 'txt', 'jpg', 'png', 'zip'].map(type => (
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={allowedTypes.includes(type)}
                    onChange={(e) => {
                      const newTypes = e.target.checked 
                        ? [...allowedTypes, type]
                        : allowedTypes.filter(t => t !== type);
                      onChange({ 
                        ...question, 
                        validation: { 
                          ...question.validation, 
                          allowedTypes: newTypes 
                        }
                      });
                    }}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">.{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={question.required || false}
            onChange={(e) => onChange({ ...question, required: e.target.checked })}
            className="text-blue-600"
          />
          <label className="text-sm text-gray-700">Required question</label>
        </div>
      </div>
    );
  }

  // Preview Mode
  if (mode === 'preview') {
    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">
          {question.title}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </h4>
        
        {question.instructions && (
          <p className="text-sm text-gray-600">{question.instructions}</p>
        )}
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
          <Upload size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">File upload area (preview)</p>
          <p className="text-xs text-gray-500 mt-2">
            Max size: {maxSize} • Allowed: {allowedTypes.join(', ')}
          </p>
        </div>
      </div>
    );
  }

  // Runtime Mode
  if (mode === 'runtime'|| mode==='simulation') {
    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">
          {question.title}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </h4>
        
        {question.instructions && (
          <p className="text-sm text-gray-600">{question.instructions}</p>
        )}
        
        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}
        
        {!answer ? (
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging 
                ? 'border-blue-400 bg-blue-50' 
                : error 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload size={32} className={`mx-auto mb-2 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
            <p className="text-sm text-gray-600 mb-2">
              {isDragging ? 'Drop your file here' : 'Drag and drop your file here, or'}
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              browse files
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              accept={allowedTypes.map(type => `.${type}`).join(',')}
              className="hidden"
            />
            
            <p className="text-xs text-gray-500 mt-3">
              Max size: {maxSize} • Allowed: {allowedTypes.join(', ')}
            </p>
          </div>
        ) : (
          <div className="border border-gray-300 rounded-lg p-4 bg-green-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle size={20} className="text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">{answer.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(answer.size)}</p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="text-red-500 hover:text-red-700"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default FileUpload;
