import { FormEvent, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/globals.css';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError('Falha no login. Verifique usuário e senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='login-page'>
      <div className='login-card'>
        <h1>Painel Top Burguer</h1>
        <p>Faça login para acessar o painel de pedidos.</p>
        <form onSubmit={handleSubmit}>
          <label>
            Usuário
            <input value={username} onChange={(event) => setUsername(event.target.value)} />
          </label>
          <label>
            Senha
            <input type='password' value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error && <p className='error'>{error}</p>}
          <button type='submit' disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        </form>
      </div>
    </div>
  );
}
