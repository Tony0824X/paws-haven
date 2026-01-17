
import React, { useState, useRef, useEffect } from 'react';
import { Pet, Message } from '../types';
import { getVolunteerResponse } from '../services/geminiService';
import { getMessagesForPet, sendMessage as sendMessageToDb } from '../services/chatService';

interface ChatProps {
  pet: Pet;
  onBack: () => void;
}

const Chat: React.FC<ChatProps> = ({ pet, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load existing messages on mount
  useEffect(() => {
    async function loadMessages() {
      setIsLoading(true);
      try {
        const result = await getMessagesForPet(pet.id);
        if (result) {
          setSessionId(result.sessionId);
          if (result.messages.length > 0) {
            setMessages(result.messages);
          } else {
            // Add welcome message if no history
            setMessages([{
              id: '1',
              sender: 'volunteer',
              text: `您好！${pet.name} 很喜歡結交新朋友，她今天精神很好，一直想找人玩呢！`,
              timestamp: '今天'
            }]);
          }
        } else {
          // Fallback if Supabase not configured
          setMessages([{
            id: '1',
            sender: 'volunteer',
            text: `您好！${pet.name} 很喜歡結交新朋友，她今天精神很好，一直想找人玩呢！`,
            timestamp: '昨天'
          }]);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        // Fallback
        setMessages([{
          id: '1',
          sender: 'volunteer',
          text: `您好！${pet.name} 很喜歡結交新朋友，她今天精神很好，一直想找人玩呢！`,
          timestamp: '昨天'
        }]);
      } finally {
        setIsLoading(false);
      }
    }

    loadMessages();
  }, [pet.id, pet.name]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: '今天'
    };

    setMessages(prev => [...prev, userMsg]);
    const userInput = inputText;
    setInputText('');
    setIsTyping(true);

    // Save user message to database
    if (sessionId) {
      await sendMessageToDb(sessionId, userInput, 'user');
    }

    // Get response from Gemini
    const history = messages.map(m => ({
      role: m.sender === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: m.text }]
    }));

    const response = await getVolunteerResponse(pet.name, userInput, history);

    const volunteerMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'volunteer',
      text: response,
      timestamp: '今天'
    };

    // Save volunteer message to database
    if (sessionId) {
      await sendMessageToDb(sessionId, response, 'volunteer');
    }

    setIsTyping(false);
    setMessages(prev => [...prev, volunteerMsg]);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col bg-background-light dark:bg-background-dark items-center justify-center">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#9a6c4c] mt-4 font-medium">載入對話...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-hidden border-x border-gray-100 dark:border-gray-800">
      {/* Header */}
      <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <button onClick={onBack} className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <div className="flex flex-col items-center flex-1">
          <div className="flex items-center gap-2">
            <div
              className="aspect-square bg-cover rounded-full size-8 border-2 border-primary"
              style={{ backgroundImage: `url("${pet.images[0]}")` }}
            />
            <h2 className="text-lg font-bold tracking-tight">{pet.name} 🐾</h2>
          </div>
          <p className="text-[#9a6c4c] dark:text-[#c4a48c] text-[11px] font-medium">Paws Haven 的 Sarah</p>
        </div>
        <button className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <span className="material-symbols-outlined">videocam</span>
        </button>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-2 pb-4 no-scrollbar">
        <div className="py-4">
          <h4 className="text-[#9a6c4c] dark:text-[#c4a48c] text-xs font-bold tracking-widest text-center">對話記錄</h4>
        </div>

        {messages.map((m) => (
          <ChatBubble key={m.id} message={m} />
        ))}

        {isTyping && (
          <div className="flex items-end gap-3 p-2">
            <div className="rounded-full w-8 h-8 bg-gray-200 animate-pulse" />
            <div className="bg-[#f3ece7] dark:bg-[#3d2b1d] px-4 py-3 rounded-2xl rounded-bl-none text-sm italic text-gray-400">
              Sarah 正在輸入中...
            </div>
          </div>
        )}

        <div className="flex justify-center my-6">
          <div className="bg-white dark:bg-[#2d1f14] border border-[#f3ece7] dark:border-[#3d2b1d] rounded-xl p-4 flex flex-col items-center gap-3 shadow-sm max-w-[90%]">
            <span className="material-symbols-outlined text-primary text-3xl">calendar_today</span>
            <p className="text-center text-sm font-medium">想要預約時間來現場看看 {pet.name} 嗎？</p>
            <button className="w-full bg-primary text-white font-bold py-2 px-6 rounded-lg text-sm hover:opacity-90">預約親自見面</button>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background-light dark:bg-background-dark border-t border-gray-100 dark:border-gray-800 pb-8">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
          <QuickAction label="查看資料" />
          <QuickAction label="疫苗紀錄" />
          <QuickAction label="領養費用" />
        </div>
        <div className="flex items-center gap-2">
          <button className="text-[#9a6c4c] hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full">
            <span className="material-symbols-outlined">add_circle</span>
          </button>
          <div className="relative flex-1">
            <input
              className="w-full bg-[#f3ece7] dark:bg-[#3d2b1d] border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary placeholder-[#9a6c4c]"
              placeholder="傳送訊息給 Sarah..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
          </div>
          <button
            onClick={handleSend}
            className="size-10 flex items-center justify-center rounded-full bg-primary text-white shadow-lg hover:opacity-90 disabled:opacity-50"
            disabled={!inputText.trim() || isTyping}
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ChatBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.sender === 'user';
  return (
    <div className={`flex items-end gap-3 p-2 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-8 shrink-0 border border-gray-200"
          style={{ backgroundImage: 'url("https://picsum.photos/100/100?random=20")' }}
        />
      )}
      <div className={`flex flex-1 flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <p className="text-[#9a6c4c] dark:text-[#c4a48c] text-[12px] font-medium mx-2">{isUser ? '您' : 'Sarah (志工)'}</p>
        <p className={`text-sm leading-relaxed flex max-w-[85%] px-4 py-3 ${isUser ? 'rounded-2xl rounded-br-none bg-primary text-white' : 'rounded-2xl rounded-bl-none bg-[#f3ece7] dark:bg-[#3d2b1d]'}`}>
          {message.text}
        </p>
      </div>
      {isUser && (
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-8 shrink-0 border border-gray-200"
          style={{ backgroundImage: 'url("https://picsum.photos/100/100?random=10")' }}
        />
      )}
    </div>
  );
};

const QuickAction: React.FC<{ label: string }> = ({ label }) => (
  <button className="flex-none bg-[#f3ece7] dark:bg-[#3d2b1d] px-4 py-1.5 rounded-full text-xs font-semibold border border-transparent hover:border-primary transition-colors">
    {label}
  </button>
);

export default Chat;
