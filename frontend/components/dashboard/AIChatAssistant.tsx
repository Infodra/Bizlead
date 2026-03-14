'use client';

import { useState } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';

export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ id: string; text: string; sender: 'user' | 'ai' }[]>([
    {
      id: '1',
      text: 'Hi! I\'m your AI assistant. Ask me anything about your leads, insights, or how to optimize your usage.',
      sender: 'ai',
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const suggestedPrompts = [
    'Which industry should I target this week?',
    'Why is my usage increasing?',
    'Suggest high-conversion leads',
    'How to optimize my search',
  ];

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const userMessage = {
        id: Date.now().toString(),
        text: inputValue,
        sender: 'user' as const,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue('');

      // Simulate AI response
      setTimeout(() => {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          text: 'I\'m analyzing your data. Based on your usage patterns, I recommend focusing on the tech sector. You\'ve had 40% higher conversion rates with software companies in the past month.',
          sender: 'ai' as const,
        };
        setMessages((prev) => [...prev, aiMessage]);
      }, 600);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInputValue(prompt);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/50 flex items-center justify-center text-white transition-all duration-300 hover:scale-110 z-40"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-96 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 border border-purple-500/50 shadow-2xl shadow-purple-500/20 flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-600/20 to-blue-600/20 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">AI Assistant</h3>
              <p className="text-xs text-slate-400">Always here to help</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
                      : 'bg-slate-800 text-slate-200 border border-purple-500/30'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}

            {/* Suggested Prompts */}
            {messages.length === 1 && (
              <div className="space-y-2 pt-4">
                <p className="text-xs text-slate-500 uppercase font-semibold">Quick prompts</p>
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedPrompt(prompt)}
                    className="w-full text-left text-xs p-3 rounded-lg bg-slate-800/50 hover:bg-blue-500/10 text-slate-300 hover:text-slate-200 border border-slate-700/50 hover:border-purple-500/30 transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-purple-500/20 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask me anything..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-purple-500/30 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleSendMessage}
                className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg text-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 text-center">Powered by AI Intelligence</p>
          </div>
        </div>
      )}
    </>
  );
}
