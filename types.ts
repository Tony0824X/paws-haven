
export enum Screen {
  HOME = 'home',
  FAVORITES = 'favorites',
  CHAT_LIST = 'chat_list',
  PET_DETAIL = 'pet_detail',
  ADOPTION_FORM = 'adoption_form',
  CHAT = 'chat',
  PROFILE = 'profile',
  ADMIN_DASHBOARD = 'admin_dashboard'
}

export interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'rabbit' | 'bird';
  breed: string;
  age: string;
  gender: '公' | '母' | '未知';
  weight: string;
  location: string;
  description: string[];
  images: string[];
  healthStatus: string[];
  isFeatured?: boolean;
  isNew?: boolean;
  traits?: string[];
  status?: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'volunteer';
  text: string;
  timestamp: string;
  image?: string;
}

export interface Application {
  id: string;
  petName: string;
  petBreed: string;
  status: '審核中' | '已通過' | '未通過';
  petId?: string;
  userId?: string;
  createdAt?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  badge: string;
  role: 'user' | 'admin';
}

export interface ChatSession {
  id: string;
  pet: Pet;
  volunteerName: string;
  lastMessageAt: string;
  lastMessage?: string;
}

export interface ApplicationFormData {
  name: string;
  phone: string;
  email: string;
  job: string;
  experience: string;
  environment: string;
  companionTime: string;
  reason: string;
  commitment: boolean;
  followup: boolean;
}
