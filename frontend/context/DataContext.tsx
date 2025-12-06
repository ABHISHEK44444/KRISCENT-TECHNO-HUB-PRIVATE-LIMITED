import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Project, Task, Message, UserRole, TaskStatus } from '../types';
import { MOCK_USERS, MOCK_PROJECTS, MOCK_TASKS, MOCK_MESSAGES } from '../constants';

interface DataContextType {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  tasks: Task[];
  messages: Message[];
  activeProject: Project | null;
  login: (email: string) => Promise<void>;
  register: (name: string, email: string, role: UserRole) => Promise<void>;
  logout: () => void;
  setActiveProject: (project: Project) => void;
  addTask: (task: Omit<Task, 'id'>) => Promise<Task>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  executeAIAction: (toolCall: any) => Promise<string>;
  hasPermission: (action: 'create_project' | 'delete_project' | 'assign_task') => boolean;
  isLoading: boolean;
  isOffline: boolean;
  connectionError: string | null;
  apiUrl: string;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// --- UNIVERSAL ENVIRONMENT VARIABLE LOADER ---
const getApiUrl = () => {
  let url = '';

  // 1. Try Vite Standard (using requested method)
  try {
    const meta = import.meta as any;
    const env = (meta.env || {}) as any;
    url = env.VITE_API_URL;
  } catch (e) {
    // Ignore if import.meta is not available
  }

  // 2. Try Create React App / Webpack / Next.js Standard (process.env)
  if (!url) {
    try {
        // @ts-ignore
        if (typeof process !== 'undefined' && process.env) {
            // @ts-ignore
            url = process.env.REACT_APP_API_URL || process.env.NEXT_PUBLIC_API_URL;
        }
    } catch (e) {
        // Ignore error
    }
  }

  // 3. Fallback to Localhost if no environment variable is found
  if (!url) {
    url = 'http://localhost:5000/api';
  }
  
  // 4. Cleanup: Remove trailing slash
  url = url.replace(/\/$/, '');

  // 5. Smart Correction: If user pasted "https://myapp.onrender.com", append "/api"
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  
  // 6. Force HTTPS in production (if not localhost)
  if (!url.includes('localhost') && url.startsWith('http://')) {
    url = url.replace('http://', 'https://');
  }

  return url;
};

const API_URL = getApiUrl();

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('collabflow_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [activeProject, setActiveProjectState] = useState<Project | null>(() => {
    const saved = localStorage.getItem('collabflow_active_project');
    return saved ? JSON.parse(saved) : null;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const setActiveProject = (project: Project) => {
    setActiveProjectState(project);
    localStorage.setItem('collabflow_active_project', JSON.stringify(project));
  };

  // --- HEALTH CHECK / WAKE UP LOGIC ---
  const waitForBackend = async () => {
    console.log(`[Connection] Attempting to connect to: ${API_URL}`);
    const maxRetries = 15; // Increased retries for Render cold start
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const res = await fetch(`${API_URL}/health`);
        if (res.ok) {
          console.log(`[Connection] Backend is Online! (Attempt ${i + 1})`);
          return true;
        }
      } catch (e) {
        console.log(`[Connection] Backend not ready yet... (Attempt ${i + 1})`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
      }
    }
    return false;
  };

