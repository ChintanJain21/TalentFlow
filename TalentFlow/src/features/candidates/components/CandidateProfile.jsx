import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, FileText, Github, Linkedin, Clock, Award } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { db } from '../../../db/database';
import NotesSection from './NotesSection';

// Stage validation logic
const getStageOrder = () => ['applied', 'screen', 'tech', 'offer', 'hired'];

const isValidStageTransition = (fromStage, toStage) => {
  const stageOrder = getStageOrder();
  const fromIndex = stageOrder.indexOf(fromStage);
  const toIndex = stageOrder.indexOf(toStage);
  
  if (fromStage === 'hired' || fromStage === 'rejected') return false;
  if (toStage === 'rejected') return fromStage !== 'rejected' && fromStage !== 'hired';
  if (fromIndex === -1 || toIndex === -1) return false;
  
  return toIndex >= fromIndex;
};

const CandidateProfile = () => {
  const { isDark } = useTheme();
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [savingStage, setSavingStage] = useState(null);
  const [savedStage, setSavedStage] = useState(null);

  const stages = [
    { 
      key: 'applied', 
      label: 'Applied', 
      icon: '🎯', 
      color: 'from-gray-500 to-gray-600', 
      bg: 'bg-gray-100 dark:bg-gray-800', 
      text: 'text-gray-700 dark:text-gray-300',
      border: 'border-gray-200 dark:border-gray-700'
    },
    { 
      key: 'screen', 
      label: 'Screening', 
      icon: '👋', 
      color: 'from-amber-500 to-orange-500', 
      bg: 'bg-amber-50 dark:bg-amber-900/20', 
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-700'
    },
    { 
      key: 'tech', 
      label: 'Technical', 
      icon: '⚡', 
      color: 'from-violet-500 to-purple-600', 
      bg: 'bg-violet-50 dark:bg-violet-900/20', 
      text: 'text-violet-700 dark:text-violet-300',
      border: 'border-violet-200 dark:border-violet-700'
    },
    { 
      key: 'offer', 
      label: 'Offer', 
      icon: '🎉', 
      color: 'from-emerald-500 to-green-600', 
      bg: 'bg-emerald-50 dark:bg-emerald-900/20', 
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-700'
    },
    { 
      key: 'hired', 
      label: 'Hired', 
      icon: '🚀', 
      color: 'from-cyan-500 to-blue-600', 
      bg: 'bg-cyan-50 dark:bg-cyan-900/20', 
      text: 'text-cyan-700 dark:text-cyan-300',
      border: 'border-cyan-200 dark:border-cyan-700'
    },
    { 
      key: 'rejected', 
      label: 'Rejected', 
      icon: '💔', 
      color: 'from-red-500 to-pink-600', 
      bg: 'bg-red-50 dark:bg-red-900/20', 
      text: 'text-red-700 dark:text-red-300',
      border: 'border-red-200 dark:border-red-700'
    }
  ];

  // ✅ SIMPLE - Try API first, fallback to IndexedDB
  const fetchWithFallback = async (apiCall, fallbackCall) => {
    try {
      return await apiCall();
    } catch (error) {
      console.warn('API failed, using IndexedDB fallback:', error.message);
      return await fallbackCall();
    }
  };

  // ✅ SIMPLE - Fetch candidate with production safety
  const fetchCandidate = async () => {
    try {
      const candidateId = parseInt(id);
      if (isNaN(candidateId)) {
        console.error('Invalid candidate ID:', id);
        setCandidate(null);
        return;
      }

      const result = await fetchWithFallback(
        // Try MSW API first
        async () => {
          const response = await fetch(`/api/candidates/${candidateId}`);
          if (response.status === 404) {
            return null; // Candidate not found
          }
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          
          const candidateData = await response.json();
          console.log('✅ Candidate loaded via MSW API:', candidateData.name);
          return candidateData;
        },
        // Fallback to IndexedDB
        async () => {
          const candidateData = await db.candidates.get(candidateId);
          if (candidateData) {
            console.log('✅ Candidate loaded from IndexedDB:', candidateData.name);
          } else {
            console.warn('❌ Candidate not found:', candidateId);
          }
          return candidateData;
        }
      );

      setCandidate(result);
    } catch (error) {
      console.error('❌ Error fetching candidate:', error);
      setCandidate(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ SIMPLE - Update stage with production safety
  const updateStage = async (newStage) => {
    if (!candidate) return;

    if (!isValidStageTransition(candidate.stage, newStage)) {
      const errorMessages = {
        hired: '🔒 Hired candidates cannot be moved to other stages.',
        rejected: '🔒 Rejected candidates cannot be moved to other stages.',
        default: '📈 Candidates can only move forward through stages or be rejected.'
      };
      
      let message = errorMessages.default;
      if (candidate.stage === 'hired' || candidate.stage === 'rejected') {
        message = errorMessages[candidate.stage];
      } else if (newStage === 'hired' && candidate.stage !== 'offer') {
        message = '📋 Candidates can only be hired from the Offer stage.';
      }
      
      alert(`❌ Invalid Stage Change!\n\n${message}`);
      return;
    }

    setSavingStage(newStage);
    setUpdating(newStage);

    try {
      console.log('🔄 Updating candidate stage:', { 
        id: candidate.id, 
        from: candidate.stage, 
        to: newStage 
      });

      // Helper function to get stage display names
      const getStageDisplayName = (stage) => {
        const stageNames = {
          'applied': 'Applied',
          'screen': 'Screening',
          'tech': 'Technical Interview',
          'offer': 'Offer',
          'hired': 'Hired',
          'rejected': 'Rejected'
        };
        return stageNames[stage] || stage;
      };

      // Create timeline entry for stage change
      const timelineEntry = {
        id: Date.now(),
        type: 'stage_change',
        title: `Stage changed to ${getStageDisplayName(newStage)}`,
        description: `Moved from ${getStageDisplayName(candidate.stage)} to ${getStageDisplayName(newStage)}`,
        timestamp: new Date().toISOString(),
        user: 'HR Team', // You can make this dynamic
        stage: newStage,
        note: `Candidate stage updated to ${getStageDisplayName(newStage)}`,
        metadata: {
          previousStage: candidate.stage,
          newStage: newStage,
          changedBy: 'HR Team',
          changeMethod: 'profile_actions'
        }
      };

      const updatedCandidate = await fetchWithFallback(
        // Try MSW API first
        async () => {
          const response = await fetch(`/api/candidates/${candidate.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              stage: newStage,
              timeline: [...(candidate.timeline || []), timelineEntry],
              updatedAt: new Date().toISOString()
            }),
          });

          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          
          const result = await response.json();
          console.log('✅ Candidate stage updated via MSW API with timeline entry');
          return result;
        },
        // Fallback to IndexedDB
        async () => {
          await db.candidates.update(candidate.id, {
            stage: newStage,
            timeline: [...(candidate.timeline || []), timelineEntry],
            updatedAt: new Date().toISOString()
          });

          const result = await db.candidates.get(candidate.id);
          console.log('✅ Candidate stage updated via IndexedDB with timeline entry');
          return result;
        }
      );

      setSavingStage(null);
      setSavedStage(newStage);
      setCandidate(updatedCandidate);
      
      console.log('✅ Candidate stage updated successfully with timeline entry:', timelineEntry);
      
      // Clear success animation after 2 seconds
      setTimeout(() => setSavedStage(null), 2000);

    } catch (error) {
      console.error('❌ Error updating candidate stage:', error);
      alert('Failed to update candidate stage. Please try again.');
    } finally {
      setUpdating(false);
      setSavingStage(null);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCandidate();
    }
  }, [id]);

  const getStageInfo = (stageKey) => {
    return stages.find(s => s.key === stageKey) || stages[0];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatFullDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl text-gray-600 dark:text-gray-400">Loading candidate profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="text-8xl mb-6">🤔</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">Candidate Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">This candidate doesn't exist or has been removed.</p>
          <Link 
            to="/candidates" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="mr-2" size={18} />
            Back to Candidates
          </Link>
        </div>
      </div>
    );
  }

  const currentStage = getStageInfo(candidate.stage);
  const stageIndex = stages.findIndex(s => s.key === candidate.stage);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Notifications */}
      {savingStage && (
        <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-3"></div>
          <span className="font-medium">Updating stage to {stages.find(s => s.key === savingStage)?.label}...</span>
        </div>
      )}

      {savedStage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center">
          <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center mr-3">
            <span className="text-green-500 text-xs">✓</span>
          </div>
          <span className="font-medium">Stage updated successfully!</span>
        </div>
      )}

      <div className="relative">
        {/* Left Side - Candidate Info */}
        <div className="absolute top-0 left-0 w-2/5 h-screen overflow-y-auto p-8">
          {/* Back Button */}
          <div className="mb-4">
            <Link 
              to="/candidates" 
              className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-all border border-gray-200 dark:border-gray-700"
            >
              <ArrowLeft className="mr-2" size={16} />
              Back to Candidates
            </Link>
          </div>

          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6 border border-gray-200 dark:border-gray-700 transition-colors">
            <div className={`h-32 bg-gradient-to-r ${currentStage.color} relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute top-4 right-4">
                <div className={`px-4 py-2 bg-white/90 backdrop-blur rounded-full text-sm font-bold ${currentStage.text} flex items-center border ${currentStage.border}`}>
                  <span className="mr-2 text-lg">{currentStage.icon}</span>
                  {currentStage.label}
                </div>
              </div>
            </div>
            
            <div className="p-6 -mt-10 relative z-10">
              <div className="w-20 h-20 bg-white dark:bg-gray-700 border-4 border-white dark:border-gray-600 rounded-full shadow-lg flex items-center justify-center text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4 mx-auto">
                {candidate.name ? candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'NA'}
              </div>
              
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">{candidate.name || 'Unknown'}</h1>
                <p className="text-gray-600 dark:text-gray-400">{candidate.email || 'No email'}</p>
                <div className="flex items-center justify-center mt-2 text-sm text-gray-500 dark:text-gray-500">
                  <Clock size={14} className="mr-1" />
                  <span>Applied {formatDate(candidate.appliedDate || candidate.createdAt)}</span>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-50">{candidate.experience || 0}y</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Experience</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-50">
                    ${candidate.salary ? (candidate.salary / 1000).toFixed(0) : 0}k
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Expected</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-50">
                    {candidate.location ? candidate.location.split(',')[0] : 'Remote'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Location</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-50">{candidate.skills?.length || 0}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Skills</div>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-3">
                {candidate.phone && (
                  <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <Phone className="text-blue-600 dark:text-blue-400 mr-3" size={18} />
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Phone</div>
                      <div className="font-medium text-gray-900 dark:text-gray-50">{candidate.phone}</div>
                    </div>
                  </div>
                )}
                
                {/* Links */}
                <div className="flex gap-2">
                  {candidate.resume && (
                    <a href={candidate.resume} target="_blank" rel="noopener noreferrer" 
                       className="flex-1 flex items-center justify-center p-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-colors border border-red-200 dark:border-red-800">
                      <FileText className="text-red-600 dark:text-red-400" size={18} />
                    </a>
                  )}
                  {candidate.linkedin && (
                    <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer"
                       className="flex-1 flex items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-colors border border-blue-200 dark:border-blue-800">
                      <Linkedin className="text-blue-600 dark:text-blue-400" size={18} />
                    </a>
                  )}
                  {candidate.github && (
                    <a href={candidate.github} target="_blank" rel="noopener noreferrer"
                       className="flex-1 flex items-center justify-center p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-colors border border-gray-200 dark:border-gray-600">
                      <Github className="text-gray-600 dark:text-gray-400" size={18} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          {candidate.skills && candidate.skills.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 transition-colors">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50 mb-4 flex items-center">
                <Award className="mr-2" size={20} />
                Skills Arsenal
              </h3>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 bg-gradient-to-r ${currentStage.color} text-white rounded-full text-xs font-medium shadow-sm hover:shadow-md transition-shadow cursor-default`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Dynamic Content */}
        <div className="ml-[40%] min-h-screen p-8">
          {/* Tab Navigation */}
          <div className="flex space-x-2 mb-6">
            {[
              { key: 'overview', label: '🎯 Overview' },
              { key: 'timeline', label: '📅 Timeline' },
              { key: 'notes', label: '📝 Notes' },
              { key: 'actions', label: '⚡ Actions' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                  activeTab === tab.key
                    ? `bg-gradient-to-r ${currentStage.color} text-white shadow-lg border-transparent`
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-6">🚀 Hiring Journey</h3>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-1 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="space-y-4">
                    {stages.map((stage, index) => {
                      const isPast = index < stageIndex;
                      const isCurrent = index === stageIndex;
                      
                      return (
                        <div key={stage.key} className="relative flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 ${
                            isCurrent ? `bg-gradient-to-r ${stage.color} text-white shadow-lg border-transparent` :
                            isPast ? 'bg-green-500 text-white border-green-500' :
                            'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-300 dark:border-gray-600'
                          }`}>
                            {isPast ? '✓' : stage.icon}
                          </div>
                          <div className="ml-4">
                            <div className={`font-medium ${
                              isCurrent ? 'text-gray-900 dark:text-gray-50' : 
                              isPast ? 'text-green-600 dark:text-green-400' : 
                              'text-gray-400 dark:text-gray-500'
                            }`}>
                              {stage.label}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ✅ Timeline with enhanced display */}
            {activeTab === 'timeline' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-6">📅 Activity Timeline</h3>
                <div className="space-y-4">
                  {candidate.timeline?.length > 0 ? (
                    candidate.timeline
                      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                      .map((event, index) => {
                        const getEventIcon = (type) => {
                          switch (type) {
                            case 'stage_change': return '🔄';
                            case 'note_added': return '📝';
                            case 'interview_scheduled': return '📅';
                            case 'assessment_completed': return '✅';
                            default: return '📋';
                          }
                        };

                        const getEventColor = (type) => {
                          switch (type) {
                            case 'stage_change': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700';
                            case 'note_added': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700';
                            case 'interview_scheduled': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700';
                            case 'assessment_completed': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700';
                            default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
                          }
                        };

                        return (
                          <div key={event.id || index} className="flex items-start p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 border ${getEventColor(event.type)}`}>
                              <span className="text-lg">{getEventIcon(event.type)}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-gray-900 dark:text-gray-50">
                                  {event.title || event.note || 'Activity Update'}
                                </h4>
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                  {formatFullDate(event.timestamp)}
                                </span>
                              </div>
                              
                              {event.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  {event.description}
                                </p>
                              )}
                              
                              {event.type === 'stage_change' && event.metadata && (
                                <div className="flex items-center space-x-2 text-xs mt-2">
                                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded border border-red-200 dark:border-red-700">
                                    {event.metadata.previousStage}
                                  </span>
                                  <span className="text-gray-400">→</span>
                                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded border border-green-200 dark:border-green-700">
                                    {event.metadata.newStage}
                                  </span>
                                  {event.metadata.changedBy && (
                                    <span className="text-gray-500 dark:text-gray-400 ml-2">
                                      by {event.metadata.changedBy}
                                    </span>
                                  )}
                                </div>
                              )}
                              
                              {event.user && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Updated by: <span className="font-medium">{event.user}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <div className="text-4xl mb-4">📅</div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-50 mb-2">No timeline events yet</h4>
                      <p className="text-sm">Timeline entries will appear here when candidate status changes.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {activeTab === 'notes' && (
              <NotesSection 
                candidate={candidate} 
                setCandidate={setCandidate} 
                currentStage={currentStage}
                formatFullDate={formatFullDate}
              />
            )}

            {/* Actions */}
            {activeTab === 'actions' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-6">⚡ Stage Management</h3>
                <div className="grid grid-cols-2 gap-4">
                  {stages.map((stage) => {
                    const isActive = candidate.stage === stage.key;
                    const isUpdatingThis = updating === stage.key;
                    const isSavingThis = savingStage === stage.key;
                    const isSavedThis = savedStage === stage.key;
                    const canTransition = isValidStageTransition(candidate.stage, stage.key);
                    
                    return (
                      <button
                        key={stage.key}
                        onClick={() => updateStage(stage.key)}
                        disabled={isActive || isUpdatingThis || !canTransition}
                        className={`p-4 rounded-xl text-left transition-all relative border ${
                          isActive
                            ? `bg-gradient-to-r ${stage.color} text-white shadow-lg cursor-default border-transparent`
                            : canTransition
                            ? `${stage.bg} ${stage.text} ${stage.border} hover:shadow-md hover:scale-105`
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60 border-gray-200 dark:border-gray-600'
                        } ${isSavedThis ? 'ring-2 ring-green-500' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-lg mb-1">{stage.icon}</div>
                            <div className="font-medium">{stage.label}</div>
                            {!canTransition && !isActive && (
                              <div className="text-xs mt-1 opacity-75">Not available</div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {isSavingThis && <span className="animate-spin">⏳</span>}
                            {isActive && <span className="text-2xl">✓</span>}
                            {isSavedThis && <span className="text-green-500 text-xl animate-bounce">✓</span>}
                          </div>
                        </div>

                        {isSavingThis && (
                          <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-400/20 rounded-xl animate-pulse"></div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Stage Rules Info */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h4 className="font-bold text-gray-900 dark:text-gray-50 mb-2 flex items-center">
                    <span className="mr-2">💡</span>
                    Stage Transition Rules
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Candidates can only move forward through stages</li>
                    <li>• Candidates can be rejected from any stage (except hired)</li>
                    <li>• Hired and rejected are final states</li>
                    <li>• Only candidates with offers can be hired</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;
