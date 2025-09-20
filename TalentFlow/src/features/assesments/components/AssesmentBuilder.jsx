import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, ArrowLeft, FileText, User, BarChart3 } from 'lucide-react';
import QuestionBuilder from './QuestionBuilder';

const AssessmentBuilder = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('loading');

  useEffect(() => {
    if (jobId) {
      fetchJobAndAssessment();
    } else {
      navigate('/jobs');
    }
  }, [jobId]);

  const fetchJobAndAssessment = async () => {
    try {
      // Fetch job details
      const jobsResponse = await fetch('/api/jobs?pageSize=25');
      const jobsData = await jobsResponse.json();
      const foundJob = jobsData.data?.find(j => j.id === parseInt(jobId));
      
      if (!foundJob) {
        console.error('Job not found:', jobId);
        navigate('/jobs');
        return;
      }
      
      setJob(foundJob);
      
      // Try to fetch existing assessment
      try {
        const assessmentResponse = await fetch(`/api/assessments/${jobId}`);
        
        if (assessmentResponse.ok) {
          const assessmentData = await assessmentResponse.json();
          setAssessment(assessmentData);
          setMode('edit');
          console.log(`✅ Found existing assessment for job ${jobId}`);
        } else {
          setAssessment(null);
          setMode('create');
          console.log(`📝 No assessment found for job ${jobId}, will create new`);
        }
      } catch (assessmentError) {
        setAssessment(null);
        setMode('create');
        console.log(`📝 No assessment found for job ${jobId}, will create new`);
      }

      // Fetch submissions
      const allSubmissions = JSON.parse(localStorage.getItem('assessmentSubmissions') || '[]');
      const jobSubmissions = allSubmissions.filter(sub => sub.jobId === parseInt(jobId));
      setSubmissions(jobSubmissions);
      
    } catch (error) {
      console.error('Error fetching job/assessment:', error);
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssessment = () => {
    setMode('builder');
  };

  const handleEditAssessment = () => {
    setMode('builder');
  };

  const handleSaveAssessment = (savedAssessment) => {
    console.log('Assessment saved:', savedAssessment);
    setAssessment(savedAssessment);
    setMode('edit');
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
        onCancel={() => setMode(assessment ? 'edit' : 'create')}
      />
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
              Assessment for {job?.title}
            </h1>
            <p className="text-gray-600">{job?.company} • {job?.location}</p>
          </div>
        </div>
      </div>

      {/* Create Mode */}
      {mode === 'create' && (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center py-12">
            <FileText size={64} className="mx-auto text-gray-400 mb-6" />
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              No Assessment Created Yet
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create a comprehensive assessment for <strong>{job?.title}</strong> position 
              with different question types, sections, and validation rules.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={handleCreateAssessment}
                className="flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg mx-auto"
              >
                <Plus size={20} />
                <span className="font-medium">Create Assessment</span>
              </button>
              
              <div className="text-left max-w-md mx-auto mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Assessment Features:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Multiple sections and question types</li>
                  <li>• Single choice, multiple choice, text inputs</li>
                  <li>• File uploads and numeric ranges</li>
                  <li>• Live preview and validation rules</li>
                  <li>• Conditional questions and logic</li>
                  <li>• HR simulation and testing tools</li>
                </ul>
              </div>
            </div>
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
                    <span>📅</span>
                    <span>Updated {new Date(assessment.updatedAt || assessment.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleEditAssessment}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <span>Edit Assessment</span>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={handleEditAssessment}
                className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <FileText size={16} />
                <span>Edit Questions</span>
              </button>
              
              <button
                onClick={handleEditAssessment}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <User size={16} />
                <span>Test as Candidate</span>
              </button>
              
              <button
                className="flex items-center justify-center space-x-2 px-4 py-3 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50"
                disabled={submissions.length === 0}
              >
                <BarChart3 size={16} />
                <span>View Results ({submissions.length})</span>
              </button>
            </div>
          </div>

          {/* Assessment Preview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-medium text-gray-900 mb-4">Assessment Overview</h3>
            
            {assessment.sections?.map((section, index) => (
              <div key={section.id} className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">
                  {index + 1}. {section.title}
                </h4>
                <div className="text-sm text-gray-600">
                  {section.questions?.length || 0} questions
                  {section.questions?.length > 0 && (
                    <span className="ml-2">
                      ({section.questions.map(q => q.type.replace('-', ' ')).join(', ')})
                    </span>
                  )}
                </div>
              </div>
            ))}
            
            {(!assessment.sections || assessment.sections.length === 0) && (
              <p className="text-gray-500 italic">No sections created yet.</p>
            )}
          </div>

          {/* Submissions Summary */}
          {submissions.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4">Recent Test Results</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{submissions.length}</div>
                  <div className="text-sm text-blue-800">Total Submissions</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(submissions.reduce((acc, sub) => acc + (sub.score || 0), 0) / submissions.length)}%
                  </div>
                  <div className="text-sm text-green-800">Average Score</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(submissions.reduce((acc, sub) => acc + (sub.timeSpent || 0), 0) / submissions.length / 1000 / 60)}
                  </div>
                  <div className="text-sm text-purple-800">Avg Time (min)</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">Recent Tests:</h4>
                {submissions.slice(0, 3).map(submission => (
                  <div key={submission.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm font-medium">{submission.candidateInfo?.name || 'Anonymous'}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      {submission.score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssessmentBuilder;
