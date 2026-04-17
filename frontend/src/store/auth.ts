import { create } from 'zustand';
import { authApi } from '@/lib/api';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('ennlabel_token') : null,
  isLoading: true,

  login: async (email: string, password: string) => {
    const { data } = await authApi.login(email, password);
    localStorage.setItem('ennlabel_token', data.token);
    set({ user: data.user, token: data.token });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem('ennlabel_token');
      set({ user: null, token: null });
    }
  },

  fetchUser: async () => {
    try {
      const { data } = await authApi.me();
      set({ user: data.user, isLoading: false });
    } catch {
      localStorage.removeItem('ennlabel_token');
      set({ user: null, token: null, isLoading: false });
    }
  },

  setToken: (token: string) => {
    localStorage.setItem('ennlabel_token', token);
    set({ token });
  },
}));
