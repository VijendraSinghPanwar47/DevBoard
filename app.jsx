import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import {
  LayoutDashboard,
  CheckSquare,
  FolderGit2,
  Calendar as CalendarIcon,
  StickyNote,
  BarChart3,
  Settings,
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Flame,
  ArrowUpRight,
  LogOut,
  User,
  Sparkles
} from 'lucide-react';

// ==========================================================================
// Mock Initial Data for Portfolio Demonstration
// ==========================================================================

const INITIAL_TASKS = [
  {
    id: 't-1',
    title: 'Architect GraphQL Federation Gateway',
    description: 'Decompose monolithic endpoints into subgraphs with unified schema management.',
    project: 'SmartSpend AI',
    status: 'In Progress',
    priority: 'high',
    dueDate: '2026-09-22',
    tag: 'Backend'
  },
  {
    id: 't-2',
    title: 'Implement Dark Mode CSS Tokens',
    description: 'Harmonize dynamic palette tokens using CSS native custom properties.',
    project: 'DevBoard',
    status: 'Done',
    priority: 'medium',
    dueDate: '2026-09-15',
    tag: 'UI/UX'
  },
  {
    id: 't-3',
    title: 'Optimize Core Web Vitals to 99+',
    description: 'Eliminate render-blocking resources and dynamic import hydration bundles.',
    project: 'CloudPulse',
    status: 'Review',
    priority: 'high',
    dueDate: '2026-09-25',
    tag: 'Performance'
  },
  {
    id: 't-4',
    title: 'Draft OAuth 2.1 PKCE Flow Docs',
    description: 'Document the authorization grant code exchange pipeline for native clients.',
    project: 'SmartSpend AI',
    status: 'To Do',
    priority: 'low',
    dueDate: '2026-09-28',
    tag: 'Security'
  },
  {
    id: 't-5',
    title: 'Setup Distributed Tracing with OpenTelemetry',
    description: 'Instrument async spans across microservices to isolate latency bottlenecks.',
    project: 'CloudPulse',
    status: 'To Do',
    priority: 'medium',
    dueDate: '2026-10-02',
    tag: 'DevOps'
  }
];

const INITIAL_PROJECTS = [
  {
    id: 'p-1',
    name: 'SmartSpend AI',
    description: 'Autonomous financial categorization platform powered by local LLMs.',
    totalTasks: 24,
    completedTasks: 18,
    deadline: 'Due in 6 days',
    status: 'Active'
  },
  {
    id: 'p-2',
    name: 'DevBoard Core',
    description: 'High-density developer productivity system with zero-latency UX.',
    totalTasks: 16,
    completedTasks: 14,
    deadline: 'Due in 12 days',
    status: 'Near Complete'
  },
  {
    id: 'p-3',
    name: 'CloudPulse Telemetry',
    description: 'Real-time distributed metrics collector and anomaly alert engine.',
    totalTasks: 32,
    completedTasks: 12,
    deadline: 'Due in 18 days',
    status: 'Planning'
  }
];

const INITIAL_NOTES = [
  {
    id: 'n-1',
    title: 'IndexedDB vs LocalStorage Storage Limits',
    content: 'LocalStorage is synchronous and capped at ~5MB. Ideal for lightweight metadata, theme flags, and user preferences. For telemetry blobs, benchmark IndexedDB with Dexie.js wrapper.',
    updatedAt: '2 hours ago'
  },
  {
    id: 'n-2',
    title: 'Design System Micro-Tokens',
    content: 'Stick to an 8pt dynamic scale. All modals should use scale(0.98) -> scale(1) with cubic-bezier(0.16, 1, 0.3, 1) for snappy response feel.',
    updatedAt: 'Yesterday'
  }
];

// ==========================================================================
// Main Application Component
// ==========================================================================

