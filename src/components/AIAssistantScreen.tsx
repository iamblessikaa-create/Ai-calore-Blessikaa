import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Trash2,
  Mic,
  MicOff,
  Send,
  Utensils,
  Home,
  BarChart2,
  Plus,
  Settings,
  MessageSquare,
  Bot,
  RefreshCw,
} from 'lucide-react';
import { DailyGoals, LoggedMeal, UserProfile } from '../types/nutrition';

interface AIAssistantScreenProps {
  userProfile: UserProfile;
  goals: DailyGoals;
  meals: LoggedMeal[];
  isDayMode?: boolean;
  onNavigateHome: () => void;
  onOpenAnalytics: () => void;
  onOpenQuickLog: () => void;
  onOpenSettings: () => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  title: string;
  date: string;
  preview: string;
  messages: Message[];
}

export const AIAssistantScreen: React.FC<AIAssistantScreenProps> = ({
  userProfile,
  goals,
  meals,
  isDayMode = false,
  onNavigateHome,
  onOpenAnalytics,
  onOpenQuickLog,
  onOpenSettings,
}) => {
  const [viewState, setViewState] = useState<'list' | 'conversation'>('list');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Daily consumed values
  const consumedCalories = meals.reduce((sum, m) => sum + m.totalCalories, 0);
  const consumedProtein = meals.reduce((sum, m) => sum + m.totalProtein, 0);
  const consumedCarbs = meals.reduce((sum, m) => sum + m.totalCarbs, 0);
  const consumedFat = meals.reduce((sum, m) => sum + m.totalFat, 0);

  // Conversation history
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'conv-1',
      title: 'Sep 9',
      date: 'Sep 9',
      preview: 'Meal plan & protein target recommendations',
      messages: [
        {
          id: 'msg-init',
          sender: 'ai',
          text: "Hi 👋\nI'm your AI Nutritional Coach.\nFeel free to ask any nutrition questions!",
          timestamp: '12:34 PM',
        },
      ],
    },
  ]);

  const [activeConversationId, setActiveConversationId] = useState<string>('conv-1');

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (viewState === 'conversation') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation?.messages, isTyping, viewState]);

  // Suggested prompt pills exactly matching screenshot
  const promptSuggestions = [
    {
      title: 'Meal Plan',
      prompt: 'Give me a 3-day Keto Meal Plan for 2300 kcal.',
    },
    {
      title: 'High Protein',
      prompt: 'Suggest 3 snacks under 200 kcal with 20g+ protein.',
    },
    {
      title: 'Hydration Advice',
      prompt: 'How much water should I drink for my current weight?',
    },
    {
      title: 'Calorie Deficit',
      prompt: `Is my ${goals.calories} kcal budget optimal for fat loss from ${userProfile.weightKg}kg to ${userProfile.targetWeightKg}kg?`,
    },
    {
      title: 'Macro Balance',
      prompt: 'Evaluate my carb and fat ratio for today based on my goals.',
    },
  ];

  // Start new conversation
  const handleStartNewConversation = () => {
    const todayStr = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(
      new Date()
    );
    const newId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      title: todayStr,
      date: todayStr,
      preview: 'New nutrition conversation',
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'ai',
          text: "Hi 👋\nI'm your AI Nutritional Coach.\nFeel free to ask any nutrition questions!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    setViewState('conversation');
  };

  // Delete current conversation
  const handleDeleteConversation = () => {
    if (conversations.length <= 1) {
      // Clear messages of current conversation
      const resetConv: Conversation = {
        ...activeConversation,
        messages: [
          {
            id: `msg-${Date.now()}`,
            sender: 'ai',
            text: "Hi 👋\nI'm your AI Nutritional Coach.\nFeel free to ask any nutrition questions!",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      };
      setConversations([resetConv]);
      return;
    }

    setConversations((prev) => prev.filter((c) => c.id !== activeConversationId));
    setViewState('list');
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update conversation immediately with user message
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? {
              ...c,
              preview: text.length > 35 ? text.slice(0, 35) + '...' : text,
              messages: [...c.messages, userMessage],
            }
          : c
      )
    );

    setInput('');
    setIsTyping(true);

    try {
      // Call server-side AI chat endpoint
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...activeConversation.messages, userMessage],
          userProfile,
          goals,
          consumed: {
            calories: consumedCalories,
            protein: consumedProtein,
            carbs: consumedCarbs,
            fat: consumedFat,
          },
        }),
      });

      const resData = await response.json();
      let replyText = '';

      if (resData.success && resData.reply) {
        replyText = resData.reply;
      } else {
        // Smart fallback nutrition advisor logic
        const lower = text.toLowerCase();
        if (lower.includes('keto') || lower.includes('meal plan')) {
          replyText = `Here is your customized **3-day Keto Meal Plan (2300 kcal, <30g net carbs)**:\n\n**Day 1**:\n• Breakfast: 3 Scrambled Eggs with Avocado & Spinach (480 kcal, 24g P, 40g F)\n• Lunch: Grilled Ribeye with Garlic Herb Butter & Asparagus (720 kcal, 54g P, 52g F)\n• Snack: Macadamia Nuts (40g) + String Cheese (340 kcal, 9g P, 32g F)\n• Dinner: Baked Salmon Fillet with Cauliflower Mash & Olive Oil (760 kcal, 50g P, 58g F)\n\n**Day 2**:\n• Breakfast: Keto Omelette with Cheddar & Bacon (520 kcal, 32g P, 42g F)\n• Lunch: Chicken Thigh Salad with Olive Oil & Walnuts (680 kcal, 46g P, 50g F)\n• Dinner: Grass-fed Ground Beef Burger Patties with Guacamole (800 kcal, 55g P, 60g F)\n• Snack: 2 Hard Boiled Eggs with Sea Salt (160 kcal, 14g P, 11g F)\n\n**Day 3**:\n• Breakfast: Chia Seed Pudding with Unsweetened Almond Milk & MCT Oil (420 kcal, 12g P, 38g F)\n• Lunch: Tuna Salad Boats in Romaine Lettuce (610 kcal, 48g P, 44g F)\n• Dinner: Herb Roasted Pork Tenderloin with Sautéed Zucchini & Butter (790 kcal, 58g P, 56g F)\n• Snack: Celery sticks with Almond Butter (310 kcal, 8g P, 28g F)\n\n*Total Macros Average*: ~2,250 - 2,300 kcal | 150g Protein (26%) | 185g Healthy Fats (70%) | <25g Net Carbs (4%).`;
        } else if (lower.includes('protein') || lower.includes('snack')) {
          replyText = `Top high-protein snacks under 200 kcal with 20g+ protein:\n\n1. **Non-Fat Greek Yogurt (170g)**: 100 kcal, 18-20g Protein, 6g Carbs, 0g Fat.\n2. **Whey Protein Isolate Shake (1 scoop in water)**: 120 kcal, 25g Protein, 1g Carbs, 0.5g Fat.\n3. **Cottage Cheese 1% (150g)**: 110 kcal, 21g Protein, 5g Carbs, 1.5g Fat.\n4. **Sliced Roasted Turkey Breast (100g)**: 115 kcal, 24g Protein, 1g Carbs, 1g Fat.`;
        } else if (lower.includes('water') || lower.includes('hydration')) {
          const recommendedMl = Math.round(userProfile.weightKg * 35);
          replyText = `Based on your weight of ${userProfile.weightKg} kg, your optimal baseline hydration is approximately **${recommendedMl} ml** (~${(recommendedMl / 1000).toFixed(1)} liters) per day.\n\nDrink an extra 500 ml for every 45 minutes of vigorous exercise to stay properly hydrated and preserve athletic endurance.`;
        } else if (lower.includes('deficit') || lower.includes('budget') || lower.includes('fat loss')) {
          replyText = `Your daily calorie target of **${goals.calories} kcal** is well-structured. Aiming for a sustainable weekly deficit of 350-500 kcal per day typically yields ~0.45 kg of fat loss weekly, preserving lean muscle mass while moving towards your target of ${userProfile.targetWeightKg} kg.`;
        } else {
          replyText = `Thank you for asking! For your daily goal of ${goals.calories} kcal with ${goals.protein}g protein, focus on lean protein sources, fibrous green vegetables, and staying hydrated. Let me know if you'd like specific recipe suggestions or meal logging tips!`;
        }
      }

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? {
                ...c,
                messages: [...c.messages, aiMessage],
              }
            : c
        )
      );
    } catch {
      const fallbackMsg: Message = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: `You have ${goals.calories - consumedCalories} kcal left today. Aim to reach your ${goals.protein}g protein target for optimal metabolic balance!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? {
                ...c,
                messages: [...c.messages, fallbackMsg],
              }
            : c
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  // Web Speech Recognition for the microphone button
  const handleToggleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in this browser. Please type your message.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          handleSendMessage(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  return (
    <div
      className={`w-full min-h-[780px] flex flex-col transition-colors duration-300 ${
        isDayMode ? 'text-neutral-900' : 'text-neutral-100'
      }`}
    >
      {/* VIEW 1: AI Assistant Root Screen (Exact Ditto to Screenshot 1) */}
      {viewState === 'list' ? (
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Display Typography Header: "AI Assistant" */}
            <h1
              className={`font-display-serif text-3xl sm:text-4xl font-bold tracking-tight mb-5 ${
                isDayMode ? 'text-[#19221a]' : 'text-[#f2f6f3]'
              }`}
            >
              AI Assistant
            </h1>

            {/* "Start a new conversation" Green Card Button (Exact Ditto) */}
            <button
              onClick={handleStartNewConversation}
              className="w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-[#5dba7d] hover:bg-[#52a66e] active:scale-[0.99] text-white shadow-sm transition cursor-pointer font-medium text-sm sm:text-base group"
            >
              <span className="font-semibold tracking-wide">Start a new conversation</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform stroke-[2.4]" />
            </button>

            {/* Past Conversations List if any exist */}
            {conversations.length > 0 && (
              <div className="mt-6 space-y-2.5">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-1">
                  Recent Conversations
                </p>
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setActiveConversationId(conv.id);
                      setViewState('conversation');
                    }}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                      isDayMode
                        ? 'bg-white border-neutral-100 hover:border-emerald-200 hover:shadow-xs'
                        : 'bg-[#18211b] border-[#253328] hover:border-emerald-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-9 h-9 rounded-full bg-[#2a362d] text-white flex items-center justify-center shrink-0">
                        <Utensils className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold truncate">{conv.title}</h4>
                        <p className="text-xs text-neutral-400 truncate mt-0.5">{conv.preview}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 text-neutral-400">
                      <span className="text-xs">{conv.date}</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Spacing before bottom navigation */}
          <div className="h-20" />

          {/* Bottom Navigation Bar (Matching Screenshot with Ai Chat active) */}
          <nav
            className={`fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-md px-4 py-2 transition-colors duration-300 ${
              isDayMode
                ? 'bg-white/95 border-neutral-200 text-neutral-600'
                : 'bg-[#131914]/95 border-[#232f25] text-neutral-400'
            }`}
          >
            <div className="max-w-md mx-auto flex items-center justify-between relative">
              {/* Tab 1: Home */}
              <button
                type="button"
                onClick={onNavigateHome}
                className="flex flex-col items-center flex-1 py-1 cursor-pointer hover:text-neutral-900 dark:hover:text-white transition"
              >
                <Home className="w-5 h-5 stroke-[1.8]" />
                <span className="text-[10px] mt-0.5 font-medium">Home</span>
              </button>

              {/* Tab 2: Progress */}
              <button
                type="button"
                onClick={onOpenAnalytics}
                className="flex flex-col items-center flex-1 py-1 cursor-pointer hover:text-neutral-900 dark:hover:text-white transition"
              >
                <BarChart2 className="w-5 h-5 stroke-[1.8]" />
                <span className="text-[10px] mt-0.5 font-medium">Progress</span>
              </button>

              {/* Tab 3: Elevated Center Green FAB (+) */}
              <div className="flex-1 flex justify-center -mt-7 relative z-50">
                <button
                  type="button"
                  onClick={onOpenQuickLog}
                  title="Log Meal with AI"
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#5dba7d] hover:bg-[#50a76e] active:scale-95 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 transition ring-4 cursor-pointer ${
                    isDayMode ? 'ring-[#f6f7f5]' : 'ring-[#0d110e]'
                  }`}
                >
                  <Plus className="w-7 h-7 stroke-[3]" />
                </button>
              </div>

              {/* Tab 4: Ai Chat (ACTIVE) */}
              <button
                type="button"
                className={`flex flex-col items-center flex-1 py-1 cursor-pointer transition ${
                  isDayMode ? 'text-neutral-900 font-semibold' : 'text-emerald-400 font-semibold'
                }`}
              >
                <Sparkles className="w-5 h-5 stroke-[2.4]" />
                <span className="text-[10px] mt-0.5 font-bold">Ai Chat</span>
              </button>

              {/* Tab 5: Settings */}
              <button
                type="button"
                onClick={onOpenSettings}
                className="flex flex-col items-center flex-1 py-1 cursor-pointer hover:text-neutral-900 dark:hover:text-white transition"
              >
                <Settings className="w-5 h-5 stroke-[1.8]" />
                <span className="text-[10px] mt-0.5 font-medium">Settings</span>
              </button>
            </div>
          </nav>
        </div>
      ) : (
        /* VIEW 2: Active Chat Conversation (Exact Ditto to Screenshot 2) */
        <div className="flex-1 flex flex-col h-full -mx-4 -mt-4 sm:-mx-5 sm:-mt-5">
          {/* Top Bar matching screenshot */}
          <div
            className={`px-4 py-3 flex items-center justify-between border-b ${
              isDayMode ? 'bg-white border-neutral-200/80' : 'bg-[#151c17] border-[#253227]'
            }`}
          >
            {/* Left Circular Back Button */}
            <button
              onClick={() => setViewState('list')}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer ${
                isDayMode
                  ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                  : 'bg-[#222d25] hover:bg-[#2b392f] text-neutral-200'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Center Title: Date of conversation (e.g. Sep 9) */}
            <h2 className="font-bold text-base tracking-tight">{activeConversation.title}</h2>

            {/* Right Circular Delete / Clear Button */}
            <button
              onClick={handleDeleteConversation}
              title="Delete or clear this conversation"
              className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer ${
                isDayMode
                  ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                  : 'bg-[#222d25] hover:bg-[#2b392f] text-neutral-200'
              }`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Message Scrollable Viewport */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {/* Centered Date Pill/Divider: "Today" */}
            <div className="flex items-center my-3">
              <div
                className={`flex-1 h-px ${
                  isDayMode ? 'bg-neutral-200' : 'bg-neutral-800'
                }`}
              />
              <span className="px-3 text-xs text-neutral-400 font-medium">Today</span>
              <div
                className={`flex-1 h-px ${
                  isDayMode ? 'bg-neutral-200' : 'bg-neutral-800'
                }`}
              />
            </div>

            {/* Messages Thread */}
            {activeConversation.messages.map((msg) => {
              const isAi = msg.sender === 'ai';

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {/* Left Cutlery Avatar for AI */}
                  {isAi && (
                    <div className="w-9 h-9 rounded-full bg-[#2a362d] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <Utensils className="w-4 h-4 stroke-[2]" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[82%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isAi
                        ? isDayMode
                          ? 'bg-white border border-neutral-100 text-neutral-800 shadow-xs'
                          : 'bg-[#1b241e] border border-[#263529] text-neutral-100'
                        : isDayMode
                        ? 'bg-[#263328] text-white'
                        : 'bg-[#5dba7d] text-white'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>
                    <span
                      className={`block text-[10px] mt-1 text-right ${
                        isAi ? 'text-neutral-400' : 'text-white/70'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* AI Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#2a362d] text-white flex items-center justify-center shrink-0">
                  <Utensils className="w-4 h-4 stroke-[2]" />
                </div>
                <div
                  className={`rounded-2xl px-4 py-3 flex items-center gap-1.5 ${
                    isDayMode ? 'bg-white border border-neutral-100' : 'bg-[#1b241e]'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Above Input: Horizontal Scrollable Suggestion Carousel (Exact Ditto to Screenshot 2) */}
          <div className="px-4 pt-2 pb-1">
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
              {promptSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.prompt)}
                  className={`shrink-0 w-64 text-left p-3 rounded-2xl border transition-all active:scale-[0.98] cursor-pointer ${
                    isDayMode
                      ? 'bg-white border-neutral-200 hover:border-emerald-300 shadow-xs'
                      : 'bg-[#18211b] border-[#27372b] hover:border-emerald-500/40 text-neutral-100'
                  }`}
                >
                  <h5 className="font-bold text-xs tracking-tight">{item.title}</h5>
                  <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2 leading-tight">
                    {item.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Input Field matching screenshot */}
          <div
            className={`p-3 sm:p-4 border-t ${
              isDayMode ? 'bg-white border-neutral-200/80' : 'bg-[#121713] border-[#222d25]'
            }`}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* Soft Pill Input */}
              <div
                className={`flex-1 flex items-center px-4 py-2.5 rounded-full border transition ${
                  isDayMode
                    ? 'bg-[#f1f3f0] border-transparent focus-within:border-[#5dba7d] focus-within:bg-white'
                    : 'bg-[#1d2620] border-[#29382b] focus-within:border-emerald-500'
                }`}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me any nutrition questions"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
                />
              </div>

              {/* Green Circular Action Button: Microphone when empty, Send when input has text */}
              <button
                type={input.trim() ? 'submit' : 'button'}
                onClick={input.trim() ? undefined : handleToggleVoiceInput}
                className={`w-11 h-11 rounded-full flex items-center justify-center text-white transition active:scale-95 shadow-sm cursor-pointer shrink-0 ${
                  isListening
                    ? 'bg-rose-500 animate-pulse'
                    : 'bg-[#5dba7d] hover:bg-[#50a76e]'
                }`}
                title={
                  input.trim()
                    ? 'Send message'
                    : isListening
                    ? 'Listening... Click to stop'
                    : 'Speak with voice'
                }
              >
                {input.trim() ? (
                  <Send className="w-4 h-4 stroke-[2.2] translate-x-0.5" />
                ) : isListening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
