
import React from 'react';
import { Screen } from '../types';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/80 dark:bg-background-dark/80 backdrop-blur-xl border-t border-primary/10 h-20 flex items-center justify-around px-6 pb-2 z-50">
      <NavButton 
        active={currentScreen === Screen.HOME} 
        icon="home" 
        label="首頁" 
        onClick={() => onNavigate(Screen.HOME)}
      />
      <NavButton 
        active={currentScreen === Screen.FAVORITES} 
        icon="favorite" 
        label="收藏" 
        onClick={() => onNavigate(Screen.FAVORITES)}
      />
      <NavButton 
        active={currentScreen === Screen.CHAT_LIST || currentScreen === Screen.CHAT} 
        icon="chat_bubble" 
        label="聊天" 
        onClick={() => onNavigate(Screen.CHAT_LIST)}
      />
      <NavButton 
        active={currentScreen === Screen.PROFILE} 
        icon="person" 
        label="個人檔案" 
        onClick={() => onNavigate(Screen.PROFILE)}
      />
    </nav>
  );
};

const NavButton: React.FC<{ icon: string, label: string, active?: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center gap-1 transition-all duration-200 transform ${active ? 'text-primary scale-110' : 'text-[#9a6c4c] dark:text-white/50 hover:text-primary/70'}`}
  >
    <span className={`material-symbols-outlined ${active ? 'fill-1' : ''}`}>{icon}</span>
    <span className={`text-[10px] ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
  </button>
);

export default BottomNav;
