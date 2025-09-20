import { GripVertical } from 'lucide-react';

const LongText = ({ 
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
          <span className="text-sm font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded">
            Long Text
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
          <textarea
            value={question.placeholder || ''}
            onChange={(e) => onChange({ ...question, placeholder: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="2"
            placeholder="Enter placeholder text..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Characters
            </label>
            <input
              type="number"
              value={question.validation?.maxLength || 500}
              onChange={(e) => onChange({ 
                ...question, 
                validation: { 
                  ...question.validation, 
                  maxLength: parseInt(e.target.value) || 500 
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="50"
              max="5000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Textarea Rows
            </label>
            <input
              type="number"
              value={question.rows || 4}
              onChange={(e) => onChange({ ...question, rows: parseInt(e.target.value) || 4 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="2"
              max="10"
            />
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
        
        <textarea
          disabled
          rows={question.rows || 4}
          placeholder={question.placeholder || "Enter your detailed answer..."}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 resize-none"
        />
        
        {question.validation?.maxLength && (
          <p className="text-xs text-gray-500">
            Maximum {question.validation.maxLength} characters
          </p>
        )}
      </div>
    );
  }

  
  if (mode === 'runtime' || mode === 'simulation') {
    const maxLength = question.validation?.maxLength || 500;
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
        
        <textarea
          value={answer || ''}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder={question.placeholder || "Enter your detailed answer..."}
          rows={question.rows || 4}
          maxLength={maxLength}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
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

export default LongText;
