import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Edit3, X, Users, Settings } from 'lucide-react';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('professionals'); // 'professionals' or 'services'
  
  // State for Professionals
  const [professionals, setProfessionals] = useState([]);
  const [showProfModal, setShowProfModal] = useState(false);
  const [editingProfId, setEditingProfId] = useState(null);
  const [profForm, setProfForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'professional' });

  // State for Services
  const [services, setServices] = useState([]);
  const [showServModal, setShowServModal] = useState(false);
  const [editingServId, setEditingServId] = useState(null);
  const [servForm, setServForm] = useState({ name: '', description: '', duration: 30, price: 0 });

  useEffect(() => {
    fetchProfessionals();
    fetchServices();
  }, []);

  // --- Professionals Methods ---
  const fetchProfessionals = async () => {
    try {
      const { data } = await api.get('/professionals');
      setProfessionals(data);
    } catch (err) { console.error(err); }
  };

  const handleProfSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProfId) {
        await api.patch(`/professionals/${editingProfId}`, profForm);
      } else {
        await api.post('/professionals', profForm);
      }
      setShowProfModal(false);
      fetchProfessionals();
    } catch (err) { alert('Error al guardar profesional.'); }
  };

  const openProfModal = (prof = null) => {
    if (prof) {
      setEditingProfId(prof.id);
      setProfForm({ ...prof, password: '' }); // Don't show password
    } else {
      setEditingProfId(null);
      setProfForm({ firstName: '', lastName: '', email: '', password: '', role: 'professional' });
    }
    setShowProfModal(true);
  };

  // --- Services Methods ---
  const fetchServices = async () => {
    try {
      const { data } = await api.get('/services');
      setServices(data);
    } catch (err) { console.error(err); }
  };

  const handleServSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingServId) {
        await api.patch(`/services/${editingServId}`, servForm);
      } else {
        await api.post('/services', servForm);
      }
      setShowServModal(false);
      fetchServices();
    } catch (err) { alert('Error al guardar servicio.'); }
  };

  const openServModal = (serv = null) => {
    if (serv) {
      setEditingServId(serv.id);
      setServForm({ ...serv });
    } else {
      setEditingServId(null);
      setServForm({ name: '', description: '', duration: 30, price: 0 });
    }
    setShowServModal(true);
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Panel de Administración</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid var(--soft-gray)' }}>
        <button 
          onClick={() => setActiveTab('professionals')}
          style={{ 
            background: 'none', border: 'none', cursor: 'pointer', padding: '10px 20px', 
            borderBottom: activeTab === 'professionals' ? '3px solid var(--salmon)' : '3px solid transparent',
            fontWeight: activeTab === 'professionals' ? 'bold' : 'normal',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Users size={18} /> Profesionales
        </button>
        <button 
          onClick={() => setActiveTab('services')}
          style={{ 
            background: 'none', border: 'none', cursor: 'pointer', padding: '10px 20px', 
            borderBottom: activeTab === 'services' ? '3px solid var(--salmon)' : '3px solid transparent',
            fontWeight: activeTab === 'services' ? 'bold' : 'normal',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Settings size={18} /> Servicios
        </button>
      </div>

      {/* Content */}
      <div className="card">
        {activeTab === 'professionals' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2>Gestión de Profesionales</h2>
              <button className="btn btn-primary" onClick={() => openProfModal()}>
                <Plus size={18} /> Nuevo Profesional
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--soft-gray)' }}>
                  <th style={{ padding: '1rem' }}>Nombre</th>
                  <th style={{ padding: '1rem' }}>Email</th>
                  <th style={{ padding: '1rem' }}>Rol</th>
                  <th style={{ padding: '1rem' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {professionals.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--soft-gray)' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{p.firstName} {p.lastName}</td>
                    <td style={{ padding: '1rem' }}>{p.email}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        background: p.role === 'admin' ? 'var(--light-blue)' : 'var(--soft-gray)', 
                        padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem' 
                      }}>
                        {p.role}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button className="btn" style={{ padding: '6px', background: 'transparent' }} onClick={() => openProfModal(p)}>
                        <Edit3 size={18} color="var(--salmon)" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'services' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2>Gestión de Servicios</h2>
              <button className="btn btn-primary" onClick={() => openServModal()}>
                <Plus size={18} /> Nuevo Servicio
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--soft-gray)' }}>
                  <th style={{ padding: '1rem' }}>Servicio</th>
                  <th style={{ padding: '1rem' }}>Descripción</th>
                  <th style={{ padding: '1rem' }}>Duración (min)</th>
                  <th style={{ padding: '1rem' }}>Precio</th>
                  <th style={{ padding: '1rem' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {services.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--soft-gray)' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{s.name}</td>
                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#666' }}>{s.description}</td>
                    <td style={{ padding: '1rem' }}>{s.duration}</td>
                    <td style={{ padding: '1rem' }}>${s.price}</td>
                    <td style={{ padding: '1rem' }}>
                      <button className="btn" style={{ padding: '6px', background: 'transparent' }} onClick={() => openServModal(s)}>
                        <Edit3 size={18} color="var(--salmon)" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {/* Professional Modal */}
      {showProfModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setShowProfModal(false)} style={{ position: 'absolute', right: '15px', top: '15px', background: 'transparent', border: 'none', cursor: 'pointer' }}><X /></button>
            <h2>{editingProfId ? 'Editar Profesional' : 'Nuevo Profesional'}</h2>
            <form onSubmit={handleProfSubmit} style={{ marginTop: '1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label>Nombre</label>
                <input type="text" required className="form-control" style={{ width: '100%', padding: '8px', borderRadius:'8px', border:'1px solid #ddd'}} value={profForm.firstName} onChange={e => setProfForm({...profForm, firstName: e.target.value})} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Apellido</label>
                <input type="text" required className="form-control" style={{ width: '100%', padding: '8px', borderRadius:'8px', border:'1px solid #ddd'}} value={profForm.lastName} onChange={e => setProfForm({...profForm, lastName: e.target.value})} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Email</label>
                <input type="email" required className="form-control" style={{ width: '100%', padding: '8px', borderRadius:'8px', border:'1px solid #ddd'}} value={profForm.email} onChange={e => setProfForm({...profForm, email: e.target.value})} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Contraseña {editingProfId && '(Dejar en blanco para no cambiar)'}</label>
                <input type="password" required={!editingProfId} className="form-control" style={{ width: '100%', padding: '8px', borderRadius:'8px', border:'1px solid #ddd'}} value={profForm.password} onChange={e => setProfForm({...profForm, password: e.target.value})} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label>Rol</label>
                <select className="form-control" style={{ width: '100%', padding: '8px', borderRadius:'8px', border:'1px solid #ddd', background:'white'}} value={profForm.role} onChange={e => setProfForm({...profForm, role: e.target.value})}>
                  <option value="professional">Profesional</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Guardar</button>
            </form>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {showServModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setShowServModal(false)} style={{ position: 'absolute', right: '15px', top: '15px', background: 'transparent', border: 'none', cursor: 'pointer' }}><X /></button>
            <h2>{editingServId ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
            <form onSubmit={handleServSubmit} style={{ marginTop: '1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label>Nombre del Servicio</label>
                <input type="text" required className="form-control" style={{ width: '100%', padding: '8px', borderRadius:'8px', border:'1px solid #ddd'}} value={servForm.name} onChange={e => setServForm({...servForm, name: e.target.value})} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Descripción</label>
                <textarea className="form-control" style={{ width: '100%', padding: '8px', borderRadius:'8px', border:'1px solid #ddd'}} value={servForm.description} onChange={e => setServForm({...servForm, description: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label>Duración (min)</label>
                  <input type="number" required min="1" className="form-control" style={{ width: '100%', padding: '8px', borderRadius:'8px', border:'1px solid #ddd'}} value={servForm.duration} onChange={e => setServForm({...servForm, duration: e.target.value})} />
                </div>
                <div>
                  <label>Precio</label>
                  <input type="number" required min="0" className="form-control" style={{ width: '100%', padding: '8px', borderRadius:'8px', border:'1px solid #ddd'}} value={servForm.price} onChange={e => setServForm({...servForm, price: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Guardar</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;
