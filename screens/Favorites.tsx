
import React from 'react';
import { Pet, Screen } from '../types';
import BottomNav from '../components/BottomNav';

interface FavoritesProps {
  pets: Pet[];
  onSelectPet: (pet: Pet) => void;
  favorites: string[];
  onNavigate: (screen: Screen) => void;
  currentScreen: Screen;
}

const Favorites: React.FC<FavoritesProps> = ({ pets, onSelectPet, favorites, onNavigate, currentScreen }) => {
  const favoritePets = pets.filter(p => favorites.includes(p.id));

  return (
    <div className="pb-24 min-h-screen bg-background-light dark:bg-background-dark">
      <div className="p-4 pt-8">
        <h1 className="text-3xl font-bold tracking-tight">我的收藏</h1>
        <p className="text-[#9a6c4c] dark:text-primary/70 text-sm mt-1">共有 {favoritePets.length} 個心動對象</p>
      </div>

      {favoritePets.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 px-4 mt-4">
          {favoritePets.map(pet => (
            <div
              key={pet.id}
              onClick={() => onSelectPet(pet)}
              className="flex gap-4 bg-white dark:bg-white/5 p-3 rounded-2xl shadow-sm border border-primary/5 hover:border-primary/20 transition-all cursor-pointer"
            >
              <div
                className="size-24 rounded-xl bg-cover bg-center shrink-0"
                style={{ backgroundImage: `url("${pet.images[0]}")` }}
              />
              <div className="flex flex-col justify-center flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">{pet.name}</h3>
                  <span className="material-symbols-outlined text-primary fill-1">favorite</span>
                </div>
                <p className="text-[#9a6c4c] dark:text-primary/70 text-sm font-medium">{pet.breed} • {pet.age}</p>
                <div className="flex items-center gap-1 mt-2 text-primary">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  <span className="text-xs font-bold">{pet.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
          <div className="bg-primary/10 p-6 rounded-full mb-4">
            <span className="material-symbols-outlined text-5xl text-primary/50">heart_broken</span>
          </div>
          <h3 className="text-xl font-bold">還沒有收藏唷</h3>
          <p className="text-[#9a6c4c] mt-2 text-sm leading-relaxed">
            去探索看看，遇到喜歡的寵物點擊愛心收藏，之後就能在這裡找到他們！
          </p>
          <button
            onClick={() => onNavigate(Screen.HOME)}
            className="mt-6 bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-primary/20"
          >
            去探索
          </button>
        </div>
      )}

      <BottomNav currentScreen={currentScreen} onNavigate={onNavigate} />
    </div>
  );
};

export default Favorites;
