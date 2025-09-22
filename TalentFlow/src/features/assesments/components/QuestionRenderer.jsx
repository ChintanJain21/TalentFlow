import SingleChoice from './QuestionTypes/SingleChoice';
import MultiChoice from './QuestionTypes/MultiChoice';
import TextInput from './QuestionTypes/TextInput';
import LongText from './QuestionTypes/LongText';
import NumericInput from './QuestionTypes/NumbericInput';
import FileUpload from './QuestionTypes/FileUpload';

const QuestionRenderer = ({ 
  question, 
  onChange, 
  mode = 'builder', // 'builder' | 'preview' | 'simulation'
  answer,
  onAnswer,
  error,
  questionNumber 
}) => {
  // Early return if no question
  if (!question) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <p className="text-red-600">❌ Question data is missing</p>
      </div>
    );
  }

  // ✅ SIMPLIFIED props preparation
  const questionProps = {
    question,
    onChange,
    mode,
    answer,
    onAnswer,
    error,
    questionNumber: (mode === 'simulation' || mode === 'preview') ? questionNumber : undefined
  };

  const renderQuestion = () => {
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
        return (
          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <p className="text-red-600">❌ Unknown question type: {question.type}</p>
            <p className="text-xs text-gray-500 mt-1">
              Supported types: single-choice, multi-choice, short-text, long-text, numeric, file-upload
            </p>
          </div>
        );
    }
  };

  return (
    <div className="question-renderer">
      {renderQuestion()}
      
      {/* Error display */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">⚠️ {error}</p>
        </div>
      )}
    </div>
  );
};

export default QuestionRenderer;
