import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { askGeminiEVAdvisor } from '../services/geminiService';
import {
  Sparkles,
  X,
  Send,
  Bot,
  Car,
  Zap,
  Clock,
  Compass,
  Lightbulb,
} from 'lucide-react';

export const AICopilotDrawer: React.FC = () => {
  const {
    isCopilotModalOpen,
    setIsCopilotModalOpen,
    vehicle,
    selectedStation,
    recommendedWindow,
  } = useApp();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ sender: 'user' | 'assistant'; text: string }[]>([
    {
      sender: 'assistant',
      text: `Hello! I'm ChargeEase AI. I've analyzed your ${vehicle.make} ${vehicle.model} (currently at ${vehicle.currentSoc}% SOC). Your optimal off-peak charging window is ${recommendedWindow?.windowLabel || '11:00 PM – 2:00 AM'}. How can I help optimize your battery and route today?`,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isCopilotModalOpen) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    const newMsgs = [...messages, { sender: 'user' as const, text: textToSend }];
    setMessages(newMsgs);
    setInput('');
    setIsLoading(true);

    const windowStr = recommendedWindow?.windowLabel || '11:00 PM – 2:00 AM';
    const answer = await askGeminiEVAdvisor(textToSend, vehicle, selectedStation, windowStr);

    setMessages([...newMsgs, { sender: 'assistant' as const, text: answer }]);
    setIsLoading(false);
  };

  const sampleQuestions = [
    `Can I reach Bengaluru Airport (42 km) on my current ${vehicle.currentSoc}% battery?`,
    `Why should I unplug at 80% on DC fast chargers?`,
    `How much will I save charging at night vs 6:00 PM peak?`,
    `What's the best charger type for ${vehicle.make} ${vehicle.model}?`,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg h-full bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">ChargeEase AI Copilot</h3>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.2 rounded-full">
                  Gemini Flash
                </span>
              </div>
              <p className="text-xs text-slate-400">Personal EV Range & Battery Strategist</p>
            </div>
          </div>

          <button
            onClick={() => setIsCopilotModalOpen(false)}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white font-medium rounded-tr-xs'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-xs whitespace-pre-line'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2.5 items-center text-xs text-purple-400 p-2">
              <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
              <span>Analyzing battery physics & tariff forecasts...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-2">
          <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-400" /> Suggested Prompts
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sampleQuestions.slice(0, 2).map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(q)}
                className="text-[11px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-xl text-left transition-colors truncate max-w-full"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-900 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask about ${vehicle.model} range, charging time, or costs...`}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-400"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
