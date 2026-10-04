import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, ChevronDown, ChevronRight, CheckCircle2, Circle, Clock, BookOpen } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { store } from '../store';

export default function Syllabus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const subjects = useStore('subjects');

  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [newSubject, setNewSubject] = useState({ name: '', color: '#6c63ff', icon: '📚' });
  const [newChapter, setNewChapter] = useState({ name: '', topics: [] });
  const [newTopicName, setNewTopicName] = useState('');

  const selectedSubject = id ? subjects.find(s => s.id === id) : null;

  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const handleAddSubject = () => {
    if (!newSubject.name.trim()) return;
    store.addSubject(newSubject);
    setNewSubject({ name: '', color: '#6c63ff', icon: '📚' });
    setShowAddSubject(false);
  };

  const handleAddChapter = () => {
    if (!newChapter.name.trim() || !selectedSubject) return;

    const updatedSubject = {
      ...selectedSubject,
      chapters: [...(selectedSubject.chapters || []), {
        id: `ch-${crypto.randomUUID()}`,
        name: newChapter.name,
        topics: []
      }]
    };

    store.updateSubject(selectedSubject.id, updatedSubject);
    setNewChapter({ name: '', topics: [] });
    setShowAddChapter(false);
  };

  const handleAddTopic = (chapterId) => {
    if (!newTopicName.trim() || !selectedSubject) return;

    const updatedChapters = selectedSubject.chapters.map(ch => {
      if (ch.id === chapterId) {
        return {
          ...ch,
          topics: [...(ch.topics || []), {
            id: `t-${Date.now()}`,
            name: newTopicName,
            status: 'not-started'
          }]
        };
      }
      return ch;
    });

    store.updateSubject(selectedSubject.id, { chapters: updatedChapters });
    setNewTopicName('');
  };

  const handleTopicStatusChange = (chapterId, topicId, status) => {
    store.updateTopicStatus(selectedSubject.id, chapterId, topicId, status);
  };

  const handleDeleteSubject = (subjectId) => {
    if (confirm('Delete this subject and all its data?')) {
      store.deleteSubject(subjectId);
      if (id === subjectId) navigate('/syllabus');
    }
  };

  if (selectedSubject) {
    // Detail view
    const totalTopics = selectedSubject.chapters?.reduce((sum, ch) => sum + (ch.topics?.length || 0), 0) || 0;
    const completedTopics = selectedSubject.chapters?.reduce((sum, ch) =>
      sum + (ch.topics?.filter(t => t.status === 'completed').length || 0), 0) || 0;

    return (
      <div className="page-enter space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <button
              onClick={() => navigate('/syllabus')}
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] mb-2"
            >
              ← Back to all subjects
            </button>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <span style={{ fontSize: '2rem' }}>{selectedSubject.icon}</span>
              {selectedSubject.name}
            </h1>
          </div>
          <button
            onClick={() => handleDeleteSubject(selectedSubject.id)}
            className="btn btn-danger"
          >
            <Trash2 size={16} />
            Delete Subject
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="text-[var(--color-text-muted)] text-sm mb-1">Progress</div>
            <div className="text-2xl font-bold" style={{ color: selectedSubject.color }}>
              {selectedSubject.progress}%
            </div>
          </div>
          <div className="card">
            <div className="text-[var(--color-text-muted)] text-sm mb-1">Chapters</div>
            <div className="text-2xl font-bold">{selectedSubject.chapters?.length || 0}</div>
          </div>
          <div className="card">
            <div className="text-[var(--color-text-muted)] text-sm mb-1">Topics</div>
            <div className="text-2xl font-bold">{completedTopics}/{totalTopics}</div>
          </div>
          <div className="card">
            <div className="text-[var(--color-text-muted)] text-sm mb-1">Study Hours</div>
            <div className="text-2xl font-bold">{selectedSubject.studyHours || 0}h</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Completion</span>
            <span className="text-sm text-[var(--color-text-muted)]">{selectedSubject.progress}%</span>
          </div>
          <div className="h-3 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500 rounded-full"
              style={{
                width: `${selectedSubject.progress}%`,
                background: `linear-gradient(90deg, ${selectedSubject.color}, ${selectedSubject.color}cc)`
              }}
            />
          </div>
        </div>

        {/* Chapters */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Chapters & Topics</h2>
            <button
              onClick={() => setShowAddChapter(true)}
              className="btn btn-primary"
            >
              <Plus size={16} />
              Add Chapter
            </button>
          </div>

          {selectedSubject.chapters?.length === 0 ? (
            <div className="card text-center py-12 text-[var(--color-text-muted)]">
              <BookOpen size={48} className="mx-auto mb-3 opacity-50" />
              <p>No chapters yet</p>
              <button
                onClick={() => setShowAddChapter(true)}
                className="btn btn-secondary mt-4"
              >
                Add your first chapter
              </button>
            </div>
          ) : (
            selectedSubject.chapters?.map((chapter) => {
              const chapterTopics = chapter.topics || [];
              const completedCount = chapterTopics.filter(t => t.status === 'completed').length;
              const progress = chapterTopics.length > 0
                ? Math.round((completedCount / chapterTopics.length) * 100)
                : 0;

              return (
                <div key={chapter.id} className="card">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleChapter(chapter.id)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {expandedChapters[chapter.id] ? (
                        <ChevronDown size={20} className="text-[var(--color-text-muted)]" />
                      ) : (
                        <ChevronRight size={20} className="text-[var(--color-text-muted)]" />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">{chapter.name}</h3>
                        <div className="text-sm text-[var(--color-text-muted)]">
                          {completedCount}/{chapterTopics.length} topics completed
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium" style={{ color: selectedSubject.color }}>
                        {progress}%
                      </span>
                    </div>
                  </div>

                  {expandedChapters[chapter.id] && (
                    <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-2">
                      {chapterTopics.map((topic) => (
                        <div
                          key={topic.id}
                          className="flex items-center gap-3 p-3 bg-[var(--color-bg-tertiary)] rounded-lg"
                        >
                          <button
                            onClick={() => {
                              const nextStatus =
                                topic.status === 'not-started' ? 'in-progress' :
                                topic.status === 'in-progress' ? 'completed' : 'not-started';
                              handleTopicStatusChange(chapter.id, topic.id, nextStatus);
                            }}
                          >
                            {topic.status === 'completed' ? (
                              <CheckCircle2 size={20} className="text-[var(--color-success)]" />
                            ) : topic.status === 'in-progress' ? (
                              <Clock size={20} className="text-[var(--color-warning)]" />
                            ) : (
                              <Circle size={20} className="text-[var(--color-text-muted)]" />
                            )}
                          </button>
                          <span className={topic.status === 'completed' ? 'line-through text-[var(--color-text-muted)]' : ''}>
                            {topic.name}
                          </span>
                          <span className={`ml-auto badge ${
                            topic.status === 'completed' ? 'badge-success' :
                            topic.status === 'in-progress' ? 'badge-warning' : ''
                          }`}>
                            {topic.status.replace('-', ' ')}
                          </span>
                        </div>
                      ))}

                      {/* Add topic */}
                      <div className="flex gap-2 mt-3">
                        <input
                          type="text"
                          placeholder="Add new topic..."
                          value={newTopicName}
                          onChange={(e) => setNewTopicName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddTopic(chapter.id)}
                          className="input flex-1"
                        />
                        <button
                          onClick={() => handleAddTopic(chapter.id)}
                          className="btn btn-primary"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Add Chapter Modal */}
        {showAddChapter && (
          <div className="modal-overlay" onClick={() => setShowAddChapter(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold mb-4">Add Chapter</h2>
              <input
                type="text"
                placeholder="Chapter name"
                value={newChapter.name}
                onChange={(e) => setNewChapter({ ...newChapter, name: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleAddChapter()}
                className="input mb-4"
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={handleAddChapter} className="btn btn-primary flex-1">
                  Add Chapter
                </button>
                <button onClick={() => setShowAddChapter(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // List view
  return (
    <div className="page-enter space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Syllabus</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Track your subjects and master every topic
          </p>
        </div>
        <button
          onClick={() => setShowAddSubject(true)}
          className="btn btn-primary"
        >
          <Plus size={16} />
          Add Subject
        </button>
      </div>

      {subjects.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold mb-2">No subjects yet</h3>
          <p className="text-[var(--color-text-muted)] mb-6">
            Start by adding your first subject
          </p>
          <button onClick={() => setShowAddSubject(true)} className="btn btn-primary">
            <Plus size={16} />
            Add Subject
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              onClick={() => navigate(`/syllabus/${subject.id}`)}
              className="card card-interactive cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{subject.icon}</div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSubject(subject.id);
                  }}
                  className="p-2 hover:bg-[var(--color-bg-hover)] rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <h3 className="text-xl font-semibold mb-2">{subject.name}</h3>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-[var(--color-text-muted)]">Progress</span>
                    <span className="font-medium" style={{ color: subject.color }}>
                      {subject.progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${subject.progress}%`,
                        backgroundColor: subject.color
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">
                    {subject.chapters?.length || 0} chapters
                  </span>
                  <span className="text-[var(--color-text-muted)]">
                    {subject.studyHours || 0}h studied
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddSubject && (
        <div className="modal-overlay" onClick={() => setShowAddSubject(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Add Subject</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g., Mathematics"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  className="input"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Icon (Emoji)</label>
                <input
                  type="text"
                  placeholder="📚"
                  value={newSubject.icon}
                  onChange={(e) => setNewSubject({ ...newSubject, icon: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex gap-2">
                  {['#6c63ff', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#a29bfe', '#fd79a8'].map(color => (
                    <button
                      key={color}
                      onClick={() => setNewSubject({ ...newSubject, color })}
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        newSubject.color === color ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={handleAddSubject} className="btn btn-primary flex-1">
                Add Subject
              </button>
              <button onClick={() => setShowAddSubject(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
