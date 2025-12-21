import { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axiosClient";
import { Context } from "../../../Contexts/Context";

// Iconos
import { FiAlignJustify } from "react-icons/fi";
import { IoIosLogOut, IoIosArrowDown } from "react-icons/io";
import { GoHomeFill } from "react-icons/go";
import { MdWidgets } from "react-icons/md";
import { FaWpexplorer, FaBars, FaTimes } from "react-icons/fa";
import { CiBoxList } from "react-icons/ci";

// Estilos
import "../../styles/Navbar.css"; 

function Navbar() {
  const { Rhost, Language } = useContext(Context); // Asumiendo que usas Language del contexto
  const history = useNavigate();
  
  // Estado para el menú móvil general
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Estado para saber qué submenú está abierto (0: Widgets, 1: Explorer, 2: Lists, 3: Settings)
  const [activeSubMenu, setActiveSubMenu] = useState(-1);

  // Referencias para cerrar al hacer clic fuera (opcional en diseño móvil, pero útil en desktop)
  const navRef = useRef(null);

  // --- LÓGICA DE IDIOMAS (Original) ---
  const updateLang = (language) => {
    const date = new Date();
    date.setTime(date.getTime() + 365 * 24 * 60 * 60 * 1000);
    document.cookie = `lang=${language}; expires=${date.toUTCString()}; path=/; domain=${window.location.hostname}`;
  };

  useEffect(() => {
    // Click outside para cerrar submenús en desktop
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActiveSubMenu(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    // Chequeo inicial de idioma
    const cookies = document.cookie.split(";");
    const langCookie = cookies.find((cookie) => cookie.trim().startsWith("lang="));
    if (!langCookie) updateLang("en");

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLangChange = (language) => {
    updateLang(language);
    window.location.href = `/Hero`;
  };

  // --- LOGOUT HANDLER (Original) ---
  const LogoutHandler = async () => {
    try {
      await api.post("/logout");
      console.log("Sesión cerrada correctamente");
      window.location.href = `${Rhost || ''}/Hero`; 
    } catch (error) {
      console.error("Error al intentar cerrar sesión:", error);
      window.location.href = `${Rhost || ''}/Hero`;
    }
  };

  // --- CONTROL DE MENÚS ---
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  
  const toggleSubMenu = (index) => {
    if (activeSubMenu === index) {
      setActiveSubMenu(-1); // Cerrar si ya está abierto
    } else {
      setActiveSubMenu(index); // Abrir el nuevo
    }
  };

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setActiveSubMenu(-1);
  };

  return (
    <nav className="navbar" ref={navRef}>
      <div className="navbar-container">
        
        {/* 1. LOGO */}
        <div className="navbar-logo" onClick={() => { window.location.href = "/Hero"; }}>
          <img src="https://i.postimg.cc/xjNb8mG6/1766222649362.png" alt="Logo" className="logo-img" /> {/* Ajusta la ruta de tu logo */}
          <span className="logo-text">Drillex</span>
        </div>

        {/* 2. ICONO HAMBURGUESA (Solo visible en Móvil) */}
        <div className="mobile-menu-icon" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </div>

        {/* 3. CONTENEDOR DE NAVEGACIÓN (Centro + Derecha fusionados) */}
        <ul className={mobileMenuOpen ? "nav-menu active" : "nav-menu"}>
          
          {/* --- HOME --- */}
          <li className="nav-item">
            <div className="nav-link-main" onClick={() => { history("/Hero"); closeMenus(); }}>
              <GoHomeFill className="nav-icon"/> <span className="nav-text">Home</span>
            </div>
          </li>

          {/* --- WIDGETS (Submenú 0) --- */}
          <li className="nav-item">
            <div className="nav-link-main" onClick={() => toggleSubMenu(0)}>
              <MdWidgets className="nav-icon"/> <span className="nav-text">Games</span> <IoIosArrowDown className={`arrow ${activeSubMenu === 0 ? 'up' : ''}`}/>
            </div>
            {activeSubMenu === 0 && (
              <div className="dropdown-menu">
                <p onClick={() => { history("/Random"); closeMenus(); }}>Random Repetition</p>
                <p onClick={() => { history("/Hand"); closeMenus(); }}>Hanged</p>
                <p onClick={() => { history("/ImageGame"); closeMenus(); }}>Image Game</p>
                <p onClick={() => { history("/SynAntGame"); closeMenus(); }}>Synonyms & Antonyms</p>
                <p onClick={() => { history("/AllVoiceGame"); closeMenus(); }}>All Voice</p>
              </div>
            )}
          </li>

          {/* --- EXPLORER (Submenú 1) --- */}
          <li className="nav-item">
            <div className="nav-link-main" onClick={() => toggleSubMenu(1)}>
              <FaWpexplorer className="nav-icon"/> <span className="nav-text">Explorer</span> <IoIosArrowDown className={`arrow ${activeSubMenu === 1 ? 'up' : ''}`}/>
            </div>
            {activeSubMenu === 1 && (
              <div className="dropdown-menu">
                <p onClick={() => { history("/songs"); closeMenus(); }}>Songs</p>
                <p onClick={() => { history("/YoutubeVideo"); closeMenus(); }}>Youtube</p>
                <p onClick={() => { history("/Spotify"); closeMenus(); }}>Spotify</p>
                <p onClick={() => { history("/PhrData"); closeMenus(); }}>Phrasal Verbs</p>
              </div>
            )}
          </li>

          {/* --- LISTS (Submenú 2) --- */}
          <li className="nav-item">
            <div className="nav-link-main" onClick={() => toggleSubMenu(2)}>
              <CiBoxList className="nav-icon"/> <span className="nav-text">Lists</span> <IoIosArrowDown className={`arrow ${activeSubMenu === 2 ? 'up' : ''}`}/>
            </div>
            {activeSubMenu === 2 && (
              <div className="dropdown-menu">
                <p onClick={() => { history("/AllLists"); closeMenus(); }}>See/Create Lists</p>
                <p onClick={() => { history("/createWords/create"); closeMenus(); }}>Create Word</p>
              </div>
            )}
          </li>

          {/* --- SETTINGS / LANGUAGE (Originalmente a la derecha) --- */}
          {/* En móvil se ve al final de la lista. En desktop se puede alinear a la derecha con CSS */}
          <li className="nav-item settings-item">
             <div className="nav-link-main" onClick={() => toggleSubMenu(3)}>
               <FiAlignJustify className="nav-icon"/> <span className="nav-text">Settings</span>
             </div>
             {activeSubMenu === 3 && (
                <div className="dropdown-menu settings-dropdown">
                    <p className="menu-label">Language:</p>
                    <div className="lang-options">
                        <span style={{ fontWeight: Language === "en" ? "bold" : "normal" }} onClick={() => handleLangChange("en")}>EN</span> | 
                        <span style={{ fontWeight: Language === "es" ? "bold" : "normal" }} onClick={() => handleLangChange("es")}> ES</span> | 
                        <span style={{ fontWeight: Language === "it" ? "bold" : "normal" }} onClick={() => handleLangChange("it")}> IT</span>
                    </div>
                    <div className="divider"></div>
                    <p>Settings</p>
                    <p>Follow us</p>
                    <div className="divider"></div>
                    <button className="logout-btn-nav" onClick={LogoutHandler}>
                        <IoIosLogOut /> Logout
                    </button>
                </div>
             )}
          </li>

        </ul>
      </div>
    </nav>
  );
}

export default Navbar;