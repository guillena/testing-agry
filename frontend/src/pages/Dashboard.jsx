import React, { useState, useEffect } from 'react';
import { useAuth } from '../store/AuthContext';
import { Calendar as CalendarIcon, Users, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    todayCount: 0,
    totalPatients: 0,
    nextAppointments: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ptsRes, apptsRes] = await Promise.all([
          api.get('/patients'),
          api.get('/appointments')
        ]);

        const patients = ptsRes.data;
        const appointments = apptsRes.data;

        const now = new Date();
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        let todayCount = 0;
        let upcoming = [];

        appointments.forEach(app => {
          const apptDate = new Date(app.startTime);
          
          if (apptDate >= todayStart && apptDate <= todayEnd) {
            todayCount++;
          }
          if (apptDate >= now) {
            upcoming.push(app);
          }
        });

        upcoming.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        
        setStats({
          todayCount,
          totalPatients: patients.length,
          nextAppointments: upcoming.slice(0, 3)
        });
        setLoading(false);

      } catch (err) {
        console.error('Error fetching dashboard data', err);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (targetDate.getTime() === today.getTime()) {
      return 'Hoy';
    } else if (targetDate.getTime() === tomorrow.getTime()) {
      return 'Mañana';
    } else {
      const day = String(date.getDate()).padStart(2, '0');
      const month = date.toLocaleString('es-ES', { month: 'short' }).slice(0, 3);
      return `${day} ${month}`;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: '5px solid #e0e0e0', /* slightly darker gray for contrast */
          borderTop: '5px solid var(--salmon)', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }} />
        <p style={{ marginTop: '1rem', fontWeight: 'bold', color: 'var(--dark-text)' }}>Cargando...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>
          Hola, {user?.firstName} 👋
        </h1>
        <p style={{ opacity: 0.7, fontSize: '1.2rem' }}>
          Bienvenido al portal de gestión de Kümespacio.
        </p>
      </header>

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        <div className="card" style={{ borderLeft: '6px solid var(--salmon)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '4px' }}>Turnos para hoy</p>
              <h3 style={{ fontSize: '2rem' }}>{stats.todayCount}</h3>
            </div>
            <div style={{ background: 'var(--soft-gray)', padding: '12px', borderRadius: '12px' }}>
              <CalendarIcon color="var(--salmon)" />
            </div>
          </div>
        </div>

        <div className="card" style={{ borderLeft: '6px solid var(--light-blue)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '4px' }}>Pacientes Activos</p>
              <h3 style={{ fontSize: '2rem' }}>{stats.totalPatients}</h3>
            </div>
            <div style={{ background: 'var(--soft-gray)', padding: '12px', borderRadius: '12px' }}>
              <Users color="var(--light-blue)" />
            </div>
          </div>
        </div>

        <div className="card" style={{ borderLeft: '6px solid var(--turquoise)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '4px' }}>Horas esta semana</p>
              <h3 style={{ fontSize: '2rem' }}>--</h3>
            </div>
            <div style={{ background: 'var(--soft-gray)', padding: '12px', borderRadius: '12px' }}>
              <Clock color="var(--turquoise)" />
            </div>
          </div>
        </div>
      </div>

      {/* Recently Viewed / Next Appointments */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3>Próximos Turnos</h3>
            <button 
              className="btn" 
              style={{ background: 'transparent', color: 'var(--salmon)' }}
              onClick={() => navigate('/agenda')}
            >
              Ver todos <ArrowRight size={16} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stats.nextAppointments.length > 0 ? stats.nextAppointments.map((app) => (
              <div key={app.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '12px', 
                borderRadius: '12px',
                background: 'var(--soft-gray)'
              }}>
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  background: 'white', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginRight: '1rem',
                  fontWeight: 'bold',
                  color: 'var(--salmon)'
                }}>
                  {new Date(app.startTime).getHours()}:{String(new Date(app.startTime).getMinutes()).padStart(2, '0')}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '600' }}>{app.Patient?.firstName} {app.Patient?.lastName}</p>
                  <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>{app.Benefit?.name}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: '600' }}>{formatDate(app.startTime)}</p>
                  {user.role === 'admin' ? (
                    <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Prof: {app.Professional?.firstName}</p>
                  ) : (
                    <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>{new Date(app.startTime).getHours()}:{String(new Date(app.startTime).getMinutes()).padStart(2, '0')}hs</p>
                  )}
                </div>
              </div>
            )) : (
              <p style={{ opacity: 0.6, textAlign: 'center', padding: '1rem' }}>No hay próximos turnos.</p>
            )}
          </div>
        </div>

        <div className="card" style={{ background: 'var(--yellow)', color: 'var(--dark-text)' }}>
          <h3>Aviso Importante</h3>
          <p style={{ marginTop: '1rem' }}>
            Recuerda completar las historias clínicas antes de finalizar tu jornada.
          </p>
          <button className="btn" style={{ background: 'white', marginTop: '1.5rem' }}>
            Ir a Pendientes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
