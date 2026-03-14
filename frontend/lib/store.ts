import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStore {
  token: string | null;
  user: any | null;
  isLoggedIn: boolean;
  login: (token: string, user: any) => void;
  logout: () => void;
  setUser: (user: any) => void;
}

interface ThemeStore {
  theme: 'dark';
  // No toggleTheme or setTheme needed for single theme
}
export const useThemeStore = create<ThemeStore>()(
  persist(
    () => ({
      theme: 'dark',
    }),
    {
      name: 'theme-storage',
    }
  )
);

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoggedIn: false,
      login: (token: string, user: any) => {
        console.log('🔐 Auth store login called:', { token: token.substr(0, 20) + '...', email: user?.email });
        set({ token, user, isLoggedIn: true });
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
        }
      },
      logout: () => {
        console.log('🚪 Auth store logout called');
        set({ token: null, user: null, isLoggedIn: false });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      },
      setUser: (user: any) => {
        console.log('👤 Auth store setUser called:', user?.email);
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
