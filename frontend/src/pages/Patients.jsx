import React, { useState, useEffect } from 'react';
import api from '../api';
import { Search, UserPlus, Edit3, X, ArrowUpDown, ArrowUp, ArrowDown, Activity, List, Grid } from 'lucide-react';
import MessageModal from '../components/MessageModal';

const provinces = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes', 'Entre Ríos', 
  'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 
  'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
];

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [docTypes, setDocTypes] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    docNumber: '',
    email: '',
    phone: '',
    birthDate: '',
    street: '',
    number: '',
    floor: '',
    apartment: '',
    province: '',
    city: '',
    postalCode: '',
    docTypeId: '',
    isInactive: false
  });
  const [editingId, setEditingId] = useState(null);
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'card'
  const [sortConfig, setSortConfig] = useState({ key: 'firstName', direction: 'asc' });
  
  // State for Activities
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activities, setActivities] = useState([]);
  const [newActivityDesc, setNewActivityDesc] = useState('');
  
  // State for Global Messages
  const [msgModal, setMsgModal] = useState({ isOpen: false, message: '', type: 'info', onConfirm: null });

  const showMsg = (message, type = 'info', onConfirm = null) => {
    setMsgModal({ isOpen: true, message, type, onConfirm });
  };

  useEffect(() => {
    fetchPatients();
    fetchDocTypes();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      setPatients(response.data);
    } catch (err) {
      console.error('Error fetching patients', err);
    }
  };

  const fetchDocTypes = async () => {
    try {
      const response = await api.get('/patients/document-types');
      setDocTypes(response.data);
      if (response.data.length > 0) {
        setFormData(prev => ({ ...prev, docTypeId: response.data[0].id }));
      }
    } catch (err) {
      console.error('Error fetching doc types', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.patch(`/patients/${editingId}`, formData);
      } else {
        await api.post('/patients', formData);
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({
        firstName: '', lastName: '', docNumber: '', email: '', phone: '', birthDate: '', street: '', number: '', floor: '', apartment: '', province: '', city: '', postalCode: '', docTypeId: '', isInactive: false
      });
      fetchPatients();
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al guardar el paciente. Verifique los datos.';
      showMsg(msg, 'alert');
    }
  };

  const handleEdit = (patient) => {
    setFormData({
      firstName: patient.firstName,
      lastName: patient.lastName,
      docNumber: patient.docNumber,
      email: patient.email || '',
      phone: patient.phone || '',
      birthDate: patient.birthDate || '',
      street: patient.street || '',
      number: patient.number || '',
      floor: patient.floor || '',
      apartment: patient.apartment || '',
      province: patient.province || '',
      city: patient.city || '',
      postalCode: patient.postalCode || '',
      docTypeId: patient.docTypeId || (docTypes.length > 0 ? docTypes[0].id : ''),
      isInactive: patient.isInactive || false
    });
    setEditingId(patient.id);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      firstName: '', lastName: '', docNumber: '', email: '', phone: '', birthDate: '', street: '', number: '', floor: '', apartment: '', province: '', city: '', postalCode: '',
      docTypeId: docTypes.length > 0 ? docTypes[0].id : '',
      isInactive: false
    });
    setShowModal(true);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedPatients = React.useMemo(() => {
    let sortableItems = [...patients];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key] || '';
        let bValue = b[sortConfig.key] || '';
        if (sortConfig.key === 'firstName') {
          aValue = `${a.lastName}, ${a.firstName}`.toLowerCase();
          bValue = `${b.lastName}, ${b.firstName}`.toLowerCase();
        } else if (sortConfig.key === 'phone') {
          aValue = aValue.toString();
          bValue = bValue.toString();
        } else if (sortConfig.key === 'docNumber') {
          aValue = aValue.toString();
          bValue = bValue.toString();
        } else {
           aValue = aValue.toString().toLowerCase();
           bValue = bValue.toString().toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [patients, sortConfig]);

  const filteredPatients = sortedPatients.filter(p => {
    if (showOnlyActive && p.isInactive) return false;
    return `${p.lastName}, ${p.firstName} ${p.docNumber}`.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getSortIcon = (columnName) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />;
    }
    return <ArrowUpDown size={16} style={{ opacity: 0.3 }} />;
  };

  const openActivities = async (patient) => {
    setSelectedPatient(patient);
    try {
      const response = await api.get(`/activities/patient/${patient.id}`);
      setActivities(response.data);
      setShowActivitiesModal(true);
    } catch (err) {
      showMsg('Error al cargar actividades.', 'alert');
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!newActivityDesc.trim()) return;
    try {
      const response = await api.post('/activities', {
        patientId: selectedPatient.id,
        description: newActivityDesc
      });
      setActivities([response.data, ...activities]);
      setNewActivityDesc('');
    } catch (err) {
      showMsg('Error al agregar actividad.', 'alert');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Gestión de Pacientes</h1>
        <button 
          className="btn btn-primary" 
          onClick={openCreateModal}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <UserPlus size={20} />
          Nuevo Paciente
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button 
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', right: '20px', top: '20px', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '1.5rem' }}>{editingId ? 'Editar Paciente' : 'Nuevo Paciente'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Primer Apellido</label>
                  <input 
                    type="text" 
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                    value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Nombre</label>
                  <input 
                    type="text" 
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Tipo Doc</label>
                  <select 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'white' }}
                    value={formData.docTypeId}
                    onChange={e => setFormData({...formData, docTypeId: e.target.value})}
                    required
                  >
                    <option value="" disabled>Seleccione...</option>
                    {docTypes && docTypes.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>DNI (8 dígitos)</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej: 12345678"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                    value={formData.docNumber}
                    onChange={e => setFormData({...formData, docNumber: e.target.value})}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Email (Opcional)</label>
                <input 
                  type="email" 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Teléfono</label>
                  <input 
                    type="text" 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Fecha de Nac. (Opcional)</label>
                  <input 
                    type="date" 
                    max={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                    value={formData.birthDate || ''}
                    onChange={e => setFormData({...formData, birthDate: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                <h3 style={{ fontSize: '0.95rem', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px', marginBottom: '12px', color: '#555' }}>Dirección (Opcional)</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '70% 30%', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: '#666' }}>Calle</label>
                    <input type="text" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }} value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: '#666' }}>Nro</label>
                    <input type="text" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }} value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: '#666' }}>Piso</label>
                    <input type="text" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }} value={formData.floor} onChange={e => setFormData({...formData, floor: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: '#666' }}>Dto</label>
                    <input type="text" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }} value={formData.apartment} onChange={e => setFormData({...formData, apartment: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: '#666' }}>Provincia</label>
                    <select style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: 'white' }} value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})}>
                      <option value="">Seleccione...</option>
                      {provinces.map(prov => <option key={prov} value={prov}>{prov}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: '#666' }}>Ciudad</label>
                    <input type="text" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }} value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: '#666' }}>C. Postal</label>
                    <input type="text" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }} value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer', backgroundColor: '#fdfdfd', padding: '10px', borderRadius: '8px', border: '1px solid #eee' }}>
                  <input 
                    type="checkbox"
                    checked={formData.isInactive}
                    onChange={e => setFormData({...formData, isInactive: e.target.checked})}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Deshabilitar Paciente (Inactivo)</span>
                </label>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Guardar Paciente</button>
            </form>
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '12px', color: '#888' }} size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o DNI..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '12px 12px 12px 40px', 
              borderRadius: '8px', 
              border: '1px solid #ddd' 
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingLeft: '4px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', cursor: 'pointer', color: '#555' }}>
            <input 
              type="checkbox"
              checked={showOnlyActive}
              onChange={e => setShowOnlyActive(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            Mostrar solo pacientes activos
          </label>

          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#eee', borderRadius: '8px', padding: '4px' }}>
            <button
              onClick={() => setViewMode('list')}
              style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', border: 'none', background: viewMode === 'list' ? 'white' : 'transparent', borderRadius: '6px', cursor: 'pointer', boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', color: viewMode === 'list' ? '#333' : '#777', transition: 'all 0.2s' }}
            >
              <List size={18} /> Lista
            </button>
            <button
              onClick={() => setViewMode('card')}
              style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', border: 'none', background: viewMode === 'card' ? 'white' : 'transparent', borderRadius: '6px', cursor: 'pointer', boxShadow: viewMode === 'card' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', color: viewMode === 'card' ? '#333' : '#777', transition: 'all 0.2s' }}
            >
              <Grid size={18} /> Tarjetas
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--soft-gray)' }}>
              <th style={{ padding: '1rem', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => handleSort('firstName')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Paciente {getSortIcon('firstName')}</div>
              </th>
              <th style={{ padding: '1rem', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => handleSort('docNumber')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>DNI {getSortIcon('docNumber')}</div>
              </th>
              <th style={{ padding: '1rem', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => handleSort('phone')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Contacto {getSortIcon('phone')}</div>
              </th>
              <th style={{ padding: '1rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length > 0 ? filteredPatients.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--soft-gray)', transition: 'background 0.2s' }}>
                <td style={{ padding: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {p.lastName}, {p.firstName}
                  {p.isInactive && <span style={{ fontSize: '0.7rem', backgroundColor: '#fee2e2', color: '#ef4444', padding: '2px 6px', borderRadius: '4px', border: '1px solid #fca5a5' }}>INACTIVO</span>}
                </td>
                <td style={{ padding: '1rem' }}>{p.docNumber}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '0.85rem' }}>{p.phone || 'Sin teléfono'}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{p.email || 'Sin email'}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn" style={{ padding: '6px', background: 'transparent' }} onClick={() => handleEdit(p)} title="Editar Paciente">
                      <Edit3 size={18} color="var(--salmon)" />
                    </button>
                    <button className="btn" style={{ padding: '6px', background: 'transparent' }} onClick={() => openActivities(p)} title="Actividades">
                      <Activity size={18} color="var(--light-blue)" />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>No se encontraron pacientes.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {filteredPatients.length > 0 ? filteredPatients.map(p => (
            <div key={p.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', position: 'relative', border: '1px solid #eaeaea', borderRadius: '12px' }}>
              {p.isInactive && (
                <span style={{ position: 'absolute', top: '15px', right: '15px', fontSize: '0.7rem', backgroundColor: '#fee2e2', color: '#ef4444', padding: '4px 8px', borderRadius: '6px', border: '1px solid #fca5a5', fontWeight: 'bold' }}>
                  INACTIVO
                </span>
              )}
              <h3 style={{ margin: '0 0 1rem 0', paddingRight: '60px', color: 'var(--dark-text)' }}>{p.lastName}, {p.firstName}</h3>
              
              <div style={{ marginBottom: '1.2rem', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#555', fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: 'bold', minWidth: '70px', color: '#444' }}>DNI:</span> {p.docNumber}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#555', fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: 'bold', minWidth: '70px', color: '#444' }}>Teléfono:</span> {p.phone || 'N/A'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#555', fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: 'bold', minWidth: '70px', color: '#444' }}>Email:</span> {p.email || 'N/A'}
                </div>
                {(p.city || p.province || p.street) && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#555', fontSize: '0.9rem' }}>
                    <span style={{ fontWeight: 'bold', minWidth: '70px', color: '#444' }}>Ciudad:</span> {p.city || p.province || p.street}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #eee', paddingTop: '1rem', marginTop: 'auto' }}>
                <button className="btn" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '8px', border: '1px solid #eee', background: '#fcfcfc', color: '#555' }} onClick={() => handleEdit(p)}>
                  <Edit3 size={16} color="var(--salmon)" /> Editar
                </button>
                <button className="btn" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '8px', border: '1px solid #eee', background: '#fcfcfc', color: '#555' }} onClick={() => openActivities(p)}>
                  <Activity size={16} color="var(--light-blue)" /> Historial
                </button>
              </div>
            </div>
          )) : (
            <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: '#888', background: 'white', border: '1px solid #eee', borderRadius: '12px' }}>
              No se encontraron pacientes.
            </div>
          )}
        </div>
      )}

      {/* Activities Modal */}
      {showActivitiesModal && selectedPatient && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', position: 'relative', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <button 
              onClick={() => { setShowActivitiesModal(false); setSelectedPatient(null); setNewActivityDesc(''); }}
              style={{ position: 'absolute', right: '20px', top: '20px', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '1.5rem', paddingRight: '30px' }}>Actividades - {selectedPatient.lastName}, {selectedPatient.firstName}</h2>
            
            {/* Activities List */}
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '10px' }}>
              {activities.length > 0 ? activities.map(act => (
                <div key={act.id} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '1rem', backgroundColor: '#fdfdfd' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', color: '#666' }}>
                    <strong>{act.Professional ? `${act.Professional.firstName} ${act.Professional.lastName}` : 'Profesional'}</strong>
                    <span>{new Date(act.date).toLocaleString()}</span>
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap', color: 'var(--dark-text)' }}>{act.description}</div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>No hay actividades registradas.</div>
              )}
            </div>

            {/* Add Activity Form */}
            <form onSubmit={handleAddActivity} style={{ borderTop: '2px solid var(--soft-gray)', paddingTop: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 'bold' }}>Nueva Actividad</label>
                <textarea 
                  required
                  rows="3"
                  placeholder="Ej: Se atendió el día de hoy, evolución favorable..."
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', resize: 'vertical' }}
                  value={newActivityDesc}
                  onChange={e => setNewActivityDesc(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', color: 'var(--dark-text)' }}>Agregar Actividad</button>
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

export default Patients;
