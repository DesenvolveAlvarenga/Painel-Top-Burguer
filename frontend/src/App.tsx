import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Kitchen from './pages/Kitchen';
import Login from './pages/Login';

type ViewType = 'dashboard' | 'kitchen';

export default function App() {
  const { token } = useAuth();
  const [view, setView] = useState<ViewType>('dashboard');

  if (!token) {
    return <Login />;
  }

  return view === 'dashboard' ? (
    <Dashboard onOpenKitchen={() => setView('kitchen')} />
  ) : (
    <Kitchen onBack={() => setView('dashboard')} />
  );
}
