import SingleChoice from './QuestionTypes/SingleChoice';
import MultiChoice from './QuestionTypes/MultiChoice';
import TextInput from './QuestionTypes/TextInput';
import LongText from './QuestionTypes/LongText';
import NumericInput from './QuestionTypes/NumbericInput';
import FileUpload from './QuestionTypes/FileUpload';

const QuestionRenderer = ({ 
  question, 
  onChange, 
  mode = 'builder', // 'builder' | 'preview' | 'runtime' | 'simulation'
  answer,
  onAnswer,
  error,
  questionNumber 
}) => {
  // Debug logging to track what's happening
  console.log('🔍 QuestionRenderer - Mode:', mode, 'Question:', question?.title, 'Type:', question?.type);

  // Ensure question exists
  if (!question) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <p className="text-red-600">❌ Question data is missing</p>
      </div>
    );
  }

  // Prepare props for question components
  const questionProps = {
    question,
    onChange,
    mode,
    answer,
    onAnswer,
    error
  };

  // 🚀 FIX: Add question number for BOTH runtime AND simulation modes
  const isInteractiveMode = mode === 'runtime' || mode === 'simulation';
  if (isInteractiveMode && questionNumber) {
    questionProps.questionNumber = questionNumber;
  }

  // Ensure onAnswer is properly passed for interactive modes
  if (isInteractiveMode && onAnswer) {
    questionProps.onAnswer = onAnswer;
  }

  const renderQuestion = () => {
    console.log('🔍 About to render question type:', question.type, 'with props:', {
      mode,
      hasAnswer: !!answer,
      hasOnAnswer: !!onAnswer,
      hasError: !!error
    });

    switch (question.type) {
      case 'single-choice':
        return <SingleChoice {...questionProps} />;
      
      case 'multi-choice':
        return <MultiChoice {...questionProps} />;
      
      case 'short-text':
        return <TextInput {...questionProps} />;
      
      case 'long-text':
        return <LongText {...questionProps} />;
      
      case 'numeric':
        return <NumericInput {...questionProps} />;
      
      case 'file-upload':
        return <FileUpload {...questionProps} />;
      
      default:
        console.error('❌ Unknown question type:', question.type);
        return (
          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <p className="text-red-600">❌ Unknown question type: {question.type}</p>
            <p className="text-xs text-gray-500 mt-1">Mode: {mode} | ID: {question.id}</p>
            <details className="mt-2">
              <summary className="text-xs text-gray-400 cursor-pointer">Debug Info</summary>
              <pre className="text-xs text-gray-400 mt-1 overflow-auto">
                {JSON.stringify(question, null, 2)}
              </pre>
            </details>
          </div>
        );
    }
  };

  return (
    <div className="question-renderer">
      {/* Development debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400 mb-2 p-2 bg-gray-50 rounded border-l-2 border-blue-300">
          <strong>Debug:</strong> Mode={mode} | Type={question.type} | ID={question.id} | 
          Answer={answer ? '✓' : '✗'} | OnAnswer={onAnswer ? '✓' : '✗'}
        </div>
      )}
      
      {renderQuestion()}
      
      {/* Error display at bottom */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">⚠️ {error}</p>
        </div>
      )}
    </div>
  );
};

export default QuestionRenderer;
