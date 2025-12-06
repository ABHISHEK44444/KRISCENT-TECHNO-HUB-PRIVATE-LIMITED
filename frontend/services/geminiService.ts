import { GoogleGenAI, FunctionDeclaration, Type, Tool } from "@google/genai";
import { Task, TaskStatus } from "../types";

// We define the tools schema for the AI to understand how to manipulate tasks
const createTaskTool: FunctionDeclaration = {
  name: 'createTask',
  description: 'Create a new task in the project.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Title of the task' },
      description: { type: Type.STRING, description: 'Description of the task' },
      priority: { type: Type.STRING, description: 'Priority: low, medium, or high' },
      status: { type: Type.STRING, description: 'Status: todo, in-progress, or done' }
    },
    required: ['title']
  }
};

const moveTaskTool: FunctionDeclaration = {
  name: 'moveTask',
  description: 'Move a task to a different status column.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      taskId: { type: Type.STRING, description: 'The exact ID of the task to move' },
      status: { type: Type.STRING, description: 'The new status: todo, in-progress, or done' }
    },
    required: ['taskId', 'status']
  }
};

const assignTaskTool: FunctionDeclaration = {
  name: 'assignTask',
  description: 'Assign a task to a user.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      taskId: { type: Type.STRING, description: 'The exact ID of the task' },
      userEmail: { type: Type.STRING, description: 'The email of the user to assign' }
    },
    required: ['taskId', 'userEmail']
  }
};

const tools: Tool[] = [{
  functionDeclarations: [createTaskTool, moveTaskTool, assignTaskTool]
}];

export class GeminiService {
  private ai: GoogleGenAI;
  private model: any;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    this.model = 'gemini-2.5-flash';
  }

  async processCommand(
    userInput: string, 
    currentContext: { tasks: Task[], users: any[] }
  ) {
    // We provide context about the current state so the AI knows what IDs exist
    const contextPrompt = `
      Current Project Context:
      Existing Tasks: ${JSON.stringify(currentContext.tasks.map(t => ({ id: t.id, title: t.title, status: t.status, assignee: t.assignedTo })))}
      Team Members: ${JSON.stringify(currentContext.users.map(u => ({ id: u.id, name: u.name, email: u.email })))}
      
      User Request: ${userInput}
      
      If the user asks to move a task by name, look up the ID from the Existing Tasks list provided above.
      If the user asks to assign to a name, look up the email.
    `;

    try {
      const result = await this.ai.models.generateContent({
        model: this.model,
        contents: contextPrompt,
        config: {
          tools: tools,
          systemInstruction: "You are a helpful project manager assistant. You help manage the Kanban board. When you take an action, reply with a short confirmation message."
        }
      });

      return result;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
