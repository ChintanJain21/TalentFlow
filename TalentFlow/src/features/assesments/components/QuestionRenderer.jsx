import { AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
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
  const { isDark } = useTheme();

  // Early return if no question
  if (!question) {
    return (
      <div className="p-6 border border-red-200 dark:border-red-800 rounded-xl bg-red-50 dark:bg-red-900/20 transition-colors">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="font-bold text-red-600 dark:text-red-400">Question data is missing</p>
            <p className="text-sm text-red-500 dark:text-red-400 mt-1">This question could not be loaded properly.</p>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced props preparation
  const questionProps = {
    question,
    onChange,
    mode,
    answer,
    onAnswer,
    error,
    questionNumber: (mode === 'simulation' || mode === 'preview') ? questionNumber : undefined
  };

  const getSupportedTypes = () => [
    'single-choice',
    'multi-choice', 
    'short-text',
    'long-text',
    'numeric',
    'file-upload'
  ];

  const getQuestionTypeInfo = (type) => {
    const types = {
      'single-choice': { name: 'Single Choice', icon: '○', description: 'Select one option' },
      'multi-choice': { name: 'Multiple Choice', icon: '☑', description: 'Select multiple options' },
      'short-text': { name: 'Short Text', icon: '📝', description: 'Brief text response' },
      'long-text': { name: 'Long Text', icon: '📄', description: 'Detailed text response' },
      'numeric': { name: 'Numeric', icon: '🔢', description: 'Number input' },
      'file-upload': { name: 'File Upload', icon: '📎', description: 'File attachment' }
    };
    return types[type] || { name: 'Unknown', icon: '❓', description: 'Unknown type' };
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
        const typeInfo = getQuestionTypeInfo(question.type);
        const supportedTypes = getSupportedTypes();
        
        return (
          <div className="p-6 border border-red-200 dark:border-red-800 rounded-xl bg-red-50 dark:bg-red-900/20 transition-colors">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-bold text-red-600 dark:text-red-400">Unknown Question Type</h4>
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 rounded-md text-xs font-medium">
                    {question.type}
                  </span>
                </div>
                <p className="text-sm text-red-500 dark:text-red-400 mb-4">
                  This question type is not supported or may be corrupted.
                </p>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-200 dark:border-red-700">
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Supported question types:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {supportedTypes.map(type => {
                      const info = getQuestionTypeInfo(type);
                      return (
                        <div key={type} className="flex items-center space-x-2 text-xs">
                          <span className="w-4 h-4 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
                            {info.icon}
                          </span>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{info.name}</span>
                            <p className="text-gray-500 dark:text-gray-400">{info.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="question-renderer">
      {renderQuestion()}
      
      {/* Enhanced Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl transition-colors">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="font-bold text-red-600 dark:text-red-400 text-sm mb-1">Validation Error</p>
              <p className="text-red-600 dark:text-red-400 text-sm leading-relaxed">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info (only in builder mode) */}
      {mode === 'builder' && process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-bold text-gray-600 dark:text-gray-400">Debug Info:</span>
          </div>
          <div className="space-y-1 text-gray-500 dark:text-gray-400">
            <p><strong>Type:</strong> {question.type}</p>
            <p><strong>ID:</strong> {question.id}</p>
            <p><strong>Mode:</strong> {mode}</p>
            {answer !== undefined && <p><strong>Answer:</strong> {JSON.stringify(answer)}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionRenderer;
