import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Task, TaskStatus, User } from '../types';
import { MoreHorizontal, Plus, Calendar, AlertCircle, Search, Filter, X, Trash2, CheckCircle2 } from 'lucide-react';

const StatusColors = {
  [TaskStatus.TODO]: 'bg-slate-100 border-slate-200',
  [TaskStatus.IN_PROGRESS]: 'bg-indigo-50 border-indigo-100',
  [TaskStatus.DONE]: 'bg-emerald-50 border-emerald-100'
};

const PriorityColors = {
  low: 'text-slate-600 bg-slate-100',
  medium: 'text-amber-700 bg-amber-100',
  high: 'text-red-700 bg-red-100'
};

export const KanbanBoard: React.FC = () => {
  const { tasks, activeProject, updateTask, deleteTask, users, hasPermission } = useData();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');

  // Modal State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Filter tasks for current project and apply search/filters
  const projectTasks = useMemo(() => {
    let filtered = tasks.filter(t => t.projectId === activeProject?.id);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q));
    }

    if (filterAssignee !== 'all') {
      filtered = filtered.filter(t => t.assignedTo === filterAssignee);
    }

    return filtered;
  }, [tasks, activeProject, searchQuery, filterAssignee]);

  const getTasksByStatus = (status: TaskStatus) => 
    projectTasks.filter(t => t.status === status);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (draggedTaskId) {
      updateTask(draggedTaskId, { status });
      setDraggedTaskId(null);
    }
  };

  const getUser = (id?: string) => users.find(u => u.id === id);

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTask) {
      updateTask(selectedTask.id, {
        title: selectedTask.title,
        description: selectedTask.description,
        priority: selectedTask.priority,
        status: selectedTask.status,
        assignedTo: selectedTask.assignedTo
      });
      setSelectedTask(null);
    }
  };

  const handleDeleteTask = () => {
    if (selectedTask && window.confirm("Delete this task?")) {
      deleteTask(selectedTask.id);
      setSelectedTask(null);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      {/* Header with Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{activeProject?.name}</h2>
          <p className="text-gray-500 text-sm max-w-md truncate">{activeProject?.description}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-full sm:w-48"
            />
          </div>
          
          <div className="relative hidden sm:block">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Members</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div className="flex -space-x-2 border-l border-gray-200 pl-3">
             {users.slice(0, 4).map(u => (
               <img key={u.id} src={u.avatar} className="w-8 h-8 rounded-full border-2 border-white" title={u.name} alt={u.name} />
             ))}
          </div>
        </div>
      </div>

      {/* Board Columns */}
      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {Object.values(TaskStatus).map((status) => (
          <div 
            key={status}
            className={`flex-1 min-w-[300px] flex flex-col rounded-xl border ${StatusColors[status]} transition-colors`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="p-4 flex items-center justify-between border-b border-gray-200/50">
              <h3 className="font-semibold text-gray-700 capitalize flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${status === 'done' ? 'bg-emerald-500' : status === 'in-progress' ? 'bg-indigo-500' : 'bg-slate-500'}`}></span>
                {status.replace('-', ' ')}
                <span className="ml-2 px-2 py-0.5 text-xs bg-white rounded-full text-gray-500 border border-gray-100 shadow-sm">
                  {getTasksByStatus(status).length}
                </span>
              </h3>
              <button className="text-gray-400 hover:text-gray-700 transition-colors">
                <Plus size={16} />
              </button>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
              {getTasksByStatus(status).map(task => {
                const assignee = getUser(task.assignedTo);
                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => setSelectedTask(task)}
                    className={`
                      bg-white p-4 rounded-lg border border-gray-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-indigo-400 hover:shadow-md group transition-all relative
                      ${draggedTaskId === task.id ? 'opacity-50' : 'opacity-100'}
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${PriorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal size={14} className="text-gray-400" />
                      </div>
                    </div>
                    
                    <h4 className="text-sm font-medium text-gray-800 mb-1 leading-snug">{task.title}</h4>
                    {task.description && <p className="text-xs text-gray-500 line-clamp-2 mb-3">{task.description}</p>}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {assignee ? (
                          <img src={assignee.avatar} alt={assignee.name} className="w-5 h-5 rounded-full" title={assignee.name} />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                            <span className="text-[8px] text-gray-500">?</span>
                          </div>
                        )}
                        <span>{assignee ? assignee.name.split(' ')[0] : 'Unassigned'}</span>
                      </div>
                      
                      {task.priority === 'high' && (
                        <AlertCircle size={14} className="text-red-500" />
                      )}
                    </div>
                  </div>
                );
              })}
              
              {/* Drop Zone Placeholder */}
              {draggedTaskId && (
                 <div className="h-24 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
                   Drop here
                 </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                Edit Task
              </h3>
              <button 
                onClick={() => setSelectedTask(null)}
                className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="taskForm" onSubmit={handleSaveTask} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Title</label>
                  <input
                    type="text"
                    value={selectedTask.title}
                    onChange={(e) => setSelectedTask({...selectedTask, title: e.target.value})}
                    className="w-full text-lg font-medium text-gray-900 border-b border-gray-200 focus:border-indigo-500 focus:outline-none py-1 bg-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
                    <select
                      value={selectedTask.status}
                      onChange={(e) => setSelectedTask({...selectedTask, status: e.target.value as TaskStatus})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      {Object.values(TaskStatus).map(s => (
                        <option key={s} value={s}>{s.replace('-', ' ').toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Priority</label>
                    <select
                      value={selectedTask.priority}
                      onChange={(e) => setSelectedTask({...selectedTask, priority: e.target.value as 'low'|'medium'|'high'})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Assignee</label>
                  <select
                    value={selectedTask.assignedTo || ''}
                    onChange={(e) => setSelectedTask({...selectedTask, assignedTo: e.target.value})}
                    disabled={!hasPermission('assign_task')}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="">Unassigned</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                  {!hasPermission('assign_task') && (
                    <p className="text-[10px] text-amber-600">Only Managers can reassign tasks</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
                  <textarea
                    value={selectedTask.description || ''}
                    onChange={(e) => setSelectedTask({...selectedTask, description: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 h-32 resize-none"
                    placeholder="Add more details about this task..."
                  />
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
               <button
                  type="button"
                  onClick={handleDeleteTask}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Trash2 size={16} /> Delete
                </button>
               <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="taskForm"
                  className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 size={16} /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};