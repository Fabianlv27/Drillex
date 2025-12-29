import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './main.css';

function Popup() {
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    // Checar si hay token
    chrome.storage.local.get(['access_token'], (res) => {
      if (res.access_token) setIsLogged(true);
    });
  }, []);

  return (
    <div style={{ width: '300px', padding: '20px', background: '#072138', color: 'white' }}>
      <h2 style={{ color: '#00c3ff', textAlign: 'center' }}>Drillex</h2>

      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        {isLogged ? (
          <p style={{color: '#00ffaa'}}>● Sesión Activa</p>
        ) : (
          <p style={{color: '#ff4757'}}>● Sin sesión</p>
        )}
      </div>

      <button 
        style={{ 
          width: '100%', padding: '10px', background: '#00c3ff', 
          border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' 
        }}
        onClick={() => window.open('http://localhost:5173/Hero', '_blank')}
      >
        Abrir Panel Completo
      </button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Popup />);