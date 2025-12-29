import React from 'react';
import ReactDOM from 'react-dom/client';
// Importa tus contextos (IMPORTANTE: La extensión es una instancia nueva de React)
import { ContextProvider } from './Contexts/Context';
import { ListsContextProvider } from './Contexts/ListsContext';
import { WordsContextProvider } from './Contexts/WordsContext';
import { DiccionaryContextProvider } from './Contexts/DiccionaryContext';

// Importa el componente que quieres inyectar
import FloatingMenu from './Functions/MainMenus/FloatingMenu'; // Ajusta la ruta

// Importa CSS para que Vite lo procese y genere el archivo assets/content.css
import './main.css';
import './styles/SeeWords.css'; // Estilos de tus cards

// 1. Crear contenedor aislado
const host = document.createElement('div');
host.id = 'drillex-root';
host.style.position = 'fixed';
host.style.zIndex = '999999999';
host.style.top = '0';
host.style.left = '0';
document.body.appendChild(host);

// 2. Shadow DOM (Protege tus estilos de la página web)
const shadow = host.attachShadow({ mode: 'open' });

// 3. Inyectar el CSS generado por Vite
const styleLink = document.createElement('link');
styleLink.rel = 'stylesheet';
styleLink.href = chrome.runtime.getURL('assets/content.css');
shadow.appendChild(styleLink);

// 4. Montar React
const mountPoint = document.createElement('div');
shadow.appendChild(mountPoint);

ReactDOM.createRoot(mountPoint).render(
  <React.StrictMode>
    <ContextProvider>
      <ListsContextProvider>
        <WordsContextProvider>
          <DiccionaryContextProvider>
             {/* Pasamos el shadowRoot si el menú necesita inyectar algo más */}
             <FloatingMenu />
          </DiccionaryContextProvider>
        </WordsContextProvider>
      </ListsContextProvider>
    </ContextProvider>
  </React.StrictMode>
);