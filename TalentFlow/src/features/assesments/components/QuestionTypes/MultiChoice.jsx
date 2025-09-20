import { useState } from 'react';
import { Plus, X, GripVertical } from 'lucide-react';

const MultiChoice = ({ 
  question, 
  onChange, 
  mode = 'builder',
  answer = [],
  onAnswer,
  error 
}) => {
  const handleOptionChange = (index, value) => {
    const newOptions = [...(question.options || [])];
    newOptions[index] = value;
    onChange({ ...question, options: newOptions });
  };

  const addOption = () => {
    const newOptions = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`];
    onChange({ ...question, options: newOptions });
  };

  const removeOption = (index) => {
    if (question.options && question.options.length > 2) {
      const newOptions = question.options.filter((_, i) => i !== index);
      onChange({ ...question, options: newOptions });
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
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <GripVertical size={16} className="text-gray-400" />
          <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
            Multiple Choice
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
            Options (minimum 2) - Multiple selections allowed
          </label>
          <div className="space-y-2">
            {(question.options || []).map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="flex-shrink-0">
                  <input type="checkbox" disabled className="text-blue-600" />
                </div>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Option ${index + 1}`}
                />
                {question.options && question.options.length > 2 && (
                  <button
                    onClick={() => removeOption(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <button
            onClick={addOption}
            className="mt-2 flex items-center space-x-2 text-blue-600 hover:text-blue-800"
          >
            <Plus size={16} />
            <span>Add Option</span>
          </button>
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
        <p className="text-sm text-gray-600">Select all that apply</p>
        
        <div className="space-y-2">
          {(question.options || []).map((option, index) => (
            <label key={index} className="flex items-center space-x-2">
              <input 
                type="checkbox" 
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

  // Runtime Mode
  if (mode === 'runtime'|| mode==='simulation') {
    const currentAnswers = Array.isArray(answer) ? answer : [];
    
    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">
          {question.title}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </h4>
        <p className="text-sm text-gray-600">Select all that apply</p>
        
        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}
        
        <div className="space-y-2">
          {(question.options || []).map((option, index) => (
            <label key={index} className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox"
                checked={currentAnswers.includes(option)}
                onChange={(e) => handleAnswerChange(option, e.target.checked)}
                className="text-blue-600" 
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default MultiChoice;
