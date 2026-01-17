
import React, { useState, useEffect } from 'react';
import { Screen, Pet } from './types';
import Home from './screens/Home';
import PetDetail from './screens/PetDetail';
import AdoptionForm from './screens/AdoptionForm';
import Chat from './screens/Chat';
import Profile from './screens/Profile';
import Favorites from './screens/Favorites';
import ChatList from './screens/ChatList';
import Landing from './screens/Landing';

// Import services
import { getPets } from './services/petService';
import { getFavoriteIds, toggleFavorite as toggleFavoriteService } from './services/favoriteService';
import { isAuthenticated, getCurrentAuthUser, signOut, AuthUser } from './services/authService';
import { MOCK_PETS } from './constants';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // null = checking
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.HOME);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useSupabase, setUseSupabase] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    async function checkAuth() {
      const authenticated = await isAuthenticated();
      setIsLoggedIn(authenticated);
      if (authenticated) {
        const user = await getCurrentAuthUser();
        setCurrentUser(user);
      }
    }
    checkAuth();
  }, []);

  // Load pets and favorites after login
  useEffect(() => {
    if (!isLoggedIn) return;

    async function loadData() {
      setIsLoading(true);
      try {
        // Try to load from Supabase
        const [petsData, favoritesData] = await Promise.all([
          getPets(),
          getFavoriteIds(),
        ]);

        // If Supabase returns data, use it
        if (petsData.length > 0) {
          setPets(petsData);
          setFavorites(favoritesData);
          setUseSupabase(true);
        } else {
          // Fallback to mock data if Supabase is not configured
          console.log('Supabase not configured or no data. Using mock data.');
          setPets(MOCK_PETS);
          setFavorites(['1', '4']);
          setUseSupabase(false);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to mock data
        setPets(MOCK_PETS);
        setFavorites(['1', '4']);
        setUseSupabase(false);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [isLoggedIn]);

  const handleLogin = async () => {
    setIsLoggedIn(true);
    const user = await getCurrentAuthUser();
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await signOut();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentScreen(Screen.HOME);
  };

  const navigateTo = (screen: Screen, pet: Pet | null = null) => {
    if (pet) setSelectedPet(pet);
    setCurrentScreen(screen);
    window.scrollTo(0, 0);
  };

  const toggleFavorite = async (id: string) => {
    if (useSupabase) {
      // Use Supabase service
      const result = await toggleFavoriteService(id);
      if (result.isFavorite) {
        setFavorites(prev => [...prev, id]);
      } else {
        setFavorites(prev => prev.filter(f => f !== id));
      }
    } else {
      // Fallback to local state
      setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
    }
  };

  // Show loading while checking auth
  if (isLoggedIn === null) {
    return (
      <div className="max-w-[480px] mx-auto min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-[#f5a623] rounded-2xl flex items-center justify-center shadow-xl">
          <span className="material-symbols-outlined text-white text-3xl">pets</span>
        </div>
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show landing/login if not authenticated
  if (!isLoggedIn) {
    return (
      <div className="max-w-[480px] mx-auto min-h-screen bg-background-light dark:bg-background-dark relative shadow-2xl overflow-x-hidden">
        <Landing onLoginSuccess={handleLogin} />
      </div>
    );
  }

  const renderScreen = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#9a6c4c] font-medium">載入中...</p>
        </div>
      );
    }

    switch (currentScreen) {
      case Screen.HOME:
        return <Home
          pets={pets}
          onSelectPet={(pet) => navigateTo(Screen.PET_DETAIL, pet)}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onNavigate={(screen) => setCurrentScreen(screen)}
          currentScreen={currentScreen}
        />;
      case Screen.FAVORITES:
        return <Favorites
          pets={pets}
          onSelectPet={(pet) => navigateTo(Screen.PET_DETAIL, pet)}
          favorites={favorites}
          onNavigate={(screen) => setCurrentScreen(screen)}
          currentScreen={currentScreen}
        />;
      case Screen.CHAT_LIST:
        return <ChatList
          pets={pets}
          onSelectChat={(pet) => navigateTo(Screen.CHAT, pet)}
          onNavigate={(screen) => setCurrentScreen(screen)}
          currentScreen={currentScreen}
        />;
      case Screen.PET_DETAIL:
        return selectedPet ? (
          <PetDetail
            pet={selectedPet}
            onBack={() => setCurrentScreen(Screen.HOME)}
            onAdopt={() => setCurrentScreen(Screen.ADOPTION_FORM)}
            onChat={() => setCurrentScreen(Screen.CHAT)}
            isFavorite={favorites.includes(selectedPet.id)}
            onToggleFavorite={() => toggleFavorite(selectedPet.id)}
          />
        ) : null;
      case Screen.ADOPTION_FORM:
        return selectedPet ? (
          <AdoptionForm
            pet={selectedPet}
            onBack={() => setCurrentScreen(Screen.PET_DETAIL)}
            onComplete={() => setCurrentScreen(Screen.PROFILE)}
          />
        ) : null;
      case Screen.CHAT:
        return selectedPet ? (
          <Chat
            pet={selectedPet}
            onBack={() => setCurrentScreen(Screen.CHAT_LIST)}
          />
        ) : null;
      case Screen.PROFILE:
        return (
          <Profile
            onBack={() => setCurrentScreen(Screen.HOME)}
            onNavigateHome={() => setCurrentScreen(Screen.HOME)}
            favorites={favorites}
            pets={pets}
            onSelectPet={(pet) => navigateTo(Screen.PET_DETAIL, pet)}
            onNavigate={(screen) => setCurrentScreen(screen)}
            currentScreen={currentScreen}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        );
      default:
        return <Home
          pets={pets}
          onSelectPet={(pet) => navigateTo(Screen.PET_DETAIL, pet)}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onNavigate={(screen) => setCurrentScreen(screen)}
          currentScreen={currentScreen}
        />;
    }
  };

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-background-light dark:bg-background-dark relative shadow-2xl overflow-x-hidden">
      {renderScreen()}
    </div>
  );
};

export default App;
