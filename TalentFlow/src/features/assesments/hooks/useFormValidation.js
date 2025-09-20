import { useState, useCallback, useMemo } from 'react';

const useFormValidation = (assessment, answers = {}) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation rules
  const validationRules = {
    required: (value, field) => {
      if (!value || value === '' || (Array.isArray(value) && value.length === 0)) {
        return `${field.title} is required`;
      }
      return null;
    },

    maxLength: (value, field, maxLength) => {
      if (value && value.toString().length > maxLength) {
        return `${field.title} must be ${maxLength} characters or less`;
      }
      return null;
    },

    minLength: (value, field, minLength) => {
      if (value && value.toString().length < minLength) {
        return `${field.title} must be at least ${minLength} characters`;
      }
      return null;
    },

    numericRange: (value, field, min, max) => {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return `${field.title} must be a valid number`;
      }
      if (min !== undefined && numValue < min) {
        return `${field.title} must be at least ${min}`;
      }
      if (max !== undefined && numValue > max) {
        return `${field.title} must be at most ${max}`;
      }
      return null;
    },

    fileSize: (value, field, maxSize) => {
      if (value && value.size) {
        const maxSizeBytes = parseFloat(maxSize) * (maxSize.includes('MB') ? 1024 * 1024 : 1024);
        if (value.size > maxSizeBytes) {
          return `File size must be less than ${maxSize}`;
        }
      }
      return null;
    },

    fileType: (value, field, allowedTypes) => {
      if (value && value.name) {
        const fileExtension = value.name.split('.').pop().toLowerCase();
        if (!allowedTypes.includes(fileExtension)) {
          return `File type must be one of: ${allowedTypes.join(', ')}`;
        }
      }
      return null;
    }
  };

  // Validate individual question
  const validateQuestion = useCallback((question, answer) => {
    const questionErrors = [];

    // Required validation
    if (question.required) {
      const error = validationRules.required(answer, question);
      if (error) questionErrors.push(error);
    }

    // Skip other validations if required validation failed
    if (questionErrors.length > 0) {
      return questionErrors[0];
    }

    // Type-specific validations
    switch (question.type) {
      case 'short-text':
      case 'long-text':
        if (question.validation?.maxLength) {
          const error = validationRules.maxLength(answer, question, question.validation.maxLength);
          if (error) questionErrors.push(error);
        }
        if (question.validation?.minLength) {
          const error = validationRules.minLength(answer, question, question.validation.minLength);
          if (error) questionErrors.push(error);
        }
        break;

      case 'numeric':
        if (answer && answer !== '') {
          const error = validationRules.numericRange(
            answer, 
            question, 
            question.validation?.min, 
            question.validation?.max
          );
          if (error) questionErrors.push(error);
        }
        break;

      case 'file-upload':
        if (answer) {
          if (question.validation?.maxSize) {
            const error = validationRules.fileSize(answer, question, question.validation.maxSize);
            if (error) questionErrors.push(error);
          }
          if (question.validation?.allowedTypes) {
            const error = validationRules.fileType(answer, question, question.validation.allowedTypes);
            if (error) questionErrors.push(error);
          }
        }
        break;

      case 'single-choice':
        // Single choice validation handled by required check
        break;

      case 'multi-choice':
        // Multi choice validation handled by required check
        break;
    }

    return questionErrors[0] || null;
  }, []);

  // Validate all questions
  const validateAll = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    if (!assessment?.sections) return { isValid: true, errors: {} };

    assessment.sections.forEach(section => {
      section.questions?.forEach(question => {
        // Check conditional logic first
        if (!shouldShowQuestion(question, answers)) {
          return; // Skip validation for hidden questions
        }

        const answer = answers[question.id];
        const error = validateQuestion(question, answer);
        
        if (error) {
          newErrors[question.id] = error;
          isValid = false;
        }
      });
    });

    setErrors(newErrors);
    return { isValid, errors: newErrors };
  }, [assessment, answers, validateQuestion]);

  // Validate single field
  const validateField = useCallback((questionId) => {
    const question = findQuestionById(questionId);
    if (!question) return;

    const answer = answers[questionId];
    const error = validateQuestion(question, answer);
    
    setErrors(prev => ({
      ...prev,
      [questionId]: error
    }));

    setTouched(prev => ({
      ...prev,
      [questionId]: true
    }));

    return !error;
  }, [answers, validateQuestion]);

  // Clear error for field
  const clearError = useCallback((questionId) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[questionId];
      return newErrors;
    });
  }, []);

  // Mark field as touched
  const touchField = useCallback((questionId) => {
    setTouched(prev => ({
      ...prev,
      [questionId]: true
    }));
  }, []);

  // Helper: Find question by ID
  const findQuestionById = useCallback((questionId) => {
    if (!assessment?.sections) return null;
    
    for (const section of assessment.sections) {
      const question = section.questions?.find(q => q.id === questionId);
      if (question) return question;
    }
    return null;
  }, [assessment]);

  // Conditional logic - determine if question should be shown
  const shouldShowQuestion = useCallback((question, currentAnswers) => {
    if (!question.conditionalLogic) return true;

    const { dependsOn, condition, value } = question.conditionalLogic;
    const dependentAnswer = currentAnswers[dependsOn];

    switch (condition) {
      case 'equals':
        return dependentAnswer === value;
      case 'not_equals':
        return dependentAnswer !== value;
      case 'contains':
        return Array.isArray(dependentAnswer) && dependentAnswer.includes(value);
      case 'greater_than':
        return parseFloat(dependentAnswer) > parseFloat(value);
      case 'less_than':
        return parseFloat(dependentAnswer) < parseFloat(value);
      case 'is_filled':
        return dependentAnswer && dependentAnswer !== '';
      case 'is_empty':
        return !dependentAnswer || dependentAnswer === '';
      default:
        return true;
    }
  }, []);

  // Get visible questions (after conditional logic)
  const visibleQuestions = useMemo(() => {
    if (!assessment?.sections) return [];

    const visible = [];
    assessment.sections.forEach(section => {
      section.questions?.forEach(question => {
        if (shouldShowQuestion(question, answers)) {
          visible.push({
            ...question,
            sectionId: section.id,
            sectionTitle: section.title
          });
        }
      });
    });

    return visible;
  }, [assessment, answers, shouldShowQuestion]);

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    const visible = visibleQuestions;
    if (visible.length === 0) return 0;

    const answered = visible.filter(question => {
      const answer = answers[question.id];
      if (Array.isArray(answer)) return answer.length > 0;
      return answer && answer.toString().trim() !== '';
    }).length;

    return Math.round((answered / visible.length) * 100);
  }, [visibleQuestions, answers]);

  // Get validation summary
  const validationSummary = useMemo(() => {
    const totalQuestions = visibleQuestions.length;
    const requiredQuestions = visibleQuestions.filter(q => q.required).length;
    const answeredQuestions = visibleQuestions.filter(question => {
      const answer = answers[question.id];
      if (Array.isArray(answer)) return answer.length > 0;
      return answer && answer.toString().trim() !== '';
    }).length;
    const errorCount = Object.keys(errors).length;

    return {
      totalQuestions,
      requiredQuestions,
      answeredQuestions,
      errorCount,
      completionPercentage,
      isValid: errorCount === 0 && answeredQuestions >= requiredQuestions
    };
  }, [visibleQuestions, answers, errors, completionPercentage]);

  return {
    // State
    errors,
    touched,
    
    // Actions
    validateAll,
    validateField,
    clearError,
    touchField,
    
    // Helpers
    shouldShowQuestion,
    visibleQuestions,
    completionPercentage,
    validationSummary,
    
    // Individual validators (for custom use)
    validateQuestion
  };
};

export default useFormValidation;
