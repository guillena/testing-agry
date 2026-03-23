import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../api';
import { useAuth } from '../store/AuthContext';
import { X, Trash2 } from 'lucide-react';

const Agenda = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  
  // Dependencies for dropdowns
  const [patients, setPatients] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [professionals, setProfessionals] = useState([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '',
    benefitId: '',
    professionalId: '',
    date: '',
    startTime: '',
    endTime: '',
    notes: ''
  });

  useEffect(() => {
    fetchAppointments();
    fetchDependencies();
  }, [user.id]);

  const fetchDependencies = async () => {
    try {
      const [pts, bnts] = await Promise.all([
        api.get('/patients'),
        api.get('/benefits')
      ]);
      setPatients(pts.data);
      setBenefits(bnts.data);

      if (user.role === 'admin') {
        const profs = await api.get('/professionals');
        setProfessionals(profs.data);
      }
    } catch (err) {
      console.error('Error fetching dependencies', err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      const formattedEvents = response.data.map(app => ({
        id: app.id,
        title: `${app.Patient?.firstName} ${app.Patient?.lastName} - ${app.Benefit?.name}`,
        start: app.startTime,
        end: app.endTime,
        extendedProps: { ...app }
      }));
      setEvents(formattedEvents);
    } catch (err) {
      console.error('Error fetching appointments', err);
    }
  };

  const handleDateClick = (arg) => {
    // Determine default end time (30 mins from click)
    const startDate = arg.date;
    const endDate = new Date(startDate.getTime() + 30 * 60000);

    setEditingId(null);
    setFormData({
      patientId: patients.length > 0 ? patients[0].id : '',
      benefitId: benefits.length > 0 ? benefits[0].id : '',
      professionalId: user.role === 'admin' && professionals.length > 0 ? professionals[0].id : user.id,
      date: startDate.toISOString().split('T')[0],
      startTime: startDate.toTimeString().substring(0, 5),
      endTime: endDate.toTimeString().substring(0, 5),
      notes: ''
    });
    setShowModal(true);
  };

  const handleEventClick = (info) => {
    const app = info.event.extendedProps;
    
    // Convert UTC Date to local HTML format for inputs
    const sDate = new Date(app.startTime);
    const eDate = new Date(app.endTime);

    setEditingId(app.id);
    setFormData({
      patientId: app.patientId,
      benefitId: app.benefitId,
      professionalId: app.professionalId || user.id,
      date: sDate.toISOString().split('T')[0],
      startTime: sDate.toTimeString().substring(0, 5),
      endTime: eDate.toTimeString().substring(0, 5),
      notes: app.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Combine date and time
      const startDateTime = new Date(`${formData.date}T${formData.startTime}:00`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}:00`);

      const payload = {
        patientId: formData.patientId,
        benefitId: formData.benefitId,
        professionalId: user.role === 'admin' ? formData.professionalId : user.id,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        notes: formData.notes
      };

      if (editingId) {
        await api.patch(`/appointments/${editingId}`, payload);
      } else {
        await api.post('/appointments', payload);
      }

      setShowModal(false);
      fetchAppointments();
    } catch (err) {
      alert('Error al guardar el turno. Verifica que tengas los permisos necesarios.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este turno?')) {
      try {
        await api.delete(`/appointments/${editingId}`);
        setShowModal(false);
        fetchAppointments();
      } catch (err) {
        alert('Error al eliminar el turno.');
      }
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>{user.role === 'admin' ? 'Agenda Global' : 'Mi Agenda'}</h1>
      
      <div className="card" style={{ padding: '2rem' }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,workWeek,timeGridDay'
          }}
          views={{
            workWeek: {
              type: 'timeGridWeek',
              hiddenDays: [0, 6],
              buttonText: 'Semana Laboral'
            }
          }}
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          locale="es"
          buttonText={{ today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día' }}
          eventBackgroundColor="var(--salmon)"
          eventBorderColor="transparent"
          height="700px"
        />
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', right: '20px', top: '20px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '1.5rem' }}>{editingId ? 'Editar Turno' : 'Nuevo Turno'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Paciente</label>
                <select 
                  className="form-control" 
                  value={formData.patientId} 
                  onChange={e => setFormData({...formData, patientId: e.target.value})} 
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'white' }}
                >
                  <option value="" disabled>Seleccione un paciente</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Prestación</label>
                <select 
                  className="form-control" 
                  value={formData.benefitId} 
                  onChange={e => setFormData({...formData, benefitId: e.target.value})} 
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'white' }}
                >
                  <option value="" disabled>Seleccione una prestación</option>
                  {benefits.map(s => <option key={s.id} value={s.id}>{s.name} ({s.duration} min)</option>)}
                </select>
              </div>

              {user.role === 'admin' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Profesional Asignado</label>
                  <select 
                    className="form-control" 
                    value={formData.professionalId} 
                    onChange={e => setFormData({...formData, professionalId: e.target.value})} 
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'white' }}
                  >
                    <option value="" disabled>Seleccione profesional</option>
                    {professionals.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                  </select>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Fecha</label>
                  <input 
                    type="date" 
                    required 
                    value={formData.date} 
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Inicio</label>
                  <input 
                    type="time" 
                    required 
                    value={formData.startTime} 
                    onChange={e => setFormData({...formData, startTime: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Fin</label>
                  <input 
                    type="time" 
                    required 
                    value={formData.endTime} 
                    onChange={e => setFormData({...formData, endTime: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Notas</label>
                <textarea 
                  value={formData.notes} 
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                {editingId && (
                  <button type="button" className="btn btn-secondary" onClick={handleDelete} style={{ background: '#ff4d4f', color: 'white', borderColor: '#ff4d4f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash2 size={18} />
                  </button>
                )}
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Guardar Turno</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Agenda;
