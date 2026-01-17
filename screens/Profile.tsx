
import React, { useState, useEffect } from 'react';
import { Pet, Application, Screen } from '../types';
import BottomNav from '../components/BottomNav';
import { getCurrentUser, getUserStats, User, UserStats } from '../services/userService';
import { getApplications } from '../services/applicationService';
import { AuthUser } from '../services/authService';

interface ProfileProps {
  onBack: () => void;
  onNavigateHome: () => void;
  favorites: string[];
  pets: Pet[];
  onSelectPet: (pet: Pet) => void;
  onNavigate: (screen: Screen) => void;
  currentScreen: Screen;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onBack, onNavigateHome, favorites, pets, onSelectPet, onNavigate, currentScreen, currentUser, onLogout }) => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats>({ favoritesCount: 0, pendingApplicationsCount: 0, adoptedCount: 0 });
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    async function loadUserData() {
      setIsLoading(true);
      try {
        const [userData, statsData, applicationsData] = await Promise.all([
          getCurrentUser(),
          getUserStats(),
          getApplications(),
        ]);

        // Priority: Supabase user from database > currentUser from auth session
        if (userData) {
          setUser(userData);
        } else if (currentUser) {
          // Use current auth user if no user record in database yet
          setUser({
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.name || currentUser.email?.split('@')[0] || 'User',
            avatarUrl: currentUser.avatarUrl,
            badge: '新進領養人',
          });
        }
        // No fallback - if no user, user state remains null

        setStats(statsData);
        setApplications(applicationsData);
      } catch (error) {
        console.error('Error loading user data:', error);
        // Use currentUser from auth on error
        if (currentUser) {
          setUser({
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.name || currentUser.email?.split('@')[0] || 'User',
            avatarUrl: currentUser.avatarUrl,
            badge: '新進領養人',
          });
        }
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserData();
  }, [currentUser]);

  // Use favorites count from props if Supabase stats not available
  const displayStats = {
    favoritesCount: stats.favoritesCount || favorites.length,
    pendingApplicationsCount: stats.pendingApplicationsCount || applications.filter(a => a.status === '審核中').length,
    adoptedCount: stats.adoptedCount || applications.filter(a => a.status === '已通過').length,
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    if (onLogout) {
      onLogout();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#9a6c4c] mt-4 font-medium">載入中...</p>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen pb-24">
      <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/5">
        <div className="flex items-center p-4 pb-2 justify-between">
          <button onClick={onBack} className="flex size-12 items-center justify-start">
            <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
          </button>
          <h2 className="text-lg font-bold flex-1 text-center">個人檔案</h2>
          <button
            onClick={() => setShowSettings(true)}
            className="flex size-12 items-center justify-end"
          >
            <span className="material-symbols-outlined text-2xl">settings</span>
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        <section className="px-4 py-6">
          <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-[2rem] border border-primary/5 shadow-xl shadow-primary/5 flex flex-col items-center text-center">
            <div
              className="bg-center bg-cover rounded-full h-24 w-24 border-4 border-white dark:border-zinc-700 shadow-xl mb-4"
              style={{ backgroundImage: `url("${user?.avatarUrl || 'https://picsum.photos/200/200?random=10'}")` }}
            />
            <h2 className="text-2xl font-bold">{user?.name || 'User'}</h2>
            <p className="text-[#9a6c4c] text-sm mt-1">{user?.email}</p>
            <p className="text-primary font-bold text-sm flex items-center gap-1 mt-2 bg-primary/5 px-4 py-1 rounded-full">
              <span className="material-symbols-outlined text-sm">verified</span>
              {user?.badge || '領養人'}
            </p>
            <div className="grid grid-cols-3 w-full gap-4 mt-6 pt-6 border-t border-primary/5">
              <StatItem label="已收藏" value={displayStats.favoritesCount} />
              <StatItem label="諮詢中" value={displayStats.pendingApplicationsCount} />
              <StatItem label="已領養" value={displayStats.adoptedCount} />
            </div>
          </div>
        </section>

        <section className="mt-4 px-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">申請進度</h3>
            <button className="text-primary text-sm font-bold">歷史紀錄</button>
          </div>
          <div className="space-y-3">
            {applications.map(app => (
              <div key={app.id} className="flex items-center gap-4 rounded-2xl border border-primary/5 bg-white dark:bg-zinc-900/50 p-4 shadow-sm">
                <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${app.status === '審核中' ? 'bg-amber-100 text-amber-600' : app.status === '已通過' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                  <span className="material-symbols-outlined text-2xl">{app.status === '審核中' ? 'hourglass_top' : app.status === '已通過' ? 'task_alt' : 'cancel'}</span>
                </div>
                <div className="flex flex-col flex-1">
                  <h4 className="text-base font-bold">{app.petName} 的申請</h4>
                  <p className="text-[#9a6c4c] text-xs font-medium">{app.petBreed} • {app.status}</p>
                </div>
                <button className="text-primary font-bold text-xs bg-primary/5 px-3 py-2 rounded-lg">查看詳情</button>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 px-4">
          <div className="bg-white dark:bg-zinc-900/50 rounded-2xl border border-primary/5 overflow-hidden divide-y divide-primary/5">
            <MenuLink icon="person_search" label="領養偏好設定" onClick={() => alert('即將推出！')} />
            <MenuLink icon="favorite" label="管理收藏毛孩" onClick={() => onNavigate(Screen.FAVORITES)} />
            <MenuLink icon="history_edu" label="領養與切結書範本" onClick={() => alert('即將推出！')} />
            <MenuLink icon="support_agent" label="聯絡客服志工" onClick={() => onNavigate(Screen.CHAT_LIST)} />
            <MenuLink icon="logout" label="登出帳號" color="text-red-500" onClick={() => setShowLogoutConfirm(true)} />
          </div>
        </section>
      </main>

      <BottomNav currentScreen={currentScreen} onNavigate={onNavigate} />

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-t-[2rem] w-full max-w-[480px] animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 dark:bg-zinc-700 rounded-full"></div>
            </div>
            <div className="px-6 pb-8">
              <h3 className="text-xl font-bold mb-6">設定</h3>
              <div className="space-y-3">
                <SettingsItem icon="dark_mode" label="深色模式" action="toggle" />
                <SettingsItem icon="notifications" label="通知設定" onClick={() => alert('即將推出！')} />
                <SettingsItem icon="language" label="語言設定" value="繁體中文" onClick={() => alert('即將推出！')} />
                <SettingsItem icon="info" label="關於 Paws Haven" onClick={() => alert('Paws Haven v1.0.0\n寵物領養平台')} />
                <SettingsItem icon="help" label="使用說明" onClick={() => alert('即將推出！')} />
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="w-full mt-6 h-14 bg-gray-100 dark:bg-zinc-800 text-[#1b130d] dark:text-white font-bold rounded-2xl"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-red-500 text-3xl">logout</span>
              </div>
              <h3 className="text-xl font-bold text-[#1b130d] dark:text-white mb-2">確定要登出嗎？</h3>
              <p className="text-[#9a6c4c] dark:text-zinc-400 text-sm mb-6">登出後需要重新登入才能使用所有功能。</p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 h-12 bg-gray-100 dark:bg-zinc-800 text-[#1b130d] dark:text-white font-bold rounded-xl"
                >
                  取消
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 h-12 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors"
                >
                  登出
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatItem: React.FC<{ label: string, value: string | number }> = ({ label, value }) => (
  <div className="flex flex-col items-center">
    <p className="text-xl font-bold">{value}</p>
    <p className="text-xs text-[#9a6c4c] dark:text-zinc-400 font-medium">{label}</p>
  </div>
);

const MenuLink: React.FC<{ icon: string, label: string, color?: string, onClick?: () => void }> = ({ icon, label, color = "text-[#1b130d] dark:text-zinc-200", onClick }) => (
  <div onClick={onClick} className="flex items-center justify-between p-4 cursor-pointer hover:bg-primary/5 transition-colors">
    <div className={`flex items-center gap-3 ${color}`}>
      <span className="material-symbols-outlined text-xl">{icon}</span>
      <span className="font-bold text-sm">{label}</span>
    </div>
    <span className="material-symbols-outlined text-zinc-300 text-xl">chevron_right</span>
  </div>
);

const SettingsItem: React.FC<{ icon: string, label: string, value?: string, action?: 'toggle', onClick?: () => void }> = ({ icon, label, value, action, onClick }) => {
  const [isOn, setIsOn] = useState(false);

  return (
    <div
      onClick={action !== 'toggle' ? onClick : undefined}
      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-xl">{icon}</span>
        <span className="font-medium">{label}</span>
      </div>
      {action === 'toggle' ? (
        <button
          onClick={() => setIsOn(!isOn)}
          className={`w-12 h-7 rounded-full transition-colors relative ${isOn ? 'bg-primary' : 'bg-gray-300 dark:bg-zinc-600'}`}
        >
          <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${isOn ? 'translate-x-6' : 'translate-x-1'}`}></div>
        </button>
      ) : value ? (
        <span className="text-[#9a6c4c] dark:text-zinc-400 text-sm">{value}</span>
      ) : (
        <span className="material-symbols-outlined text-zinc-300 text-xl">chevron_right</span>
      )}
    </div>
  );
};

export default Profile;
