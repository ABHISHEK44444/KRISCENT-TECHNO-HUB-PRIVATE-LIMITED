import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { useData } from '../context/DataContext';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hi! I can help you manage your tasks. Try saying "Add a bug fix task" or "Move the API task to done".' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { tasks, users, executeAIAction } = useData();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await geminiService.processCommand(userMsg, { tasks, users });
      const candidates = response.candidates;
      
      if (!candidates || candidates.length === 0) {
          throw new Error("No response from AI");
      }

      const candidate = candidates[0];
      let responseText = "";

      // Handle function calls if present
      const parts = candidate.content.parts;
      for (const part of parts) {
          if (part.functionCall) {
              const toolResult = await executeAIAction(part.functionCall);
              // In a real app, we'd send this result back to the model for a final summary.
              // For this demo, we'll append the system action confirmation.
              responseText += `[Action Performed] ${toolResult}\n`;
          }
          if (part.text) {
              responseText += part.text;
          }
      }
      
      if (!responseText) responseText = "Task updated successfully.";

      setMessages(prev => [...prev, { role: 'model', text: responseText }]);

    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error processing your request.' }]);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button - Moved up to bottom-24 to avoid covering Chat Input */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-6 sm:bottom-10 sm:right-10 p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-500/30 transition-all z-40 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <Sparkles size={24} />
      </button>

      {/* Chat Interface */}
      <div 
        className={`fixed z-50 bg-white sm:border sm:border-gray-200 sm:rounded-2xl shadow-2xl flex flex-col transition-all duration-300 origin-bottom-right
          ${isOpen 
            ? 'inset-0 sm:inset-auto sm:bottom-24 sm:right-10 scale-100 opacity-100' 
            : 'bottom-24 right-6 scale-90 opacity-0 pointer-events-none'
          }
          sm:w-96
        `}
        style={{ height: isOpen ? (window.innerWidth >= 640 ? '500px' : '100%') : '0px' }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 rounded-t-none sm:rounded-t-2xl backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-100 p-1.5 rounded-lg">
               <Bot size={18} className="text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Gemini Assistant</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white" ref={scrollRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] px-3 py-2 rounded-xl text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 flex items-center gap-2">
                 <Loader2 size={14} className="animate-spin text-indigo-600" />
                 <span className="text-xs text-gray-500">Thinking...</span>
               </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-none sm:rounded-b-2xl flex gap-2 shrink-0 pb-safe sm:pb-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI to manage tasks..."
            className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 transition-colors placeholder-gray-400"
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </>
  );
};
