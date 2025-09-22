import { useState, useCallback } from 'react';

const useAssessmentBuilder = (initialAssessment = null) => {
  // Assessment state
  const [assessment, setAssessment] = useState(initialAssessment || {
    title: '',
    description: '',
    jobId: null,
    sections: [{
      id: `section-${Date.now()}`,
      title: 'Section 1',
      questions: []
    }]
  });

  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ✅ FIXED: Restore template titles for sidebar, keep empty options only
  const questionTemplates = {
    'single-choice': {
      type: 'single-choice',
      title: 'Single Choice', // ✅ RESTORED for sidebar display
      required: true,
      options: ['', ''] // ✅ ONLY this stays empty for placeholder fix
    },
    'multi-choice': {
      type: 'multi-choice',
      title: 'Multiple Choice', // ✅ RESTORED for sidebar display
      required: false,
      options: ['', ''] // ✅ ONLY this stays empty for placeholder fix
    },
    'short-text': {
      type: 'short-text',
      title: 'Short Text', // ✅ RESTORED for sidebar display
      required: true,
      validation: { maxLength: 100 }
    },
    'long-text': {
      type: 'long-text',
      title: 'Long Text', // ✅ RESTORED for sidebar display
      required: false,
      validation: { maxLength: 500 }
    },
    'numeric': {
      type: 'numeric',
      title: 'Numeric', // ✅ RESTORED for sidebar display
      required: true,
      validation: { min: 0, max: 100 }
    },
    'file-upload': {
      type: 'file-upload',
      title: 'File Upload', // ✅ RESTORED for sidebar display
      required: false,
      validation: { maxSize: '5MB', allowedTypes: ['pdf', 'doc', 'docx'] }
    }
  };

  // Update assessment basic info
  const updateAssessment = useCallback((updates) => {
    setAssessment(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  }, []);

  // Section management
  const addSection = useCallback(() => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: `Section ${assessment.sections.length + 1}`,
      questions: []
    };

    setAssessment(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
    setIsDirty(true);
  }, [assessment.sections.length]);

  const updateSection = useCallback((sectionId, updates) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(section => 
        section.id === sectionId ? { ...section, ...updates } : section
      )
    }));
    setIsDirty(true);
  }, []);

  const removeSection = useCallback((sectionId) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }));
    setIsDirty(true);
  }, []);

  const reorderSections = useCallback((fromIndex, toIndex) => {
    setAssessment(prev => {
      const newSections = [...prev.sections];
      const [movedSection] = newSections.splice(fromIndex, 1);
      newSections.splice(toIndex, 0, movedSection);
      return { ...prev, sections: newSections };
    });
    setIsDirty(true);
  }, []);

  // Question management
  const addQuestion = useCallback((sectionId, questionType) => {
    const template = questionTemplates[questionType];
    if (!template) {
      console.error('Unknown question type:', questionType);
      return;
    }

    const newQuestion = {
      ...template,
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title : '', // ✅ FIXED: Use template title for new questions
    };

    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(section => 
        section.id === sectionId 
          ? { ...section, questions: [...section.questions, newQuestion] }
          : section
      )
    }));
    setIsDirty(true);
  }, [questionTemplates]);

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
    setIsDirty(true);
  }, []);

  const removeQuestion = useCallback((sectionId, questionId) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(section => 
        section.id === sectionId 
          ? { ...section, questions: section.questions.filter(q => q.id !== questionId) }
          : section
      )
    }));
    setIsDirty(true);
  }, []);

  const reorderQuestions = useCallback((sectionId, fromIndex, toIndex) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(section => 
        section.id === sectionId 
          ? {
              ...section,
              questions: (() => {
                const newQuestions = [...section.questions];
                const [movedQuestion] = newQuestions.splice(fromIndex, 1);
                newQuestions.splice(toIndex, 0, movedQuestion);
                return newQuestions;
              })()
            }
          : section
      )
    }));
    setIsDirty(true);
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
                  // Add duplicated question
                  acc.push({
                    ...question,
                    id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    title: `${question.title} (Copy)`
                  });
                }
                return acc;
              }, [])
            }
          : section
      )
    }));
    setIsDirty(true);
  }, []);

  // Validation
  const validateAssessment = useCallback(() => {
    const newErrors = {};

    // Basic validation
    if (!assessment.title.trim()) {
      newErrors.title = 'Assessment title is required';
    }

    if (!assessment.jobId) {
      newErrors.jobId = 'Job selection is required';
    }

    // Section validation
    assessment.sections.forEach((section, sectionIndex) => {
      if (!section.title.trim()) {
        newErrors[`section-${section.id}-title`] = 'Section title is required';
      }

      if (section.questions.length === 0) {
        newErrors[`section-${section.id}-questions`] = 'Section must have at least one question';
      }

      // Question validation
      section.questions.forEach((question, questionIndex) => {
        const questionKey = `question-${question.id}`;
        
        if (!question.title || !question.title.trim()) {
          newErrors[`${questionKey}-title`] = 'Question title is required';
        }

        // Type-specific validation
        if (['single-choice', 'multi-choice'].includes(question.type)) {
          const validOptions = question.options ? question.options.filter(opt => opt && opt.trim()) : [];
          if (validOptions.length < 2) {
            newErrors[`${questionKey}-options`] = 'At least 2 options with content are required';
          }
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [assessment]);

  // Save assessment
  // ✅ SIMPLE FIX - Just use your existing MSW handlers
const saveAssessment = useCallback(async () => {
  if (!validateAssessment()) {
    return false;
  }

  setLoading(true);
  try {
    // Your MSW handler expects PUT /api/assessments/:jobId
    const response = await fetch(`/api/assessments/${assessment.jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessment)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const savedAssessment = await response.json();
    setAssessment(savedAssessment);
    setIsDirty(false);
    return true;
  } catch (error) {
    console.error('Save failed:', error);
    return false;
  } finally {
    setLoading(false);
  }
}, [assessment, validateAssessment]);


  // Reset to initial state
  const resetAssessment = useCallback(() => {
    setAssessment(initialAssessment || {
      title: '',
      description: '',
      jobId: null,
      sections: [{
        id: `section-${Date.now()}`,
        title: 'Section 1',
        questions: []
      }]
    });
    setIsDirty(false);
    setErrors({});
  }, [initialAssessment]);

  // Get stats
  const getStats = useCallback(() => {
    const totalQuestions = assessment.sections.reduce((total, section) => {
      return total + section.questions.length;
    }, 0);

    const questionTypes = assessment.sections.reduce((types, section) => {
      section.questions.forEach(question => {
        types[question.type] = (types[question.type] || 0) + 1;
      });
      return types;
    }, {});

    return {
      totalSections: assessment.sections.length,
      totalQuestions,
      questionTypes,
      requiredQuestions: assessment.sections.reduce((total, section) => {
        return total + section.questions.filter(q => q.required).length;
      }, 0)
    };
  }, [assessment]);

  return {
    // State
    assessment,
    isDirty,
    loading,
    errors,
    questionTemplates,

    // Assessment methods
    updateAssessment,
    resetAssessment,
    saveAssessment,
    validateAssessment,

    // Section methods
    addSection,
    updateSection,
    removeSection,
    reorderSections,

    // Question methods
    addQuestion,
    updateQuestion,
    removeQuestion,
    reorderQuestions,
    duplicateQuestion,

    // Utils
    getStats
  };
};

export default useAssessmentBuilder;
