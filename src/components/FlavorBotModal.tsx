import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import {
  FlavorBotContext,
  SUGGESTED_QUESTION_CHIPS,
  getFlavorBotReply,
  buildFlavorBotContext,
} from '../services/flavorBotService';
import { RebuiltRecipeData } from '../data/sampleData';
import { getRebuiltRecipe } from '../services/recipeService';

interface FlavorBotModalProps {
  recipe?: RebuiltRecipeData;
  dishId?: string;
  diet?: string;
  allergies?: string[];
  rebuiltIngredients?: string[];
  shoppingListTotal?: number;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
  suggestChips?: boolean;
  debugError?: string;
}

export const FlavorBotModal: React.FC<FlavorBotModalProps> = ({
  recipe,
  dishId = 'butter-chicken',
  diet = 'Non-veg',
  allergies = ['None'],
  rebuiltIngredients = [
    'Refined table salt',
    'Refined white sugar',
    'Salted table butter & ghee',
    'Heavy dairy cream',
  ],
  shoppingListTotal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Compute active recipe data if not passed directly
  const activeRecipe = recipe || getRebuiltRecipe(dishId, diet, allergies, rebuiltIngredients).recipe;
  const currentDishName = activeRecipe?.dishName || 'your dish';

  // Chat message history initialized with greeting and initial question chips
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-init',
      sender: 'bot',
      text: `Hi! I'm FlavorBot, your cooking helper. Ask me anything about ${currentDishName}, ingredient swaps, or cooking steps!`,
      timestamp: new Date(),
      suggestChips: true,
    },
  ]);

  // Update greeting text if selected dish changes and chat is at initial state
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length <= 1) {
        return [
          {
            id: 'msg-init',
            sender: 'bot',
            text: `Hi! I'm FlavorBot, your cooking helper. Ask me anything about ${currentDishName}, ingredient swaps, or cooking steps!`,
            timestamp: new Date(),
            suggestChips: true,
          },
        ];
      }
      return prev;
    });
  }, [currentDishName]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Build current context for Layer 1 & Layer 2 answering
  const getContext = (): FlavorBotContext => {
    if (activeRecipe) {
      return buildFlavorBotContext(
        activeRecipe,
        diet,
        allergies,
        rebuiltIngredients,
        shoppingListTotal
      );
    }
    // Fallback safe context if recipe not loaded
    return {
      dishId,
      dishName: currentDishName,
      diet,
      allergies,
      rebuiltIngredients,
      keptIngredients: [],
      originalSodiumMg: 890,
      rebuiltSodiumMg: 310,
      limitSodiumMg: 350,
      isSodiumOverLimit: false,
      originalSatFatG: 14.0,
      rebuiltSatFatG: 3.9,
      originalAddedSugarG: 4.0,
      rebuiltAddedSugarG: 1.0,
      costPerServing: 65,
      difficulty: 'Easy',
      estimatedTimeMins: 30,
      swaps: [],
      cookingSteps: [],
      shoppingListTotal,
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const rawText = textToSend !== undefined ? textToSend : inputMessage;
    const query = rawText.trim();
    if (!query || isTyping) return;

    setInputMessage('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const context = getContext();
      const response = await getFlavorBotReply(query, context);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.text,
        timestamp: new Date(),
        suggestChips: response.suggestChips,
        debugError: response.debugError,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      // In case of unexpected network/script error, chat NEVER crashes
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: "I'm having trouble right now. Try one of these questions:",
          timestamp: new Date(),
          suggestChips: true,
          debugError: 'network error',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <aside
        aria-label="FlavorBot Assistant Trigger"
        className="fixed bottom-24 right-3 sm:bottom-6 sm:right-6 z-40 no-print"
      >
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? 'Close FlavorBot Assistant' : 'Open FlavorBot Assistant'}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FFF0C5] dark:bg-[#1B2A23] text-[#193826] dark:text-[#FFB34D] border-2.5 border-[#193826] dark:border-[#3F6B57] ink-shadow flex items-center justify-center hover:scale-105 active:scale-95 dark:hover:bg-[#22332A] dark:hover:border-[#5FA283] transition-all duration-150 cursor-pointer group relative"
        >
          <Bot className="w-5 h-5 sm:w-7 sm:h-7 text-[#193826] dark:text-[#FFB34D] group-hover:rotate-6 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF7B25] dark:bg-[#FFB34D] rounded-full border-2 border-white dark:border-[#0C1411] animate-pulse" />
        </button>
      </aside>

      {/* Slide-in chat panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="FlavorBot Assistant"
          className="fixed bottom-16 right-3 sm:bottom-20 sm:right-6 w-[calc(100vw-24px)] sm:w-96 h-[480px] max-h-[calc(100vh-80px)] flex flex-col rounded-2xl bg-[#FFFDF9] dark:bg-[#15211B] border-2 border-[#193826] dark:border-[#3F6B57] ink-shadow-lg z-50 overflow-hidden no-print animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header (design preserved: icon, title, Beta tag, subtitle, close) */}
          <div className="p-3.5 bg-[#193826] dark:bg-[#101A15] text-white flex items-center justify-between border-b dark:border-[#3F6B57] shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#FFF0C5] dark:bg-[#22332A] text-[#193826] dark:text-[#FFB34D] flex items-center justify-center border border-white/20 dark:border-[#3F6B57]">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm leading-tight flex items-center gap-1.5 dark:text-[#F1F6F2]">
                  FlavorBot
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#FF7B25] dark:bg-[#FFB34D] text-white dark:text-[#1A1200]">
                    Beta
                  </span>
                </h3>
                <span className="text-[10px] text-white/80 dark:text-[#8FA89A]">
                  Cooking helper
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close FlavorBot"
              className="text-white/80 dark:text-[#BBCDC2] hover:text-white dark:hover:text-[#F1F6F2] p-1 rounded-md hover:bg-white/10 dark:hover:bg-[#1B2A23] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#FAF7F2] dark:bg-[#15211B]">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-2">
                <div
                  className={`flex items-start gap-2 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-6 h-6 rounded-md bg-[#FFF0C5] dark:bg-[#22332A] border border-[#193826]/30 dark:border-[#3F6B57] flex items-center justify-center text-[#193826] dark:text-[#FFB34D] shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                      msg.sender === 'user'
                        ? 'bg-[#FFE0CE] text-[#193826] dark:bg-[#FFB34D] dark:text-[#1A1200] rounded-tr-xs border border-[#193826] dark:border-[#3F6B57] font-semibold'
                        : 'bg-white dark:bg-[#1B2A23] text-[#193826] dark:text-[#F1F6F2] rounded-tl-xs border border-[#193826]/30 dark:border-[#3F6B57] shadow-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    {msg.debugError && (
                      <p className="mt-1.5 text-[10px] text-gray-500 dark:text-[#8FA89A] font-mono leading-tight border-t border-gray-200/60 dark:border-[#3F6B57]/40 pt-1">
                        {msg.debugError}
                      </p>
                    )}
                  </div>
                </div>

                {/* Question Chips rendered under greeting or fallback message */}
                {msg.suggestChips && (
                  <div className="pl-8 pt-1 flex flex-wrap gap-1.5">
                    {SUGGESTED_QUESTION_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleSendMessage(chip)}
                        className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#D8EFDF] text-[#193826] border border-[#193826] dark:bg-[#1B2A23] dark:text-[#5FD39A] dark:border-[#3F6B57] hover:bg-[#bce4c7] dark:hover:bg-[#22332A] dark:hover:border-[#5FA283] transition-colors duration-150 cursor-pointer text-left active:scale-95"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 pl-1">
                <div className="w-6 h-6 rounded-md bg-[#FFF0C5] dark:bg-[#22332A] border border-[#193826]/30 dark:border-[#3F6B57] flex items-center justify-center text-[#193826] dark:text-[#FFB34D] shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-2.5 rounded-2xl bg-white dark:bg-[#1B2A23] border border-[#193826]/30 dark:border-[#3F6B57] text-xs text-[#193826]/75 dark:text-[#BBCDC2] flex items-center gap-1.5">
                  <span>FlavorBot is thinking</span>
                  <span className="flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF7B25] dark:bg-[#FFB34D] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF7B25] dark:bg-[#FFB34D] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF7B25] dark:bg-[#FFB34D] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Strip if chat has more messages */}
          {messages.length > 2 && (
            <div className="px-3 py-1.5 bg-[#FFF0C5]/40 dark:bg-[#1B2A23] border-t border-[#193826]/10 dark:border-[#3F6B57]/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              <span className="text-[10px] font-bold text-[#193826]/60 dark:text-[#8FA89A] shrink-0">
                Quick:
              </span>
              {SUGGESTED_QUESTION_CHIPS.slice(0, 3).map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleSendMessage(chip)}
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-[#101A15] border border-[#193826]/20 dark:border-[#3F6B57] text-[#193826] dark:text-[#BBCDC2] hover:bg-[#D8EFDF] dark:hover:bg-[#1B2A23] shrink-0 cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Chat Input & Send Button (design preserved) */}
          <div className="p-3 bg-white dark:bg-[#101A15] border-t border-[#193826]/20 dark:border-[#3F6B57] shrink-0">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about swaps, sodium, or steps..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border-2 border-[#193826] dark:border-[#3F6B57] bg-[#FFFDF9] dark:bg-[#15211B] text-[#193826] dark:text-[#F1F6F2] dark:placeholder-[#8FA89A] focus:outline-none focus:ring-2 focus:ring-[#FF7B25] dark:focus:ring-[#FFB34D]"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isTyping}
                className="p-2 rounded-xl bg-[#FF7B25] dark:bg-[#FFB34D] text-white dark:text-[#1A1200] border-2 border-[#193826] dark:border-[#3F6B57] hover:bg-[#e0681b] dark:hover:bg-[#FFC266] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors duration-150 shrink-0"
                title="Send message"
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Note under input */}
            <p className="mt-1.5 text-[10px] text-[#193826]/60 dark:text-[#8FA89A] text-center font-medium">
              Sample data. Food suggestions, not medical advice.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
