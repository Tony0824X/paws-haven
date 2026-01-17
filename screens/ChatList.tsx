
import React, { useState, useEffect } from 'react';
import { Pet, Screen } from '../types';
import BottomNav from '../components/BottomNav';
import { getChatSessions, ChatSession } from '../services/chatService';

interface ChatListProps {
  pets: Pet[];
  onSelectChat: (pet: Pet) => void;
  onNavigate: (screen: Screen) => void;
  currentScreen: Screen;
}

const ChatList: React.FC<ChatListProps> = ({ pets, onSelectChat, onNavigate, currentScreen }) => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showVolunteerInfo, setShowVolunteerInfo] = useState(false);

  useEffect(() => {
    async function loadChatSessions() {
      try {
        const sessions = await getChatSessions();
        if (sessions.length > 0) {
          setChatSessions(sessions);
        } else {
          // Fallback to showing first 2 pets as potential chats
          const defaultSessions: ChatSession[] = pets.slice(0, 2).map(pet => ({
            id: `mock-${pet.id}`,
            pet,
            volunteerName: 'Sarah',
            lastMessageAt: new Date().toISOString(),
            lastMessage: `您好！${pet.name} 很喜歡結交新朋友，她今天精神很好...`,
          }));
          setChatSessions(defaultSessions);
        }
      } catch (error) {
        console.error('Error loading chat sessions:', error);
        // Fallback
        const defaultSessions: ChatSession[] = pets.slice(0, 2).map(pet => ({
          id: `mock-${pet.id}`,
          pet,
          volunteerName: 'Sarah',
          lastMessageAt: new Date().toISOString(),
          lastMessage: `您好！${pet.name} 很喜歡結交新朋友...`,
        }));
        setChatSessions(defaultSessions);
      } finally {
        setIsLoading(false);
      }
    }

    if (pets.length > 0) {
      loadChatSessions();
    } else {
      setIsLoading(false);
    }
  }, [pets]);

  const availablePetsForChat = pets.filter(p => !chatSessions.some(s => s.pet.id === p.id));

  return (
    <div className="pb-24 min-h-screen bg-background-light dark:bg-background-dark">
      <div className="p-4 pt-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">訊息與諮詢</h1>
          <p className="text-[#9a6c4c] dark:text-primary/70 text-sm mt-1">與志工聯繫，了解更多細節</p>
        </div>
        <button
          onClick={() => setShowNewChatModal(true)}
          className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <span className="material-symbols-outlined">edit_square</span>
        </button>
      </div>

      <div className="px-4 mt-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#9a6c4c] mb-4">最近聯繫</h3>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : chatSessions.length > 0 ? (
          <div className="space-y-4">
            {chatSessions.map(session => (
              <div
                key={session.id}
                onClick={() => onSelectChat(session.pet)}
                className="flex items-center gap-4 bg-white dark:bg-white/5 p-4 rounded-2xl shadow-sm hover:bg-primary/5 transition-all cursor-pointer relative"
              >
                <div
                  className="size-14 rounded-full bg-cover bg-center shrink-0 border-2 border-primary/20"
                  style={{ backgroundImage: `url("${session.pet.images[0]}")` }}
                />
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4 className="font-bold text-base">{session.pet.name} 的志工 {session.volunteerName}</h4>
                    <span className="text-[10px] text-[#9a6c4c]">10:45 AM</span>
                  </div>
                  <p className="text-[#9a6c4c] dark:text-primary/70 text-sm truncate">
                    {session.lastMessage || `您好！${session.pet.name} 很喜歡結交新朋友...`}
                  </p>
                </div>
                <div className="absolute right-4 bottom-4 size-2 bg-primary rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-gray-400">chat_bubble</span>
            </div>
            <h4 className="font-bold text-lg mb-2">還沒有對話</h4>
            <p className="text-[#9a6c4c] text-sm mb-4">開始與志工聊天，了解更多寵物資訊</p>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="bg-primary text-white font-bold px-6 py-2 rounded-lg"
            >
              開始新對話
            </button>
          </div>
        )}
      </div>

      <div className="px-4 mt-10">
        <div className="bg-primary/5 rounded-2xl p-6 flex flex-col items-center text-center">
          <span className="material-symbols-outlined text-4xl text-primary mb-3">volunteer_activism</span>
          <h4 className="font-bold">想成為志工嗎？</h4>
          <p className="text-sm text-[#9a6c4c] mt-2 mb-4">加入 Paws Haven 幫助更多毛孩找到溫馨的家。</p>
          <button
            onClick={() => setShowVolunteerInfo(true)}
            className="text-primary font-bold text-sm bg-white dark:bg-white/10 px-6 py-2 rounded-lg border border-primary/20 hover:bg-primary hover:text-white transition-colors"
          >
            了解更多
          </button>
        </div>
      </div>

      <BottomNav currentScreen={currentScreen} onNavigate={onNavigate} />

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-200">
          <div
            className="absolute inset-0"
            onClick={() => setShowNewChatModal(false)}
          />
          <div className="bg-white dark:bg-zinc-900 rounded-t-[2rem] w-full max-w-[480px] max-h-[70vh] animate-in slide-in-from-bottom duration-300 relative z-10">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 dark:bg-zinc-700 rounded-full"></div>
            </div>
            <div className="px-6 pb-8">
              <h3 className="text-xl font-bold mb-2">開始新對話</h3>
              <p className="text-[#9a6c4c] text-sm mb-6">選擇一個寵物開始與志工諮詢</p>

              <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                {availablePetsForChat.length > 0 ? availablePetsForChat.map(pet => (
                  <div
                    key={pet.id}
                    onClick={() => {
                      setShowNewChatModal(false);
                      onSelectChat(pet);
                    }}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors"
                  >
                    <div
                      className="size-12 rounded-full bg-cover bg-center"
                      style={{ backgroundImage: `url("${pet.images[0]}")` }}
                    />
                    <div className="flex-1">
                      <h4 className="font-bold">{pet.name}</h4>
                      <p className="text-[#9a6c4c] text-sm">{pet.breed}</p>
                    </div>
                    <span className="material-symbols-outlined text-primary">arrow_forward</span>
                  </div>
                )) : (
                  <p className="text-center text-[#9a6c4c] py-8">您已經與所有寵物的志工開始對話了！</p>
                )}
              </div>

              <button
                onClick={() => setShowNewChatModal(false)}
                className="w-full mt-6 h-12 bg-gray-100 dark:bg-zinc-800 text-[#1b130d] dark:text-white font-bold rounded-xl"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Volunteer Info Modal */}
      {showVolunteerInfo && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary text-4xl">volunteer_activism</span>
              </div>
              <h3 className="text-2xl font-bold text-[#1b130d] dark:text-white mb-3">成為 Paws Haven 志工</h3>
              <p className="text-[#9a6c4c] dark:text-zinc-400 text-sm mb-6 leading-relaxed">
                我們正在尋找有愛心的志工加入我們的團隊！您可以：
              </p>
              <ul className="text-left text-sm space-y-2 mb-6 w-full">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                  協助照顧待領養的毛孩
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                  回覆領養人的諮詢問題
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                  參與領養活動和推廣
                </li>
              </ul>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowVolunteerInfo(false)}
                  className="flex-1 h-12 bg-gray-100 dark:bg-zinc-800 text-[#1b130d] dark:text-white font-bold rounded-xl"
                >
                  稍後再說
                </button>
                <button
                  onClick={() => {
                    setShowVolunteerInfo(false);
                    alert('感謝您的興趣！請發送郵件至 volunteer@pawshaven.com 申請成為志工。');
                  }}
                  className="flex-1 h-12 bg-primary hover:bg-[#e06b1a] text-white font-bold rounded-xl transition-colors"
                >
                  我要加入
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;
