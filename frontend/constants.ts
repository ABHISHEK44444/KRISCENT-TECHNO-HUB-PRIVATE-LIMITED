import { Project, Task, TaskStatus, Team, User, UserRole, Message } from './types';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alice Admin', email: 'alice@collab.com', role: UserRole.ADMIN, avatar: 'https://picsum.photos/seed/alice/200' },
  { id: 'u2', name: 'Bob Manager', email: 'bob@collab.com', role: UserRole.MANAGER, avatar: 'https://picsum.photos/seed/bob/200' },
  { id: 'u3', name: 'Charlie Dev', email: 'charlie@collab.com', role: UserRole.MEMBER, avatar: 'https://picsum.photos/seed/charlie/200' },
  { id: 'u4', name: 'Diana Designer', email: 'diana@collab.com', role: UserRole.MEMBER, avatar: 'https://picsum.photos/seed/diana/200' },
];

export const MOCK_TEAMS: Team[] = [
  { id: 't1', name: 'Product Alpha', description: 'Core product development team', members: ['u1', 'u2', 'u3', 'u4'] }
];

export const MOCK_PROJECTS: Project[] = [
  { id: 'p1', name: 'Q3 Feature Launch', description: 'Main features for Q3 release', teamId: 't1' },
  { id: 'p2', name: 'Infrastructure Migration', description: 'Moving to cloud native', teamId: 't1' }
];

export const MOCK_TASKS: Task[] = [
  { id: 'tsk1', title: 'Setup Repo', description: 'Initial commit and linting config', status: TaskStatus.DONE, projectId: 'p1', assignedTo: 'u3', priority: 'high' },
  { id: 'tsk2', title: 'Design System', description: 'Create Figma tokens', status: TaskStatus.IN_PROGRESS, projectId: 'p1', assignedTo: 'u4', priority: 'medium' },
  { id: 'tsk3', title: 'API Integration', description: 'Connect to Gemini API', status: TaskStatus.TODO, projectId: 'p1', assignedTo: 'u3', priority: 'high' },
];

export const MOCK_MESSAGES: Message[] = [
  { id: 'm1', content: 'Hey team, welcome to the new board!', senderId: 'u1', teamId: 't1', timestamp: new Date(Date.now() - 86400000) },
  { id: 'm2', content: 'Looks great! I will start on the design tokens.', senderId: 'u4', teamId: 't1', timestamp: new Date(Date.now() - 82000000) },
];
