import { Plus, X, GripVertical, Trash2, CheckSquare, AlertCircle, Settings, Hash } from 'lucide-react';
import { useTheme } from '../../../../contexts/ThemeContext';

const MultiChoice = ({ 
  question, 
  onChange, 
  mode = 'builder',
  answer = [],
  onAnswer,
  error 
}) => {
  const { isDark } = useTheme();

  const handleOptionChange = (index, value) => {
    const newOptions = [...(question.options || [])];
    newOptions[index] = value;
    onChange({ ...question, options: newOptions });
  };

  const addOption = () => {
    const newOptions = [...(question.options || []), ''];
    onChange({ ...question, options: newOptions });
  };

  const removeOption = (index) => {
    if (question.options && question.options.length > 2) {
      const newOptions = question.options.filter((_, i) => i !== index);
      onChange({ ...question, options: newOptions });
      
      // Update answers if removing selected options
      if (onAnswer && answer) {
        const removedOption = question.options[index];
        const currentAnswers = Array.isArray(answer) ? answer : [];
        if (currentAnswers.includes(removedOption)) {
          onAnswer(currentAnswers.filter(a => a !== removedOption));
        }
      }
    }
  };

  const handleAnswerChange = (option, checked) => {
    const currentAnswers = Array.isArray(answer) ? answer : [];
    if (checked) {
      onAnswer([...currentAnswers, option]);
    } else {
      onAnswer(currentAnswers.filter(a => a !== option));
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
          <span className="inline-flex items-center space-x-2 text-sm font-bold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-lg border border-green-200 dark:border-green-700">
            <CheckSquare size={14} />
            <span>Multiple Choice</span>
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
            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="What question allows multiple correct answers?"
          />
        </div>

        {/* Enhanced Options Builder */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
              Answer Options (minimum 2)
            </label>
            <span className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-xs font-medium border border-green-200 dark:border-green-700">
              <CheckSquare size={12} />
              <span>Multiple selections allowed</span>
            </span>
          </div>
          
          <div className="space-y-3">
            {(question.options || ['', '']).map((option, index) => (
              <div key={`${question.id}-${index}`} className="group">
                <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-green-300 dark:hover:border-green-600 transition-all">
                  
                  {/* Option Number */}
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">{index + 1}</span>
                  </div>
                  
                  {/* Checkbox Preview */}
                  <div className="flex-shrink-0">
                    <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600"></div>
                  </div>
                  
                  {/* Option Input */}
                  <input
                    type="text"
                    value={option || ''}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Enter option ${index + 1}...`}
                    className="flex-1 px-3 py-2 bg-transparent border-0 focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  
                  {/* Remove Button */}
                  {question.options && question.options.length > 2 && (
                    <button
                      onClick={() => removeOption(index)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      title="Remove option"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Add Option Button */}
          <button
            onClick={addOption}
            className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-3 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-2 border-dashed border-green-200 dark:border-green-800 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 hover:border-green-300 dark:hover:border-green-600 transition-all group"
          >
            <div className="w-6 h-6 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
              <Plus size={14} />
            </div>
            <span className="font-medium">Add Another Option</span>
          </button>
          
          {/* Options Count */}
          <div className="mt-3 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <Hash size={12} />
            <span>{(question.options || []).length} option{(question.options || []).length !== 1 ? 's' : ''} • Candidates can select multiple answers</span>
          </div>
        </div>

        {/* Enhanced Settings */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex items-center space-x-3">
              <Settings size={18} className="text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Required Question</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Candidates must select at least one option to continue</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={question.required || false}
              onChange={(e) => onChange({ ...question, required: e.target.checked })}
              className="w-4 h-4 text-green-600 dark:text-green-400 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-green-500 dark:focus:ring-green-400"
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
    const validOptions = (question.options || []).filter(option => option && option.trim());
    
    return (
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-50">
          {question.title}
          {question.required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
        </h4>
        
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium border border-green-200 dark:border-green-700">
          <CheckSquare size={14} />
          <span>Select all that apply</span>
        </div>
        
        <div className="space-y-3">
          {validOptions.map((option, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700">
              <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600"></div>
              <span className="text-gray-700 dark:text-gray-300">{option}</span>
              <div className="ml-auto text-xs text-gray-400 dark:text-gray-500">Preview Mode</div>
            </div>
          ))}
        </div>
        
        {validOptions.length === 0 && (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <div className="flex items-center space-x-2">
              <AlertCircle size={16} className="text-amber-600 dark:text-amber-400" />
              <p className="text-amber-700 dark:text-amber-300 text-sm">No options have been added yet</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Simulation Mode
  if (mode === 'simulation') {
    const currentAnswers = Array.isArray(answer) ? answer : [];
    const validOptions = (question.options || []).filter(option => option && option.trim());
    
    return (
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-50">
          {question.title}
          {question.required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
        </h4>
        
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium border border-green-200 dark:border-green-700">
          <CheckSquare size={14} />
          <span>Select all that apply</span>
        </div>
        
        <div className="space-y-3">
          {validOptions.map((option, index) => {
            const isSelected = currentAnswers.includes(option);
            return (
              <label 
                key={index} 
                className={`flex items-center space-x-4 p-4 rounded-xl cursor-pointer transition-all group ${
                  isSelected 
                    ? 'border-2 border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20' 
                    : 'border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/10'
                }`}
              >
                <input 
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => handleAnswerChange(option, e.target.checked)}
                  className="w-4 h-4 text-green-600 dark:text-green-400 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-green-500 dark:focus:ring-green-400" 
                />
                <span className={`flex-1 transition-colors ${
                  isSelected 
                    ? 'text-green-800 dark:text-green-200 font-medium' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {option}
                </span>
                {isSelected && (
                  <div className="w-6 h-6 bg-green-500 dark:bg-green-400 rounded-full flex items-center justify-center">
                    <CheckSquare size={14} className="text-white" />
                  </div>
                )}
              </label>
            );
          })}
        </div>

        {/* Enhanced Selection Counter */}
        {currentAnswers.length > 0 && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-500 dark:bg-green-400 rounded-full flex items-center justify-center">
                  <CheckSquare size={14} className="text-white" />
                </div>
                <p className="text-green-700 dark:text-green-300 text-sm font-medium">
                  {currentAnswers.length} option{currentAnswers.length === 1 ? '' : 's'} selected
                </p>
              </div>
              
              {currentAnswers.length > 1 && (
                <button
                  onClick={() => onAnswer([])}
                  className="text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>
            
            {/* Show selected options */}
            <div className="mt-2 flex flex-wrap gap-2">
              {currentAnswers.map((selectedOption, index) => (
                <span key={index} className="inline-flex items-center space-x-1 px-2 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded text-xs font-medium">
                  <span>{selectedOption}</span>
                  <button
                    onClick={() => handleAnswerChange(selectedOption, false)}
                    className="hover:text-green-600 dark:hover:text-green-300"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
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

export default MultiChoice;
