
import React, { useState } from 'react';
import { Pet } from '../types';

interface PetDetailProps {
  pet: Pet;
  onBack: () => void;
  onAdopt: () => void;
  onChat: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const PetDetail: React.FC<PetDetailProps> = ({ pet, onBack, onAdopt, onChat, isFavorite, onToggleFavorite }) => {
  const [showGallery, setShowGallery] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen relative font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md">
        <div className="flex items-center px-4 py-3 justify-between">
          <button onClick={onBack} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
          </button>
          <h2 className="text-lg font-bold leading-tight">寵物詳情與故事</h2>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `${pet.name} - Paws Haven`,
                  text: `來看看這隻可愛的 ${pet.breed}！`,
                  url: window.location.href,
                }).catch(() => { });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('連結已複製到剪貼簿！');
              }
            }}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">share</span>
          </button>
        </div>
      </nav>

      <main className="pt-16 pb-32">
        {/* Image Display Area - Click to show gallery as requested */}
        <div className="px-6 py-4">
          <div
            className="relative w-full aspect-[4/3] bg-center bg-cover rounded-[2.5rem] shadow-xl border border-black/5 cursor-pointer overflow-hidden group transition-transform active:scale-[0.98]"
            style={{ backgroundImage: `url("${pet.images[0]}")` }}
            onClick={() => setShowGallery(true)}
          >
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />

            {/* Horizontal Indicator Peek (matches screenshot style) */}
            <div className="absolute right-[-24%] top-[10%] bottom-[10%] w-[30%] opacity-40 pointer-events-none">
              <div
                className="w-full h-full bg-center bg-cover rounded-l-[2rem] shadow-inner"
                style={{ backgroundImage: `url("${pet.images[1] || pet.images[0]}")` }}
              />
            </div>

            {/* Hint overlay */}
            <div className="absolute bottom-4 right-4 bg-white/80 dark:bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-primary text-sm">photo_library</span>
              <span className="text-[10px] font-bold text-gray-800 dark:text-white">{pet.images.length} 張照片</span>
            </div>
          </div>
        </div>

        {/* Basic Info Section */}
        <div className="px-8 mt-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-[48px] font-bold tracking-tight text-[#1b130d] dark:text-white leading-[1.1]">
                {pet.name}
              </h1>
              <div className="flex items-center gap-1.5 text-[#9a6c4c] dark:text-[#c0a08a] mt-2">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
                <p className="text-sm font-medium">{pet.breed} • {pet.location}</p>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
              className={`mt-4 flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 shadow-sm border ${isFavorite ? 'bg-primary/10 border-primary text-primary' : 'bg-white dark:bg-white/5 border-[#e7d9cf] dark:border-white/10 text-gray-400'}`}
            >
              <span className={`material-symbols-outlined text-2xl ${isFavorite ? 'fill-1' : ''}`}>favorite</span>
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-4 px-8 py-8">
          <StatBox label="年齡" value={pet.age} />
          <StatBox label="性別" value={pet.gender} />
          <StatBox label="體重" value={pet.weight} />
        </div>

        {/* Health Status Section */}
        <div className="px-8 mb-10">
          <h3 className="text-base font-bold text-[#1b130d] dark:text-white mb-5 uppercase tracking-wider">健康狀況</h3>
          <div className="flex flex-wrap gap-3">
            {pet.healthStatus.map((status, idx) => (
              <HealthTag key={idx} label={status} index={idx} />
            ))}
          </div>
        </div>

        {/* Story Section */}
        <div className="px-8 pb-12 border-t border-[#f3ece7] dark:border-white/5 pt-8">
          <h3 className="text-xl font-bold text-[#1b130d] dark:text-white mb-5">關於 {pet.name}</h3>
          <div className="space-y-5 text-[16px] leading-relaxed text-[#5e412f] dark:text-[#d1c2b8] font-medium">
            {pet.description.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </main>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/95 dark:bg-[#221810]/98 backdrop-blur-xl border-t border-[#f3ece7] dark:border-[#3d2b1d] p-5 pb-10 flex items-center gap-4 z-[60]">
        <button
          onClick={onAdopt}
          className="flex-1 bg-primary hover:bg-[#e06b1a] text-white h-[68px] rounded-[1.5rem] font-bold text-lg shadow-xl shadow-primary/25 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
        >
          領養 {pet.name}
          <span className="material-symbols-outlined text-2xl font-variation-settings-'FILL'-1">pets</span>
        </button>

        <button
          onClick={onChat}
          className="w-[68px] h-[68px] flex items-center justify-center border-2 border-primary/30 text-primary rounded-[1.5rem] bg-white dark:bg-[#2d1f14] hover:bg-primary/5 transition-colors active:scale-[0.98] shadow-sm"
        >
          <span className="material-symbols-outlined text-[32px]">chat_bubble</span>
        </button>
      </div>

      {/* Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-2xl flex flex-col animate-in fade-in duration-300">
          {/* Fixed Close Button - Always visible at top right */}
          <button
            onClick={() => setShowGallery(false)}
            className="fixed top-4 right-4 z-[110] text-white bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors shadow-lg backdrop-blur-sm"
            aria-label="關閉相簿"
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>

          {/* Header with counter */}
          <div className="flex justify-center items-center p-6 pt-16">
            <span className="text-white/70 font-display font-semibold tracking-wider bg-white/10 px-4 py-2 rounded-full">{activeImageIndex + 1} / {pet.images.length}</span>
          </div>

          {/* Main image area */}
          <div className="flex-1 flex items-center justify-center relative px-4">
            <button
              className="absolute left-4 z-10 text-white/60 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2"
              onClick={() => setActiveImageIndex(prev => (prev > 0 ? prev - 1 : pet.images.length - 1))}
              aria-label="上一張"
            >
              <span className="material-symbols-outlined text-[36px]">chevron_left</span>
            </button>
            <img
              src={pet.images[activeImageIndex]}
              className="max-h-[60vh] max-w-[85%] rounded-[2rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] object-contain select-none animate-in zoom-in-95 duration-500"
              alt="Pet"
            />
            <button
              className="absolute right-4 z-10 text-white/60 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2"
              onClick={() => setActiveImageIndex(prev => (prev < pet.images.length - 1 ? prev + 1 : 0))}
              aria-label="下一張"
            >
              <span className="material-symbols-outlined text-[36px]">chevron_right</span>
            </button>
          </div>

          {/* Thumbnails */}
          <div className="p-6 pb-10 flex gap-4 overflow-x-auto no-scrollbar justify-center">
            {pet.images.map((img, i) => (
              <div
                key={i}
                className={`w-16 h-16 rounded-xl bg-cover bg-center cursor-pointer border-2 transition-all duration-300 shrink-0 ${activeImageIndex === i ? 'border-primary scale-110 shadow-lg shadow-primary/20 ring-4 ring-primary/10' : 'border-transparent opacity-50 hover:opacity-75'}`}
                style={{ backgroundImage: `url("${img}")` }}
                onClick={() => setActiveImageIndex(i)}
              />
            ))}
          </div>

          {/* Bottom close button for mobile */}
          <div className="pb-8 flex justify-center">
            <button
              onClick={() => setShowGallery(false)}
              className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-full transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined">close</span>
              關閉相簿
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const StatBox: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="flex flex-col gap-1.5 rounded-[1.25rem] p-6 border border-[#e7d9cf] dark:border-[#3d2c1e] bg-white dark:bg-[#2d1f14] shadow-sm items-center text-center transition-transform hover:scale-[1.02]">
    <p className="text-[#9a6c4c] dark:text-[#c0a08a] text-[11px] font-bold uppercase tracking-[0.1em]">{label}</p>
    <p className="text-xl font-bold text-[#1b130d] dark:text-white leading-none">{value}</p>
  </div>
);

const HealthTag: React.FC<{ label: string, index: number }> = ({ label, index }) => {
  const configs = [
    { bg: 'bg-green-50 dark:bg-green-900/10', text: 'text-green-600 dark:text-green-400', border: 'border-green-100 dark:border-green-900/20', icon: 'check_circle' },
    { bg: 'bg-blue-50 dark:bg-blue-900/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-900/20', icon: 'verified' },
    { bg: 'bg-purple-50 dark:bg-purple-900/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-900/20', icon: 'contactless' }
  ];
  const config = configs[index % configs.length];

  return (
    <div className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold border ${config.bg} ${config.text} ${config.border} shadow-sm transition-all hover:bg-opacity-80`}>
      <span className="material-symbols-outlined text-[18px]">{config.icon}</span>
      {label}
    </div>
  );
};

export default PetDetail;
