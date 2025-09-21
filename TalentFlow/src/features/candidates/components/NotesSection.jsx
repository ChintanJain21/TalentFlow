import { useState, useRef, useEffect } from 'react';

const NotesSection = ({ candidate, setCandidate, currentStage, formatFullDate }) => {
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef(null);

  // Mock users for @mentions (replace with actual user data)
  const availableUsers = [
    { id: 1, name: 'Sarah Johnson', email: 'sarah@company.com', role: 'HR Manager' },
    { id: 2, name: 'Mike Chen', email: 'mike@company.com', role: 'Tech Lead' },
    { id: 3, name: 'Emily Davis', email: 'emily@company.com', role: 'Recruiter' },
    { id: 4, name: 'John Smith', email: 'john@company.com', role: 'Engineering Manager' },
    { id: 5, name: 'Lisa Wong', email: 'lisa@company.com', role: 'Product Manager' }
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
        `<span class="bg-blue-100 text-blue-800 px-1 rounded font-medium">@${user.name}</span>`
      );
    });
    
    return <div dangerouslySetInnerHTML={{ __html: renderedContent }} />;
  };

  return (
    <div className="space-y-6">
      {/* Add Note */}
      <div className="bg-white rounded-3xl shadow-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">✍️ Add Note</h3>
        <div className="space-y-4 relative">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={newNote}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Write a note about this candidate... Use @name to mention team members"
              className="w-full h-32 px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            
            {/* Mentions Dropdown */}
            {showMentions && filteredUsers.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto mt-1">
                {filteredUsers.map((user, index) => (
                  <button
                    key={user.id}
                    onClick={() => selectMention(user)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              💡 Use @name to mention team members
            </div>
            <button
              onClick={addNote}
              disabled={!newNote.trim() || addingNote}
              className={`px-6 py-3 bg-gradient-to-r ${currentStage.color} text-white rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2`}
            >
              {addingNote ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Add Note</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="bg-white rounded-3xl shadow-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">💭 Notes History</h3>
        {candidate.notes?.length > 0 ? (
          <div className="space-y-4">
            {candidate.notes.map((note) => (
              <div key={note.id} className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-2xl">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {note.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{note.author}</div>
                      <div className="text-xs text-gray-500">{formatFullDate(note.timestamp)}</div>
                    </div>
                  </div>
                  
                  {/* Note type indicator */}
                  <div className="flex items-center space-x-2">
                    {note.mentions?.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <span className="text-blue-600 text-xs">👥</span>
                        <span className="text-xs text-blue-600">{note.mentions.length}</span>
                      </div>
                    )}
                    <span className="text-xs text-gray-400">📝</span>
                  </div>
                </div>
                
                <div className="text-gray-900 mb-2">
                  {renderNoteContent(note.content, note.mentions)}
                </div>
                
                {/* Show mentions */}
                {note.mentions?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-yellow-200">
                    <div className="text-xs text-gray-600 mb-2">Mentioned:</div>
                    <div className="flex flex-wrap gap-2">
                      {note.mentions.map((user, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                        >
                          <span className="mr-1">@</span>
                          {user.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-lg font-medium mb-2">No notes yet</p>
            <p className="text-sm">Add the first note to start tracking this candidate's progress!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesSection;
