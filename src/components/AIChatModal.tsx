import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Sparkles, Bot, User, Flame, Apple, Dumbbell, ArrowLeft } from 'lucide-react';
import { DailyGoals, LoggedMeal, UserProfile } from '../types/nutrition';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: DailyGoals;
  meals: LoggedMeal[];
  userProfile: UserProfile;
  isDayMode?: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  suggestions?: string[];
}

export const AIChatModal: React.FC<AIChatModalProps> = ({
  isOpen,
  onClose,
  goals,
  meals,
  userProfile,
  isDayMode = false,
}) => {
  const consumedCalories = meals.reduce((sum, m) => sum + m.totalCalories, 0);
  const consumedProtein = meals.reduce((sum, m) => sum + m.totalProtein, 0);
  const remainingCalories = Math.max(0, goals.calories - consumedCalories);
  const remainingProtein = Math.max(0, goals.protein - Math.round(consumedProtein));

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: `Hello ${userProfile.name.split(' ')[0]}! I'm your Blessikaa AI Nutritionist. Today you have ${remainingCalories} kcal left and need ${remainingProtein}g more protein to hit your target. How can I assist your nutrition today?`,
      timestamp: 'Just now',
      suggestions: [
        'Suggest a high-protein dinner under 500 kcal',
        'How can I hit my protein goal today?',
        'Am I on track for my weight goal?',
      ],
    },
  ]);

  if (!isOpen) return null;

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Generate smart contextual AI response
    setTimeout(() => {
      let aiReply = '';
      const lower = text.toLowerCase();

      if (lower.includes('dinner') || lower.includes('recipe') || lower.includes('500')) {
        aiReply = `Here is a meal that fits your remaining ${remainingCalories} kcal budget: **Herb-Crusted Grilled Salmon (160g) with Steamed Asparagus and Quinoa**. This provides **420 kcal, 41g Protein, 26g Carbs, and 14g Healthy Fats**. Would you like to log this directly to Dinner?`;
      } else if (lower.includes('protein') || lower.includes('hit')) {
        aiReply = `To hit your remaining ${remainingProtein}g of protein without excess calories, I recommend: 1 scoop of Whey Isolate (25g P / 120 kcal) or 200g of Greek Non-Fat Yogurt (20g P / 110 kcal) or 150g Grilled Chicken Breast (45g P / 240 kcal).`;
      } else if (lower.includes('weight') || lower.includes('goal') || lower.includes('cut')) {
        aiReply = `Based on your profile target of ${userProfile.targetWeightKg} kg, staying within your daily budget of ${goals.calories} kcal creates a healthy 400 kcal deficit, yielding approximately 0.45 kg of fat loss per week while preserving lean muscle mass.`;
      } else {
        aiReply = `Great question! Looking at your current day (${consumedCalories} / ${goals.calories} kcal logged), your macronutrient balance is looking steady. Keep hydrating—remember to aim for ${goals.waterMl} ml daily!`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: ['Log grilled salmon to dinner', 'Check my hydration', 'Summarize today'],
      };

      setMessages((prev) => [...prev, aiMsg]);
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className={`w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[600px] max-h-[90vh] border ${
            isDayMode
              ? 'bg-[#f7f8f6] border-[#e5e8e3] text-[#1a231b]'
              : 'bg-[#121714] border-[#222d25] text-[#f1f5f2]'
          }`}
        >
          {/* Header */}
          <div
            className={`px-4 py-3.5 border-b flex items-center justify-between ${
              isDayMode ? 'bg-white border-[#e5e8e3]' : 'bg-[#17201a] border-[#222d25]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isDayMode
                    ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div className="w-9 h-9 rounded-2xl bg-[#5dba7d] text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base flex items-center gap-1.5">
                  Blessikaa AI Chat
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500">
                    Active
                  </span>
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className={`p-2 rounded-full transition cursor-pointer ${
                isDayMode ? 'hover:bg-neutral-100 text-neutral-600' : 'hover:bg-neutral-800 text-neutral-400'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#5dba7d] text-white rounded-br-none'
                      : isDayMode
                      ? 'bg-white border border-[#e5e8e3] text-neutral-800 rounded-bl-none'
                      : 'bg-[#1a221c] border border-[#26352a] text-neutral-100 rounded-bl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-1 text-right ${
                      msg.sender === 'user'
                        ? 'text-white/80'
                        : isDayMode
                        ? 'text-neutral-400'
                        : 'text-neutral-500'
                    }`}
                  >
                    {msg.timestamp}
                  </span>

                  {msg.suggestions && (
                    <div className="mt-3 pt-2 border-t border-neutral-200/40 dark:border-neutral-700/40 space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Suggested Inquiries:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestions.map((s, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(s)}
                            className={`text-xs px-2.5 py-1 rounded-xl transition text-left cursor-pointer ${
                              isDayMode
                                ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                                : 'bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-neutral-700 text-white flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input Bar */}
          <div
            className={`p-3 border-t flex items-center gap-2 ${
              isDayMode ? 'bg-white border-[#e5e8e3]' : 'bg-[#17201a] border-[#222d25]'
            }`}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask Blessikaa AI about your calories, protein, or recipes..."
              className={`flex-1 px-4 py-2.5 rounded-2xl text-xs sm:text-sm outline-none transition ${
                isDayMode
                  ? 'bg-neutral-100 text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-emerald-500/30'
                  : 'bg-neutral-900 text-white placeholder:text-neutral-500 focus:ring-2 focus:ring-emerald-500/30'
              }`}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim()}
              className="p-2.5 rounded-2xl bg-[#5dba7d] hover:bg-[#50a76f] disabled:opacity-40 text-white transition cursor-pointer shadow-md shadow-emerald-600/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
