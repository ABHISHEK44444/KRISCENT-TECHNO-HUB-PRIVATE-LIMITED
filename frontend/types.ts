export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  MEMBER = 'MEMBER'
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  DONE = 'done'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: string[]; // User IDs
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  teamId: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  projectId: string;
  assignedTo?: string; // User ID
  priority: 'low' | 'medium' | 'high';
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  teamId: string;
  timestamp: Date;
}

export interface AIResponse {
  text: string;
  toolCalls?: any[];
}
