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
  const { Rhost, Language } = useContext(Context);
  const history = useNavigate();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState(-1);
  const navRef = useRef(null);

  // --- LÓGICA DE IDIOMAS ---
  const updateLang = (language) => {
    const date = new Date();
    date.setTime(date.getTime() + 365 * 24 * 60 * 60 * 1000);
    document.cookie = `lang=${language}; expires=${date.toUTCString()}; path=/; domain=${window.location.hostname}`;
  };

  useEffect(() => {
    // Click outside para cerrar
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActiveSubMenu(-1);
        setMobileMenuOpen(false); // También cerrar móvil si clic fuera
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    // Chequeo idioma
    const cookies = document.cookie.split(";");
    const langCookie = cookies.find((cookie) => cookie.trim().startsWith("lang="));
    if (!langCookie) updateLang("en");

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLangChange = (language) => {
    updateLang(language);
    window.location.reload(); // Recarga limpia para aplicar idioma
  };

  // --- LOGOUT ---
  const LogoutHandler = async () => {
    try {
      await api.post("/logout");
      console.log("Sesión cerrada");
      window.location.href = `${Rhost || ''}/Hero`; 
    } catch (error) {
      console.error("Error logout:", error);
      window.location.href = `${Rhost || ''}/Hero`;
    }
  };

  // --- CONTROL DE MENÚS ---
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  
  const toggleSubMenu = (index) => {
    setActiveSubMenu(activeSubMenu === index ? -1 : index);
  };

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setActiveSubMenu(-1);
  };

  return (
    <nav className="navbar" ref={navRef}>
      <div className="navbar-container">
        
        {/* LOGO */}
        <div className="navbar-logo" onClick={() => { window.location.href = "/Hero"; }}>
          <img src="https://i.postimg.cc/xjNb8mG6/1766222649362.png" alt="Drillex" className="logo-img" />
          <span className="logo-text">Drillex</span>
        </div>

        {/* MÓVIL ICONO */}
        <div className="mobile-menu-icon" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </div>

        {/* MENÚ PRINCIPAL */}
        <ul className={mobileMenuOpen ? "nav-menu active" : "nav-menu"}>
          
          {/* HOME */}
          <li className="nav-item">
            <div className="nav-link-main" onClick={() => { history("/Hero"); closeMenus(); }}>
              <GoHomeFill className="nav-icon"/> <span className="nav-text">Home</span>
            </div>
          </li>

          {/* GAMES */}
          <li className="nav-item">
            <div className="nav-link-main" onClick={() => toggleSubMenu(0)}>
              <MdWidgets className="nav-icon"/> <span className="nav-text">Games</span> <IoIosArrowDown className={`arrow ${activeSubMenu === 0 ? 'up' : ''}`}/>
            </div>
            {activeSubMenu === 0 && (
              <div className="dropdown-menu">
                <p onClick={() => { history("/Random"); closeMenus(); }}>Random Repetition</p>
                <p onClick={() => { history("/Hand"); closeMenus(); }}>Hanged</p>
                <p onClick={() => { history("/ImageGame"); closeMenus(); }}>Visual Memory</p>
                <p onClick={() => { history("/SynAntGame"); closeMenus(); }}>Synonyms & Antonyms</p>
                <p onClick={() => { history("/AllVoiceGame"); closeMenus(); }}>Listening</p>
                <p onClick={() => { history("/WSkills"); closeMenus(); }}>Writing AI</p>
              </div>
            )}
          </li>

          {/* EXPLORER */}
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

          {/* LISTS */}
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

          {/* SETTINGS (SPECIAL) */}
          <li className="nav-item settings-item">
             <div className="nav-link-main" onClick={() => toggleSubMenu(3)}>
               <FiAlignJustify className="nav-icon"/> <span className="nav-text">Settings</span>
             </div>
             {activeSubMenu === 3 && (
                // Añadimos clase específica settings-dropdown
                <div className="dropdown-menu settings-dropdown">
                    <p className="menu-label">Language:</p>
                    <div className="lang-options">
                        <span className={Language === "en" ? "active-lang" : ""} onClick={() => handleLangChange("en")}>EN</span>
                        <span style={{color:'#00c3ff'}}>|</span>
                        <span className={Language === "es" ? "active-lang" : ""} onClick={() => handleLangChange("es")}>ES</span>
                        <span style={{color:'#00c3ff'}}>|</span>
                        <span className={Language === "it" ? "active-lang" : ""} onClick={() => handleLangChange("it")}>IT</span>
                    </div>
                    
                    <div className="divider"></div>
                    
                    <p onClick={closeMenus}>Account Settings</p>
                    <p onClick={closeMenus}>Follow us</p>
                    
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