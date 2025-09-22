import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, AlertCircle, User, Play, Eye, TestTube } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import QuestionRenderer from './QuestionRenderer';
import useFormValidation from '../hooks/useFormValidation';

const AssessmentPreview = ({ 
  assessment, 
  onBack, 
  mode = 'preview', // 'preview' | 'simulation'
  candidateInfo = null
}) => {
  const { isDark } = useTheme();
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState({});
  const [startTime] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);

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
    // Skip validation for preview mode
    if (mode !== 'preview') {
      const { isValid, errors: validationErrors } = validateAll();
      if (!isValid) {
        alert(`Please fix ${Object.keys(validationErrors).length} validation errors.`);
        return;
      }
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

      if (!response.ok) throw new Error('Failed to submit assessment');

      const result = await response.json();
      
      const message = mode === 'simulation' && candidateInfo
        ? `🎭 Simulation Complete!\n\nCandidate: ${candidateInfo.name}\nScore: ${result.score}%\nTime: ${Math.round((Date.now() - startTime) / 1000 / 60)} min`
        : `✅ Assessment test completed!\n\nScore: ${result.score}%`;
      
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
  const isSimulation = mode === 'simulation' && candidateInfo;
  const showSubmit = mode !== 'preview';

  const getModeStyles = () => {
    if (isSimulation) {
      return {
        primary: 'bg-green-600 hover:bg-green-700',
        secondary: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700',
        progress: 'bg-green-600',
        accent: 'text-green-600 dark:text-green-400'
      };
    }
    return {
      primary: 'bg-blue-600 hover:bg-blue-700',
      secondary: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700',
      progress: 'bg-blue-600',
      accent: 'text-blue-600 dark:text-blue-400'
    };
  };

  const styles = getModeStyles();
  
  return (
    <div className="max-w-4xl mx-auto space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen p-4 transition-colors">
      
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{assessment.title}</h1>
            {assessment.description && (
              <p className="text-gray-600 dark:text-gray-400">{assessment.description}</p>
            )}
          </div>
        </div>

        {/* Enhanced Mode Badge */}
        {isSimulation && (
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl border ${styles.secondary}`}>
            <TestTube size={16} className={styles.accent} />
            <span className="text-sm font-bold">
              Simulating: {candidateInfo.name}
            </span>
          </div>
        )}
        
        {mode === 'preview' && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl">
            <Eye size={16} className="text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-bold text-blue-800 dark:text-blue-300">Preview Mode</span>
          </div>
        )}
      </div>

      {/* Enhanced Progress Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <Clock size={16} />
              <span className="font-medium">{Math.floor((Date.now() - startTime) / 1000 / 60)} min elapsed</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle size={16} />
              <span className="font-medium">{completionPercentage}% complete</span>
            </div>
            {mode !== 'preview' && Object.keys(errors).length > 0 && (
              <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                <AlertCircle size={16} />
                <span className="font-medium">{Object.keys(errors).length} errors</span>
              </div>
            )}
          </div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Section {currentSection + 1} of {assessment.sections.length}
          </div>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${styles.progress}`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Enhanced Current Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">{currentSectionData.title}</h2>
          {currentSectionData.description && (
            <p className="text-gray-600 dark:text-gray-400 mt-2">{currentSectionData.description}</p>
          )}
        </div>

        <div className="p-6 space-y-8">
          {currentSectionData.questions
            .filter(question => shouldShowQuestion(question, answers))
            .map((question, index) => (
            <div key={question.id} className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isSimulation 
                    ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700' 
                    : 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
                }`}>
                  <span className={`text-sm font-bold ${styles.accent}`}>{index + 1}</span>
                </div>
                <div className="flex-1">
                  <QuestionRenderer
                    question={question}
                    mode={mode}
                    answer={answers[question.id]}
                    onAnswer={(answer) => handleAnswer(question.id, answer)}
                    error={mode !== 'preview' ? errors[question.id] : null}
                    questionNumber={index + 1}
                  />
                </div>
              </div>
              
              {index < currentSectionData.questions.length - 1 && (
                <hr className="border-gray-200 dark:border-gray-700" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
          disabled={currentSection === 0}
          className="flex items-center space-x-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
        >
          <ArrowLeft size={16} />
          <span>Previous</span>
        </button>

        {mode !== 'preview' && (
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {validationSummary.answeredQuestions} of {validationSummary.totalQuestions} answered
              {validationSummary.errorCount > 0 && (
                <span className="text-red-600 dark:text-red-400 ml-2 font-bold">• {validationSummary.errorCount} errors</span>
              )}
            </p>
          </div>
        )}

        {/* Enhanced Next/Submit Button */}
        {currentSection === assessment.sections.length - 1 ? (
          showSubmit ? (
            <button
              onClick={handleSubmit}
              disabled={submitting || validationSummary.errorCount > 0}
              className={`flex items-center space-x-2 px-6 py-3 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold shadow-lg hover:shadow-xl ${styles.primary}`}
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
              ) : (
                <CheckCircle size={16} />
              )}
              <span>
                {submitting ? 'Submitting...' : 
                 isSimulation ? `Submit as ${candidateInfo.name}` : 'Submit Assessment'}
              </span>
            </button>
          ) : (
            <div className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl font-medium">
              Last Section
            </div>
          )
        ) : (
          <button
            onClick={() => setCurrentSection(Math.min(assessment.sections.length - 1, currentSection + 1))}
            className={`flex items-center space-x-2 px-6 py-3 text-white rounded-xl transition-all font-bold shadow-lg hover:shadow-xl ${styles.primary}`}
          >
            <span>Next</span>
            <ArrowRight size={16} />
          </button>
        )}
      </div>

      {/* Enhanced Simulation Footer */}
      {isSimulation && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-6 transition-colors">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <User size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-bold text-green-800 dark:text-green-300 mb-1">Simulation Mode Active</h4>
              <p className="text-sm text-green-700 dark:text-green-400 leading-relaxed">
                Testing as <strong>{candidateInfo.name}</strong> ({candidateInfo.experience} years experience). 
                All responses will be stored as if this candidate completed the assessment.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Preview Mode Footer */}
      {mode === 'preview' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 transition-colors">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Eye size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-1">Preview Mode</h4>
              <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
                You're previewing how candidates will see this assessment. No data will be saved in this mode.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentPreview;