function App() {
  // Navigation & Theme State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('devboard_theme') || 'dark');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Authentication State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('devboard_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Core Data Persistent States
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('devboard_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });
  const [projects] = useState(() => {
    const saved = localStorage.getItem('devboard_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('devboard_notes');
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });

  // Focus Timer Persistent State
  const [focusSeconds, setFocusSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [completedFocusMinutes, setCompletedFocusMinutes] = useState(() => {
    const saved = localStorage.getItem('devboard_focus_mins');
    return saved ? parseInt(saved, 10) : 125;
  });

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Modal Dialogs & Toasts
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('devboard_theme', theme);
  }, [theme]);

  // Sync LocalStorage
  useEffect(() => {
    localStorage.setItem('devboard_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('devboard_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('devboard_focus_mins', completedFocusMinutes.toString());
  }, [completedFocusMinutes]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('devboard_user', JSON.stringify(userData));
    triggerToast(`Welcome back, ${userData.name}!`);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('devboard_user');
    triggerToast('Logged out of workspace.');
  };

  // Timer Tick
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && focusSeconds > 0) {
      interval = setInterval(() => {
        setFocusSeconds((prev) => prev - 1);
      }, 1000);
    } else if (focusSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setCompletedFocusMinutes((prev) => prev + 25);
      triggerToast('Focus session completed! Logged +25 minutes.');
      setFocusSeconds(25 * 60);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, focusSeconds]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Search Aggregation
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { tasks: [], projects: [], notes: [] };
    const q = searchQuery.toLowerCase();
    return {
      tasks: tasks.filter((t) => t.title.toLowerCase().includes(q) || t.project.toLowerCase().includes(q)),
      projects: projects.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)),
      notes: notes.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
    };
  }, [searchQuery, tasks, projects, notes]);

  // Task Operations
  const handleSaveTask = (taskData) => {
    if (editingTask) {
      setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? { ...taskData, id: t.id } : t)));
      triggerToast('Task updated successfully.');
    } else {
      const newTask = {
        ...taskData,
        id: `t-${Date.now()}`
      };
      setTasks((prev) => [newTask, ...prev]);
      triggerToast('New task scheduled.');
    }
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    triggerToast('Task removed.');
  };

  const handleStatusChange = (taskId, newStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
  };

  // If user is not logged in, render Auth Screen
  if (!user) {
    return (
      <>
        <AuthScreen onLogin={handleLogin} />
        {toastMessage && (
          <div className="toast-notification">
            <CheckCircle2 size={18} color="var(--accent-primary)" />
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  // Computed Metrics
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter((t) => t.status === 'Done').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const completionRate = totalTasksCount ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div className="app-container">
      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsMobileMenuOpen(false);
        }}
        isOpen={isMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Topbar
          pageTitle={
            activeTab === 'dashboard' ? 'Overview' :
            activeTab === 'tasks' ? 'Tasks Kanban' :
            activeTab === 'projects' ? 'Active Projects' :
            activeTab === 'calendar' ? 'Sprint Schedule' :
            activeTab === 'notes' ? 'Developer Scratchpad' :
            activeTab === 'analytics' ? 'Velocity Analytics' : 'Configuration'
          }
          user={user}
          onLogout={handleLogout}
          theme={theme}
          toggleTheme={toggleTheme}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isSearchFocused={isSearchFocused}
          setIsSearchFocused={setIsSearchFocused}
          searchResults={searchResults}
          onSelectResult={(tab) => {
            setActiveTab(tab);
            setSearchQuery('');
          }}
        />

        <main className="content-viewport">
          {activeTab === 'dashboard' && (
            <DashboardView
              user={user}
              totalTasks={totalTasksCount}
              completedTasks={completedTasksCount}
              inProgress={inProgressCount}
              completionRate={completionRate}
              focusMinutes={completedFocusMinutes}
              tasks={tasks}
              onOpenNewTask={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              focusSeconds={focusSeconds}
              isTimerRunning={isTimerRunning}
              setIsTimerRunning={setIsTimerRunning}
              setFocusSeconds={setFocusSeconds}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksKanbanView
              tasks={tasks}
              onSaveTask={handleSaveTask}
              onDeleteTask={handleDeleteTask}
              onStatusChange={handleStatusChange}
              onOpenModal={(task = null) => {
                setEditingTask(task);
                setIsTaskModalOpen(true);
              }}
            />
          )}

          {activeTab === 'projects' && <ProjectsView projects={projects} tasks={tasks} />}

          {activeTab === 'calendar' && <CalendarView tasks={tasks} />}

          {activeTab === 'notes' && (
            <NotesView
              notes={notes}
              setNotes={setNotes}
              onNotify={triggerToast}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              totalTasks={totalTasksCount}
              completedTasks={completedTasksCount}
              inProgress={inProgressCount}
              focusMinutes={completedFocusMinutes}
              completionRate={completionRate}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              user={user}
              onLogout={handleLogout}
              theme={theme}
              toggleTheme={toggleTheme}
            />
          )}
        </main>
      </div>

      {/* Task Creation & Edit Modal */}
      {isTaskModalOpen && (
        <TaskModal
          task={editingTask}
          onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
        />
      )}

      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="toast-notification">
          <CheckCircle2 size={18} color="var(--accent-primary)" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

// ==========================================================================
// Subcomponent: Auth / Login Screen
// ==========================================================================

function AuthScreen({ onLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Frontend Developer');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onLogin({ name, email, role });
  };

  const handleGuestLogin = () => {
    onLogin({
      name: 'Portfolio Reviewer',
      email: 'recruiter@techcorp.io',
      role: 'Engineering Manager'
    });
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-icon-wrapper" style={{ margin: '0 auto 12px auto' }}>
            <Flame size={24} />
          </div>
          <h2>DevBoard Workspace</h2>
          <p>Sign in to orchestrate sprints, tasks, and velocity metrics.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Work Email *</label>
            <input
              type="email"
              className="form-input"
              placeholder="developer@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Primary Role</label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Full Stack Engineer">Full Stack Engineer</option>
              <option value="UI/UX Engineer">UI/UX Engineer</option>
              <option value="Software Intern">Software Engineering Intern</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            Access Workspace
          </button>
        </form>

        <div className="auth-divider">or explore quick demo</div>

        <button
          type="button"
          className="btn btn-guest"
          onClick={handleGuestLogin}
        >
          <Sparkles size={16} />
          <span>One-Click Guest Access (Reviewer)</span>
        </button>
      </div>
    </div>
  );
}

// ==========================================================================
// Subcomponent: Sidebar Navigation
// ==========================================================================

function Sidebar({ activeTab, setActiveTab, isOpen }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'My Tasks', icon: CheckSquare },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'notes', label: 'Notes', icon: StickyNote },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-icon-wrapper">
          <Flame size={22} />
        </div>
        <div>
          <span className="brand-name">DevBoard</span>
        </div>
        <span className="brand-tag">v2.6</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="system-status">
          <div className="status-dot" />
          <span>All Services Nominal</span>
        </div>
      </div>
    </aside>
  );
}

// ==========================================================================
// Subcomponent: Top Navigation Bar
// ==========================================================================

function Topbar({
  pageTitle,
  user,
  onLogout,
  theme,
  toggleTheme,
  onOpenMobileMenu,
  searchQuery,
  setSearchQuery,
  isSearchFocused,
  setIsSearchFocused,
  searchResults,
  onSelectResult
}) {
  const searchContainerRef = useRef(null);
  const profileMenuRef = useRef(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsSearchFocused]);

  const hasResults =
    searchResults.tasks.length > 0 ||
    searchResults.projects.length > 0 ||
    searchResults.notes.length > 0;

  // Calculate User Initials
  const initials = useMemo(() => {
    if (!user || !user.name) return 'DV';
    const parts = user.name.trim().split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase();
  }, [user]);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="mobile-menu-btn"
          onClick={onOpenMobileMenu}
          aria-label="Open Navigation Menu"
        >
          <Menu size={22} />
        </button>
        <h2 className="page-title">{pageTitle}</h2>
      </div>

      <div className="topbar-center" ref={searchContainerRef}>
        <div className="search-box">
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search tasks, stacks, notes... (Press /)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
          />
          <span className="search-shortcut">⌘K</span>
        </div>

        {isSearchFocused && searchQuery.trim().length > 0 && (
          <div className="search-results-dropdown">
            {!hasResults ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-faint)' }}>
                No records matching "{searchQuery}"
              </div>
            ) : (
              <>
                {searchResults.tasks.length > 0 && (
                  <div>
                    <div className="search-result-group-title">Tasks</div>
                    {searchResults.tasks.map((t) => (
                      <div
                        key={t.id}
                        className="search-result-item"
                        onClick={() => onSelectResult('tasks')}
                      >
                        <span>{t.title}</span>
                        <span className="badge badge-medium">{t.status}</span>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.projects.length > 0 && (
                  <div>
                    <div className="search-result-group-title">Projects</div>
                    {searchResults.projects.map((p) => (
                      <div
                        key={p.id}
                        className="search-result-item"
                        onClick={() => onSelectResult('projects')}
                      >
                        <span>{p.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {p.deadline}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.notes.length > 0 && (
                  <div>
                    <div className="search-result-group-title">Notes</div>
                    {searchResults.notes.map((n) => (
                      <div
                        key={n.id}
                        className="search-result-item"
                        onClick={() => onSelectResult('notes')}
                      >
                        <span>{n.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="topbar-right">
        <button
          className="icon-button"
          onClick={toggleTheme}
          aria-label="Toggle Color Scheme"
          title="Toggle Color Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="icon-button" aria-label="Notifications" title="System Alerts">
          <Bell size={18} />
          <span className="notification-badge" />
        </button>

        <div className="user-profile-menu" ref={profileMenuRef}>
          <div className="user-profile" onClick={() => setIsProfileOpen(!isProfileOpen)}>
            <div className="avatar">{initials}</div>
            <div className="user-info">
              <span className="user-name">{user?.name || 'Developer'}</span>
              <span className="user-role">{user?.role || 'Frontend Engineer'}</span>
            </div>
          </div>

          {isProfileOpen && (
            <div className="profile-dropdown">
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '4px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user?.email}</div>
              </div>
              <button
                className="nav-item"
                onClick={onLogout}
                style={{ color: 'var(--danger)', gap: '8px', padding: '8px 12px' }}
              >
                <LogOut size={15} />
                <span>Logout Session</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ==========================================================================
// Subcomponent: Dashboard View
// ==========================================================================

function DashboardView({
  user,
  totalTasks,
  completedTasks,
  inProgress,
  completionRate,
  focusMinutes,
  tasks,
  onOpenNewTask,
  focusSeconds,
  isTimerRunning,
  setIsTimerRunning,
  setFocusSeconds
}) {
  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const hours = Math.floor(focusMinutes / 60);
  const mins = focusMinutes % 60;

  const weeklyData = [
    { day: 'Mon', value: 65, label: '5.2h' },
    { day: 'Tue', value: 85, label: '6.8h' },
    { day: 'Wed', value: 45, label: '3.6h' },
    { day: 'Thu', value: 95, label: '7.6h' },
    { day: 'Fri', value: 70, label: '5.6h' },
    { day: 'Sat', value: 30, label: '2.4h' },
    { day: 'Sun', value: 40, label: '3.2h' }
  ];

  const firstName = user?.name ? user.name.split(' ')[0] : 'Developer';

  return (
    <div>
      <div className="dashboard-header">
        <h1>Welcome back, {firstName} 👋</h1>
        <p>Here's your productivity overview for this sprint.</p>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Tasks</span>
            <div className="stat-icon">
              <CheckSquare size={18} />
            </div>
          </div>
          <div className="stat-value">{totalTasks}</div>
          <div className="stat-trend positive">
            <TrendingUp size={14} />
            <span>+12% vs last week</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Completed</span>
            <div className="stat-icon">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="stat-value">{completedTasks}</div>
          <div className="stat-trend positive">
            <span>{completionRate}% completion rate</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">In Progress</span>
            <div className="stat-icon">
              <AlertCircle size={18} />
            </div>
          </div>
          <div className="stat-value">{inProgress}</div>
          <div className="stat-trend neutral">
            <span>Active sprint scope</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Deep Focus</span>
            <div className="stat-icon">
              <Clock size={18} />
            </div>
          </div>
          <div className="stat-value">{hours}h {mins}m</div>
          <div className="stat-trend highlight">
            <span>+8% deep work ratio</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart & Focus Widget */}
      <div className="dashboard-main-grid">
        <div className="card-panel">
          <div className="card-panel-header">
            <div>
              <h3 className="panel-title">Weekly Productivity Velocity</h3>
              <p className="panel-subtitle">Total logged deep work hours over current 7-day cycle</p>
            </div>
            <span className="badge badge-low">+14.2% Avg</span>
          </div>

          <div className="chart-container">
            <div className="chart-bars-wrap">
              {weeklyData.map((d) => (
                <div key={d.day} className="chart-column">
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>{d.label}</span>
                  <div className="chart-bar-outer">
                    <div
                      className="chart-bar-fill"
                      style={{ height: `${d.value}%` }}
                    />
                  </div>
                  <span className="chart-label">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Focus Pomodoro */}
        <div className="card-panel">
          <div className="card-panel-header">
            <div>
              <h3 className="panel-title">Active Focus Block</h3>
              <p className="panel-subtitle">Pomodoro state machine</p>
            </div>
          </div>

          <div className="focus-quick-widget">
            <div className="timer-circle">{formatTimer(focusSeconds)}</div>
            <div className="timer-controls">
              <button
                className="btn btn-primary"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
              >
                {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
                <span>{isTimerRunning ? 'Pause Session' : 'Start Focus'}</span>
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setIsTimerRunning(false);
                  setFocusSeconds(25 * 60);
                }}
                aria-label="Reset Timer"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Priority Tasks Overview */}
      <div className="card-panel">
        <div className="card-panel-header">
          <div>
            <h3 className="panel-title">Immediate Attention Needed</h3>
            <p className="panel-subtitle">Highest priority issues assigned to your sprint</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={onOpenNewTask}>
            <Plus size={16} />
            <span>Create Task</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {tasks.slice(0, 3).map((task) => (
            <div
              key={task.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: '2px' }}>
                  {task.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {task.project} • Due {task.dueDate}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                <span className="badge badge-medium">{task.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// Subcomponent: Kanban Task Board View (Native Drag & Drop)
// ==========================================================================

function TasksKanbanView({
  tasks,
  onDeleteTask,
  onStatusChange,
  onOpenModal
}) {
  const [filterProject, setFilterProject] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const columns = ['To Do', 'In Progress', 'Review', 'Done'];

  const filteredTasks = tasks.filter((t) => {
    const matchProj = filterProject === 'All' || t.project === filterProject;
    const matchPrio = filterPriority === 'All' || t.priority === filterPriority;
    return matchProj && matchPrio;
  });

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
    setDragOverColumn(null);
  };

  const handleDragOver = (e, col) => {
    e.preventDefault();
    setDragOverColumn(col);
  };

  const handleDrop = (e, col) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onStatusChange(taskId, col);
    }
    setDragOverColumn(null);
  };

  return (
    <div>
      <div className="kanban-toolbar">
        <div className="kanban-filters">
          <select
            className="select-filter"
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
          >
            <option value="All">All Projects</option>
            <option value="SmartSpend AI">SmartSpend AI</option>
            <option value="DevBoard">DevBoard</option>
            <option value="CloudPulse">CloudPulse</option>
          </select>

          <select
            className="select-filter"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={() => onOpenModal()}>
          <Plus size={16} />
          <span>New Task</span>
        </button>
      </div>

      <div className="kanban-board">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col);
          const dotClass =
            col === 'To Do' ? 'dot-todo' :
            col === 'In Progress' ? 'dot-in-progress' :
            col === 'Review' ? 'dot-review' : 'dot-done';

          return (
            <div
              key={col}
              className={`kanban-column ${dragOverColumn === col ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, col)}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={(e) => handleDrop(e, col)}
            >
              <div className="column-header">
                <div className="column-title-group">
                  <div className={`column-dot ${dotClass}`} />
                  <span className="column-title">{col}</span>
                </div>
                <span className="column-counter">{colTasks.length}</span>
              </div>

              <div className="cards-container">
                {colTasks.length === 0 ? (
                  <div className="empty-kanban-slot">Drop tasks here</div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="task-card"
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="task-card-header">
                        <span className="task-project-tag">{task.project}</span>
                        <div className="task-actions">
                          <button
                            className="btn-icon-only"
                            onClick={() => onOpenModal(task)}
                            title="Edit task"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            className="btn-icon-only"
                            onClick={() => onDeleteTask(task.id)}
                            title="Delete task"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="task-title">{task.title}</div>
                      {task.description && <div className="task-desc">{task.description}</div>}

                      <div className="task-card-footer">
                        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                        <div className="task-due">
                          <Clock size={12} />
                          <span>{task.dueDate}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================================================
// Subcomponent: Projects View
// ==========================================================================

function ProjectsView({ projects, tasks }) {
  return (
    <div>
      <div className="dashboard-header">
        <h1>Engineering Projects</h1>
        <p>Active repositories, delivery milestones, and sprint progress tracking.</p>
      </div>

      <div className="projects-grid">
        {projects.map((proj) => {
          const relatedTasks = tasks.filter((t) => t.project === proj.name);
          const total = relatedTasks.length > 0 ? relatedTasks.length : proj.totalTasks;
          const completed = relatedTasks.length > 0 ? relatedTasks.filter((t) => t.status === 'Done').length : proj.completedTasks;
          const pct = Math.round((completed / total) * 100);

          return (
            <div key={proj.id} className="project-card">
              <div className="project-meta">
                <span className="badge badge-low">{proj.status}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>{proj.deadline}</span>
              </div>

              <div>
                <h3 className="project-name">{proj.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {proj.description}
                </p>
              </div>

              <div className="project-progress-wrap">
                <div className="progress-info">
                  <span>Sprint Progress</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{pct}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                <span>{completed} of {total} Tasks Finished</span>
                <ArrowUpRight size={16} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================================================
// Subcomponent: Calendar Schedule View
// ==========================================================================

function CalendarView({ tasks }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 16)); // September 2026

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const totalDays = daysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrev = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNext = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="calendar-wrapper">
      <div className="calendar-header-bar">
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
        </div>
        <div className="calendar-nav-group">
          <button className="icon-button" onClick={handlePrev} aria-label="Previous Month">
            <ChevronLeft size={18} />
          </button>
          <button className="icon-button" onClick={handleNext} aria-label="Next Month">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="calendar-day-label">{d}</div>
        ))}

        {/* Empty slots before first day */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="calendar-cell different-month" />
        ))}

        {/* Month Day Cells */}
        {Array.from({ length: totalDays }).map((_, idx) => {
          const dayNum = idx + 1;
          const formattedDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const matchingTasks = tasks.filter((t) => t.dueDate === formattedDateStr);
          const isToday = dayNum === 16 && currentDate.getMonth() === 8;

          return (
            <div
              key={dayNum}
              className={`calendar-cell ${isToday ? 'is-today' : ''} ${matchingTasks.length > 0 ? 'has-tasks' : ''}`}
            >
              <span className="cell-date-num">{dayNum}</span>
              <div className="cell-tasks">
                {matchingTasks.map((t) => (
                  <div key={t.id} className="calendar-task-pill" title={t.title}>
                    {t.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================================================
// Subcomponent: Scratchpad Notes View
// ==========================================================================

function NotesView({ notes, setNotes, onNotify }) {
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const item = {
      id: `n-${Date.now()}`,
      title: newTitle,
      content: newContent,
      updatedAt: 'Just now'
    };
    setNotes([item, ...notes]);
    setNewTitle('');
    setNewContent('');
    setIsCreating(false);
    onNotify('Note saved to local storage.');
  };

  const handleDelete = (id) => {
    setNotes(notes.filter((n) => n.id !== id));
    onNotify('Note discarded.');
  };

  return (
    <div>
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Developer Scratchpad</h1>
          <p>Local persisted snippets, architecture thoughts, and code ideas.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsCreating(!isCreating)}>
          <Plus size={16} />
          <span>{isCreating ? 'Close Pad' : 'New Note'}</span>
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleAddNote} className="card-panel" style={{ marginBottom: '24px' }}>
          <div className="form-group">
            <label>Note Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Distributed Lock Mechanism using Redis Redlock"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Details / Markdown Snippet</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Write raw thoughts, bash snippets, or configs..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCreating(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Note
            </button>
          </div>
        </form>
      )}

      <div className="notes-grid">
        {notes.map((note) => (
          <div key={note.id} className="note-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 className="note-title">{note.title}</h3>
              <button
                className="btn-icon-only"
                onClick={() => handleDelete(note.id)}
                title="Delete note"
              >
                <Trash2 size={15} />
              </button>
            </div>
            <div className="note-body">{note.content}</div>
            <div className="note-footer">
              <span>Updated {note.updatedAt}</span>
              <StickyNote size={14} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================================================
// Subcomponent: Velocity Analytics View
// ==========================================================================

function AnalyticsView({ totalTasks, completedTasks, inProgress, focusMinutes, completionRate }) {
  return (
    <div>
      <div className="dashboard-header">
        <h1>Engineering Velocity & Metrics</h1>
        <p>Quantitative audit of task completion velocity, focus efficiency, and cycle time.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Throughput Efficiency</span>
          <div className="stat-value">{completionRate}%</div>
          <div className="stat-trend positive">Sprint Goal on Track</div>
        </div>

        <div className="stat-card">
          <span className="stat-label">Logged Deep Focus</span>
          <div className="stat-value">{Math.round(focusMinutes / 60)} hrs</div>
          <div className="stat-trend highlight">+4.2 hrs over baseline</div>
        </div>

        <div className="stat-card">
          <span className="stat-label">WIP Limit Ratio</span>
          <div className="stat-value">{inProgress} / 5</div>
          <div className="stat-trend neutral">Optimal concurrency</div>
        </div>

        <div className="stat-card">
          <span className="stat-label">Resolved Tickets</span>
          <div className="stat-value">{completedTasks}</div>
          <div className="stat-trend positive">Zero regressions reported</div>
        </div>
      </div>

      <div className="card-panel" style={{ marginTop: '24px' }}>
        <h3 className="panel-title" style={{ marginBottom: '12px' }}>Sprint Task Distribution</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
              <span>Done Tasks</span>
              <span>{completedTasks} of {totalTasks}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${completionRate}%` }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
              <span>In Progress (Active Execution)</span>
              <span>{inProgress} of {totalTasks}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${(inProgress / (totalTasks || 1)) * 100}%`, background: 'var(--warning)' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// Subcomponent: Settings View
// ==========================================================================

function SettingsView({ user, onLogout, theme, toggleTheme }) {
  return (
    <div>
      <div className="dashboard-header">
        <h1>Workspace Settings</h1>
        <p>Manage application preferences, appearance tokens, and local cache state.</p>
      </div>

      <div className="card-panel" style={{ maxWidth: '640px' }}>
        <h3 className="panel-title" style={{ marginBottom: '16px' }}>Active Profile</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <div style={{ fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {user?.email} • {user?.role}
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onLogout}>
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>

        <h3 className="panel-title" style={{ margin: '20px 0 16px' }}>Appearance</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <div style={{ fontWeight: 600 }}>Color Theme</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Currently utilizing {theme} scheme
            </div>
          </div>
          <button className="btn btn-secondary" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </div>

        <h3 className="panel-title" style={{ margin: '24px 0 16px' }}>Local Storage Data</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600 }}>Purge Client Cache</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Clear all tasks, scratchpad notes, and telemetry from your browser
            </div>
          </div>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => {
              if (confirm('Are you sure you want to reset all data back to factory defaults?')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
          >
            Reset Workspace
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// Subcomponent: Task Creation/Edit Modal Dialog
// ==========================================================================

function TaskModal({ task, onClose, onSave }) {
  const [title, setTitle] = useState(task ? task.title : '');
  const [description, setDescription] = useState(task ? task.description : '');
  const [project, setProject] = useState(task ? task.project : 'SmartSpend AI');
  const [status, setStatus] = useState(task ? task.status : 'To Do');
  const [priority, setPriority] = useState(task ? task.priority : 'medium');
  const [dueDate, setDueDate] = useState(task ? task.dueDate : '2026-09-24');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title,
      description,
      project,
      status,
      priority,
      dueDate
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{task ? 'Edit Task' : 'Create New Task'}</h3>
          <button className="btn-icon-only" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Task Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Implement refresh token rotation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Outline execution criteria and technical nuances..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Project</label>
              <select className="form-select" value={project} onChange={(e) => setProject(e.target.value)}>
                <option value="SmartSpend AI">SmartSpend AI</option>
                <option value="DevBoard">DevBoard</option>
                <option value="CloudPulse">CloudPulse</option>
              </select>
            </div>

            <div className="form-group">
              <label>Initial Status</label>
              <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {task ? 'Update Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================================================
// Bootstrap React App
// ==========================================================================

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);