  const fetchData = async () => {
    setIsLoading(true);
    setConnectionError(null);

    // 1. Try to wake up the server first
    const isOnline = await waitForBackend();

    if (!isOnline) {
      console.warn("Backend unreachable after retries. Switching to Offline Mode.");
      setIsOffline(true);
      setConnectionError("Could not connect to server. Using demo data.");
      loadMockData();
      setIsLoading(false);
      return;
    }

    // 2. Fetch Real Data
    try {
      const [usersRes, projectsRes, tasksRes, messagesRes] = await Promise.all([
        fetch(`${API_URL}/users`),
        fetch(`${API_URL}/projects`),
        fetch(`${API_URL}/tasks`),
        fetch(`${API_URL}/messages`)
      ]);

      if (!usersRes.ok) throw new Error("API responded with error");

      const usersData = await usersRes.json();
      const projectsData = await projectsRes.json();
      const tasksData = await tasksRes.json();
      const messagesData = await messagesRes.json();

      setUsers(usersData);
      setProjects(projectsData);
      setTasks(tasksData);
      setMessages(messagesData);
      setIsOffline(false);

      if (projectsData.length > 0 && !activeProject) {
        setActiveProject(projectsData[0]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsOffline(true);
      setConnectionError("Connected to server, but data fetch failed.");
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockData = () => {
    setUsers(MOCK_USERS);
    setProjects(MOCK_PROJECTS);
    setTasks(MOCK_TASKS);
    setMessages(MOCK_MESSAGES);
    if (MOCK_PROJECTS.length > 0 && !activeProject) {
      setActiveProject(MOCK_PROJECTS[0]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- CRUD ACTIONS ---

  const login = async (email: string) => {
    if (isOffline) {
      const user = users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('collabflow_user', JSON.stringify(user));
      } else {
        alert("User not found in demo data.");
      }
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        localStorage.setItem('collabflow_user', JSON.stringify(user));
        fetchData();
      } else {
        alert("Login failed: User not found");
      }
    } catch (e) {
      alert("Connection error during login");
    }
  };

  const register = async (name: string, email: string, role: UserRole) => {
    if (isOffline) {
      const newUser: User = {
        id: `u-${Date.now()}`,
        name,
        email,
        role,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
      };
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      localStorage.setItem('collabflow_user', JSON.stringify(newUser));
      return;
    }

    const res = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, role })
    });
    
    if (res.ok) {
      const newUser = await res.json();
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      localStorage.setItem('collabflow_user', JSON.stringify(newUser));
    } else {
      alert("Registration failed");
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('collabflow_user');
    localStorage.removeItem('collabflow_active_project');
  };

  const hasPermission = (action: 'create_project' | 'delete_project' | 'assign_task'): boolean => {
    if (!currentUser) return false;
    switch (action) {
      case 'create_project':
        return currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER;
      case 'delete_project':
        return currentUser.role === UserRole.ADMIN;
      case 'assign_task':
        return currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER;
      default:
        return false;
    }
  };

  const addTask = async (taskData: Omit<Task, 'id'>) => {
    if (isOffline) {
      const newTask: Task = { ...taskData, id: `task-${Date.now()}` };
      setTasks(prev => [...prev, newTask]);
      return newTask;
    }

    const res = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    const newTask = await res.json();
    setTasks(prev => [...prev, newTask]);
    return newTask;
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    
    if (!isOffline) {
      await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (!isOffline) {
      await fetch(`${API_URL}/tasks/${taskId}`, { method: 'DELETE' });
    }
  };

  const sendMessage = async (content: string) => {
    if (!currentUser || !activeProject) return;
    
    const msgData = {
      content,
      senderId: currentUser.id,
      teamId: activeProject.teamId
    };

    if (isOffline) {
      const newMsg: Message = { id: `msg-${Date.now()}`, ...msgData, timestamp: new Date() };
      setMessages(prev => [...prev, newMsg]);
      return;
    }

    const res = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msgData)
    });
    const savedMsg = await res.json();
    setMessages(prev => [...prev, savedMsg]);
  };

  const addProject = async (projectData: Omit<Project, 'id'>) => {
    if (isOffline) {
      const newProject: Project = { id: `proj-${Date.now()}`, ...projectData };
      setProjects(prev => [...prev, newProject]);
      setActiveProject(newProject);
      return;
    }

    const res = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });
    const newProject = await res.json();
    setProjects(prev => [...prev, newProject]);
    setActiveProject(newProject);
  };

  const deleteProject = async (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (activeProject?.id === projectId) {
       const remaining = projects.filter(p => p.id !== projectId);
       setActiveProject(remaining.length > 0 ? remaining[0] : null);
    }
    setTasks(prev => prev.filter(t => t.projectId !== projectId));
    
    if (!isOffline) {
      await fetch(`${API_URL}/projects/${projectId}`, { method: 'DELETE' });
    }
  };

  const executeAIAction = async (toolCall: any): Promise<string> => {
    const name = toolCall.name;
    const args = toolCall.args;

    if (name === 'createTask') {
      const newTask = await addTask({
        title: args.title,
        description: args.description || '',
        status: (args.status as TaskStatus) || TaskStatus.TODO,
        priority: args.priority || 'medium',
        projectId: activeProject?.id || projects[0]?.id
      });
      return `Created task ${newTask.title}`;
    }

    if (name === 'moveTask') {
      await updateTask(args.taskId, { status: args.status });
      return `Moved task ${args.taskId} to ${args.status}`;
    }

    if (name === 'assignTask') {
      if (!hasPermission('assign_task')) return "Permission denied.";
      const user = users.find(u => u.email === args.userEmail);
      if (user) {
        await updateTask(args.taskId, { assignedTo: user.id });
        return `Assigned to ${user.name}`;
      }
      return `User ${args.userEmail} not found`;
    }

    return 'Unknown action';
  };

  return (
    <DataContext.Provider value={{
      currentUser, users, projects, tasks, messages, activeProject,
      login, register, logout, setActiveProject, addTask, updateTask, deleteTask, 
      sendMessage, addProject, deleteProject, executeAIAction, hasPermission, 
      isLoading, isOffline, connectionError, apiUrl: API_URL
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};
