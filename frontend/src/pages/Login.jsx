import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/Logokume.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Credenciales inválidas. Por favor intente de nuevo.');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--light-blue) 0%, var(--white) 100%)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src={logo} alt="Kümespacio Logo" style={{ maxWidth: '200px', marginBottom: '0.5rem' }} />
          <p>Portal de Gestión</p>
        </div>

        {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="username" style={{ display: 'block', marginBottom: '0.5rem' }}>Usuario</label>
            <input 
              id="username"
              name="username"
              type="text" 
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
          </div>
          <div style={{ marginBottom: '2rem' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem' }}>Contraseña</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'} 
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '12px', paddingRight: '45px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <LogIn size={20} />
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
