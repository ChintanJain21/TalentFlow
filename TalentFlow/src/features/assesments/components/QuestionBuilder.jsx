import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Settings, Eye, Save, ArrowLeft, User, UserCheck, X } from 'lucide-react';
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
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // Mock candidates for simulation
  const mockCandidates = [
    { 
      id: 1, 
      name: "John Smith", 
      email: "john.smith@email.com", 
      experience: "Senior Developer",
      avatar: "👨‍💻"
    },
    { 
      id: 2, 
      name: "Sarah Johnson", 
      email: "sarah.johnson@email.com", 
      experience: "Mid-level Designer",
      avatar: "👩‍🎨"
    },
    { 
      id: 3, 
      name: "Mike Chen", 
      email: "mike.chen@email.com", 
      experience: "Junior Developer",
      avatar: "👨‍🔬"
    },
    { 
      id: 4, 
      name: "Emily Davis", 
      email: "emily.davis@email.com", 
      experience: "Senior Manager",
      avatar: "👩‍💼"
    },
    { 
      id: 5, 
      name: "Alex Rodriguez", 
      email: "alex.rodriguez@email.com", 
      experience: "Mid-level Engineer",
      avatar: "👨‍🔧"
    }
  ];

  // DnD Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleTestAsCandidate = () => {
    setShowCandidateSelect(true);
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

  // Candidate Selection Modal
  const CandidateSelectionModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Test as Candidate</h2>
          <button
            onClick={() => setShowCandidateSelect(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Choose a candidate profile to simulate. This will test the assessment as if they were taking it.
          </p>
          
          <div className="space-y-3">
            {mockCandidates.map(candidate => (
              <button
                key={candidate.id}
                onClick={() => startTestWithCandidate(candidate)}
                className="w-full p-4 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{candidate.avatar}</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{candidate.name}</p>
                    <p className="text-sm text-gray-600">{candidate.email}</p>
                    <p className="text-xs text-blue-600 mt-1">{candidate.experience}</p>
                  </div>
                  <div className="text-blue-600">
                    <span className="text-xs">Start Test →</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              💡 <strong>Simulation Mode:</strong> Responses will be saved as if this candidate completed the assessment. 
              Perfect for testing and generating sample data.
            </p>
          </div>
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
              <h2 className="text-xl font-bold text-gray-900">
                {testMode ? 'Testing as Candidate' : 'Assessment Preview'}
              </h2>
              {testMode && selectedCandidate && (
                <div className="flex items-center space-x-2 mt-1">
                  <UserCheck size={16} className="text-green-600" />
                  <span className="text-sm text-gray-600">
                    Simulating: <strong>{selectedCandidate.name}</strong> ({selectedCandidate.experience})
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
            <h2 className="text-xl font-bold text-gray-900">
              {initialAssessment ? 'Edit Assessment' : 'Create Assessment'}
            </h2>
            {job && (
              <p className="text-gray-600">for {job.title} at {job.company}</p>
            )}
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
            onClick={handleTestAsCandidate}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <User size={16} />
            <span>Test as Candidate</span>
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

      {/* Stats Bar */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6">
            <span>📋 {stats.totalSections} sections</span>
            <span>❓ {stats.totalQuestions} questions</span>
            <span>⚠️ {stats.requiredQuestions} required</span>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            {Object.entries(stats.questionTypes).map(([type, count]) => (
              <span key={type} className="bg-white px-2 py-1 rounded">
                {type}: {count}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Builder Area */}
        <div className="col-span-8 space-y-6">
          {/* Assessment Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Assessment Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assessment Title *
                </label>
                <input
                  type="text"
                  value={assessment.title || ''}
                  onChange={(e) => updateAssessment({ title: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter assessment title..."
                />
                {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
              </div>

              {job && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Position
                  </label>
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
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={assessment.description || ''}
                  onChange={(e) => updateAssessment({ description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Describe the purpose of this assessment..."
                />
              </div>
            </div>
          </div>

          {/* Testing Panel */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <UserCheck className="text-green-600" size={20} />
              <span>Assessment Testing</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <button
                onClick={() => setPreviewMode(true)}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye size={16} />
                <span>Quick Preview</span>
              </button>
              
              <button
                onClick={handleTestAsCandidate}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <User size={16} />
                <span>Test as Candidate</span>
              </button>
            </div>
            
            <div className="text-sm text-gray-600 bg-white p-3 rounded border-l-4 border-green-400">
              <p className="font-medium text-green-800 mb-1">💡 HR Simulation Mode</p>
              <p>Use "Test as Candidate" to experience the assessment from a candidate's perspective. 
              Perfect for testing validation rules, conditional questions, and generating sample submissions.</p>
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

        {/* Question Types Palette */}
        <div className="col-span-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Question Types</h3>
            
            <div className="space-y-3">
              {Object.entries(questionTemplates).map(([type, template]) => (
                <div
                  key={type}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer group"
                  title={`Add ${template.title}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      type === 'single-choice' ? 'bg-blue-500' :
                      type === 'multi-choice' ? 'bg-green-500' :
                      type === 'short-text' ? 'bg-purple-500' :
                      type === 'long-text' ? 'bg-indigo-500' :
                      type === 'numeric' ? 'bg-orange-500' :
                      'bg-pink-500'
                    }`} />
                    <div className="flex-1">
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
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                💡 Tip: Click on a section's "Add Question" button, then select a question type to add it.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Selection Modal */}
      {showCandidateSelect && <CandidateSelectionModal />}
    </div>
  );
};

export default QuestionBuilder;
