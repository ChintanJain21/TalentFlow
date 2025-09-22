import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Plus, ArrowLeft, FileText, User, BarChart3, Eye, TestTube, ChevronRight, Clock, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { db } from '../../../db/database'; // ✅ ALREADY IMPORTED
import QuestionBuilder from './QuestionBuilder';
import AssessmentPreview from './AssesmentPreview';

const AssessmentBuilder = () => {
  const { isDark } = useTheme();
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [job, setJob] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('loading');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedSubmissionForReview, setSelectedSubmissionForReview] = useState(null);

  const isForceCreateMode = searchParams.get('mode') === 'create';

  useEffect(() => {
    if (jobId) {
      fetchData();
    } else {
      navigate('/jobs');
    }
  }, [jobId, searchParams]);

  // ✅ FIXED - IndexedDB data fetching
  const fetchData = async () => {
    try {
      const parsedJobId = parseInt(jobId);
      if (isNaN(parsedJobId)) {
        navigate('/jobs');
        return;
      }

      console.log('🔍 Fetching assessment data from IndexedDB:', parsedJobId);

      // Fetch job from IndexedDB
      const jobData = await db.jobs.get(parsedJobId);
      if (!jobData) {
        console.warn('❌ Job not found:', parsedJobId);
        navigate('/jobs');
        return;
      }
      setJob(jobData);

      // Fetch candidates from IndexedDB
      const candidatesData = await db.candidates
        .where('jobId')
        .equals(parsedJobId)
        .toArray();
      console.log('✅ Candidates loaded:', candidatesData.length);
      setCandidates(candidatesData);

      // Handle force create mode
      if (isForceCreateMode) {
        setAssessment(null);
        setMode('create');
        setLoading(false);
        return;
      }

      // Try to fetch existing assessment from IndexedDB
      try {
        const assessmentData = await db.assessments
          .where('jobId')
          .equals(parsedJobId)
          .first();

        if (assessmentData) {
          console.log('✅ Assessment found:', assessmentData.title);
          setAssessment(assessmentData);
          setMode('edit');
          
          await fetchSubmissions(assessmentData.id);
        } else {
          console.log('ℹ️ No assessment found for job:', parsedJobId);
          setAssessment(null);
          setMode('create');
        }
      } catch (assessmentError) {
        console.error('❌ Error fetching assessment:', assessmentError);
        setAssessment(null);
        setMode('create');
      }
      
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED - IndexedDB submissions fetching
  const fetchSubmissions = async (assessmentId) => {
    try {
      console.log('🔍 Fetching submissions for assessment:', assessmentId);
      const submissionsData = await db.submissions
        .where('assessmentId')
        .equals(assessmentId)
        .toArray();
      console.log('✅ Submissions loaded:', submissionsData.length);
      setSubmissions(submissionsData);
    } catch (error) {
      console.error('❌ Error fetching submissions:', error);
      setSubmissions([]);
    }
  };

  const handleSaveAssessment = (savedAssessment) => {
    setAssessment(savedAssessment);
    setMode('edit');
    if (isForceCreateMode) {
      navigate(`/assessments/${jobId}`, { replace: true });
    }
  };

  const handleCancel = () => {
    if (isForceCreateMode) {
      navigate(`/jobs/${jobId}`);
    } else {
      setMode(assessment ? 'edit' : 'create');
    }
  };

  const handleTestAsCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setMode('simulation');
  };

  const handleTestClick = () => {
    if (candidates.length === 0) {
      const testCandidate = {
        id: 'test-' + Date.now(),
        name: 'Test User',
        email: 'test@simulation.com',
        stage: 'assessment'
      };
      handleTestAsCandidate(testCandidate);
    } else if (candidates.length === 1) {
      handleTestAsCandidate(candidates[0]);
    } else {
      setMode('selectCandidate');
    }
  };

  const handleSimulationComplete = async () => {
    setMode('edit');
    if (assessment) {
      await fetchSubmissions(assessment.id);
    }
  };

  // ✅ FIXED - IndexedDB candidate lookup
  const handleViewResponses = async () => {
    if (submissions.length === 0) return;
    
    const latestSubmission = submissions[submissions.length - 1];
    
    let candidateDetails = null;
    if (latestSubmission.candidateId && typeof latestSubmission.candidateId === 'number') {
      try {
        candidateDetails = await db.candidates.get(latestSubmission.candidateId);
      } catch (error) {
        console.warn('❌ Could not fetch candidate details:', error);
      }
    }
    
    setSelectedSubmissionForReview({
      ...latestSubmission,
      candidateDetails
    });
    setMode('responses');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading assessment...</p>
        </div>
      </div>
    );
  }

  // Builder Mode
  if (mode === 'builder') {
    return (
      <QuestionBuilder
        assessment={assessment}
        jobId={parseInt(jobId)}
        job={job}
        onSave={handleSaveAssessment}
        onCancel={handleCancel}
      />
    );
  }

  // Preview Mode
  if (mode === 'preview') {
    return (
      <AssessmentPreview
        assessment={assessment}
        mode="preview"
        onBack={() => setMode('edit')}
      />
    );
  }

  // Simulation Mode
  if (mode === 'simulation') {
    return (
      <AssessmentPreview
        assessment={assessment}
        mode="simulation"
        candidateInfo={selectedCandidate}
        onBack={handleSimulationComplete}
        onSubmit={handleSimulationComplete}
      />
    );
  }

  // Responses Mode
  if (mode === 'responses' && selectedSubmissionForReview) {
    const submission = selectedSubmissionForReview;
    const allQuestions = assessment?.sections?.reduce((acc, section) => {
      return [...acc, ...section.questions];
    }, []) || [];

    return (
      <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen p-4">
        {/* Enhanced Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setMode('edit')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Mock Assessment Responses</h1>
            <p className="text-gray-600 dark:text-gray-400">{assessment?.title} - {job?.title}</p>
          </div>
        </div>

        {/* Enhanced Response Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">Simulation Response Review</h3>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Completed on {new Date(submission.completedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BarChart3 className="w-4 h-4" />
                  <span>{Math.floor((submission.timeSpent || 0) / 60)}m {(submission.timeSpent || 0) % 60}s</span>
                </div>
              </div>
            </div>
            <span className="inline-flex items-center space-x-2 px-4 py-2 text-sm rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 font-medium">
              <TestTube className="w-4 h-4" />
              <span>Mock Simulation</span>
            </span>
          </div>
        </div>

        {/* Enhanced Mock Responses */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">Questions & Responses</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Review how the mock assessment was answered</p>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {allQuestions.map((question, index) => {
              const answer = submission.answers?.[question.id];
              const hasAnswer = answer && (Array.isArray(answer) ? answer.length > 0 : answer.toString().trim() !== '');
              
              return (
                <div key={question.id} className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Enhanced Question Number */}
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center justify-center text-sm font-bold border border-blue-200 dark:border-blue-700">
                      {index + 1}
                    </div>

                    <div className="flex-1">
                      {/* Enhanced Question */}
                      <div className="mb-4">
                        <h4 className="font-bold text-gray-900 dark:text-gray-50 mb-2">{question.title}</h4>
                        <div className="inline-flex items-center space-x-2 text-sm">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md font-medium capitalize">
                            {question.type.replace('-', ' ')} question
                          </span>
                        </div>
                      </div>

                      {/* Enhanced Mock Answer */}
                      <div>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Mock Response:</p>
                        
                        {hasAnswer ? (
                          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                            {question.type === 'single-choice' || question.type === 'multi-choice' ? (
                              <div className="space-y-2">
                                {Array.isArray(answer) ? (
                                  answer.map((option, idx) => (
                                    <div key={idx} className="flex items-center space-x-3">
                                      <div className={`w-4 h-4 bg-blue-600 ${question.type === 'single-choice' ? 'rounded-full' : 'rounded'}`}></div>
                                      <span className="text-blue-800 dark:text-blue-300 font-medium">{option}</span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="flex items-center space-x-3">
                                    <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                                    <span className="text-blue-800 dark:text-blue-300 font-medium">{answer}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-blue-800 dark:text-blue-300">{answer}</p>
                            )}
                          </div>
                        ) : (
                          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                            <span className="text-gray-500 dark:text-gray-400 italic">No response provided</span>
                          </div>
                        )}

                        {/* Enhanced Available Options */}
                        {(question.type === 'single-choice' || question.type === 'multi-choice') && question.options && (
                          <div className="mt-4">
                            <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Available choices were:</p>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                              <div className="space-y-2">
                                {question.options.filter(opt => opt.trim()).map((option, idx) => (
                                  <div key={idx} className="flex items-center space-x-3">
                                    <div className={`w-3 h-3 border-2 border-gray-400 dark:border-gray-500 ${question.type === 'single-choice' ? 'rounded-full' : 'rounded-sm'}`}></div>
                                    <span className="text-gray-600 dark:text-gray-300 text-sm">{option}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhanced Back Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setMode('edit')}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Assessment</span>
          </button>
        </div>
      </div>
    );
  }

  // Candidate Selection Mode
  if (mode === 'selectCandidate') {
    return (
      <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setMode('edit')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Select Candidate to Simulate</h1>
            <p className="text-gray-600 dark:text-gray-400">Choose a candidate who applied to {job?.title}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">
              Candidates Applied ({candidates.length})
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Test the assessment as if you were one of these candidates
            </p>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {candidate.name ? candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'NA'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">{candidate.name || 'Unknown'}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{candidate.email || 'No email'}</p>
                      <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500 dark:text-gray-500">
                        <span>{candidate.experience || 0} years exp</span>
                        <span>•</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          candidate.stage === 'hired' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                          candidate.stage === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                          candidate.stage === 'offer' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' :
                          'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                        }`}>
                          {candidate.stage || 'applied'}
                        </span>
                        <span>•</span>
                        <span>Applied {new Date(candidate.appliedDate || candidate.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleTestAsCandidate(candidate)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors font-medium"
                  >
                    <TestTube size={16} />
                    <span>Test as {candidate.name ? candidate.name.split(' ')[0] : 'User'}</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen p-4">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to={`/jobs/${jobId}`}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Job</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              {isForceCreateMode ? 'Create Assessment' : 'Assessment'} for {job?.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{job?.department || job?.company} • {job?.location}</p>
            {isForceCreateMode && (
              <div className="flex items-center space-x-2 mt-1">
                <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                  Create Mode - Starting with blank assessment
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Mode */}
      {mode === 'create' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <FileText size={40} className="text-gray-400 dark:text-gray-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-4">
              {isForceCreateMode ? 'Create New Assessment' : 'No Assessment Created Yet'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Create a comprehensive assessment for <strong>{job?.title}</strong> position 
              with different question types, sections, and validation rules.
            </p>
            
            <button
              onClick={() => setMode('builder')}
              className="flex items-center space-x-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-lg mx-auto font-medium"
            >
              <Plus size={20} />
              <span>
                {isForceCreateMode ? 'Start Creating Assessment' : 'Create Assessment'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Edit Mode */}
      {mode === 'edit' && assessment && (
        <div className="space-y-6">
          {/* Enhanced Assessment Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">{assessment.title}</h2>
                  <span className="inline-flex items-center space-x-1 px-3 py-1 text-sm rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700">
                    <CheckCircle className="w-3 h-3" />
                    <span>Active</span>
                  </span>
                </div>
                
                {assessment.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{assessment.description}</p>
                )}
                
                <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>{assessment.sections?.length || 0} sections</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>
                      {assessment.sections?.reduce((total, section) => 
                        total + (section.questions?.length || 0), 0) || 0} questions
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{candidates.length} candidates applied</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setMode('builder')}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
              >
                <span>Edit Assessment</span>
              </button>
            </div>

            {/* Enhanced Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setMode('builder')}
                className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <FileText size={16} />
                <span className="font-medium">Edit Questions</span>
              </button>
              
              <button
                onClick={() => setMode('preview')}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
              >
                <Eye size={16} />
                <span className="font-medium">Preview</span>
              </button>
              
              <button
                onClick={handleTestClick}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors"
              >
                <TestTube size={16} />
                <span className="font-medium">Test as Candidate</span>
              </button>
              
              <button
                onClick={handleViewResponses}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl transition-colors ${
                  submissions.length === 0
                    ? 'border border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'border border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }`}
                disabled={submissions.length === 0}
              >
                <BarChart3 size={16} />
                <span className="font-medium">View Responses ({submissions.length})</span>
              </button>
            </div>
          </div>

          {/* Enhanced Assessment Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-gray-50 mb-4">Assessment Structure</h3>
            
            {assessment.sections?.map((section, index) => (
              <div key={section.id} className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2">
                  {index + 1}. {section.title}
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {section.questions?.length || 0} questions
                  {section.questions?.length > 0 && (
                    <span className="ml-2">
                      ({[...new Set(section.questions.map(q => q.type.replace('-', ' ')))].join(', ')})
                    </span>
                  )}
                </div>
              </div>
            ))}
            
            {(!assessment.sections || assessment.sections.length === 0) && (
              <p className="text-gray-500 dark:text-gray-400 italic">No sections created yet.</p>
            )}
          </div>

          {/* Enhanced Candidates & Results Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enhanced Job-Specific Candidates */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-gray-50 mb-4">
                Candidates Applied ({candidates.length})
              </h3>
              
              {candidates.length > 0 ? (
                <div className="space-y-3">
                  {candidates.slice(0, 5).map(candidate => (
                    <div key={candidate.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-50">{candidate.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{candidate.stage || 'applied'}</p>
                      </div>
                      <button
                        onClick={() => handleTestAsCandidate(candidate)}
                        className="text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                      >
                        Test as {candidate.name ? candidate.name.split(' ')[0] : 'User'}
                      </button>
                    </div>
                  ))}
                  
                  {candidates.length > 5 && (
                    <button
                      onClick={() => setMode('selectCandidate')}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      View all {candidates.length} candidates →
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">No candidates applied yet</p>
                  <button
                    onClick={handleTestClick}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    Test assessment anyway →
                  </button>
                </div>
              )}
            </div>

            {/* Enhanced Test Results */}
            {submissions.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-gray-50 mb-4">Mock Test History</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{submissions.length}</div>
                    <div className="text-xs text-blue-800 dark:text-blue-300">Simulations</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      {Math.floor(submissions.reduce((acc, sub) => acc + (sub.timeSpent || 0), 0) / submissions.length / 60)}m
                    </div>
                    <div className="text-xs text-purple-800 dark:text-purple-300">Avg Time</div>
                  </div>
                </div>

                <div className="space-y-2">
                  {submissions.slice(-3).map((submission, index) => (
                    <div key={submission.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-50">Mock Test #{submissions.length - index}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(submission.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                          {Math.floor((submission.timeSpent || 0) / 60)}m {(submission.timeSpent || 0) % 60}s
                        </span>
                        <button
                          onClick={() => {
                            setSelectedSubmissionForReview(submission);
                            setMode('responses');
                          }}
                          className="block text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-1 font-medium"
                        >
                          View Responses
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleViewResponses}
                  className="w-full mt-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  View Latest Responses →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentBuilder;
