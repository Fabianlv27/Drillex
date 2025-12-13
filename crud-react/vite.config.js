import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

// Detecta si estamos en modo desarrollo local
let isLocal = import.meta.env?.VITE_LOCAL_HTTPS === 'true';
isLocal=true
// Reemplazo de __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rutas portables dentro del proyecto
const certPath = path.resolve(__dirname, 'certs/192.168.0.15-cert.pem');
const keyPath = path.resolve(__dirname, 'certs/192.168.0.15-key.pem');

export default defineConfig({
  plugins: [react()],
  server: isLocal
    ? {
        https: {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
        },
        host: '192.168.0.15', // IP específica
        port: 5173,           // puedes cambiar el puerto
      }
    : {
        host: '192.168.0.15',
        port: 5173,
      },
});
