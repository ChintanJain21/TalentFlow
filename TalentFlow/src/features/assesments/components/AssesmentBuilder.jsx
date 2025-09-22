import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Plus, ArrowLeft, FileText, User, BarChart3, Eye, TestTube, ChevronRight } from 'lucide-react';
import { db } from '../../../db/database';
import QuestionBuilder from './QuestionBuilder';
import AssessmentPreview from './AssesmentPreview'; // Your existing component

const AssessmentBuilder = () => {
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

  const fetchData = async () => {
    try {
      // Fetch job
      const jobResponse = await fetch(`/api/jobs/${jobId}`);
      if (!jobResponse.ok) {
        navigate('/jobs');
        return;
      }
      const jobData = await jobResponse.json();
      setJob(jobData);

      // ✅ FETCH CANDIDATES FROM DEXIE
      const candidatesData = await db.candidates
        .where('jobId')
        .equals(parseInt(jobId))
        .toArray();
      setCandidates(candidatesData);

      // Handle force create mode
      if (isForceCreateMode) {
        setAssessment(null);
        setMode('create');
        setLoading(false);
        return;
      }

      // Try to fetch existing assessment
      try {
        const assessmentResponse = await fetch(`/api/assessments/${jobId}`);
        if (assessmentResponse.ok) {
          const assessmentData = await assessmentResponse.json();
          setAssessment(assessmentData);
          setMode('edit');
          
          // ✅ FETCH SUBMISSIONS FROM DEXIE
          await fetchSubmissions(assessmentData.id || parseInt(jobId));
        } else {
          setAssessment(null);
          setMode('create');
        }
      } catch {
        setAssessment(null);
        setMode('create');
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  // ✅ SEPARATE FUNCTION TO FETCH SUBMISSIONS
  const fetchSubmissions = async (assessmentId) => {
    try {
      const submissionsData = await db.submissions
        .where('assessmentId')
        .equals(assessmentId)
        .toArray();
      setSubmissions(submissionsData);
    } catch (error) {
      console.error('Error fetching submissions:', error);
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
      // Create a generic test candidate
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

  // ✅ HANDLE SIMULATION COMPLETION
  const handleSimulationComplete = async () => {
    setMode('edit');
    // Refresh submissions after simulation
    if (assessment) {
      await fetchSubmissions(assessment.id || parseInt(jobId));
    }
  };

  // ✅ VIEW RESPONSES HANDLER
  const handleViewResponses = async () => {
    if (submissions.length === 0) return;
    
    // Get the latest submission with full details
    const latestSubmission = submissions[submissions.length - 1];
    
    // Load candidate details if available
    let candidateDetails = null;
    if (latestSubmission.candidateId) {
      candidateDetails = await db.candidates.get(latestSubmission.candidateId);
    }
    
    setSelectedSubmissionForReview({
      ...latestSubmission,
      candidateDetails
    });
    setMode('responses');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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

  // ✅ SIMULATION MODE - Using your existing AssessmentPreview
  if (mode === 'simulation') {
    return (
      <AssessmentPreview
        assessment={assessment}
        mode="simulation"
        candidateInfo={selectedCandidate}
        onBack={handleSimulationComplete} // ✅ Updated to handle completion
        onSubmit={handleSimulationComplete} // ✅ Handle submission
      />
    );
  }

  // ✅ RESPONSES MODE - SHOW MOCK RESPONSES
  if (mode === 'responses' && selectedSubmissionForReview) {
    const submission = selectedSubmissionForReview;
    const allQuestions = assessment?.sections?.reduce((acc, section) => {
      return [...acc, ...section.questions];
    }, []) || [];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setMode('edit')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mock Assessment Responses</h1>
            <p className="text-gray-600">{assessment?.title} - {job?.title}</p>
          </div>
        </div>

        {/* Simple Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Simulation Response Review</h3>
              <p className="text-sm text-gray-600">
                Completed on {new Date(submission.completedAt).toLocaleDateString()}
              </p>
            </div>
            <span className="px-3 py-1 text-sm rounded-full bg-purple-100 text-purple-700 font-medium">
              🎮 Mock Simulation
            </span>
          </div>
        </div>

        {/* Mock Responses */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Questions & Responses</h3>
            <p className="text-sm text-gray-600 mt-1">Review how the mock assessment was answered</p>
          </div>

          <div className="divide-y divide-gray-200">
            {allQuestions.map((question, index) => {
              const answer = submission.answers[question.id];
              const hasAnswer = answer && (Array.isArray(answer) ? answer.length > 0 : answer.toString().trim() !== '');
              
              return (
                <div key={question.id} className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Question Number */}
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>

                    <div className="flex-1">
                      {/* Question */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">{question.title}</h4>
                        <div className="text-sm text-gray-500 capitalize">
                          {question.type.replace('-', ' ')} question
                        </div>
                      </div>

                      {/* Mock Answer */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Mock Response:</p>
                        
                        {hasAnswer ? (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            {question.type === 'single-choice' || question.type === 'multi-choice' ? (
                              <div className="space-y-2">
                                {Array.isArray(answer) ? (
                                  answer.map((option, idx) => (
                                    <div key={idx} className="flex items-center space-x-2">
                                      <div className={`w-4 h-4 bg-blue-600 ${question.type === 'single-choice' ? 'rounded-full' : 'rounded'}`}></div>
                                      <span className="text-blue-800 font-medium">{option}</span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                                    <span className="text-blue-800 font-medium">{answer}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-blue-800">{answer}</p>
                            )}
                          </div>
                        ) : (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <span className="text-gray-500 italic">No response provided</span>
                          </div>
                        )}

                        {/* Show available options for reference */}
                        {(question.type === 'single-choice' || question.type === 'multi-choice') && question.options && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-gray-600 mb-2">Available choices were:</p>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="space-y-1">
                                {question.options.filter(opt => opt.trim()).map((option, idx) => (
                                  <div key={idx} className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 border border-gray-400 ${question.type === 'single-choice' ? 'rounded-full' : 'rounded-sm'}`}></div>
                                    <span className="text-gray-600 text-sm">{option}</span>
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

        {/* Simple Back Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setMode('edit')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Assessment
          </button>
        </div>
      </div>
    );
  }

  // Candidate Selection Mode
  if (mode === 'selectCandidate') {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setMode('edit')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Select Candidate to Simulate</h1>
            <p className="text-gray-600">Choose a candidate who applied to {job?.title}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Candidates Applied ({candidates.length})
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Test the assessment as if you were one of these candidates
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">
                        {candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{candidate.name}</h3>
                      <p className="text-sm text-gray-600">{candidate.email}</p>
                      <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500">
                        <span>{candidate.experience} years exp</span>
                        <span>•</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          candidate.stage === 'hired' ? 'bg-green-100 text-green-800' :
                          candidate.stage === 'rejected' ? 'bg-red-100 text-red-800' :
                          candidate.stage === 'offer' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {candidate.stage}
                        </span>
                        <span>•</span>
                        <span>Applied {new Date(candidate.appliedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleTestAsCandidate(candidate)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <TestTube size={16} />
                    <span>Test as {candidate.name.split(' ')[0]}</span>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to={`/jobs/${jobId}`}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            <span>Back to Job</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isForceCreateMode ? 'Create Assessment' : 'Assessment'} for {job?.title}
            </h1>
            <p className="text-gray-600">{job?.company} • {job?.location}</p>
            {isForceCreateMode && (
              <p className="text-blue-600 text-sm font-medium mt-1">
                🎯 Create Mode - Starting with blank assessment
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Create Mode */}
      {mode === 'create' && (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center py-12">
            <FileText size={64} className="mx-auto text-gray-400 mb-6" />
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {isForceCreateMode ? 'Create New Assessment' : 'No Assessment Created Yet'}
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create a comprehensive assessment for <strong>{job?.title}</strong> position 
              with different question types, sections, and validation rules.
            </p>
            
            <button
              onClick={() => setMode('builder')}
              className="flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg mx-auto"
            >
              <Plus size={20} />
              <span className="font-medium">
                {isForceCreateMode ? 'Start Creating Assessment' : 'Create Assessment'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Edit Mode */}
      {mode === 'edit' && assessment && (
        <div className="space-y-6">
          {/* Assessment Overview */}
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{assessment.title}</h2>
                  <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                
                {assessment.description && (
                  <p className="text-gray-600 mb-4">{assessment.description}</p>
                )}
                
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <span>📋</span>
                    <span>{assessment.sections?.length || 0} sections</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>❓</span>
                    <span>
                      {assessment.sections?.reduce((total, section) => 
                        total + (section.questions?.length || 0), 0) || 0} questions
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>👥</span>
                    <span>{candidates.length} candidates applied</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setMode('builder')}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <span>Edit Assessment</span>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={() => setMode('builder')}
                className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <FileText size={16} />
                <span>Edit Questions</span>
              </button>
              
              <button
                onClick={() => setMode('preview')}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Eye size={16} />
                <span>Preview</span>
              </button>
              
              <button
                onClick={handleTestClick}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <TestTube size={16} />
                <span>Test as Candidate</span>
              </button>
              
              <button
                onClick={handleViewResponses}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg ${
                  submissions.length === 0
                    ? 'border border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'border border-blue-300 text-blue-600 hover:bg-blue-50'
                }`}
                disabled={submissions.length === 0}
              >
                <BarChart3 size={16} />
                <span>View Responses ({submissions.length})</span>
              </button>
            </div>
          </div>

          {/* Assessment Preview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-medium text-gray-900 mb-4">Assessment Structure</h3>
            
            {assessment.sections?.map((section, index) => (
              <div key={section.id} className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">
                  {index + 1}. {section.title}
                </h4>
                <div className="text-sm text-gray-600">
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
              <p className="text-gray-500 italic">No sections created yet.</p>
            )}
          </div>

          {/* Candidates & Results Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Job-Specific Candidates */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4">
                Candidates Applied ({candidates.length})
              </h3>
              
              {candidates.length > 0 ? (
                <div className="space-y-3">
                  {candidates.slice(0, 5).map(candidate => (
                    <div key={candidate.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{candidate.name}</p>
                        <p className="text-xs text-gray-500">{candidate.stage}</p>
                      </div>
                      <button
                        onClick={() => handleTestAsCandidate(candidate)}
                        className="text-xs px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Test as {candidate.name.split(' ')[0]}
                      </button>
                    </div>
                  ))}
                  
                  {candidates.length > 5 && (
                    <button
                      onClick={() => setMode('selectCandidate')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View all {candidates.length} candidates →
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-sm text-gray-500">No candidates applied yet</p>
                  <button
                    onClick={handleTestClick}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Test assessment anyway →
                  </button>
                </div>
              )}
            </div>

            {/* ✅ UPDATED Test Results - Mock Responses Only */}
            {submissions.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-medium text-gray-900 mb-4">Mock Test History</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{submissions.length}</div>
                    <div className="text-xs text-blue-800">Simulations</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">
                      {Math.floor(submissions.reduce((acc, sub) => acc + (sub.timeSpent || 0), 0) / submissions.length / 60)}m
                    </div>
                    <div className="text-xs text-purple-800">Avg Time</div>
                  </div>
                </div>

                <div className="space-y-2">
                  {submissions.slice(-3).map((submission, index) => (
                    <div key={submission.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium">Mock Test #{submissions.length - index}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(submission.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-purple-600 font-medium">
                          {Math.floor(submission.timeSpent / 60)}m {submission.timeSpent % 60}s
                        </span>
                        <button
                          onClick={() => {
                            setSelectedSubmissionForReview(submission);
                            setMode('responses');
                          }}
                          className="block text-xs text-blue-600 hover:text-blue-700 mt-1"
                        >
                          View Responses
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleViewResponses}
                  className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
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
