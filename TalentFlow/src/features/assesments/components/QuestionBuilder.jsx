import { useState } from 'react';
import { Plus, Eye, Save, ArrowLeft, User, UserCheck, X, FileText, BarChart3, TestTube, AlertCircle, Lightbulb } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import useAssessmentBuilder from '../hooks/useAssesmentBuilder';
import SectionBuilder from './SectionBuilder';
import AssessmentPreview from './AssesmentPreview';

const QuestionBuilder = ({ 
  assessment: initialAssessment, 
  jobId,
  job,
  onSave, 
  onCancel 
}) => {
  const { isDark } = useTheme();
  
  const {
    assessment,
    isDirty,
    loading,
    errors,
    questionTemplates,
    updateAssessment,
    addSection,
    updateSection,
    removeSection,
    addQuestion,
    updateQuestion,
    removeQuestion,
    duplicateQuestion,
    saveAssessment,
    getStats
  } = useAssessmentBuilder(initialAssessment);

  const [previewMode, setPreviewMode] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showCandidateSelect, setShowCandidateSelect] = useState(false);

  // Mock candidates
  const mockCandidates = [
    { id: 1, name: "John Smith", email: "john.smith@email.com", experience: "Senior Developer" },
    { id: 2, name: "Sarah Johnson", email: "sarah.johnson@email.com", experience: "Mid-level Designer" },
    { id: 3, name: "Mike Chen", email: "mike.chen@email.com", experience: "Junior Developer" }
  ];

  const stats = getStats();

  const handleSave = async () => {
    if (!assessment.jobId && jobId) {
      updateAssessment({ jobId });
    }
    const success = await saveAssessment();
    if (success) {
      onSave?.(assessment);
    }
  };

  const startTestWithCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setShowCandidateSelect(false);
    setTestMode(true);
  };

  const handleBackFromTest = () => {
    setPreviewMode(false);
    setTestMode(false);
    setSelectedCandidate(null);
  };

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'single-choice': return '○';
      case 'multi-choice': return '☑';
      case 'short-text': return '📝';
      case 'long-text': return '📄';
      case 'numeric': return '🔢';
      default: return '❓';
    }
  };

  // Enhanced Candidate Modal
  const CandidateModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Test as Candidate</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Choose a candidate to simulate</p>
          </div>
          <button 
            onClick={() => setShowCandidateSelect(false)} 
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-3">
          {mockCandidates.map(candidate => (
            <button
              key={candidate.id}
              onClick={() => startTestWithCandidate(candidate)}
              className="w-full p-4 text-left border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {candidate.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-gray-50">{candidate.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{candidate.experience}</p>
                </div>
                <TestTube className="ml-auto w-5 h-5 text-gray-400 group-hover:text-blue-600" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Preview/Test Mode
  if (previewMode || testMode) {
    return (
      <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackFromTest}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              <ArrowLeft size={20} />
              <span>Back to Builder</span>
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">
                {testMode ? 'Testing as Candidate' : 'Assessment Preview'}
              </h2>
              {testMode && selectedCandidate && (
                <div className="flex items-center space-x-2 mt-1">
                  <UserCheck size={16} className="text-green-600 dark:text-green-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Simulating: <strong>{selectedCandidate.name}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <AssessmentPreview 
          assessment={assessment}
          mode={testMode ? "simulation" : "preview"}
          candidateInfo={selectedCandidate}
          onBack={handleBackFromTest}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen p-4 transition-colors">
      
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onCancel}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">
              {initialAssessment ? 'Edit Assessment' : 'Create Assessment'}
            </h2>
            {job && <p className="text-gray-600 dark:text-gray-400">for {job.title}</p>}
          </div>
          {isDirty && (
            <span className="inline-flex items-center space-x-1 text-orange-600 dark:text-orange-400 text-sm font-medium">
              <AlertCircle size={14} />
              <span>Unsaved changes</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setPreviewMode(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Eye size={16} />
            <span>Preview</span>
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50 transition-colors shadow-lg font-medium"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
            ) : (
              <Save size={16} />
            )}
            <span>{loading ? 'Saving...' : 'Save Assessment'}</span>
          </button>
        </div>
      </div>

      {/* Enhanced Stats Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-gray-700 dark:text-gray-300">{stats.totalSections} sections</span>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="font-medium text-gray-700 dark:text-gray-300">{stats.totalQuestions} questions</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="font-medium text-gray-700 dark:text-gray-300">{stats.requiredQuestions} required</span>
            </div>
          </div>
          
          <button
            onClick={() => setShowCandidateSelect(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors shadow-md"
          >
            <TestTube size={16} />
            <span>Test as Candidate</span>
          </button>
        </div>

        {/* Enhanced Question Types Summary */}
        {Object.values(stats.questionTypes).some(count => count > 0) && (
          <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Question types:</span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.questionTypes).map(([type, count]) => (
                count > 0 && (
                  <span key={type} className="inline-flex items-center space-x-1 bg-white dark:bg-gray-700 px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium">
                    <span>{getQuestionTypeIcon(type)}</span>
                    <span className="text-gray-700 dark:text-gray-300">{type.replace('-', ' ')}: {count}</span>
                  </span>
                )
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* Main Builder */}
        <div className="col-span-9 space-y-6">
          
          {/* Enhanced Assessment Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-colors">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50 mb-4">Assessment Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Assessment Title *
                </label>
                <input
                  type="text"
                  value={assessment.title || ''}
                  onChange={(e) => updateAssessment({ title: e.target.value })}
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-700 border rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                    errors.title 
                      ? 'border-red-300 dark:border-red-600' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter assessment title..."
                />
                {errors.title && <p className="text-red-600 dark:text-red-400 text-sm mt-1 flex items-center space-x-1">
                  <AlertCircle size={14} />
                  <span>{errors.title}</span>
                </p>}
              </div>

              {job && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-blue-900 dark:text-blue-300">{job.title}</p>
                      <p className="text-sm text-blue-700 dark:text-blue-400">{job.company} • {job.location}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs rounded-lg font-medium border border-blue-200 dark:border-blue-700">
                      Job #{job.id}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={assessment.description || ''}
                  onChange={(e) => updateAssessment({ description: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  rows="3"
                  placeholder="Brief description of this assessment..."
                />
              </div>
            </div>
          </div>

          {/* Enhanced Sections */}
          <div className="space-y-4">
            {assessment.sections.map((section, index) => (
              <SectionBuilder
                key={section.id}
                section={section}
                sectionIndex={index}
                onUpdateSection={(updates) => updateSection(section.id, updates)}
                onRemoveSection={() => removeSection(section.id)}
                onAddQuestion={(questionType) => addQuestion(section.id, questionType)}
                onUpdateQuestion={(questionId, updates) => updateQuestion(section.id, questionId, updates)}
                onRemoveQuestion={(questionId) => removeQuestion(section.id, questionId)}
                onDuplicateQuestion={(questionId) => duplicateQuestion(section.id, questionId)}
                questionTemplates={questionTemplates}
                errors={errors}
                canRemove={assessment.sections.length > 1}
              />
            ))}

            {/* Enhanced Add Section Button */}
            <button
              onClick={addSection}
              className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
            >
              <div className="flex items-center justify-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                </div>
                <div>
                  <p className="font-bold text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">Add New Section</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400">Organize questions into logical groups</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Enhanced Question Types Sidebar */}
        <div className="col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 sticky top-6 shadow-sm transition-colors">
            <h3 className="font-bold text-gray-900 dark:text-gray-50 mb-4 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Question Types</span>
            </h3>
            
            <div className="space-y-3">
              {Object.entries(questionTemplates).map(([type, template]) => (
                <div
                  key={type}
                  className="p-3 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                      type === 'single-choice' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                      type === 'multi-choice' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                      type === 'short-text' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                      type === 'long-text' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' :
                      type === 'numeric' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                      'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
                    }`}>
                      {getQuestionTypeIcon(type)}
                    </div>
                    <div className="flex-1">
                      <span className="font-bold text-gray-900 dark:text-gray-50 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {template.title}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {type === 'single-choice' ? 'One answer only' :
                         type === 'multi-choice' ? 'Multiple answers' :
                         type === 'short-text' ? 'Brief response' :
                         type === 'long-text' ? 'Detailed response' :
                         type === 'numeric' ? 'Number input' :
                         'Custom type'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Testing Tip */}
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <div className="flex items-start space-x-2">
                <Lightbulb className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <p className="font-bold text-green-800 dark:text-green-300 text-xs mb-1">Testing Tip</p>
                  <p className="text-xs text-green-700 dark:text-green-400 leading-relaxed">
                    Use "Test as Candidate" to experience your assessment from a candidate's perspective and validate question flow.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Modal */}
      {showCandidateSelect && <CandidateModal />}
    </div>
  );
};

export default QuestionBuilder;
