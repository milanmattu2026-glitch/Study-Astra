import { format, addDays } from 'date-fns';

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const sampleData = {
  user: {
    id: 'user-1',
    name: 'Alex',
    email: 'alex@studyastra.com',
    avatar: '👨‍🎓',
    educationLevel: 'Undergraduate',
    dailyStudyGoal: 240, // minutes
    preferredStudyHours: { start: '09:00', end: '17:00' },
    onboardingCompleted: true,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },

  subjects: [
    {
      id: 'subj-1',
      name: 'Data Structures',
      color: '#6c63ff',
      icon: '💻',
      progress: 68,
      chapters: [
        {
          id: 'ch-1',
          name: 'Arrays',
          topics: [
            { id: 't-1', name: 'Introduction to Arrays', status: 'completed' },
            { id: 't-2', name: 'Array Operations', status: 'completed' },
            { id: 't-3', name: 'Multi-dimensional Arrays', status: 'completed' },
          ]
        },
        {
          id: 'ch-2',
          name: 'Linked Lists',
          topics: [
            { id: 't-4', name: 'Singly Linked List', status: 'completed' },
            { id: 't-5', name: 'Doubly Linked List', status: 'completed' },
            { id: 't-6', name: 'Circular Linked List', status: 'completed' },
          ]
        },
        {
          id: 'ch-3',
          name: 'Stacks',
          topics: [
            { id: 't-7', name: 'Stack Operations', status: 'completed' },
            { id: 't-8', name: 'Applications of Stack', status: 'completed' },
          ]
        },
        {
          id: 'ch-4',
          name: 'Queues',
          topics: [
            { id: 't-9', name: 'Queue Operations', status: 'completed' },
            { id: 't-10', name: 'Circular Queue', status: 'completed' },
            { id: 't-11', name: 'Priority Queue', status: 'in-progress' },
          ]
        },
        {
          id: 'ch-5',
          name: 'Trees',
          topics: [
            { id: 't-12', name: 'Binary Trees', status: 'in-progress' },
            { id: 't-13', name: 'Binary Search Trees', status: 'in-progress' },
            { id: 't-14', name: 'AVL Trees', status: 'not-started' },
            { id: 't-15', name: 'Tree Traversals', status: 'in-progress' },
          ]
        },
        {
          id: 'ch-6',
          name: 'Graphs',
          topics: [
            { id: 't-16', name: 'Graph Representation', status: 'in-progress' },
            { id: 't-17', name: 'BFS and DFS', status: 'not-started' },
            { id: 't-18', name: 'Shortest Path Algorithms', status: 'not-started' },
          ]
        },
        {
          id: 'ch-7',
          name: 'Dynamic Programming',
          topics: [
            { id: 't-19', name: 'Introduction to DP', status: 'not-started' },
            { id: 't-20', name: 'Memoization', status: 'not-started' },
            { id: 't-21', name: 'Classic DP Problems', status: 'not-started' },
          ]
        }
      ],
      studyHours: 45,
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    },
    {
      id: 'subj-2',
      name: 'Mathematics',
      color: '#ff6b6b',
      icon: '📐',
      progress: 82,
      chapters: [
        {
          id: 'ch-8',
          name: 'Calculus',
          topics: [
            { id: 't-22', name: 'Limits', status: 'completed' },
            { id: 't-23', name: 'Derivatives', status: 'completed' },
            { id: 't-24', name: 'Integrals', status: 'completed' },
          ]
        },
        {
          id: 'ch-9',
          name: 'Linear Algebra',
          topics: [
            { id: 't-25', name: 'Matrices', status: 'completed' },
            { id: 't-26', name: 'Determinants', status: 'completed' },
            { id: 't-27', name: 'Eigenvalues', status: 'in-progress' },
          ]
        },
        {
          id: 'ch-10',
          name: 'Probability',
          topics: [
            { id: 't-28', name: 'Probability Basics', status: 'completed' },
            { id: 't-29', name: 'Distributions', status: 'completed' },
            { id: 't-30', name: 'Bayes Theorem', status: 'in-progress' },
          ]
        }
      ],
      studyHours: 52,
      createdAt: new Date(Date.now() - 28 * 86400000).toISOString(),
    },
    {
      id: 'subj-3',
      name: 'Physics',
      color: '#4ecdc4',
      icon: '⚛️',
      progress: 56,
      chapters: [
        {
          id: 'ch-11',
          name: 'Mechanics',
          topics: [
            { id: 't-31', name: 'Kinematics', status: 'completed' },
            { id: 't-32', name: 'Dynamics', status: 'completed' },
            { id: 't-33', name: 'Work and Energy', status: 'in-progress' },
          ]
        },
        {
          id: 'ch-12',
          name: 'Electromagnetism',
          topics: [
            { id: 't-34', name: 'Electric Fields', status: 'in-progress' },
            { id: 't-35', name: 'Magnetic Fields', status: 'not-started' },
            { id: 't-36', name: 'Electromagnetic Induction', status: 'not-started' },
          ]
        },
        {
          id: 'ch-13',
          name: 'Thermodynamics',
          topics: [
            { id: 't-37', name: 'Laws of Thermodynamics', status: 'in-progress' },
            { id: 't-38', name: 'Heat Transfer', status: 'not-started' },
          ]
        }
      ],
      studyHours: 38,
      createdAt: new Date(Date.now() - 26 * 86400000).toISOString(),
    },
    {
      id: 'subj-4',
      name: 'Computer Science',
      color: '#45b7d1',
      icon: '🖥️',
      progress: 74,
      chapters: [
        {
          id: 'ch-14',
          name: 'Operating Systems',
          topics: [
            { id: 't-39', name: 'Process Management', status: 'completed' },
            { id: 't-40', name: 'Memory Management', status: 'completed' },
            { id: 't-41', name: 'File Systems', status: 'in-progress' },
          ]
        },
        {
          id: 'ch-15',
          name: 'Computer Networks',
          topics: [
            { id: 't-42', name: 'OSI Model', status: 'completed' },
            { id: 't-43', name: 'TCP/IP', status: 'completed' },
            { id: 't-44', name: 'Network Security', status: 'in-progress' },
          ]
        },
        {
          id: 'ch-16',
          name: 'Database Systems',
          topics: [
            { id: 't-45', name: 'SQL Basics', status: 'completed' },
            { id: 't-46', name: 'Normalization', status: 'completed' },
            { id: 't-47', name: 'Transactions', status: 'not-started' },
          ]
        }
      ],
      studyHours: 41,
      createdAt: new Date(Date.now() - 27 * 86400000).toISOString(),
    }
  ],

  tasks: [
    {
      id: 'task-1',
      title: 'Complete Arrays chapter exercises',
      subject: 'subj-1',
      priority: 'high',
      dueDate: addDays(new Date(), 0).toISOString(),
      dueTime: '18:00',
      completed: true,
      tags: ['practice', 'coding'],
      notes: '',
      subtasks: [],
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'task-2',
      title: 'Revise Linked Lists concepts',
      subject: 'subj-1',
      priority: 'medium',
      dueDate: addDays(new Date(), 0).toISOString(),
      dueTime: '20:00',
      completed: false,
      tags: ['revision'],
      notes: '',
      subtasks: [],
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'task-3',
      title: 'Solve 10 recursion problems',
      subject: 'subj-1',
      priority: 'high',
      dueDate: addDays(new Date(), 1).toISOString(),
      dueTime: '16:00',
      completed: false,
      tags: ['practice', 'recursion'],
      notes: '',
      subtasks: [
        { id: 'st-1', title: 'Fibonacci', completed: true },
        { id: 'st-2', title: 'Tower of Hanoi', completed: false },
        { id: 'st-3', title: 'N-Queens', completed: false },
      ],
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'task-4',
      title: 'Review Physics Chapter 3',
      subject: 'subj-3',
      priority: 'medium',
      dueDate: addDays(new Date(), 0).toISOString(),
      dueTime: '15:00',
      completed: false,
      tags: ['revision'],
      notes: '',
      subtasks: [],
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'task-5',
      title: 'Linear Algebra assignment',
      subject: 'subj-2',
      priority: 'critical',
      dueDate: addDays(new Date(), 2).toISOString(),
      dueTime: '23:59',
      completed: false,
      tags: ['assignment'],
      notes: 'Submit on portal',
      subtasks: [],
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'task-6',
      title: 'Practice SQL queries',
      subject: 'subj-4',
      priority: 'low',
      dueDate: addDays(new Date(), 3).toISOString(),
      dueTime: '12:00',
      completed: false,
      tags: ['practice'],
      notes: '',
      subtasks: [],
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'task-7',
      title: 'Read Chapter on Tree Traversals',
      subject: 'subj-1',
      priority: 'medium',
      dueDate: addDays(new Date(), 1).toISOString(),
      dueTime: '10:00',
      completed: false,
      tags: ['reading'],
      notes: '',
      subtasks: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-8',
      title: 'Prepare notes on Electromagnetism',
      subject: 'subj-3',
      priority: 'high',
      dueDate: addDays(new Date(), 4).toISOString(),
      dueTime: '14:00',
      completed: false,
      tags: ['notes'],
      notes: '',
      subtasks: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-9',
      title: 'Watch lecture on Network Security',
      subject: 'subj-4',
      priority: 'medium',
      dueDate: addDays(new Date(), 5).toISOString(),
      dueTime: '19:00',
      completed: false,
      tags: ['lecture'],
      notes: '',
      subtasks: [],
      createdAt: new Date().toISOString(),
    }
  ],

  notes: [
    {
      id: 'note-1',
      title: 'Singly Linked List Explained',
      content: '# Singly Linked List\n\nA singly linked list is a linear data structure where each element points to the next.\n\n## Key Concepts:\n- **Node**: Contains data and pointer to next node\n- **Head**: First node in the list\n- **Tail**: Last node (points to null)\n\n## Operations:\n- Insert at beginning: O(1)\n- Insert at end: O(n)\n- Delete: O(n)\n- Search: O(n)',
      subject: 'subj-1',
      chapter: 'ch-2',
      topic: 't-4',
      tags: ['linked-list', 'data-structures'],
      favorite: true,
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
    {
      id: 'note-2',
      title: 'Derivatives - Quick Reference',
      content: '# Derivatives Formulas\n\n## Basic Rules:\n- d/dx(x^n) = nx^(n-1)\n- d/dx(e^x) = e^x\n- d/dx(ln x) = 1/x\n- d/dx(sin x) = cos x\n- d/dx(cos x) = -sin x\n\n## Product Rule:\n(uv)\' = u\'v + uv\'\n\n## Chain Rule:\nf(g(x))\' = f\'(g(x)) × g\'(x)',
      subject: 'subj-2',
      chapter: 'ch-8',
      topic: 't-23',
      tags: ['calculus', 'formulas'],
      favorite: true,
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    },
    {
      id: 'note-3',
      title: 'Newton\'s Laws of Motion',
      content: '# Newton\'s Laws\n\n## First Law (Inertia):\nAn object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force.\n\n## Second Law (F=ma):\nF = ma\nForce = mass × acceleration\n\n## Third Law (Action-Reaction):\nFor every action, there is an equal and opposite reaction.',
      subject: 'subj-3',
      chapter: 'ch-11',
      topic: 't-32',
      tags: ['mechanics', 'laws'],
      favorite: false,
      createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    },
    {
      id: 'note-4',
      title: 'Stack Implementation in Python',
      content: '# Stack Implementation\n\n```python\nclass Stack:\n    def __init__(self):\n        self.items = []\n    \n    def push(self, item):\n        self.items.append(item)\n    \n    def pop(self):\n        if not self.is_empty():\n            return self.items.pop()\n    \n    def peek(self):\n        if not self.is_empty():\n            return self.items[-1]\n    \n    def is_empty(self):\n        return len(self.items) == 0\n    \n    def size(self):\n        return len(self.items)\n```\n\n## Applications:\n- Function call stack\n- Expression evaluation\n- Undo functionality\n- Backtracking',
      subject: 'subj-1',
      chapter: 'ch-3',
      topic: 't-7',
      tags: ['stack', 'code', 'python'],
      favorite: true,
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    },
    {
      id: 'note-5',
      title: 'OSI Model Layers',
      content: '# OSI Model - 7 Layers\n\n1. **Physical**: Bits, cables, signals\n2. **Data Link**: Frames, MAC addresses, switches\n3. **Network**: Packets, IP addresses, routers\n4. **Transport**: Segments, TCP/UDP, ports\n5. **Session**: Session management\n6. **Presentation**: Data formatting, encryption\n7. **Application**: HTTP, FTP, SMTP\n\n**Mnemonic**: Please Do Not Throw Sausage Pizza Away',
      subject: 'subj-4',
      chapter: 'ch-15',
      topic: 't-42',
      tags: ['networking', 'osi'],
      favorite: false,
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    },
    {
      id: 'note-6',
      title: 'Binary Search Tree Operations',
      content: '# Binary Search Tree\n\n## Properties:\n- Left subtree < root\n- Right subtree > root\n- Both subtrees are also BSTs\n\n## Time Complexity:\n- Search: O(log n) average, O(n) worst\n- Insert: O(log n) average, O(n) worst\n- Delete: O(log n) average, O(n) worst\n\n## Traversals:\n- **Inorder**: Left → Root → Right (gives sorted order)\n- **Preorder**: Root → Left → Right\n- **Postorder**: Left → Right → Root',
      subject: 'subj-1',
      chapter: 'ch-5',
      topic: 't-13',
      tags: ['bst', 'trees'],
      favorite: false,
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    }
  ],

  exams: [
    {
      id: 'exam-1',
      name: 'Data Structures Midterm',
      subject: 'subj-1',
      date: addDays(new Date(), 28).toISOString(),
      time: '10:00',
      location: 'Room 305',
      notes: 'Topics: Arrays, Linked Lists, Stacks, Queues',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'exam-2',
      name: 'Mathematics Final',
      subject: 'subj-2',
      date: addDays(new Date(), 45).toISOString(),
      time: '14:00',
      location: 'Hall A',
      notes: 'Comprehensive exam covering all topics',
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    {
      id: 'exam-3',
      name: 'Physics Quiz',
      subject: 'subj-3',
      date: addDays(new Date(), 7).toISOString(),
      time: '11:30',
      location: 'Lab 2',
      notes: 'Mechanics and Thermodynamics',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    }
  ],

  sessions: [
    // Past sessions
    {
      id: 'sess-1',
      subject: 'subj-1',
      topic: 'Arrays',
      startTime: new Date(Date.now() - 14 * 86400000 + 9 * 3600000).toISOString(),
      endTime: new Date(Date.now() - 14 * 86400000 + 11 * 3600000).toISOString(),
      duration: 120,
      priority: 'high',
      goal: 'Master array operations',
      notes: '',
      completed: true,
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
    {
      id: 'sess-2',
      subject: 'subj-2',
      topic: 'Derivatives',
      startTime: new Date(Date.now() - 13 * 86400000 + 14 * 3600000).toISOString(),
      endTime: new Date(Date.now() - 13 * 86400000 + 16 * 3600000).toISOString(),
      duration: 120,
      priority: 'medium',
      goal: 'Practice derivative problems',
      notes: '',
      completed: true,
      createdAt: new Date(Date.now() - 13 * 86400000).toISOString(),
    },
    // Today's sessions
    {
      id: 'sess-today-1',
      subject: 'subj-1',
      topic: 'Binary Trees',
      startTime: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
      endTime: new Date(new Date().setHours(9, 30, 0, 0)).toISOString(),
      duration: 90,
      priority: 'high',
      goal: 'Understand tree structure',
      notes: '',
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sess-today-2',
      subject: 'subj-3',
      topic: 'Kinematics',
      startTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
      endTime: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(),
      duration: 120,
      priority: 'medium',
      goal: 'Solve practice problems',
      notes: '',
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sess-today-3',
      subject: 'subj-2',
      topic: 'Linear Algebra',
      startTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
      endTime: new Date(new Date().setHours(16, 0, 0, 0)).toISOString(),
      duration: 120,
      priority: 'high',
      goal: 'Complete assignment',
      notes: '',
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sess-today-4',
      subject: 'subj-1',
      topic: 'Graph Algorithms',
      startTime: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(),
      endTime: new Date(new Date().setHours(19, 0, 0, 0)).toISOString(),
      duration: 120,
      priority: 'medium',
      goal: 'Learn BFS and DFS',
      notes: '',
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sess-today-5',
      subject: 'subj-4',
      topic: 'Network Security',
      startTime: new Date(new Date().setHours(20, 0, 0, 0)).toISOString(),
      endTime: new Date(new Date().setHours(21, 0, 0, 0)).toISOString(),
      duration: 60,
      priority: 'low',
      goal: 'Watch lecture',
      notes: '',
      completed: false,
      createdAt: new Date().toISOString(),
    },
  ],

  quizzes: [
    {
      id: 'quiz-1',
      subject: 'subj-1',
      topic: 'Arrays',
      difficulty: 'medium',
      questionCount: 10,
      score: 80,
      totalScore: 100,
      timeTaken: 15, // minutes
      questions: [
        {
          question: 'What is the time complexity of accessing an element in an array?',
          options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
          correct: 0,
          selected: 0,
          type: 'multiple-choice'
        },
        {
          question: 'Arrays have fixed size',
          options: ['True', 'False'],
          correct: 0,
          selected: 0,
          type: 'true-false'
        }
      ],
      weakAreas: ['Multi-dimensional arrays'],
      completedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      id: 'quiz-2',
      subject: 'subj-2',
      topic: 'Calculus',
      difficulty: 'hard',
      questionCount: 15,
      score: 73,
      totalScore: 100,
      timeTaken: 25,
      questions: [],
      weakAreas: ['Integration by parts', 'Partial derivatives'],
      completedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'quiz-3',
      subject: 'subj-1',
      topic: 'Linked Lists',
      difficulty: 'medium',
      questionCount: 12,
      score: 92,
      totalScore: 100,
      timeTaken: 18,
      questions: [],
      weakAreas: [],
      completedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'quiz-4',
      subject: 'subj-3',
      topic: 'Mechanics',
      difficulty: 'easy',
      questionCount: 8,
      score: 88,
      totalScore: 100,
      timeTaken: 12,
      questions: [],
      weakAreas: ['Work and Energy'],
      completedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    }
  ],

  streakData: {
    currentStreak: 12,
    bestStreak: 18,
    lastStudyDate: format(new Date(), 'yyyy-MM-dd'),
    studyDates: Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() - i * 86400000);
      return format(date, 'yyyy-MM-dd');
    }).filter((_, i) => i < 12 || (i >= 15 && i < 20) || i === 25)
  },

  settings: {
    theme: 'dark',
    accentColor: '#6c63ff',
    layoutDensity: 'comfortable',
    backgroundStyle: 'solid',
    weekStartsOn: 'monday',
    dailyStudyGoal: 240,
    pomodoroFocus: 25,
    pomodoroShortBreak: 5,
    pomodoroLongBreak: 15,
    notificationsEnabled: true,
    examReminders: true,
    taskReminders: true,
    studyReminders: true,
    streakReminders: true,
  },

  dashboardConfig: {
    widgets: [
      { id: 'overview', visible: true, order: 0 },
      { id: 'tasks', visible: true, order: 1 },
      { id: 'studyPlan', visible: true, order: 2 },
      { id: 'examCountdown', visible: true, order: 3 },
      { id: 'studyPulse', visible: true, order: 4 },
      { id: 'streak', visible: true, order: 5 },
      { id: 'syllabusProgress', visible: true, order: 6 },
    ]
  },

  notifications: [
    {
      id: 'notif-1',
      type: 'exam',
      title: 'Physics Quiz Tomorrow',
      message: 'Physics Quiz is scheduled for tomorrow at 11:30 AM',
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'notif-2',
      type: 'task',
      title: 'Task Due Today',
      message: 'You have 3 tasks due today',
      read: false,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'notif-3',
      type: 'streak',
      title: '12 Day Streak! 🔥',
      message: 'You\'re on fire! Keep up the great work.',
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    }
  ]
};
