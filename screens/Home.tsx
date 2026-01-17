
import React, { useState, useEffect } from 'react';
import { Pet, Screen } from '../types';
import BottomNav from '../components/BottomNav';
import { getNotifications, subscribeToNotifications, markAsRead, markAllAsRead, Notification } from '../services/notificationService';
import { getCurrentUserId } from '../services/authService';

interface HomeProps {
  pets: Pet[];
  onSelectPet: (pet: Pet) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onNavigate: (screen: Screen) => void;
  currentScreen: Screen;
}

const Home: React.FC<HomeProps> = ({ pets, onSelectPet, favorites, onToggleFavorite, onNavigate, currentScreen }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'cat' | 'dog'>('all');
  const [search, setSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load initial notifications
    loadNotifications();

    // Subscribe to real-time notifications
    const unsubscribe = subscribeToNotifications((newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      // Play sound or show toast here if needed
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.isRead).length);
  }, [notifications]);

  const loadNotifications = async () => {
    const data = await getNotifications();
    setNotifications(data);
  };

  const handleOpenNotifications = async () => {
    setShowNotifications(true);
    // Mark all as read when opening (or can be done per item)
    if (unreadCount > 0) {
      await markAllAsRead();
      // Optimistically update UI
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };

  const filteredPets = pets.filter(pet => {
    const matchesTab = activeTab === 'all' || pet.type === activeTab;
    const matchesSearch = pet.name.toLowerCase().includes(search.toLowerCase()) || pet.breed.includes(search);
    return matchesTab && matchesSearch;
  });

  const featuredPets = filteredPets.filter(p => p.isFeatured);
  const newPets = filteredPets.filter(p => p.isNew);

  // Helper to format time relative to now
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return '剛剛';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} 分鐘前`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} 小時前`;
    return `${Math.floor(diffInSeconds / 86400)} 天前`;
  };

  return (
    <div className="pb-24">
      <div className="flex items-center p-4 pb-2 justify-between sticky top-0 bg-background-light dark:bg-background-dark z-50">
        <div className="flex items-center gap-3">
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-primary/20 cursor-pointer hover:border-primary transition-colors"
            onClick={() => onNavigate(Screen.PROFILE)}
            style={{ backgroundImage: 'url("https://picsum.photos/100/100?random=10")' }}
          />
          <div>
            <p className="text-[#9a6c4c] dark:text-primary/70 text-xs font-medium">歡迎回來！</p>
            <h2 className="text-[#1b130d] dark:text-white text-lg font-bold leading-tight tracking-tight">尋找你最好的朋友</h2>
          </div>
        </div>
        <button
          onClick={handleOpenNotifications}
          className="flex size-10 items-center justify-center rounded-full bg-white dark:bg-white/10 shadow-sm relative hover:bg-gray-100 dark:hover:bg-white/20 transition-colors"
        >
          <span className="material-symbols-outlined">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </button>
      </div>

      <div className="px-4 py-3">
        <div className="flex w-full items-stretch rounded-xl shadow-sm bg-white dark:bg-white/5 border border-transparent focus-within:border-primary transition-all">
          <div className="text-[#9a6c4c] flex items-center justify-center pl-4">
            <span className="material-symbols-outlined">search</span>
          </div>
          <input
            className="w-full bg-transparent border-none focus:ring-0 px-4 py-3 text-base placeholder:text-[#9a6c4c]"
            placeholder="搜尋寵物..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="px-4 text-[#9a6c4c] hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-3 px-4 py-4 overflow-x-auto no-scrollbar">
        <TabItem label="全部" icon="pets" active={activeTab === 'all'} onClick={() => setActiveTab('all')} />
        <TabItem label="貓咪" icon="pets" active={activeTab === 'cat'} onClick={() => setActiveTab('cat')} />
        <TabItem label="狗狗" icon="pets" active={activeTab === 'dog'} onClick={() => setActiveTab('dog')} />
      </div>

      {featuredPets.length > 0 && (
        <section className="mt-4">
          <div className="flex justify-between items-center px-4 pb-2">
            <h2 className="text-[22px] font-bold tracking-tight">精選寵物</h2>
          </div>
          <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 gap-4 pb-4">
            {featuredPets.map(pet => (
              <div
                key={pet.id}
                onClick={() => onSelectPet(pet)}
                className="flex-shrink-0 w-[280px] snap-center bg-white dark:bg-white/5 p-2 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              >
                <div
                  className="relative aspect-[4/5] bg-cover bg-center rounded-lg overflow-hidden"
                  style={{ backgroundImage: `url("${pet.images[0]}")` }}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(pet.id); }}
                    className="absolute top-3 right-3 bg-white/90 dark:bg-black/50 backdrop-blur-md rounded-full p-2 text-primary hover:scale-110 transition-transform"
                  >
                    <span className={`material-symbols-outlined ${favorites.includes(pet.id) ? 'fill-1' : ''}`}>favorite</span>
                  </button>
                </div>
                <div className="px-2 pt-3 pb-1">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold">{pet.name}</p>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">精選</span>
                  </div>
                  <p className="text-[#9a6c4c] dark:text-primary/70 text-sm font-medium">{pet.traits?.join(' • ')}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6 px-4">
        <h2 className="text-[22px] font-bold pb-4">新進夥伴</h2>
        <div className="grid grid-cols-2 gap-4">
          {newPets.map(pet => (
            <div
              key={pet.id}
              onClick={() => onSelectPet(pet)}
              className="bg-white dark:bg-white/5 rounded-xl p-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            >
              <div
                className="aspect-square bg-cover bg-center rounded-lg"
                style={{ backgroundImage: `url("${pet.images[0]}")` }}
              />
              <div className="px-1 pt-2">
                <p className="text-sm font-bold">{pet.name}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {pet.traits?.slice(0, 2).map((t, idx) => (
                    <span key={idx} className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${idx === 0 ? 'bg-primary/10 text-primary' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Show all pets if no featured/new pets */}
      {featuredPets.length === 0 && newPets.length === 0 && filteredPets.length > 0 && (
        <section className="mt-6 px-4">
          <h2 className="text-[22px] font-bold pb-4">所有寵物</h2>
          <div className="grid grid-cols-2 gap-4">
            {filteredPets.map(pet => (
              <div
                key={pet.id}
                onClick={() => onSelectPet(pet)}
                className="bg-white dark:bg-white/5 rounded-xl p-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              >
                <div
                  className="aspect-square bg-cover bg-center rounded-lg"
                  style={{ backgroundImage: `url("${pet.images[0]}")` }}
                />
                <div className="px-1 pt-2">
                  <p className="text-sm font-bold">{pet.name}</p>
                  <p className="text-[#9a6c4c] text-xs">{pet.breed}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {filteredPets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
          <div className="bg-primary/10 p-6 rounded-full mb-4">
            <span className="material-symbols-outlined text-5xl text-primary/50">search_off</span>
          </div>
          <h3 className="text-xl font-bold">找不到寵物</h3>
          <p className="text-[#9a6c4c] mt-2 text-sm leading-relaxed">
            嘗試調整搜尋條件或瀏覽其他類別
          </p>
          <button
            onClick={() => { setSearch(''); setActiveTab('all'); }}
            className="mt-4 text-primary font-bold"
          >
            清除篩選條件
          </button>
        </div>
      )}

      <BottomNav currentScreen={currentScreen} onNavigate={onNavigate} />

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="absolute inset-0"
            onClick={() => setShowNotifications(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-zinc-900 shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="text-lg font-bold">通知中心</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-80px)]">
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-xl border ${!notif.isRead ? 'bg-primary/5 border-primary/20' : 'bg-gray-50 dark:bg-zinc-800 border-transparent'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!notif.isRead ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-zinc-700 text-gray-500'}`}>
                      <span className="material-symbols-outlined text-xl">
                        {notif.type === 'message' ? 'chat' : notif.type === 'new_pet' ? 'pets' : 'description'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm">{notif.title}</h4>
                        {!notif.isRead && <span className="w-2 h-2 bg-primary rounded-full"></span>}
                      </div>
                      <p className="text-[#9a6c4c] dark:text-zinc-400 text-sm mt-1">{notif.body}</p>
                      <p className="text-xs text-gray-400 mt-2">{formatTime(notif.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-zinc-600">notifications_off</span>
                  <p className="text-[#9a6c4c] mt-4">暫無通知</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TabItem: React.FC<{ label: string, icon: string, active: boolean, onClick: () => void }> = ({ label, icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex h-11 shrink-0 items-center justify-center gap-x-2 rounded-xl px-5 transition-all ${active ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white dark:bg-white/5 border border-primary/10 hover:border-primary/30'}`}
  >
    <span className={`material-symbols-outlined text-[20px] ${active ? 'text-white' : 'text-primary'}`}>{icon}</span>
    <p className={`text-sm font-bold leading-normal ${active ? '' : 'text-[#1b130d] dark:text-white'}`}>{label}</p>
  </button>
);

export default Home;
