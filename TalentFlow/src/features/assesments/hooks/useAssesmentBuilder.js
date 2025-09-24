import { useState, useEffect, useCallback } from 'react';
import { db } from '../../../db/database';

const useAssessmentBuilder = (initialAssessment = null) => {
  const [assessment, setAssessment] = useState(
    initialAssessment || {
      id: null,
      jobId: null,
      title: '',
      description: '',
      sections: [{
        id: Date.now(),
        title: 'Section 1',
        description: '',
        questions: []
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  );
  
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ✅ SIMPLE - Try API first, fallback to IndexedDB
  const fetchWithFallback = async (apiCall, fallbackCall) => {
    try {
      return await apiCall();
    } catch (error) {
      console.warn('API failed, using IndexedDB fallback:', error.message);
      return await fallbackCall();
    }
  };

  // Question templates (unchanged - perfect as-is)
  const questionTemplates = {
    'single-choice': {
      title: 'Single Choice',
      type: 'single-choice',
      question: '',
      options: ['', '', ''],
      required: false
    },
    'multi-choice': {
      title: 'Multiple Choice',
      type: 'multi-choice',
      question: '',
      options: ['', '', ''],
      required: false
    },
    'short-text': {
      title: 'Short Text',
      type: 'short-text',
      question: '',
      placeholder: 'Enter your answer...',
      required: false,
      maxLength: 100
    },
    'long-text': {
      title: 'Long Text',
      type: 'long-text',
      question: '',
      placeholder: 'Enter your detailed answer...',
      required: false,
      maxLength: 1000
    },
    'numeric': {
      title: 'Numeric',
      type: 'numeric',
      question: '',
      placeholder: 'Enter a number...',
      required: false,
      min: null,
      max: null
    },
    'file-upload': {
      title: 'File Upload',
      type: 'file-upload',
      question: '',
      acceptedTypes: ['.pdf', '.doc', '.docx'],
      maxSize: 5,
      required: false
    }
  };

  // Mark as dirty when assessment changes
  useEffect(() => {
    if (initialAssessment) {
      setIsDirty(JSON.stringify(assessment) !== JSON.stringify(initialAssessment));
    } else {
      setIsDirty(true);
    }
  }, [assessment, initialAssessment]);

  // ✅ UPDATED - saveAssessment with MSW + IndexedDB fallback
  const saveAssessment = useCallback(async () => {
    setLoading(true);
    setErrors({});

    try {
      console.log('💾 Saving assessment:', assessment.title);

      // Validate assessment
      const validationErrors = validateAssessment(assessment);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        console.error('❌ Validation errors:', validationErrors);
        return false;
      }

      const assessmentData = {
        ...assessment,
        updatedAt: new Date().toISOString()
      };

      const result = await fetchWithFallback(
        // Try MSW API first
        async () => {
          const isUpdate = assessment.id && assessment.id !== 'temp';
          const url = isUpdate ? `/api/assessments/${assessment.jobId}` : `/api/assessments`;
          const method = isUpdate ? 'PUT' : 'POST';

          const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assessmentData),
          });

          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          
          const savedAssessment = await response.json();
          console.log('✅ Assessment saved via MSW API:', savedAssessment.title);
          return { 
            success: true, 
            id: savedAssessment.id, 
            assessment: savedAssessment 
          };
        },
        // Fallback to IndexedDB
        async () => {
          let savedId;

          if (assessment.id) {
            // Update existing assessment
            console.log('📝 Updating existing assessment:', assessment.id);
            await db.assessments.update(assessment.id, assessmentData);
            savedId = assessment.id;
          } else {
            // Create new assessment
            console.log('🆕 Creating new assessment');
            const dataToSave = { ...assessmentData };
            delete dataToSave.id; // Remove null id
            savedId = await db.assessments.add(dataToSave);
            console.log('✅ New assessment created with ID:', savedId);
          }

          const savedAssessment = await db.assessments.get(savedId);
          console.log('✅ Assessment saved via IndexedDB');
          return { 
            success: true, 
            id: savedId, 
            assessment: savedAssessment 
          };
        }
      );

      if (result.success) {
        // Update local state
        setAssessment(prev => ({
          ...prev,
          id: result.id,
          updatedAt: result.assessment?.updatedAt || assessmentData.updatedAt
        }));

        setIsDirty(false);
        console.log('✅ Assessment saved successfully:', result.id);
        return true;
      }

      return false;

    } catch (error) {
      console.error('❌ Error saving assessment:', error);
      setErrors({ save: 'Failed to save assessment. Please try again.' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [assessment]);

  // Validation function (unchanged - perfect as-is)
  const validateAssessment = (assessment) => {
    const errors = {};

    // Validate title
    if (!assessment.title?.trim()) {
      errors.title = 'Assessment title is required';
    }

    // Validate sections
    if (!assessment.sections || assessment.sections.length === 0) {
      errors.sections = 'At least one section is required';
    } else {
      assessment.sections.forEach((section, index) => {
        if (!section.title?.trim()) {
          errors[`section-${section.id}-title`] = `Section ${index + 1} title is required`;
        }
        
        if (!section.questions || section.questions.length === 0) {
          errors[`section-${section.id}-questions`] = `Section ${index + 1} must have at least one question`;
        } else {
          section.questions.forEach((question) => {
            // Don't require question title initially, but validate on save
            if (!question.title?.trim() && !question.question?.trim()) {
              errors[`question-${question.id}`] = 'Question text is required';
            }
            
            // Validate choice questions have options
            if ((question.type === 'single-choice' || question.type === 'multi-choice')) {
              const validOptions = question.options?.filter(opt => opt && opt.trim()) || [];
              if (validOptions.length < 2) {
                errors[`question-${question.id}`] = 'Choice questions must have at least 2 non-empty options';
              }
            }
          });
        }
      });
    }

    return errors;
  };

  // Update assessment (unchanged - perfect as-is)
  const updateAssessment = useCallback((updates) => {
    setAssessment(prev => ({ ...prev, ...updates }));
  }, []);

  // Section operations (unchanged - perfect as-is)
  const addSection = useCallback(() => {
    const newSection = {
      id: Date.now(),
      title: `Section ${assessment.sections.length + 1}`,
      description: '',
      questions: []
    };
    setAssessment(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  }, [assessment.sections.length]);

  const updateSection = useCallback((sectionId, updates) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    }));
  }, []);

  const removeSection = useCallback((sectionId) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }));
  }, []);

  // Question operations (unchanged - perfect as-is)
  const addQuestion = useCallback((sectionId, questionType) => {
    const template = questionTemplates[questionType];
    if (!template) {
      console.error('Unknown question type:', questionType);
      return;
    }

    const newQuestion = {
      id: Date.now(),
      title: '',
      type: questionType,
      question: '',
      ...(template.options ? { options: ['', '', ''] } : {}),
      ...(template.placeholder ? { placeholder: template.placeholder } : {}),
      ...(template.maxLength ? { maxLength: template.maxLength } : {}),
      ...(template.acceptedTypes ? { acceptedTypes: template.acceptedTypes } : {}),
      ...(template.maxSize ? { maxSize: template.maxSize } : {}),
      required: false,
      createdAt: new Date().toISOString()
    };

    console.log('➕ Adding new question:', newQuestion);

    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              questions: [...section.questions, newQuestion]
            }
          : section
      )
    }));
  }, []);

  const updateQuestion = useCallback((sectionId, questionId, updates) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map(question =>
                question.id === questionId ? { ...question, ...updates } : question
              )
            }
          : section
      )
    }));
  }, []);

  const removeQuestion = useCallback((sectionId, questionId) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.filter(question => question.id !== questionId)
            }
          : section
      )
    }));
  }, []);

  const duplicateQuestion = useCallback((sectionId, questionId) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.reduce((acc, question) => {
                acc.push(question);
                if (question.id === questionId) {
                  const duplicate = {
                    ...question,
                    id: Date.now(),
                    title: question.title ? `${question.title} (Copy)` : '',
                    question: question.question ? `${question.question} (Copy)` : '',
                    createdAt: new Date().toISOString()
                  };
                  acc.push(duplicate);
                }
                return acc;
              }, [])
            }
          : section
      )
    }));
  }, []);

  // Get statistics (unchanged - perfect as-is)
  const getStats = useCallback(() => {
    const totalSections = assessment.sections.length;
    const totalQuestions = assessment.sections.reduce((total, section) => 
      total + (section.questions?.length || 0), 0
    );
    const requiredQuestions = assessment.sections.reduce((total, section) => 
      total + (section.questions?.filter(q => q.required)?.length || 0), 0
    );

    const questionTypes = {};
    assessment.sections.forEach(section => {
      section.questions?.forEach(question => {
        questionTypes[question.type] = (questionTypes[question.type] || 0) + 1;
      });
    });

    return {
      totalSections,
      totalQuestions,
      requiredQuestions,
      questionTypes
    };
  }, [assessment]);

  return {
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
  };
};

export default useAssessmentBuilder;
