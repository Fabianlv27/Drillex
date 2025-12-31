import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

// --- TU CONFIGURACIÓN ACTUAL DE RUTAS Y HTTPS ---
// Detecta si estamos en modo desarrollo local
let isLocal = import.meta.env?.VITE_LOCAL_HTTPS === 'true';
isLocal = true; // Forzado a true como lo tenías

// Reemplazo de __dirname para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rutas a tus certificados
const certPath = path.resolve(__dirname, 'certs/192.168.0.15-cert.pem');
const keyPath = path.resolve(__dirname, 'certs/192.168.0.15-key.pem');

export default defineConfig({
  plugins: [react()],

  // 1. CONFIGURACIÓN DEL SERVIDOR (Lo que ya tenías)
  // Esto permite que 'npm run dev' use HTTPS en tu IP local
  server: isLocal
    ? {
        https: {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
        },
        host: '192.168.0.15', 
        port: 5173,
      }
    : {
        host: '192.168.0.15',
        port: 5173,
      },
});