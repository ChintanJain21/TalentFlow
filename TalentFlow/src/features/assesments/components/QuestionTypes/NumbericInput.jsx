import { GripVertical } from 'lucide-react';

const NumericInput = ({ 
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
          <span className="text-sm font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded">
            Numeric Input
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="e.g., Enter amount in USD..."
          />
        </div>

        {/* Min/Max Values */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Value (optional)
            </label>
            <input
              type="number"
              value={question.min || ''}
              onChange={(e) => onChange({ ...question, min: e.target.value ? parseFloat(e.target.value) : null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Value (optional)
            </label>
            <input
              type="number"
              value={question.max || ''}
              onChange={(e) => onChange({ ...question, max: e.target.value ? parseFloat(e.target.value) : null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="100"
            />
          </div>
        </div>

        {/* Step Value */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Step Value (optional)
          </label>
          <select
            value={question.step || 1}
            onChange={(e) => onChange({ ...question, step: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value={1}>Whole numbers (1, 2, 3...)</option>
            <option value={0.1}>One decimal (1.0, 1.1, 1.2...)</option>
            <option value={0.01}>Two decimals (1.00, 1.01, 1.02...)</option>
            <option value={0.5}>Half steps (0.5, 1.0, 1.5...)</option>
          </select>
        </div>

        {/* Settings */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={question.required || false}
              onChange={(e) => onChange({ ...question, required: e.target.checked })}
              className="text-orange-600 rounded"
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
          type="number"
          disabled
          placeholder={question.placeholder || 'Enter a number...'}
          min={question.min}
          max={question.max}
          step={question.step || 1}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
        />
        
        {(question.min !== null || question.max !== null) && (
          <p className="text-xs text-gray-500">
            Range: {question.min || 'No minimum'} to {question.max || 'No maximum'}
          </p>
        )}
      </div>
    );
  }

  // Simulation Mode - Interactive
  if (mode === 'simulation') {
    const numericValue = answer ? parseFloat(answer) : '';
    const isOutOfRange = (question.min !== null && numericValue < question.min) || 
                         (question.max !== null && numericValue > question.max);
    
    return (
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">
          {question.title}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </h4>
        
        <input
          type="number"
          value={answer || ''}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder={question.placeholder || 'Enter a number...'}
          min={question.min}
          max={question.max}
          step={question.step || 1}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 transition-all ${
            isOutOfRange 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
              : 'border-gray-300 focus:border-orange-500'
          }`}
        />

        {(question.min !== null || question.max !== null) && (
          <p className="text-xs text-gray-500">
            Range: {question.min !== null ? question.min : 'No minimum'} to {question.max !== null ? question.max : 'No maximum'}
          </p>
        )}

        {isOutOfRange && (
          <p className="text-red-600 text-sm">
            ⚠️ Value must be between {question.min} and {question.max}
          </p>
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

export default NumericInput;
