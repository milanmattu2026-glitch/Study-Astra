import { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, Edit2, Star, StarOff, Search, Tag, FileText, BookOpen, X, Download, Youtube } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { store } from '../store';
import { formatDate, getRelativeTime, getYouTubeId } from '../utils/helpers';
import html2pdf from 'html2pdf.js';

export default function Notes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const notes = useStore('notes');
  const subjects = useStore('subjects');
  const pdfRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [currentNote, setCurrentNote] = useState({
    title: '',
    content: '',
    youtubeUrl: '',
    subject: '',
    chapter: '',
    topic: '',
    tags: [],
    favorite: false
  });
  const [tagInput, setTagInput] = useState('');

  const selectedNote = id ? notes.find(n => n.id === id) : null;

  // Filter notes
  const filteredNotes = notes.filter(note => {
    if (showFavoritesOnly && !note.favorite) return false;
    if (filterSubject !== 'all' && note.subject !== filterSubject) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const handleSaveNote = () => {
    if (!currentNote.title.trim() || !currentNote.content.trim()) return;

    if (currentNote.id) {
      store.updateNote(currentNote.id, currentNote);
    } else {
      const newNote = store.addNote(currentNote);
      navigate(`/notes/${newNote.id}`);
    }
    setShowEditor(false);
    resetEditor();
  };

  const handleDeleteNote = (noteId) => {
    if (confirm('Delete this note?')) {
      store.deleteNote(noteId);
      if (id === noteId) navigate('/notes');
    }
  };

  const handleEditNote = (note) => {
    setCurrentNote({ ...note });
    setShowEditor(true);
  };

  const resetEditor = () => {
    setCurrentNote({
      title: '',
      content: '',
      youtubeUrl: '',
      subject: '',
      chapter: '',
      topic: '',
      tags: [],
      favorite: false
    });
  };

  const handleExportToPDF = () => {
    const element = pdfRef.current;
    const opt = {
      margin: 1,
      filename: `${selectedNote.title}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const addTag = () => {
    if (tagInput.trim() && !currentNote.tags.includes(tagInput.trim())) {
      setCurrentNote({
        ...currentNote,
        tags: [...currentNote.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setCurrentNote({
      ...currentNote,
      tags: currentNote.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const getSubjectChapters = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.chapters || [];
  };

  const getChapterTopics = (subjectId, chapterId) => {
    const subject = subjects.find(s => s.id === subjectId);
    const chapter = subject?.chapters?.find(c => c.id === chapterId);
    return chapter?.topics || [];
  };

  if (selectedNote && !showEditor) {
    // Note detail view
    const subject = subjects.find(s => s.id === selectedNote.subject);
    const chapter = subject?.chapters?.find(c => c.id === selectedNote.chapter);
    const topic = chapter?.topics?.find(t => t.id === selectedNote.topic);

    return (
      <div className="page-enter space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link
              to="/notes"
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] mb-2 inline-block"
            >
              ← Back to all notes
            </Link>
            <h1 className="text-3xl font-bold">{selectedNote.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-[var(--color-text-muted)]">
              {subject && (
                <span
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: subject.color + '20',
                    color: subject.color
                  }}
                >
                  {subject.name}
                </span>
              )}
              {chapter && <span>→ {chapter.name}</span>}
              {topic && <span>→ {topic.name}</span>}
              <span>•</span>
              <span>Updated {getRelativeTime(selectedNote.updatedAt)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExportToPDF}
              className="btn btn-secondary text-blue-500 hover:bg-blue-500/10"
              title="Download as PDF"
            >
              <Download size={16} />
            </button>
            <button
              onClick={() => store.toggleNoteFavorite(selectedNote.id)}
              className="btn btn-secondary"
            >
              {selectedNote.favorite ? (
                <StarOff size={16} className="text-yellow-500" />
              ) : (
                <Star size={16} />
              )}
            </button>
            <button
              onClick={() => handleEditNote(selectedNote)}
              className="btn btn-secondary"
            >
              <Edit2 size={16} />
              Edit
            </button>
            <button
              onClick={() => handleDeleteNote(selectedNote.id)}
              className="btn btn-danger"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Tags */}
        {selectedNote.tags && selectedNote.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedNote.tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 bg-[var(--color-bg-tertiary)] rounded-full text-sm flex items-center gap-1"
              >
                <Tag size={12} />
                {tag}
              </span>
            ))}
          </div>
        )}

        <div ref={pdfRef} className="bg-[var(--color-bg-primary)] p-4 rounded-lg -m-4">
          {/* Include header for PDF context */}
          <div className="hidden print:block mb-6 border-b pb-4">
            <h1 className="text-3xl font-bold mb-2">{selectedNote.title}</h1>
            <p className="text-sm text-gray-500">Subject: {subject?.name || 'N/A'}</p>
          </div>

          {/* YouTube Embed */}
          {selectedNote.youtubeUrl && getYouTubeId(selectedNote.youtubeUrl) && (
            <div className="card mb-6 p-0 overflow-hidden print:hidden">
              <iframe
                className="w-full aspect-video"
                src={`https://www.youtube.com/embed/${getYouTubeId(selectedNote.youtubeUrl)}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}

          {/* Content */}
          <div className="card">
            <div
              className="prose prose-invert max-w-none"
              style={{
                whiteSpace: 'pre-wrap',
                lineHeight: '1.8',
                fontSize: '1rem'
              }}
            >
              {selectedNote.content}
            </div>
          </div>
        </div>

        {/* Test Me Button */}
        <div className="card bg-gradient-to-br from-[var(--color-accent)] to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Test Your Knowledge</h3>
              <p className="text-sm opacity-90">
                Generate a quiz based on this note
              </p>
            </div>
            <Link
              to={`/quizzes/create?subjectId=${selectedNote.subject}&topicId=${selectedNote.topic || ''}`}
              className="btn bg-white text-[var(--color-accent)] hover:bg-gray-100"
            >
              🧠 Test Me
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Editor or List view
  if (showEditor) {
    const selectedChapters = getSubjectChapters(currentNote.subject);
    const selectedTopics = getChapterTopics(currentNote.subject, currentNote.chapter);

    return (
      <div className="page-enter max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            {currentNote.id ? 'Edit Note' : 'New Note'}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowEditor(false);
                resetEditor();
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button onClick={handleSaveNote} className="btn btn-primary">
              Save Note
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              placeholder="Note title..."
              value={currentNote.title}
              onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
              className="input text-xl font-semibold"
              autoFocus
            />
          </div>

          {/* YouTube Link */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Youtube size={16} /> YouTube Lecture Link (Optional)
            </label>
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={currentNote.youtubeUrl || ''}
              onChange={(e) => setCurrentNote({ ...currentNote, youtubeUrl: e.target.value })}
              className="input"
            />
          </div>

          {/* Subject/Chapter/Topic */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <select
                value={currentNote.subject}
                onChange={(e) => setCurrentNote({
                  ...currentNote,
                  subject: e.target.value,
                  chapter: '',
                  topic: ''
                })}
                className="input"
              >
                <option value="">None</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Chapter</label>
              <select
                value={currentNote.chapter}
                onChange={(e) => setCurrentNote({
                  ...currentNote,
                  chapter: e.target.value,
                  topic: ''
                })}
                className="input"
                disabled={!currentNote.subject}
              >
                <option value="">None</option>
                {selectedChapters.map(chapter => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Topic</label>
              <select
                value={currentNote.topic}
                onChange={(e) => setCurrentNote({ ...currentNote, topic: e.target.value })}
                className="input"
                disabled={!currentNote.chapter}
              >
                <option value="">None</option>
                {selectedTopics.map(topic => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {currentNote.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-[var(--color-bg-tertiary)] rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-[var(--color-danger)]"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="input flex-1"
              />
              <button onClick={addTag} className="btn btn-secondary">
                Add
              </button>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <textarea
              placeholder="Write your notes here..."
              value={currentNote.content}
              onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
              className="input min-h-[400px] font-mono"
              rows={20}
            />
          </div>

          {/* Favorite */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="favorite"
              checked={currentNote.favorite}
              onChange={(e) => setCurrentNote({ ...currentNote, favorite: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="favorite" className="text-sm cursor-pointer">
              Mark as favorite
            </label>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notes</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Your knowledge vault
          </p>
        </div>
        <button
          onClick={() => {
            resetEditor();
            setShowEditor(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={16} />
          New Note
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="input md:w-48"
        >
          <option value="all">All Subjects</option>
          {subjects.map(subject => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`btn ${showFavoritesOnly ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Star size={16} />
          Favorites
        </button>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold mb-2">
            {searchQuery || showFavoritesOnly ? 'No notes found' : 'No notes yet'}
          </h3>
          <p className="text-[var(--color-text-muted)] mb-6">
            {searchQuery || showFavoritesOnly
              ? 'Try adjusting your filters'
              : 'Start building your knowledge vault'}
          </p>
          {!searchQuery && !showFavoritesOnly && (
            <button
              onClick={() => {
                resetEditor();
                setShowEditor(true);
              }}
              className="btn btn-primary"
            >
              <Plus size={16} />
              Create Your First Note
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map(note => {
            const subject = subjects.find(s => s.id === note.subject);

            return (
              <Link
                key={note.id}
                to={`/notes/${note.id}`}
                className="card card-interactive h-full flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold line-clamp-2 flex-1">
                    {note.title}
                  </h3>
                  {note.youtubeUrl && (
                    <Youtube size={16} className="text-red-500 flex-shrink-0 ml-2" />
                  )}
                  {note.favorite && (
                    <Star size={16} className="text-yellow-500 fill-yellow-500 flex-shrink-0 ml-2" />
                  )}
                </div>

                <p className="text-sm text-[var(--color-text-muted)] line-clamp-3 mb-3 flex-1">
                  {note.content}
                </p>

                <div className="space-y-2">
                  {subject && (
                    <span
                      className="inline-block px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: subject.color + '20',
                        color: subject.color
                      }}
                    >
                      {subject.name}
                    </span>
                  )}

                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="text-xs text-[var(--color-text-muted)] flex items-center gap-1"
                        >
                          <Tag size={10} />
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-xs text-[var(--color-text-muted)]">
                          +{note.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-[var(--color-text-muted)]">
                    {getRelativeTime(note.updatedAt)}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
