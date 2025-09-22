import { GripVertical } from 'lucide-react';

const TextInput = ({ 
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
          <span className="text-sm font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">
            Short Text
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder={!question.title ? 'Enter your question...' : undefined}
          />
        </div>

        {/* Placeholder Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Placeholder Text
          </label>
          <input
            type="text"
            value={question.placeholder || ''}
            onChange={(e) => onChange({ ...question, placeholder: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="e.g., Enter your full name..."
          />
          <p className="text-xs text-gray-500 mt-1">This text will appear as a hint to candidates</p>
        </div>

        {/* Character Limit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Character Limit (optional)
          </label>
          <input
            type="number"
            min="0"
            max="500"
            value={question.maxLength || ''}
            onChange={(e) => onChange({ ...question, maxLength: e.target.value ? parseInt(e.target.value) : null })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="e.g., 100"
          />
          <p className="text-xs text-gray-500 mt-1">Leave empty for no limit</p>
        </div>

        {/* Settings */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={question.required || false}
              onChange={(e) => onChange({ ...question, required: e.target.checked })}
              className="text-purple-600 rounded"
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
        
        <input
          type="text"
          disabled
          placeholder={question.placeholder || 'Enter your answer...'}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
        />
        
        {question.maxLength && (
          <p className="text-xs text-gray-500">Maximum {question.maxLength} characters</p>
        )}
      </div>
    );
  }

  // Simulation Mode - Interactive
  if (mode === 'simulation') {
    const currentLength = answer ? answer.length : 0;
    const isOverLimit = question.maxLength && currentLength > question.maxLength;
    
    return (
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">
          {question.title}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </h4>
        
        <div className="relative">
          <input
            type="text"
            value={answer || ''}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder={question.placeholder || 'Enter your answer...'}
            maxLength={question.maxLength || undefined}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 transition-all ${
              isOverLimit 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:border-purple-500'
            }`}
          />
          
          {question.maxLength && (
            <div className={`absolute right-3 top-2 text-xs ${
              isOverLimit ? 'text-red-500' : currentLength > question.maxLength * 0.8 ? 'text-orange-500' : 'text-gray-400'
            }`}>
              {currentLength}/{question.maxLength}
            </div>
          )}
        </div>

        {question.maxLength && (
          <p className="text-xs text-gray-500">Maximum {question.maxLength} characters</p>
        )}

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

export default TextInput;
