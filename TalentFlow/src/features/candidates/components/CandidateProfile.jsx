import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const CandidateProfile = () => {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const stages = [
    { key: 'applied', label: 'Applied', icon: '🎯', color: 'from-slate-500 to-slate-600', bg: 'bg-slate-100', text: 'text-slate-700' },
    { key: 'screen', label: 'Screening', icon: '👋', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-700' },
    { key: 'tech', label: 'Technical', icon: '⚡', color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', text: 'text-violet-700' },
    { key: 'offer', label: 'Offer', icon: '🎉', color: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    { key: 'hired', label: 'Hired', icon: '🚀', color: 'from-cyan-500 to-blue-600', bg: 'bg-cyan-50', text: 'text-cyan-700' },
    { key: 'rejected', label: 'Rejected', icon: '💔', color: 'from-red-500 to-pink-600', bg: 'bg-red-50', text: 'text-red-700' }
  ];

  const fetchCandidate = async () => {
    try {
      const response = await fetch(`/api/candidates/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCandidate(data);
      }
    } catch (error) {
      console.error('Error fetching candidate:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStage = async (newStage) => {
    setUpdating(newStage);
    try {
      const response = await fetch(`/api/candidates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage })
      });

      if (response.ok) {
        const updated = await response.json();
        setCandidate(updated);
      }
    } catch (error) {
      console.error('Error updating stage:', error);
    } finally {
      setUpdating(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    
    setAddingNote(true);
    try {
      // Simulate adding note (you can enhance this with proper API)
      const noteData = {
        id: Date.now(),
        content: newNote,
        author: 'Current User',
        timestamp: new Date().toISOString(),
        mentions: []
      };

      setCandidate(prev => ({
        ...prev,
        notes: [...(prev.notes || []), noteData]
      }));
      
      setNewNote('');
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setAddingNote(false);
    }
  };

  useEffect(() => {
    fetchCandidate();
  }, [id]);

  const getStageInfo = (stageKey) => {
    return stages.find(s => s.key === stageKey) || stages[0];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatFullDate = (dateString) => {
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-bounce text-6xl mb-4">🔄</div>
            <p className="text-xl text-gray-600">Loading candidate profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">🤔</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Oops! Candidate Missing</h1>
          <p className="text-gray-600 mb-8 text-lg">This candidate seems to have vanished into the digital void.</p>
          <Link 
            to="/candidates" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
          >
            🏠 Go Home
          </Link>
        </div>
      </div>
    );
  }

  const currentStage = getStageInfo(candidate.stage);
  const stageIndex = stages.findIndex(s => s.key === candidate.stage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
  
      
         
 <div className="mb-4">
    <Link 
      to="/candidates" 
      className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-all text-sm"
    >
      <span className="mr-2">←</span>
      Back to Candidates
    </Link>
  </div>

      {/* Creative Layout */}
      <div className="relative">
        {/* Left Side - Candidate Info */}
        <div className="absolute top-0 left-0 w-2/5 h-screen overflow-y-auto p-8">
          {/* Profile Card */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6 transform hover:scale-[1.02] transition-transform">
            <div className={`h-32 bg-gradient-to-r ${currentStage.color} relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute top-4 right-4">
                <div className={`px-4 py-2 bg-white/90 backdrop-blur rounded-full text-sm font-bold ${currentStage.text} flex items-center`}>
                  <span className="mr-2 text-lg">{currentStage.icon}</span>
                  {currentStage.label}
                </div>
              </div>
            </div>
            
            <div className="p-6 -mt-10 relative z-10">
              <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl font-bold text-gray-700 mb-4 mx-auto">
                {candidate.name.split(' ').map(n => n[0]).join('')}
              </div>
              
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{candidate.name}</h1>
                <p className="text-gray-600">{candidate.email}</p>
                <div className="flex items-center justify-center mt-2 text-sm text-gray-500">
                  <span>📅 Applied {formatDate(candidate.appliedDate)}</span>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <div className="text-lg font-bold text-gray-900">{candidate.experience}y</div>
                  <div className="text-xs text-gray-500">Experience</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <div className="text-lg font-bold text-gray-900">${(candidate.salary / 1000).toFixed(0)}k</div>
                  <div className="text-xs text-gray-500">Expected</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <div className="text-lg font-bold text-gray-900">{candidate.location?.split(',')[0]}</div>
                  <div className="text-xs text-gray-500">Location</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <div className="text-lg font-bold text-gray-900">{candidate.skills?.length}</div>
                  <div className="text-xs text-gray-500">Skills</div>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-blue-50 rounded-xl">
                  <span className="text-blue-600 text-lg mr-3">📱</span>
                  <div>
                    <div className="text-xs text-gray-500">Phone</div>
                    <div className="font-medium">{candidate.phone}</div>
                  </div>
                </div>
                
                {/* Links */}
                <div className="flex gap-2">
                  {candidate.resume && (
                    <a href={candidate.resume} target="_blank" rel="noopener noreferrer" 
                       className="flex-1 flex items-center justify-center p-3 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
                      <span className="text-red-600">📄</span>
                    </a>
                  )}
                  {candidate.linkedin && (
                    <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer"
                       className="flex-1 flex items-center justify-center p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
                      <span className="text-blue-600">💼</span>
                    </a>
                  )}
                  {candidate.github && (
                    <a href={candidate.github} target="_blank" rel="noopener noreferrer"
                       className="flex-1 flex items-center justify-center p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                      <span className="text-gray-600">🔗</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🛠️</span>
              Skills Arsenal
            </h3>
            <div className="flex flex-wrap gap-2">
              {candidate.skills?.map((skill, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 bg-gradient-to-r ${currentStage.color} text-white rounded-full text-xs font-medium shadow-sm hover:shadow-md transition-shadow cursor-default`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Dynamic Content */}
        <div className="ml-[40%] min-h-screen p-8">
          {/* Tab Navigation */}
          <div className="flex space-x-2 mb-6">
            {[
              { key: 'overview', label: '🎯 Overview', icon: '📊' },
              { key: 'timeline', label: '📅 Timeline', icon: '🕐' },
              { key: 'notes', label: '📝 Notes', icon: '💭' },
              { key: 'actions', label: '⚡ Actions', icon: '🎮' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? `bg-gradient-to-r ${currentStage.color} text-white shadow-lg`
                    : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
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
              <div className="space-y-6">
                {/* Stage Progress */}
                <div className="bg-white rounded-3xl shadow-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">🚀 Hiring Journey</h3>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-1 bg-gray-200"></div>
                    <div className="space-y-4">
                      {stages.map((stage, index) => {
                        const isPast = index < stageIndex;
                        const isCurrent = index === stageIndex;
                        const isFuture = index > stageIndex;
                        
                        return (
                          <div key={stage.key} className="relative flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                              isCurrent ? `bg-gradient-to-r ${stage.color} text-white shadow-lg` :
                              isPast ? 'bg-green-500 text-white' :
                              'bg-gray-200 text-gray-400'
                            }`}>
                              {isPast ? '✓' : stage.icon}
                            </div>
                            <div className="ml-4">
                              <div className={`font-medium ${isCurrent ? 'text-gray-900' : isPast ? 'text-green-600' : 'text-gray-400'}`}>
                                {stage.label}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            {activeTab === 'timeline' && (
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">📅 Activity Timeline</h3>
                <div className="space-y-4">
                  {candidate.timeline?.map((event) => {
                    const eventStage = getStageInfo(event.stage);
                    return (
                      <div key={event.id} className="flex items-start p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${eventStage.bg} ${eventStage.text}`}>
                          {eventStage.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{event.note}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {formatFullDate(event.timestamp)} • by {event.user}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notes */}
            {activeTab === 'notes' && (
              <div className="space-y-6">
                {/* Add Note */}
                <div className="bg-white rounded-3xl shadow-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">✍️ Add Note</h3>
                  <div className="space-y-4">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Write a note about this candidate..."
                      className="w-full h-24 px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <button
                      onClick={addNote}
                      disabled={!newNote.trim() || addingNote}
                      className={`px-6 py-3 bg-gradient-to-r ${currentStage.color} text-white rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium`}
                    >
                      {addingNote ? '💫 Adding...' : '🚀 Add Note'}
                    </button>
                  </div>
                </div>

                {/* Notes List */}
                <div className="bg-white rounded-3xl shadow-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">💭 Notes History</h3>
                  {candidate.notes?.length > 0 ? (
                    <div className="space-y-4">
                      {candidate.notes.map((note) => (
                        <div key={note.id} className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-2xl">
                          <p className="text-gray-900 mb-2">{note.content}</p>
                          <div className="text-sm text-gray-500">
                            <span className="font-medium">{note.author}</span> • {formatFullDate(note.timestamp)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-4">📝</div>
                      <p>No notes yet. Add the first one!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            {activeTab === 'actions' && (
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">⚡ Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  {stages.map((stage) => {
                    const isActive = candidate.stage === stage.key;
                    const isUpdating = updating === stage.key;
                    
                    return (
                      <button
                        key={stage.key}
                        onClick={() => updateStage(stage.key)}
                        disabled={isActive || isUpdating}
                        className={`p-4 rounded-2xl text-left transition-all ${
                          isActive
                            ? `bg-gradient-to-r ${stage.color} text-white shadow-lg cursor-default`
                            : `${stage.bg} ${stage.text} hover:shadow-md`
                        } disabled:opacity-75`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-lg mb-1">{stage.icon}</div>
                            <div className="font-medium">{stage.label}</div>
                          </div>
                          {isUpdating && <span className="animate-spin">⏳</span>}
                          {isActive && <span className="text-2xl">✓</span>}
                        </div>
                      </button>
                    );
                  })}
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
