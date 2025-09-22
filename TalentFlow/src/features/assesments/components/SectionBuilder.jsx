import { useState } from 'react';
import { Plus, Trash2, Copy, GripVertical, ChevronDown, ChevronUp, AlertCircle, FileText, Settings } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import QuestionRenderer from './QuestionRenderer';

const SectionBuilder = ({
  section,
  sectionIndex,
  onUpdateSection,
  onRemoveSection,
  onAddQuestion,
  onUpdateQuestion,
  onRemoveQuestion,
  onDuplicateQuestion,
  questionTemplates,
  errors,
  canRemove = true
}) => {
  const { isDark } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showQuestionTypes, setShowQuestionTypes] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);

  const handleAddQuestion = (questionType) => {
    onAddQuestion(questionType);
    setShowQuestionTypes(false);
  };

  const getQuestionTypeInfo = (type) => {
    const types = {
      'single-choice': { name: 'Single Choice', icon: '○', color: 'blue', description: 'Radio button selection' },
      'multi-choice': { name: 'Multiple Choice', icon: '☑', color: 'green', description: 'Multiple checkboxes' },
      'short-text': { name: 'Short Text', icon: '📝', color: 'purple', description: 'Single line input' },
      'long-text': { name: 'Long Text', icon: '📄', color: 'indigo', description: 'Multi-line textarea' },
      'numeric': { name: 'Numeric', icon: '🔢', color: 'orange', description: 'Number input' },
      'file-upload': { name: 'File Upload', icon: '📎', color: 'pink', description: 'File attachment' }
    };
    return types[type] || { name: 'Unknown', icon: '❓', color: 'gray', description: 'Unknown type' };
  };

  const getQuestionTypeClasses = (color) => {
    const classes = {
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
      green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700',
      purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700',
      indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700',
      orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700',
      pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-700',
      gray: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
    };
    return classes[color] || classes.gray;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
      
      {/* Enhanced Section Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
              <GripVertical size={16} className="text-gray-400 dark:text-gray-500" />
            </div>
            
            {editingTitle ? (
              <input
                type="text"
                value={section.title || ''}
                onChange={(e) => onUpdateSection({ title: e.target.value })}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setEditingTitle(false);
                  if (e.key === 'Escape') setEditingTitle(false);
                }}
                className={`text-lg font-bold bg-white dark:bg-gray-700 border rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 transition-colors ${
                  errors[`section-${section.id}-title`] 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter section title..."
                autoFocus
              />
            ) : (
              <div className="flex items-center space-x-3">
                <h3 
                  className="text-lg font-bold text-gray-900 dark:text-gray-50 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={() => setEditingTitle(true)}
                  title="Click to edit section title"
                >
                  {section.title || `Section ${sectionIndex + 1}`}
                </h3>
                <Settings size={14} className="text-gray-400 dark:text-gray-500" />
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium border border-blue-200 dark:border-blue-700">
                <FileText size={14} />
                <span>{section.questions?.length || 0} question{section.questions?.length === 1 ? '' : 's'}</span>
              </span>

              {errors[`section-${section.id}-title`] && (
                <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center" title="Section has errors">
                  <AlertCircle size={14} className="text-red-600 dark:text-red-400" />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
              title={isCollapsed ? 'Expand Section' : 'Collapse Section'}
            >
              {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </button>

            <button
              onClick={() => setShowQuestionTypes(!showQuestionTypes)}
              className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md font-medium"
            >
              <Plus size={16} />
              <span>Add Question</span>
            </button>

            {canRemove && (
              <button
                onClick={onRemoveSection}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                title="Remove Section"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Error Messages */}
        {(errors[`section-${section.id}-title`] || errors[`section-${section.id}-questions`]) && (
          <div className="mt-4 space-y-2">
            {errors[`section-${section.id}-title`] && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
                <p className="text-red-600 dark:text-red-400 text-sm font-medium">{errors[`section-${section.id}-title`]}</p>
              </div>
            )}
            {errors[`section-${section.id}-questions`] && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
                <p className="text-red-600 dark:text-red-400 text-sm font-medium">{errors[`section-${section.id}-questions`]}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Question Types Dropdown */}
      {showQuestionTypes && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/10 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Choose a question type to add:</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Select the most appropriate question type for your needs</p>
            </div>
            <button
              onClick={() => setShowQuestionTypes(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <ChevronUp size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(questionTemplates).map(([type, template]) => {
              const typeInfo = getQuestionTypeInfo(type);
              return (
                <button
                  key={type}
                  onClick={() => handleAddQuestion(type)}
                  className="flex items-center space-x-4 p-4 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all group"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${getQuestionTypeClasses(typeInfo.color)}`}>
                    <span className="text-sm">{typeInfo.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-gray-900 dark:text-gray-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {template.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {typeInfo.description}
                    </p>
                  </div>
                  <Plus size={16} className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Enhanced Questions List */}
      {!isCollapsed && (
        <div className="p-6">
          {section.questions?.length > 0 ? (
            <div className="space-y-6">
              {section.questions.map((question, questionIndex) => {
                const typeInfo = getQuestionTypeInfo(question.type);
                return (
                  <div key={question.id} className="relative">
                    <div className="absolute -left-4 top-6 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400 border-2 border-white dark:border-gray-800 shadow-sm">
                      {questionIndex + 1}
                    </div>
                    
                    <div className="ml-6 border border-gray-200 dark:border-gray-600 rounded-xl p-6 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md transition-all bg-white dark:bg-gray-700/50">
                      <div className="flex items-start justify-between mb-4">
                        <span className={`inline-flex items-center space-x-2 text-xs font-bold px-3 py-1.5 rounded-lg border ${getQuestionTypeClasses(typeInfo.color)}`}>
                          <span>{typeInfo.icon}</span>
                          <span>{typeInfo.name}</span>
                        </span>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onDuplicateQuestion(question.id)}
                            className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                            title="Duplicate Question"
                          >
                            <Copy size={16} />
                          </button>
                          
                          <button
                            onClick={() => onRemoveQuestion(question.id)}
                            className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            title="Remove Question"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Enhanced QuestionRenderer */}
                      <QuestionRenderer
                        question={question}
                        onChange={(updatedQuestion) => onUpdateQuestion(question.id, updatedQuestion)}
                        mode="builder"
                        error={errors[`question-${question.id}`]}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Enhanced Empty State */
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Plus size={32} className="text-gray-400 dark:text-gray-500" />
              </div>
              <h4 className="font-bold text-gray-900 dark:text-gray-50 mb-2">No questions in this section yet</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Add questions to start building your assessment. Choose from different question types to gather the information you need.
              </p>
              <button
                onClick={() => setShowQuestionTypes(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-lg font-medium"
              >
                <Plus size={18} />
                <span>Add your first question</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SectionBuilder;
