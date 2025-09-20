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
        <div className="flex items-center space-x-2">
          <GripVertical size={16} className="text-gray-400" />
          <span className="text-sm font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">
            Short Text
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
            Placeholder Text
          </label>
          <input
            type="text"
            value={question.placeholder || ''}
            onChange={(e) => onChange({ ...question, placeholder: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter placeholder text..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Characters
          </label>
          <input
            type="number"
            value={question.validation?.maxLength || 100}
            onChange={(e) => onChange({ 
              ...question, 
              validation: { 
                ...question.validation, 
                maxLength: parseInt(e.target.value) || 100 
              }
            })}
            className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="1"
            max="1000"
          />
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
        
        <input
          type="text"
          disabled
          placeholder={question.placeholder || "Enter your answer..."}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
        />
        
        {question.validation?.maxLength && (
          <p className="text-xs text-gray-500">
            Maximum {question.validation.maxLength} characters
          </p>
        )}
      </div>
    );
  }

  // Runtime Mode
  if (mode === 'runtime'|| mode==='simulation') {
    const maxLength = question.validation?.maxLength || 100;
    const currentLength = answer?.length || 0;
    
    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">
          {question.title}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </h4>
        
        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}
        
        <input
          type="text"
          value={answer || ''}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder={question.placeholder || "Enter your answer..."}
          maxLength={maxLength}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            error ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>Maximum {maxLength} characters</span>
          <span className={currentLength > maxLength * 0.9 ? 'text-orange-600' : ''}>
            {currentLength}/{maxLength}
          </span>
        </div>
      </div>
    );
  }

  return null;
};

export default TextInput;
