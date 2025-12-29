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

  // 2. NUEVA CONFIGURACIÓN PARA LA EXTENSIÓN (Build)
  // Esto controla qué pasa cuando ejecutas 'npm run build'
  build: {
    rollupOptions: {
      input: {
        // Entrada 1: Tu Web App completa (para usar en pestaña normal)
        main: path.resolve(__dirname, 'index.html'),
        
        // Entrada 2: El Popup pequeño de la extensión
        popup: path.resolve(__dirname, 'popup.html'),
        
        // Entrada 3: El script que inyecta el menú flotante en otras webs
        content: path.resolve(__dirname, 'src/content.jsx'), 
      },
      output: {
        // Aseguramos nombres fijos para que el manifest.json pueda encontrarlos
        entryFileNames: '[name].js', 
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Forzamos a que el CSS del content script tenga un nombre fijo
          // Nota: Vite a veces pone el nombre del archivo fuente como 'name'
          if (assetInfo.name && assetInfo.name.includes('content')) {
             return 'assets/content.css';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  }
});