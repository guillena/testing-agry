import React, { useState, useEffect } from 'react';
import api from '../api';
import { Search, UserPlus, Edit3, X } from 'lucide-react';

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
    whatsapp: '',
    address: '',
    docTypeId: ''
  });
  const [editingId, setEditingId] = useState(null);

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
        firstName: '', lastName: '', docNumber: '', email: '', phone: '', whatsapp: '', address: '', docTypeId: ''
      });
      fetchPatients();
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al guardar el paciente. Verifique los datos.';
      alert(`Error: ${msg}`);
    }
  };

  const handleEdit = (patient) => {
    setFormData({
      firstName: patient.firstName,
      lastName: patient.lastName,
      docNumber: patient.docNumber,
      email: patient.email || '',
      phone: patient.phone || '',
      whatsapp: patient.whatsapp || '',
      address: patient.address || '',
      docTypeId: patient.docTypeId || (docTypes.length > 0 ? docTypes[0].id : '')
    });
    setEditingId(patient.id);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      firstName: '', lastName: '', docNumber: '', email: '', phone: '', whatsapp: '', address: '', 
      docTypeId: docTypes.length > 0 ? docTypes[0].id : ''
    });
    setShowModal(true);
  };

  const filteredPatients = patients.filter(p => 
    `${p.firstName} ${p.lastName} ${p.docNumber}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="card" style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
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
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Nombre</label>
                  <input 
                    type="text" 
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Apellido</label>
                  <input 
                    type="text" 
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                    value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
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
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>WhatsApp (Opcional)</label>
                  <input 
                    type="text" 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                    value={formData.whatsapp}
                    onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Guardar Paciente</button>
              </div>
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
      </div>

      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--soft-gray)' }}>
              <th style={{ padding: '1rem' }}>Paciente</th>
              <th style={{ padding: '1rem' }}>DNI</th>
              <th style={{ padding: '1rem' }}>Contacto</th>
              <th style={{ padding: '1rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length > 0 ? filteredPatients.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--soft-gray)', transition: 'background 0.2s' }}>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{p.firstName} {p.lastName}</td>
                <td style={{ padding: '1rem' }}>{p.docNumber}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '0.85rem' }}>{p.phone || 'Sin teléfono'}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{p.email || 'Sin email'}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <button className="btn" style={{ padding: '6px', background: 'transparent' }} onClick={() => handleEdit(p)}>
                    <Edit3 size={18} color="var(--salmon)" />
                  </button>
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
    </div>
  );
};

export default Patients;
