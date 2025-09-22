import { GripVertical, Type, AlertCircle, Settings, Hash } from 'lucide-react';
import { useTheme } from '../../../../contexts/ThemeContext';

const TextInput = ({ 
  question, 
  onChange, 
  mode = 'builder',
  answer = '',
  onAnswer,
  error 
}) => {
  const { isDark } = useTheme();

  // Builder Mode
  if (mode === 'builder') {
    return (
      <div className="space-y-6">
        
        {/* Enhanced Question Header */}
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
            <GripVertical size={14} className="text-gray-400 dark:text-gray-500" />
          </div>
          <span className="inline-flex items-center space-x-2 text-sm font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-700">
            <Type size={14} />
            <span>Short Text</span>
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
            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="What short text response do you need?"
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
            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="e.g., Enter your full name, Your job title..."
          />
          <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <Type size={12} />
            <span>This hint helps candidates understand what information to provide</span>
          </div>
        </div>

        {/* Enhanced Character Limit */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
            Character Limit (optional)
          </label>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="number"
                min="0"
                max="500"
                value={question.maxLength || ''}
                onChange={(e) => onChange({ ...question, maxLength: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="e.g., 100"
              />
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Hash size={16} />
              <span>characters</span>
            </div>
          </div>
          <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <span>💡 Leave empty for no limit. Recommended: 50-200 characters for short responses</span>
          </div>
        </div>

        {/* Enhanced Settings */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex items-center space-x-3">
              <Settings size={18} className="text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Required Question</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Candidates must provide a text response to continue</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={question.required || false}
              onChange={(e) => onChange({ ...question, required: e.target.checked })}
              className="w-4 h-4 text-purple-600 dark:text-purple-400 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-purple-500 dark:focus:ring-purple-400"
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
            type="text"
            disabled
            placeholder={question.placeholder || 'Enter your answer...'}
            maxLength={question.maxLength || undefined}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          />
          <div className="absolute top-3 right-3 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-xs text-gray-500 dark:text-gray-400">
            Preview Mode
          </div>
        </div>
        
        {question.maxLength && (
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <Hash size={12} />
            <span>Maximum {question.maxLength} characters</span>
          </div>
        )}
      </div>
    );
  }

  // Simulation Mode - Interactive
  if (mode === 'simulation') {
    const currentLength = answer ? answer.length : 0;
    const isOverLimit = question.maxLength && currentLength > question.maxLength;
    const isNearLimit = question.maxLength && currentLength > question.maxLength * 0.8;
    
    return (
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-50">
          {question.title}
          {question.required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
        </h4>
        
        <div className="relative">
          <input
            type="text"
            value={answer || ''}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder={question.placeholder || 'Enter your answer...'}
            maxLength={question.maxLength || undefined}
            className={`w-full px-4 py-3 rounded-xl focus:ring-2 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
              isOverLimit 
                ? 'border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-200 dark:focus:ring-red-500/20 bg-red-50 dark:bg-red-900/10' 
                : 'border-gray-300 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-200 dark:focus:ring-purple-500/20 bg-white dark:bg-gray-700'
            }`}
          />
          
          {/* Enhanced Character Counter */}
          {question.maxLength && (
            <div className={`absolute bottom-3 right-3 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
              isOverLimit 
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700' 
                : isNearLimit 
                  ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-700'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600'
            }`}>
              {currentLength}/{question.maxLength}
            </div>
          )}
        </div>

        {/* Enhanced Helper Text */}
        <div className="flex items-center justify-between text-xs">
          {question.maxLength && (
            <div className="flex items-center space-x-2">
              <Hash size={12} className="text-gray-400 dark:text-gray-500" />
              <span className={`font-medium ${
                isOverLimit 
                  ? 'text-red-600 dark:text-red-400' 
                  : isNearLimit 
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-gray-500 dark:text-gray-400'
              }`}>
                {isOverLimit 
                  ? `${currentLength - question.maxLength} characters over limit`
                  : `${question.maxLength - currentLength} characters remaining`
                }
              </span>
            </div>
          )}
          
          {currentLength > 0 && (
            <div className="text-gray-400 dark:text-gray-500">
              {currentLength} character{currentLength !== 1 ? 's' : ''} entered
            </div>
          )}
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

export default TextInput;
