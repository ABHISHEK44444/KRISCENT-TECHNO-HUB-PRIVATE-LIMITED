import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Send, User as UserIcon } from 'lucide-react';

export const ChatPanel: React.FC = () => {
  const { messages, currentUser, sendMessage, activeProject, users } = useData();
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter messages for current team (simplified: project's team)
  const teamMessages = messages.filter(m => m.teamId === activeProject?.teamId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [teamMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  const getUser = (id: string) => users.find(u => u.id === id);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
           Team Chat <span className="text-gray-400 font-normal text-sm">#{activeProject?.name}</span>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {teamMessages.map((msg, idx) => {
          const isMe = msg.senderId === currentUser?.id;
          const sender = getUser(msg.senderId);
          const showHeader = idx === 0 || teamMessages[idx - 1].senderId !== msg.senderId;

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] sm:max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                {showHeader && !isMe && (
                   <img src={sender?.avatar} className="w-8 h-8 rounded-full self-start mt-1" alt={sender?.name}/>
                )}
                {!showHeader && !isMe && <div className="w-8" />} {/* Spacer */}

                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {showHeader && (
                    <span className="text-xs text-gray-500 mb-1 ml-1">
                      {isMe ? 'You' : sender?.name}
                    </span>
                  )}
                  <div className={`
                    px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${isMe 
                      ? 'bg-indigo-600 text-white rounded-tr-sm' 
                      : 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm'}
                  `}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200 flex gap-2 pb-safe sm:pb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 sm:py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent placeholder-gray-400 focus:bg-white transition-colors"
        />
        <button 
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 sm:p-2 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          disabled={!inputValue.trim()}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};
