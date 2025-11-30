import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, DailyLog, ChatMessage, AgentPersona } from '../types';
import { agentService } from '../services/geminiService';

interface ChatInterfaceProps {
  userProfile: UserProfile;
  history: DailyLog[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ userProfile, history }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'model',
      content: `Hi ${userProfile.name}! I'm your LifeSync Concierge. I can help with nutrition, workouts, or finding motivation. What's on your mind?`,
      timestamp: Date.now(),
      agentName: 'Concierge'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await agentService.processRequest(input, history, userProfile);
      
      const agentMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response.text,
        timestamp: Date.now(),
        agentName: response.agent,
        groundingLinks: response.links
      };

      setMessages(prev => [...prev, agentMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "I'm having trouble connecting to my brain. Please check your internet connection.",
        timestamp: Date.now(),
        agentName: 'System'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const getAgentColor = (name?: string) => {
    switch(name as AgentPersona) {
      case AgentPersona.Nutritionist: return 'bg-green-100 text-green-800 border-green-200';
      case AgentPersona.Trainer: return 'bg-orange-100 text-orange-800 border-orange-200';
      case AgentPersona.WellnessCoach: return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // Helper to render special content like nutrition cards
  const renderMessageContent = (msg: ChatMessage) => {
    // Check if it's a Nutritionist message and has the specific block
    const hasNutritionBlock = msg.agentName === AgentPersona.Nutritionist && msg.content.includes('```nutrition');
    
    if (hasNutritionBlock) {
       const nutritionRegex = /```nutrition\s*([\s\S]*?)\s*```/;
       const match = msg.content.match(nutritionRegex);
       
       if (match) {
          try {
             const data = JSON.parse(match[1]);
             const cleanText = msg.content.replace(match[0], '').trim();
             
             return (
               <div className="space-y-3">
                 <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-green-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <span className="text-4xl">🍎</span>
                    </div>
                    <div className="relative z-10">
                        <h4 className="text-sm font-bold text-emerald-800 uppercase tracking-wide mb-2">{data.item || 'Nutritional Info'}</h4>
                        <div className="flex flex-wrap items-end gap-3">
                            <span className="text-3xl font-bold text-emerald-600">{data.calories}<span className="text-base font-medium text-emerald-500 ml-1">kcal</span></span>
                            {data.macros && (
                                <div className="text-xs font-medium text-emerald-700 bg-white/60 px-2 py-1 rounded-md border border-emerald-100">
                                   {data.macros}
                                </div>
                            )}
                        </div>
                    </div>
                 </div>
                 <div className="whitespace-pre-wrap leading-relaxed text-slate-700">{cleanText}</div>
               </div>
             );
          } catch (e) {
             // Fallback if JSON parse fails
             return <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>;
          }
       }
    }
    
    // Default render
    return <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>;
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div>
            <h3 className="font-semibold text-slate-800">Concierge Chat</h3>
            <p className="text-xs text-slate-500">Powered by Multi-Agent Gemini System</p>
        </div>
        <div className="flex space-x-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs text-slate-400">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none'
            }`}>
              {msg.role === 'model' && msg.agentName && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border mb-2 inline-block ${getAgentColor(msg.agentName)}`}>
                  {msg.agentName}
                </span>
              )}
              
              {/* Custom Message Rendering */}
              {renderMessageContent(msg)}
              
              {/* Grounding Links */}
              {msg.groundingLinks && msg.groundingLinks.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Recommended Resources:</p>
                  <ul className="space-y-2">
                    {msg.groundingLinks.map((link, idx) => (
                      <li key={idx} className="flex items-start">
                         <span className="text-indigo-500 mr-2">▶</span>
                         <a href={link.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline break-all block">
                           {link.title || link.url}
                         </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 flex items-center space-x-2">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-50 border-t border-slate-100">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about workouts, diet, or ask for a daily video..."
            className="flex-1 p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;