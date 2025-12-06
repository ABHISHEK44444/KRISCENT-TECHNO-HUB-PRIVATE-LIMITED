import React, { ReactNode, useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Plus, 
  Menu,
  X,
  Trash2,
  FolderPlus
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  activeView: 'dashboard' | 'chat' | 'settings';
  onViewChange: (view: 'dashboard' | 'chat' | 'settings') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange }) => {
  const { currentUser, logout, projects, activeProject, setActiveProject, hasPermission, addProject, deleteProject } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Project Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      addProject({
        name: newProjectName,
        description: newProjectDesc,
        teamId: 't1' // Defaulting to the main team for this demo
      });
      setIsProjectModalOpen(false);
      setNewProjectName('');
      setNewProjectDesc('');
      onViewChange('dashboard'); // Switch to board view
    }
  };

  const handleDeleteProject = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this project? All tasks will be removed.")) {
      deleteProject(projectId);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              CollabFlow
            </h1>
            <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <div className="mb-6">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menu</p>
              <button
                onClick={() => onViewChange('dashboard')}
                className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors ${activeView === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
              >
                <LayoutDashboard size={18} className="mr-3" />
                Board
              </button>
              <button
                onClick={() => onViewChange('chat')}
                className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors ${activeView === 'chat' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
              >
                <MessageSquare size={18} className="mr-3" />
                Team Chat
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between px-3 mb-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Projects</p>
                {hasPermission('create_project') && (
                  <button 
                    onClick={() => setIsProjectModalOpen(true)}
                    className="text-gray-400 hover:text-indigo-600 transition-colors" 
                    title="Create Project"
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {projects.map(project => (
                  <div key={project.id} className="group relative flex items-center">
                    <button
                      onClick={() => setActiveProject(project)}
                      className={`flex-1 flex items-center w-full px-3 py-2 rounded-lg text-sm transition-colors ${activeProject?.id === project.id ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                      <span className={`w-2 h-2 rounded-full mr-3 ${activeProject?.id === project.id ? 'bg-indigo-500' : 'bg-gray-400'}`}></span>
                      <span className="truncate max-w-[140px] text-left">{project.name}</span>
                    </button>
                    {hasPermission('delete_project') && (
                      <button
                        onClick={(e) => handleDeleteProject(e, project.id)}
                        className="absolute right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                        title="Delete Project"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img src={currentUser?.avatar} alt={currentUser?.name} className="w-8 h-8 rounded-full bg-gray-200 object-cover" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{currentUser?.role.toLowerCase()}</p>
                </div>
              </div>
              <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col h-full bg-gray-50 relative">
        <header className="md:hidden h-16 border-b border-gray-200 flex items-center justify-between px-4 bg-white">
          <span className="font-bold text-indigo-600">CollabFlow</span>
          <button onClick={() => setMobileMenuOpen(true)} className="text-gray-500">
            <Menu size={24} />
          </button>
        </header>
        <div className="flex-1 overflow-hidden relative">
          {children}
        </div>
      </main>

      {/* Create Project Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FolderPlus size={18} className="text-indigo-600" />
                New Project
              </h3>
              <button 
                onClick={() => setIsProjectModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Project Name</label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                  placeholder="e.g. Q4 Marketing Campaign"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description (Optional)</label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors h-24 resize-none"
                  placeholder="What is this project about?"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};