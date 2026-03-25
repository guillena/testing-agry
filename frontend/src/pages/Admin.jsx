import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import { Plus, Edit3, Trash2, X, Users, Settings, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import MessageModal from '../components/MessageModal';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('professionals'); // 'professionals' or 'benefits'
  
  // State for Professionals
  const [professionals, setProfessionals] = useState([]);
  const [showProfModal, setShowProfModal] = useState(false);
  const [editingProfId, setEditingProfId] = useState(null);
  const [profForm, setProfForm] = useState({ firstName: '', lastName: '', username: '', password: '', role: 'professional', benefitIds: [] });
  const [profSortConfig, setProfSortConfig] = useState({ key: 'firstName', direction: 'asc' });

  // State for Benefits (Prestaciones)
  const [benefits, setBenefits] = useState([]);
  const [showServModal, setShowServModal] = useState(false);
  const [editingServId, setEditingServId] = useState(null);
  const [servForm, setServForm] = useState({ name: '', description: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [showPassword, setShowPassword] = useState(false);
  
  // State for Global Messages
  const [msgModal, setMsgModal] = useState({ isOpen: false, message: '', type: 'info', onConfirm: null });

  const showMsg = (message, type = 'info', onConfirm = null) => {
    setMsgModal({ isOpen: true, message, type, onConfirm });
  };

  useEffect(() => {
    fetchProfessionals();
    fetchBenefits();
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
    } catch (err) { 
      const msg = err.response?.data?.error || 'Error al guardar profesional.';
      showMsg(msg, 'alert'); 
    }
  };

  const openProfModal = (prof = null) => {
    if (prof) {
      setEditingProfId(prof.id);
      setProfForm({ 
        firstName: prof.firstName, 
        lastName: prof.lastName, 
        username: prof.username, 
        role: prof.role,
        benefitIds: prof.Benefits ? prof.Benefits.map(b => b.id) : [],
        password: '' 
      });
    } else {
      setEditingProfId(null);
      setProfForm({ firstName: '', lastName: '', username: '', password: '', role: 'professional', benefitIds: [] });
    }
    setShowPassword(false);
    setShowProfModal(true);
  };

  const handleProfSort = (key) => {
    let direction = 'asc';
    if (profSortConfig.key === key && profSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setProfSortConfig({ key, direction });
  };

  const sortedProfessionals = useMemo(() => {
    const sortableItems = [...professionals];
    if (profSortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[profSortConfig.key];
        let bValue = b[profSortConfig.key];
        
        if (profSortConfig.key === 'firstName') {
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
        } else if (profSortConfig.key === 'username' || profSortConfig.key === 'role') {
          aValue = aValue ? aValue.toLowerCase() : '';
          bValue = bValue ? bValue.toLowerCase() : '';
        }

        if (aValue < bValue) {
          return profSortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return profSortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [professionals, profSortConfig]);

  // --- Benefits Methods ---
  const fetchBenefits = async () => {
    try {
      const { data } = await api.get('/benefits');
      setBenefits(data);
    } catch (err) { console.error(err); }
  };

  const handleServSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingServId) {
        await api.patch(`/benefits/${editingServId}`, servForm);
      } else {
        await api.post('/benefits', servForm);
      }
      setShowServModal(false);
      fetchBenefits();
    } catch (err) { 
      showMsg('Error al guardar prestación.', 'alert'); 
    }
  };

  const openServModal = (serv = null) => {
    if (serv) {
      setEditingServId(serv.id);
      setServForm({ ...serv });
    } else {
      setEditingServId(null);
      setServForm({ name: '', description: '' });
    }
    setShowServModal(true);
  };

  const handleServDelete = async (id) => {
    showMsg(
      '¿Estás seguro de que quieres eliminar esta prestación? Se eliminarán también todas las citas asociadas.', 
      'info', 
      async () => {
        try {
          await api.delete(`/benefits/${id}`);
          fetchBenefits(); // Just refresh without showing success modal
        } catch (err) {
          if (err.response?.status === 400) {
            const errorData = err.response.data.error;
            showMsg(errorData, 'alert');
          } else {
            showMsg('Lo sentimos, ha ocurrido un sistema en el servidor al intentar eliminar la prestación.', 'alert');
          }
        }
      }
    );
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedBenefits = useMemo(() => {
    const sortableItems = [...benefits];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [benefits, sortConfig]);

  const toggleBenefitSelection = (id) => {
    const currentIds = [...profForm.benefitIds];
    const index = currentIds.indexOf(id);
    if (index === -1) {
      currentIds.push(id);
    } else {
      currentIds.splice(index, 1);
    }
    setProfForm({ ...profForm, benefitIds: currentIds });
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
          onClick={() => setActiveTab('benefits')}
          style={{ 
            background: 'none', border: 'none', cursor: 'pointer', padding: '10px 20px', 
            borderBottom: activeTab === 'benefits' ? '3px solid var(--salmon)' : '3px solid transparent',
            fontWeight: activeTab === 'benefits' ? 'bold' : 'normal',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Settings size={18} /> Prestaciones
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
                  <th style={{ padding: '1rem', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleProfSort('firstName')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Nombre {profSortConfig.key === 'firstName' && (profSortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                  <th style={{ padding: '1rem', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleProfSort('username')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Usuario {profSortConfig.key === 'username' && (profSortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                  <th style={{ padding: '1rem' }}>Prestaciones</th>
                  <th style={{ padding: '1rem', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleProfSort('role')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Rol {profSortConfig.key === 'role' && (profSortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                  <th style={{ padding: '1rem' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sortedProfessionals.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--soft-gray)' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{p.firstName} {p.lastName}</td>
                    <td style={{ padding: '1rem' }}>{p.username}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {p.Benefits && p.Benefits.map(b => (
                          <span key={b.id} style={{ background: '#e3f2fd', color: '#1976d2', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                            {b.name}
                          </span>
                        ))}
                      </div>
                    </td>
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

        {activeTab === 'benefits' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2>Gestión de Prestaciones</h2>
              <button className="btn btn-primary" onClick={() => openServModal()}>
                <Plus size={18} /> Nueva Prestación
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--soft-gray)' }}>
                  {[
                    { label: 'Prestación', key: 'name' },
                    { label: 'Descripción', key: 'description' }
                  ].map(header => (
                    <th 
                      key={header.key} 
                      style={{ padding: '1rem', cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort(header.key)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {header.label}
                        {sortConfig.key === header.key ? (
                          sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : null}
                      </div>
                    </th>
                  ))}
                  <th style={{ padding: '1rem' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sortedBenefits.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--soft-gray)' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{s.name}</td>
                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#666' }}>{s.description}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn" style={{ padding: '6px', background: 'transparent' }} onClick={() => openServModal(s)}>
                          <Edit3 size={18} color="var(--salmon)" />
                        </button>
                        <button className="btn" style={{ padding: '6px', background: 'transparent' }} onClick={() => handleServDelete(s.id)}>
                          <Trash2 size={18} color="#e74c3c" />
                        </button>
                      </div>
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
          <div className="card" style={{ width: '100%', maxWidth: '500px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowProfModal(false)} style={{ position: 'absolute', right: '15px', top: '15px', background: 'transparent', border: 'none', cursor: 'pointer' }}><X /></button>
            <h2>{editingProfId ? 'Editar Profesional' : 'Nuevo Profesional'}</h2>
            <form onSubmit={handleProfSubmit} style={{ marginTop: '1rem' }} autoComplete="off">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label>Nombre</label>
                  <input type="text" required className="form-control" style={{ width: '100%', padding: '8px', borderRadius:'8px', border:'1px solid #ddd'}} value={profForm.firstName} onChange={e => setProfForm({...profForm, firstName: e.target.value})} />
                </div>
                <div>
                  <label>Apellido</label>
                  <input type="text" required className="form-control" style={{ width: '100%', padding: '8px', borderRadius:'8px', border:'1px solid #ddd'}} value={profForm.lastName} onChange={e => setProfForm({...profForm, lastName: e.target.value})} />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Usuario</label>
                <input type="text" autoComplete="none" required className="form-control" style={{ width: '100%', padding: '8px', borderRadius:'8px', border:'1px solid #ddd'}} value={profForm.username} onChange={e => setProfForm({...profForm, username: e.target.value})} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Contraseña {editingProfId && '(Dejar en blanco para no cambiar)'}</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    autoComplete="new-password"
                    required={!editingProfId} 
                    className="form-control" 
                    style={{ width: '100%', padding: '8px', paddingRight: '40px', borderRadius:'8px', border:'1px solid #ddd'}} 
                    value={profForm.password} 
                    onChange={e => setProfForm({...profForm, password: e.target.value})} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#666',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Rol</label>
                <select className="form-control" style={{ width: '100%', padding: '8px', borderRadius:'8px', border:'1px solid #ddd', background:'white'}} value={profForm.role} onChange={e => setProfForm({...profForm, role: e.target.value})}>
                  <option value="professional">Profesional</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Prestaciones que brinda</label>
                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '8px', padding: '10px' }}>
                  {benefits.map(b => (
                    <label key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={profForm.benefitIds.includes(b.id)} 
                        onChange={() => toggleBenefitSelection(b.id)} 
                      />
                      <span style={{ fontSize: '0.9rem' }}>{b.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Guardar</button>
            </form>
          </div>
        </div>
      )}

      {/* Benefit Modal */}
      {showServModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setShowServModal(false)} style={{ position: 'absolute', right: '15px', top: '15px', background: 'transparent', border: 'none', cursor: 'pointer' }}><X /></button>
            <h2>{editingServId ? 'Editar Prestación' : 'Nueva Prestación'}</h2>
            <form onSubmit={handleServSubmit} style={{ marginTop: '1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label>Nombre de la Prestación</label>
                <input type="text" required className="form-control" style={{ width: '100%', padding: '8px', borderRadius:'8px', border:'1px solid #ddd'}} value={servForm.name} onChange={e => setServForm({...servForm, name: e.target.value})} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label>Descripción</label>
                <textarea className="form-control" style={{ width: '100%', padding: '8px', borderRadius:'8px', border:'1px solid #ddd'}} value={servForm.description} onChange={e => setServForm({...servForm, description: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Guardar</button>
            </form>
          </div>
        </div>
      )}

      {/* Message Modal */}
      <MessageModal 
        isOpen={msgModal.isOpen}
        message={msgModal.message}
        type={msgModal.type}
        onCancel={msgModal.onConfirm ? () => setMsgModal({ ...msgModal, isOpen: false }) : null}
        onClose={() => {
          if (msgModal.onConfirm) msgModal.onConfirm();
          setMsgModal({ ...msgModal, isOpen: false, onConfirm: null });
        }}
      />

    </div>
  );
};

export default Admin;
