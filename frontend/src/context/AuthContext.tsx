import { createContext, useContext, useState, ReactNode } from 'react';
import api from '../api/axios';

interface AuthContextProps {
  token: string | null;
  username: string;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  token: null,
  username: '',
  login: async () => {},
  logout: () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [username, setUsername] = useState<string>(() => localStorage.getItem('username') || '');

  const login = async (usernameValue: string, password: string) => {
    const response = await api.post('/auth/login', { username: usernameValue, password });
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('username', usernameValue);
    setToken(response.data.token);
    setUsername(usernameValue);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUsername('');
  };

  return (
    <AuthContext.Provider value={{ token, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
