import { useMemo } from 'react';

const useFormValidation = (assessment, answers) => {
  const errors = {};

  const validateAll = () => {
    const validationErrors = {};
    let isValid = true;

    // Validate each question based on answers
    assessment.sections?.forEach(section => {
      section.questions?.forEach(question => {
        const answer = answers[question.id];
        const error = validateQuestion(question, answer);
        
        if (error) {
          validationErrors[question.id] = error;
          isValid = false;
        }
      });
    });

    return { isValid, errors: validationErrors };
  };

  const validateQuestion = (question, answer) => {
    if (question.required && (!answer || 
        (Array.isArray(answer) && answer.length === 0) || 
        (typeof answer === 'string' && !answer.trim()))) {
      return 'This question is required';
    }

    // Type-specific validation
    switch (question.type) {
      case 'short-text':
        if (answer && question.maxLength && answer.length > question.maxLength) {
          return `Answer must be ${question.maxLength} characters or less`;
        }
        break;
        
      case 'long-text':
        if (answer && question.maxLength && answer.length > question.maxLength) {
          return `Answer must be ${question.maxLength} characters or less`;
        }
        break;
        
      case 'numeric':
        if (answer && isNaN(Number(answer))) {
          return 'Please enter a valid number';
        }
        if (answer && question.min !== null && Number(answer) < question.min) {
          return `Number must be ${question.min} or greater`;
        }
        if (answer && question.max !== null && Number(answer) > question.max) {
          return `Number must be ${question.max} or less`;
        }
        break;
    }

    return null;
  };

  const clearError = (questionId) => {
    delete errors[questionId];
  };

  const shouldShowQuestion = (question, answers) => {
    // Add conditional logic here if needed
    // For now, show all questions
    return true;
  };

  const completionPercentage = useMemo(() => {
    const totalQuestions = assessment.sections?.reduce((total, section) => 
      total + (section.questions?.length || 0), 0) || 0;
    
    if (totalQuestions === 0) return 0;
    
    const answeredQuestions = Object.keys(answers).filter(questionId => {
      const answer = answers[questionId];
      return answer && (
        (Array.isArray(answer) && answer.length > 0) ||
        (typeof answer === 'string' && answer.trim()) ||
        (typeof answer === 'number') ||
        answer === true || answer === false
      );
    }).length;

    return Math.round((answeredQuestions / totalQuestions) * 100);
  }, [assessment, answers]);

  const validationSummary = useMemo(() => {
    const totalQuestions = assessment.sections?.reduce((total, section) => 
      total + (section.questions?.length || 0), 0) || 0;
    
    const answeredQuestions = Object.keys(answers).length;
    const errorCount = Object.keys(errors).length;

    return {
      totalQuestions,
      answeredQuestions,
      errorCount
    };
  }, [assessment, answers, errors]);

  return {
    errors,
    validateAll,
    clearError,
    shouldShowQuestion,
    completionPercentage,
    validationSummary
  };
};

export default useFormValidation;
