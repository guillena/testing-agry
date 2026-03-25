import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const MessageModal = ({ isOpen, message, type = 'info', onClose, onCancel }) => {
  if (!isOpen) return null;

  const getStyle = () => {
    switch (type) {
      case 'success':
        return { color: '#2ecc71', icon: <CheckCircle size={48} /> };
      case 'alert':
        return { color: '#e74c3c', icon: <AlertCircle size={48} /> };
      case 'info':
      default:
        return { color: '#3498db', icon: <Info size={48} /> };
    }
  };

  const { color, icon } = getStyle();
  const isConfirm = !!onCancel;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000,
      backdropFilter: 'blur(4px)'
    }}>
      <div className="card" style={{ 
        width: '100%', maxWidth: '400px', textAlign: 'center', padding: '2.5rem 2rem 2rem',
        animation: 'modalFadeIn 0.3s ease-out', border: 'none', position: 'relative'
      }}>
        {/* Close Icon (acts as cancel) */}
        <button 
          onClick={onCancel || onClose}
          type="button"
          style={{
            position: 'absolute', top: '15px', right: '15px',
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#666', transition: 'color 0.2s', padding: '5px'
          }}
          onMouseOver={(e) => e.target.style.color = '#000'}
          onMouseOut={(e) => e.target.style.color = '#666'}
        >
          <X size={24} />
        </button>

        <div style={{ color: color, marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          {icon}
        </div>
        
        <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>
          {isConfirm ? 'Confirmar' : (type === 'success' ? 'Éxito' : type === 'alert' ? '¡Atención!' : 'Información')}
        </h3>
        
        <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
          {message}
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button 
            onClick={onClose}
            className="btn"
            style={{ 
              width: '100%', 
              padding: '12px', 
              background: '#b9d3fd', // Celeste from --salmon
              border: '2px solid #b9d3fd',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: '8px'
            }}
          >
            Aceptar
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default MessageModal;
