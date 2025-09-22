import { useState } from 'react';
import { Plus, Trash2, Copy, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showQuestionTypes, setShowQuestionTypes] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);

  const handleAddQuestion = (questionType) => {
    onAddQuestion(questionType);
    setShowQuestionTypes(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Section Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <GripVertical size={16} className="text-gray-400" />
            
            {editingTitle ? (
              <input
                type="text"
                value={section.title || ''}
                onChange={(e) => onUpdateSection({ title: e.target.value })}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setEditingTitle(false);
                  if (e.key === 'Escape') {
                    setEditingTitle(false);
                  }
                }}
                className={`text-lg font-medium bg-white border rounded px-2 py-1 ${
                  errors[`section-${section.id}-title`] ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter section title..."
                autoFocus
              />
            ) : (
              <h3 
                className="text-lg font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => setEditingTitle(true)}
                title="Click to edit section title"
              >
                {section.title || `Section ${sectionIndex + 1}`}
              </h3>
            )}
            
            <span className="text-sm text-gray-500">
              {section.questions?.length || 0} question{section.questions?.length === 1 ? '' : 's'}
            </span>

            {errors[`section-${section.id}-title`] && (
              <span className="text-red-500 text-sm" title="Section has errors">⚠️</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title={isCollapsed ? 'Expand Section' : 'Collapse Section'}
            >
              {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </button>

            <button
              onClick={() => setShowQuestionTypes(!showQuestionTypes)}
              className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <Plus size={14} />
              <span>Add Question</span>
            </button>

            {canRemove && (
              <button
                onClick={onRemoveSection}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Remove Section"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Error Messages */}
        {errors[`section-${section.id}-title`] && (
          <p className="text-red-600 text-sm mt-1">{errors[`section-${section.id}-title`]}</p>
        )}
        {errors[`section-${section.id}-questions`] && (
          <p className="text-red-600 text-sm mt-1">{errors[`section-${section.id}-questions`]}</p>
        )}
      </div>

      {/* Question Types Dropdown */}
      {showQuestionTypes && (
        <div className="p-4 border-b border-gray-200 bg-blue-50">
          <p className="text-sm text-gray-700 mb-3">Choose a question type to add:</p>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(questionTemplates).map(([type, template]) => (
              <button
                key={type}
                onClick={() => handleAddQuestion(type)}
                className="flex items-center space-x-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-white hover:border-blue-300 transition-colors"
              >
                <div className={`w-3 h-3 rounded-full ${
                  type === 'single-choice' ? 'bg-blue-500' :
                  type === 'multi-choice' ? 'bg-green-500' :
                  type === 'short-text' ? 'bg-purple-500' :
                  type === 'long-text' ? 'bg-indigo-500' :
                  type === 'numeric' ? 'bg-orange-500' :
                  'bg-pink-500'
                }`} />
                <div>
                  <p className="font-medium text-sm text-gray-900">{template.title}</p>
                  <p className="text-xs text-gray-500">
                    {type === 'single-choice' && 'Radio button selection'}
                    {type === 'multi-choice' && 'Multiple checkboxes'}
                    {type === 'short-text' && 'Single line input'}
                    {type === 'long-text' && 'Multi-line textarea'}
                    {type === 'numeric' && 'Number input'}
                    {type === 'file-upload' && 'File upload'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Questions List */}
      {!isCollapsed && (
        <div className="p-4">
          {section.questions?.length > 0 ? (
            <div className="space-y-4">
              {section.questions.map((question, questionIndex) => (
                <div key={question.id} className="relative">
                  <div className="absolute -left-2 top-4 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                    {questionIndex + 1}
                  </div>
                  
                  <div className="ml-6 border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        question.type === 'single-choice' ? 'bg-blue-100 text-blue-700' :
                        question.type === 'multi-choice' ? 'bg-green-100 text-green-700' :
                        question.type === 'short-text' ? 'bg-purple-100 text-purple-700' :
                        question.type === 'long-text' ? 'bg-indigo-100 text-indigo-700' :
                        question.type === 'numeric' ? 'bg-orange-100 text-orange-700' :
                        'bg-pink-100 text-pink-700'
                      }`}>
                        {question.type.replace('-', ' ')}
                      </span>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onDuplicateQuestion(question.id)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Duplicate Question"
                        >
                          <Copy size={14} />
                        </button>
                        
                        <button
                          onClick={() => onRemoveQuestion(question.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Remove Question"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* ✅ ENHANCED QuestionRenderer with proper error passing */}
                    <QuestionRenderer
                      question={question}
                      onChange={(updatedQuestion) => onUpdateQuestion(question.id, updatedQuestion)}
                      mode="builder"
                      error={errors[`question-${question.id}`]}
                    />
                    
                    {/* Question-level errors */}
                    {errors[`question-${question.id}`] && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">⚠️ {errors[`question-${question.id}`]}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Plus size={24} className="text-gray-400" />
                </div>
                <p className="font-medium">No questions in this section yet</p>
                <p className="text-sm">Add questions to start building your assessment</p>
              </div>
              <button
                onClick={() => setShowQuestionTypes(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Add your first question
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SectionBuilder;
