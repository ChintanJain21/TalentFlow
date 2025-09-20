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
        <div className="flex items-center space-x-2">
          <GripVertical size={16} className="text-gray-400" />
          <span className="text-sm font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded">
            Numeric
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

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Value
            </label>
            <input
              type="number"
              value={question.validation?.min ?? ''}
              onChange={(e) => onChange({ 
                ...question, 
                validation: { 
                  ...question.validation, 
                  min: e.target.value ? parseFloat(e.target.value) : undefined 
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="No min"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Value
            </label>
            <input
              type="number"
              value={question.validation?.max ?? ''}
              onChange={(e) => onChange({ 
                ...question, 
                validation: { 
                  ...question.validation, 
                  max: e.target.value ? parseFloat(e.target.value) : undefined 
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="No max"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step
            </label>
            <select
              value={question.validation?.step || '1'}
              onChange={(e) => onChange({ 
                ...question, 
                validation: { 
                  ...question.validation, 
                  step: e.target.value 
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="1">Whole numbers</option>
              <option value="0.1">1 decimal place</option>
              <option value="0.01">2 decimal places</option>
              <option value="any">Any number</option>
            </select>
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
        
        <input
          type="number"
          disabled
          placeholder={question.placeholder || "Enter a number..."}
          min={question.validation?.min}
          max={question.validation?.max}
          step={question.validation?.step || '1'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
        />
        
        {(question.validation?.min !== undefined || question.validation?.max !== undefined) && (
          <p className="text-xs text-gray-500">
            {question.validation?.min !== undefined && question.validation?.max !== undefined
              ? `Range: ${question.validation.min} to ${question.validation.max}`
              : question.validation?.min !== undefined
              ? `Minimum: ${question.validation.min}`
              : `Maximum: ${question.validation.max}`
            }
          </p>
        )}
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
        
        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}
        
        <input
          type="number"
          value={answer || ''}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder={question.placeholder || "Enter a number..."}
          min={question.validation?.min}
          max={question.validation?.max}
          step={question.validation?.step || '1'}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            error ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        
        {(question.validation?.min !== undefined || question.validation?.max !== undefined) && (
          <p className="text-xs text-gray-500">
            {question.validation?.min !== undefined && question.validation?.max !== undefined
              ? `Range: ${question.validation.min} to ${question.validation.max}`
              : question.validation?.min !== undefined
              ? `Minimum: ${question.validation.min}`
              : `Maximum: ${question.validation.max}`
            }
          </p>
        )}
      </div>
    );
  }

  return null;
};

export default NumericInput;
