import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, AlertCircle, User } from 'lucide-react';
import QuestionRenderer from './QuestionRenderer';
import useFormValidation from '../hooks/useFormValidation';

const AssessmentPreview = ({ 
  assessment, 
  onBack, 
  mode = 'preview', // 'preview' | 'runtime' | 'simulation'
  candidateInfo = null
}) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState({});
  const [startTime] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);

  // Use validation hook
  const {
    errors,
    validateAll,
    clearError,
    shouldShowQuestion,
    completionPercentage,
    validationSummary
  } = useFormValidation(assessment, answers);

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    clearError(questionId);
  };

  const handleSubmit = async () => {
    const { isValid, errors: validationErrors } = validateAll();
    
    if (!isValid) {
      alert(`Please fix ${Object.keys(validationErrors).length} validation errors before submitting.`);
      return;
    }

    setSubmitting(true);
    
    const submissionData = {
      assessmentId: assessment.id,
      answers,
      submittedAt: new Date().toISOString(),
      timeSpent: Date.now() - startTime,
      candidateInfo: candidateInfo || {
        name: 'HR Test User',
        email: 'hr@company.com',
        note: 'HR testing assessment'
      }
    };

    try {
      const response = await fetch(`/api/assessments/${assessment.jobId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit assessment');
      }

      const result = await response.json();
      console.log('✅ Assessment submitted:', result);
      
      let message;
      if (mode === 'simulation' && candidateInfo) {
        message = `🎭 Simulation Complete!\n\nCandidate: ${candidateInfo.name}\nScore: ${result.score}%\nCompletion: ${result.completionPercentage}%\nTime: ${Math.round((Date.now() - startTime) / 1000 / 60)} minutes\n\nSubmission ID: ${result.submissionId}`;
      } else {
        message = `✅ Assessment test completed!\n\nScore: ${result.score}%\nSubmission ID: ${result.submissionId}`;
      }
      
      alert(message);
      onBack?.();
      
    } catch (error) {
      console.error('❌ Submission failed:', error);
      alert('Failed to submit assessment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentSectionData = assessment.sections[currentSection];
  const isSimulationMode = mode === 'simulation' && candidateInfo;
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{assessment.title}</h1>
            {assessment.description && (
              <p className="text-gray-600">{assessment.description}</p>
            )}
          </div>
        </div>

        {/* Simulation Badge */}
        {isSimulationMode && (
          <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 border border-green-300 rounded-lg">
            <User size={16} className="text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Simulating: {candidateInfo.name}
            </span>
          </div>
        )}
      </div>

      {/* Progress and Stats Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Clock size={16} />
              <span>{Math.floor((Date.now() - startTime) / 1000 / 60)} min elapsed</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle size={16} />
              <span>{completionPercentage}% complete</span>
            </div>
            {Object.keys(errors).length > 0 && (
              <div className="flex items-center space-x-1 text-red-600">
                <AlertCircle size={16} />
                <span>{Object.keys(errors).length} errors</span>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-500">
            Section {currentSection + 1} of {assessment.sections.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              isSimulationMode ? 'bg-green-600' : 'bg-blue-600'
            }`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Current Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{currentSectionData.title}</h2>
          {currentSectionData.description && (
            <p className="text-gray-600 mt-2">{currentSectionData.description}</p>
          )}
        </div>

        <div className="p-6 space-y-8">
          {currentSectionData.questions
            .filter(question => shouldShowQuestion(question, answers))
            .map((question, index) => (
            <div key={question.id} className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  isSimulationMode ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  <span className={`text-sm font-medium ${
                    isSimulationMode ? 'text-green-600' : 'text-blue-600'
                  }`}>{index + 1}</span>
                </div>
                <div className="flex-1">
                  <QuestionRenderer
                    question={question}
                    mode={mode}
                    answer={answers[question.id]}
                    onAnswer={(answer) => handleAnswer(question.id, answer)}
                    error={errors[question.id]}
                    questionNumber={index + 1}
                  />
                </div>
              </div>
              
              {index < currentSectionData.questions.length - 1 && (
                <hr className="border-gray-200" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
          disabled={currentSection === 0}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={16} />
          <span>Previous</span>
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            {validationSummary.answeredQuestions} of {validationSummary.totalQuestions} answered
            {validationSummary.errorCount > 0 && (
              <span className="text-red-600 ml-2">• {validationSummary.errorCount} errors</span>
            )}
          </p>
        </div>

        {currentSection === assessment.sections.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={submitting || validationSummary.errorCount > 0}
            className={`flex items-center space-x-2 px-6 py-2 text-white rounded-lg disabled:opacity-50 ${
              isSimulationMode 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
            ) : (
              <CheckCircle size={16} />
            )}
            <span>
              {submitting ? 'Submitting...' : 
               isSimulationMode ? 'Submit as ' + candidateInfo.name : 
               'Submit Assessment'}
            </span>
          </button>
        ) : (
          <button
            onClick={() => setCurrentSection(Math.min(assessment.sections.length - 1, currentSection + 1))}
            className={`flex items-center space-x-2 px-4 py-2 text-white rounded-lg ${
              isSimulationMode ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <span>Next</span>
            <ArrowRight size={16} />
          </button>
        )}
      </div>

      {/* Simulation Footer */}
      {isSimulationMode && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <User size={16} className="text-green-600" />
            <div className="text-sm">
              <span className="font-medium text-green-800">Simulation Mode: </span>
              <span className="text-green-700">
                You are testing this assessment as <strong>{candidateInfo.name}</strong> ({candidateInfo.experience}). 
                The submission will be stored as if they completed it.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentPreview;
