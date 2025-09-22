import { Plus, X, GripVertical, Trash2 } from 'lucide-react';

const SingleChoice = ({ 
  question, 
  onChange, 
  mode = 'builder',
  answer,
  onAnswer,
  error 
}) => {
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
    }
  };

  // Builder Mode
  if (mode === 'builder') {
    return (
      <div className="space-y-4">
        {/* Question Header */}
        <div className="flex items-center space-x-2">
          <GripVertical size={16} className="text-gray-400" />
          <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
            Single Choice
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your question..."
          />
        </div>

        {/* ✅ SIMPLIFIED Options - NO complex component */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Answer Options (minimum 2)
          </label>
          <div className="space-y-3">
            {(question.options || ['', '']).map((option, index) => (
              <div key={`${question.id}-${index}`} className="flex items-center space-x-2 group">
                <div className="flex-shrink-0">
                  <input type="radio" disabled className="text-blue-600" />
                </div>
                <input
                  type="text"
                  value={option || ''}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {question.options && question.options.length > 2 && (
                  <button
                    onClick={() => removeOption(index)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
                    title="Remove option"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <button
            onClick={addOption}
            className="mt-3 flex items-center space-x-2 px-3 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <Plus size={16} />
            <span>Add Option</span>
          </button>
        </div>

        {/* Settings */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={question.required || false}
              onChange={(e) => onChange({ ...question, required: e.target.checked })}
              className="text-blue-600 rounded"
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
        
        <div className="space-y-3">
          {(question.options || []).filter(option => option && option.trim()).map((option, index) => (
            <label key={index} className="flex items-center space-x-3 p-2 border border-gray-200 rounded-lg">
              <input 
                type="radio" 
                name={`preview-${question.id}`} 
                disabled 
                className="text-blue-600" 
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  // Simulation Mode
  if (mode === 'simulation') {
    return (
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">
          {question.title}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </h4>
        
        <div className="space-y-3">
          {(question.options || []).filter(option => option && option.trim()).map((option, index) => (
            <label 
              key={index} 
              className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 cursor-pointer transition-all"
            >
              <input 
                type="radio" 
                name={`question-${question.id}`}
                value={option}
                checked={answer === option}
                onChange={(e) => onAnswer(e.target.value)}
                className="text-blue-600 w-4 h-4" 
              />
              <span className="text-gray-700 flex-1">{option}</span>
            </label>
          ))}
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

export default SingleChoice;
