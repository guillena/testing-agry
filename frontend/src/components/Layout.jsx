import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { 
  Calendar, 
  Users, 
  LayoutDashboard, 
  Settings, 
  LogOut,
  Flower2
} from 'lucide-react';
import logo from '../assets/Logokume.png';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside className="sidebar" style={{ 
        width: '260px', 
        padding: '2rem 1rem', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh'
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '4px',
          marginBottom: '3rem',
          padding: '0 1rem'
        }}>
          <img src={logo} alt="Kümespacio Logo" style={{ maxWidth: '180px' }} />
          <span style={{ color: 'red', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Development</span>
        </div>

        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none' }}>
            <li>
              <NavLink to="/" style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 1rem',
                borderRadius: '12px',
                textDecoration: 'none',
                color: isActive ? 'var(--white)' : 'var(--dark-text)',
                backgroundColor: isActive ? 'var(--salmon)' : 'transparent',
                marginBottom: '8px',
                fontWeight: '600'
              })}>
                <LayoutDashboard size={20} />
                Inicio
              </NavLink>
            </li>
            <li>
              <NavLink to="/agenda" style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 1rem',
                borderRadius: '12px',
                textDecoration: 'none',
                color: isActive ? 'var(--white)' : 'var(--dark-text)',
                backgroundColor: isActive ? 'var(--salmon)' : 'transparent',
                marginBottom: '8px',
                fontWeight: '600'
              })}>
                <Calendar size={20} />
                Mi Agenda
              </NavLink>
            </li>
            <li>
              <NavLink to="/patients" style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 1rem',
                borderRadius: '12px',
                textDecoration: 'none',
                color: isActive ? 'var(--white)' : 'var(--dark-text)',
                backgroundColor: isActive ? 'var(--salmon)' : 'transparent',
                marginBottom: '8px',
                fontWeight: '600'
              })}>
                <Users size={20} />
                Pacientes
              </NavLink>
            </li>
            {user?.role === 'admin' && (
              <li>
                <NavLink to="/admin" style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 1rem',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: isActive ? 'var(--white)' : 'var(--dark-text)',
                  backgroundColor: isActive ? 'var(--salmon)' : 'transparent',
                  marginBottom: '8px',
                  fontWeight: '600'
                })}>
                  <Settings size={20} />
                  Administración
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ marginBottom: '1rem', padding: '0 0.5rem' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{user?.firstName} {user?.lastName}</p>
            <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>{user?.role === 'admin' ? 'Administrador' : 'Profesional'}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="btn"
            style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: '10px 1rem',
              color: '#e74c3c',
              background: 'transparent',
              justifyContent: 'flex-start'
            }}
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: '260px', padding: '2rem' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
