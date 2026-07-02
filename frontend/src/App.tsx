import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import Dashboard from './pages/Dashboard';
import Kitchen from './pages/Kitchen';
import Login from './pages/Login';

type ViewType = 'dashboard' | 'kitchen';

export default function App() {
  const { token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [view, setView] = useState<ViewType>('dashboard');

  if (!token) {
    return <Login />;
  }

  return (
    <div className={`app-shell theme-${theme}`}>
      <div className='theme-switcher'>
        <button className='btn btn-secondary' onClick={toggleTheme}>
          Tema {theme === 'dark' ? 'claro' : 'escuro'}
        </button>
      </div>
      {view === 'dashboard' ? (
        <Dashboard onOpenKitchen={() => setView('kitchen')} />
      ) : (
        <Kitchen onBack={() => setView('dashboard')} />
      )}
    </div>
  );
}
