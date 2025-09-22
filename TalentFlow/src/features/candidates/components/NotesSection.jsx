import { useState, useRef, useEffect } from 'react';
import { Send, AtSign, Users, MessageSquare, Plus, Clock, User } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

const NotesSection = ({ candidate, setCandidate, currentStage, formatFullDate }) => {
  const { isDark } = useTheme();
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef(null);

  // Mock users for @mentions (replace with actual user data)
  const availableUsers = [
    { id: 1, name: 'Sarah Johnson', email: 'sarah@company.com', role: 'HR Manager', avatar: 'SJ' },
    { id: 2, name: 'Mike Chen', email: 'mike@company.com', role: 'Tech Lead', avatar: 'MC' },
    { id: 3, name: 'Emily Davis', email: 'emily@company.com', role: 'Recruiter', avatar: 'ED' },
    { id: 4, name: 'John Smith', email: 'john@company.com', role: 'Engineering Manager', avatar: 'JS' },
    { id: 5, name: 'Lisa Wong', email: 'lisa@company.com', role: 'Product Manager', avatar: 'LW' }
  ];

  // Filter users based on mention query
  const filteredUsers = availableUsers.filter(user => 
    user.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  // Handle text input changes
  const handleTextChange = (e) => {
    const value = e.target.value;
    const position = e.target.selectionStart;
    setNewNote(value);
    setCursorPosition(position);

    // Check for @ mentions
    const textUpToCursor = value.substring(0, position);
    const mentionMatch = textUpToCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1] || '');
      setShowMentions(true);
    } else {
      setShowMentions(false);
      setMentionQuery('');
    }
  };

  // Handle mention selection
  const selectMention = (user) => {
    const textUpToCursor = newNote.substring(0, cursorPosition);
    const textAfterCursor = newNote.substring(cursorPosition);
    const mentionMatch = textUpToCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const beforeMention = textUpToCursor.substring(0, mentionMatch.index);
      const newText = `${beforeMention}@${user.name} ${textAfterCursor}`;
      setNewNote(newText);
      setShowMentions(false);
      setMentionQuery('');
      
      // Focus back to textarea
      setTimeout(() => {
        textareaRef.current?.focus();
        const newPosition = beforeMention.length + user.name.length + 2;
        textareaRef.current?.setSelectionRange(newPosition, newPosition);
      }, 0);
    }
  };

  // Handle key navigation in mentions
  const handleKeyDown = (e) => {
    if (showMentions && filteredUsers.length > 0) {
      if (e.key === 'Escape') {
        setShowMentions(false);
        e.preventDefault();
      }
      // Could add arrow key navigation here
    }
  };

  // Add note function
  const addNote = async () => {
    if (!newNote.trim()) return;
    
    setAddingNote(true);
    try {
      // Extract mentions from the note
      const mentions = [];
      const mentionRegex = /@(\w+(?:\s+\w+)*)/g;
      let match;
      while ((match = mentionRegex.exec(newNote)) !== null) {
        const mentionedUser = availableUsers.find(user => 
          user.name.toLowerCase() === match[1].toLowerCase()
        );
        if (mentionedUser) {
          mentions.push(mentionedUser);
        }
      }

      const noteData = {
        id: Date.now(),
        content: newNote,
        author: 'Current User', // Replace with actual current user
        timestamp: new Date().toISOString(),
        mentions: mentions,
        type: 'user_note'
      };

      // Update candidate with new note
      setCandidate(prev => ({
        ...prev,
        notes: [...(prev.notes || []), noteData]
      }));
      
      // Clear form
      setNewNote('');
      setShowMentions(false);
      setMentionQuery('');

      // Here you would also send to API if needed
      // await fetch(`/api/candidates/${candidate.id}/notes`, { ... })
      
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note. Please try again.');
    } finally {
      setAddingNote(false);
    }
  };

  // Render note content with highlighted mentions
  const renderNoteContent = (content, mentions = []) => {
    let renderedContent = content;
    
    mentions.forEach(user => {
      const mentionRegex = new RegExp(`@${user.name}`, 'g');
      renderedContent = renderedContent.replace(
        mentionRegex, 
        `<span class="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-md font-medium border border-blue-200 dark:border-blue-700">@${user.name}</span>`
      );
    });
    
    return <div dangerouslySetInnerHTML={{ __html: renderedContent }} />;
  };

  return (
    <div className="space-y-6">
      
      {/* Enhanced Add Note Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">Add Note</h3>
        </div>
        
        <div className="space-y-4 relative">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={newNote}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Write a note about this candidate... Use @name to mention team members"
              className="w-full h-32 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
            
            {/* Enhanced Mentions Dropdown */}
            {showMentions && filteredUsers.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-48 overflow-y-auto mt-1">
                {filteredUsers.map((user, index) => (
                  <button
                    key={user.id}
                    onClick={() => selectMention(user)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-gray-50">{user.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{user.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <AtSign className="w-4 h-4" />
              <span>Use @name to mention team members</span>
            </div>
            <button
              onClick={addNote}
              disabled={!newNote.trim() || addingNote}
              className={`flex items-center space-x-2 px-6 py-3 bg-gradient-to-r ${currentStage.gradient || currentStage.color} text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold transform hover:scale-105`}
            >
              {addingNote ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Add Note</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Notes List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">Notes History</h3>
          {candidate.notes?.length > 0 && (
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm font-medium">
              {candidate.notes.length}
            </span>
          )}
        </div>
        
        {candidate.notes?.length > 0 ? (
          <div className="space-y-4">
            {candidate.notes.map((note, index) => (
              <div 
                key={note.id} 
                className="p-5 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border-l-4 border-yellow-400 dark:border-yellow-500 rounded-r-xl border border-yellow-200 dark:border-yellow-800 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                      {note.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-gray-50">{note.author}</div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatFullDate(note.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Note Indicators */}
                  <div className="flex items-center space-x-2">
                    {note.mentions?.length > 0 && (
                      <div className="flex items-center space-x-1 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-lg border border-blue-200 dark:border-blue-700">
                        <Users className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{note.mentions.length}</span>
                      </div>
                    )}
                    <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>
                </div>
                
                <div className="text-gray-900 dark:text-gray-100 mb-3 leading-relaxed">
                  {renderNoteContent(note.content, note.mentions)}
                </div>
                
                {/* Enhanced Mentions Display */}
                {note.mentions?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-yellow-200 dark:border-yellow-700">
                    <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400 mb-3">
                      <Users className="w-3 h-3" />
                      <span className="font-bold">Mentioned team members:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {note.mentions.map((user, index) => (
                        <div 
                          key={index}
                          className="inline-flex items-center space-x-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg text-xs font-bold border border-blue-200 dark:border-blue-700"
                        >
                          <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                            @
                          </div>
                          <span>{user.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Enhanced Empty State */
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-50 mb-2">No notes yet</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Add the first note to start tracking this candidate's progress!</p>
            <button
              onClick={() => textareaRef.current?.focus()}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Note</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesSection;
