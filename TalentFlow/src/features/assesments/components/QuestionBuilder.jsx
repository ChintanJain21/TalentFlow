import { useState } from 'react';
import { Plus, Eye, Save, ArrowLeft, User, UserCheck, X } from 'lucide-react';
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

  // ✅ SIMPLE mock candidates (remove after save)
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

  // ✅ SIMPLIFIED Candidate Modal
  const CandidateModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Test as Candidate</h2>
          <button onClick={() => setShowCandidateSelect(false)} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-3">
          {mockCandidates.map(candidate => (
            <button
              key={candidate.id}
              onClick={() => startTestWithCandidate(candidate)}
              className="w-full p-4 text-left border rounded-lg hover:bg-blue-50 hover:border-blue-300"
            >
              <p className="font-medium">{candidate.name}</p>
              <p className="text-sm text-gray-600">{candidate.experience}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Preview/Test Mode
  if (previewMode || testMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackFromTest}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              <span>Back to Builder</span>
            </button>
            <div>
              <h2 className="text-xl font-bold">
                {testMode ? 'Testing as Candidate' : 'Assessment Preview'}
              </h2>
              {testMode && selectedCandidate && (
                <div className="flex items-center space-x-2 mt-1">
                  <UserCheck size={16} className="text-green-600" />
                  <span className="text-sm text-gray-600">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onCancel}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div>
            <h2 className="text-xl font-bold">
              {initialAssessment ? 'Edit Assessment' : 'Create Assessment'}
            </h2>
            {job && <p className="text-gray-600">for {job.title}</p>}
          </div>
          {isDirty && <span className="text-orange-600 text-sm">• Unsaved changes</span>}
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setPreviewMode(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Eye size={16} />
            <span>Preview</span>
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={16} />
            <span>{loading ? 'Saving...' : 'Save Assessment'}</span>
          </button>
        </div>
      </div>

      {/* ✅ ENHANCED Stats Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-sm">
            <span className="flex items-center space-x-1">
              <span>📋</span>
              <span>{stats.totalSections} sections</span>
            </span>
            <span className="flex items-center space-x-1">
              <span>❓</span>
              <span>{stats.totalQuestions} questions</span>
            </span>
            <span className="flex items-center space-x-1">
              <span>⚠️</span>
              <span>{stats.requiredQuestions} required</span>
            </span>
          </div>
          
          {/* ✅ MOVED Test Button to Stats Bar */}
          <button
            onClick={() => setShowCandidateSelect(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            <User size={16} />
            <span>Test as Candidate</span>
          </button>
        </div>

        {/* Question Types Summary */}
        <div className="flex items-center space-x-3 mt-2 text-xs">
          {Object.entries(stats.questionTypes).map(([type, count]) => (
            count > 0 && (
              <span key={type} className="bg-white px-2 py-1 rounded border">
                {type.replace('-', ' ')}: {count}
              </span>
            )
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Builder */}
        <div className="col-span-9 space-y-6">
          {/* Assessment Info */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-medium mb-4">Assessment Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assessment Title *
                </label>
                <input
                  type="text"
                  value={assessment.title || ''}
                  onChange={(e) => updateAssessment({ title: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter assessment title..."
                />
                {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
              </div>

              {job && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-900">{job.title}</p>
                      <p className="text-sm text-blue-700">{job.company} • {job.location}</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      Job #{job.id}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={assessment.description || ''}
                  onChange={(e) => updateAssessment({ description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Brief description of this assessment..."
                />
              </div>
            </div>
          </div>

          {/* Sections */}
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

            <button
              onClick={addSection}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <Plus size={20} />
                <span>Add New Section</span>
              </div>
            </button>
          </div>
        </div>

        {/* ✅ COMPACT Question Types Sidebar */}
        <div className="col-span-3">
          <div className="bg-white rounded-lg border p-4 sticky top-6">
            <h3 className="font-medium mb-3">Question Types</h3>
            
            <div className="space-y-2">
              {Object.entries(questionTemplates).map(([type, template]) => (
                <div
                  key={type}
                  className="p-2 border rounded hover:bg-gray-50 cursor-pointer text-sm"
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      type === 'single-choice' ? 'bg-blue-500' :
                      type === 'multi-choice' ? 'bg-green-500' :
                      type === 'short-text' ? 'bg-purple-500' :
                      type === 'long-text' ? 'bg-indigo-500' :
                      type === 'numeric' ? 'bg-orange-500' :
                      'bg-pink-500'
                    }`} />
                    <span className="font-medium">{template.title}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-xs text-green-700">
              <p className="font-medium mb-1">💡 Testing Tip</p>
              <p>Use "Test as Candidate" to experience your assessment from a candidate's perspective and validate question flow.</p>
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
