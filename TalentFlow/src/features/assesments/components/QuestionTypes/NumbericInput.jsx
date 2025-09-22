import { GripVertical, Hash, AlertCircle, Settings, TrendingUp, TrendingDown, Calculator } from 'lucide-react';
import { useTheme } from '../../../../contexts/ThemeContext';

const NumericInput = ({ 
  question, 
  onChange, 
  mode = 'builder',
  answer = '',
  onAnswer,
  error 
}) => {
  const { isDark } = useTheme();

  const formatStepDescription = (step) => {
    switch (step) {
      case 1: return 'Whole numbers only (1, 2, 3...)';
      case 0.1: return 'One decimal place (1.0, 1.1, 1.2...)';
      case 0.01: return 'Two decimal places (1.00, 1.01, 1.02...)';
      case 0.5: return 'Half step increments (0.5, 1.0, 1.5...)';
      case 0.25: return 'Quarter step increments (0.25, 0.50, 0.75...)';
      default: return `Step size: ${step}`;
    }
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
          <span className="inline-flex items-center space-x-2 text-sm font-bold text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/30 px-3 py-1.5 rounded-lg border border-orange-200 dark:border-orange-700">
            <Calculator size={14} />
            <span>Numeric Input</span>
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
            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-orange-500 dark:focus:border-orange-400 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="What numeric value do you need from candidates?"
          />
        </div>

        {/* Enhanced Placeholder Text */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
            Placeholder Text
          </label>
          <input
            type="text"
            value={question.placeholder || ''}
            onChange={(e) => onChange({ ...question, placeholder: e.target.value })}
            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-orange-500 dark:focus:border-orange-400 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="e.g., Enter amount in USD, Enter your years of experience..."
          />
          <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <Hash size={12} />
            <span>This hint helps candidates understand what type of number you need</span>
          </div>
        </div>

        {/* Enhanced Min/Max Values */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
            Value Range (optional)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <TrendingDown size={16} className="text-orange-500 dark:text-orange-400" />
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Minimum Value</label>
              </div>
              <input
                type="number"
                value={question.min ?? ''}
                onChange={(e) => onChange({ ...question, min: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-orange-500 dark:focus:border-orange-400 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="e.g., 0"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <TrendingUp size={16} className="text-orange-500 dark:text-orange-400" />
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Maximum Value</label>
              </div>
              <input
                type="number"
                value={question.max ?? ''}
                onChange={(e) => onChange({ ...question, max: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-orange-500 dark:focus:border-orange-400 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="e.g., 100"
              />
            </div>
          </div>
          
          {/* Range Preview */}
          {(question.min !== null || question.max !== null) && (
            <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-center space-x-2 text-sm">
                <Calculator size={14} className="text-orange-600 dark:text-orange-400" />
                <span className="text-orange-700 dark:text-orange-300 font-medium">
                  Valid range: {question.min !== null ? question.min : '−∞'} to {question.max !== null ? question.max : '+∞'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Step Value */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
            Input Precision
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { value: 1, label: 'Whole Numbers', description: '1, 2, 3, 4...' },
              { value: 0.5, label: 'Half Steps', description: '0.5, 1.0, 1.5...' },
              { value: 0.1, label: 'One Decimal', description: '1.0, 1.1, 1.2...' },
              { value: 0.01, label: 'Two Decimals', description: '1.00, 1.01, 1.02...' }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ ...question, step: option.value })}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  (question.step || 1) === option.value
                    ? 'border-orange-500 dark:border-orange-400 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-500 bg-white dark:bg-gray-700'
                }`}
              >
                <div className="font-bold text-sm text-gray-900 dark:text-gray-100">{option.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{option.description}</div>
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <span>💡 Controls how precisely candidates can enter numbers</span>
          </div>
        </div>

        {/* Enhanced Settings */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex items-center space-x-3">
              <Settings size={18} className="text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Required Question</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Candidates must enter a valid number to continue</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={question.required || false}
              onChange={(e) => onChange({ ...question, required: e.target.checked })}
              className="w-4 h-4 text-orange-600 dark:text-orange-400 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-orange-500 dark:focus:ring-orange-400"
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
    return (
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-50">
          {question.title}
          {question.required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
        </h4>
        
        <div className="relative">
          <input
            type="number"
            disabled
            placeholder={question.placeholder || 'Enter a number...'}
            min={question.min}
            max={question.max}
            step={question.step || 1}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          />
          <div className="absolute top-3 right-3 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-xs text-gray-500 dark:text-gray-400">
            Preview Mode
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
          {(question.min !== null || question.max !== null) && (
            <div className="flex items-center space-x-1">
              <Calculator size={12} />
              <span>Range: {question.min !== null ? question.min : '−∞'} to {question.max !== null ? question.max : '+∞'}</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <Hash size={12} />
            <span>{formatStepDescription(question.step || 1)}</span>
          </div>
        </div>
      </div>
    );
  }

  // Simulation Mode - Interactive
  if (mode === 'simulation') {
    const numericValue = answer ? parseFloat(answer) : null;
    const isValidNumber = !isNaN(numericValue) && numericValue !== null;
    const isOutOfRange = isValidNumber && (
      (question.min !== null && numericValue < question.min) || 
      (question.max !== null && numericValue > question.max)
    );
    
    return (
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-50">
          {question.title}
          {question.required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
        </h4>
        
        <div className="relative">
          <input
            type="number"
            value={answer || ''}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder={question.placeholder || 'Enter a number...'}
            min={question.min}
            max={question.max}
            step={question.step || 1}
            className={`w-full px-4 py-3 rounded-xl focus:ring-2 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
              isOutOfRange 
                ? 'border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-200 dark:focus:ring-red-500/20 bg-red-50 dark:bg-red-900/10' 
                : 'border-gray-300 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-200 dark:focus:ring-orange-500/20 bg-white dark:bg-gray-700'
            }`}
          />
          
          {/* Input Status Indicator */}
          {isValidNumber && !isOutOfRange && (
            <div className="absolute right-3 top-3 w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
            </div>
          )}
        </div>

        {/* Enhanced Helper Information */}
        <div className="space-y-2">
          {(question.min !== null || question.max !== null) && (
            <div className={`flex items-center space-x-2 text-xs font-medium ${
              isOutOfRange ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
            }`}>
              <Calculator size={12} />
              <span>
                Valid range: {question.min !== null ? question.min : 'No minimum'} to {question.max !== null ? question.max : 'No maximum'}
              </span>
            </div>
          )}
          
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <Hash size={12} />
            <span>{formatStepDescription(question.step || 1)}</span>
          </div>
        </div>

        {/* Enhanced Validation Messages */}
        {isOutOfRange && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                {question.min !== null && numericValue < question.min && 
                  `Value must be at least ${question.min}`}
                {question.max !== null && numericValue > question.max && 
                  `Value must be no more than ${question.max}`}
                {question.min !== null && question.max !== null && 
                  (numericValue < question.min || numericValue > question.max) &&
                  ` (between ${question.min} and ${question.max})`}
              </p>
            </div>
          </div>
        )}

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

export default NumericInput;
