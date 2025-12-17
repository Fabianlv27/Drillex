import { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axiosClient"; // Ajusta la ruta según tu estructura
import "../../main.css";
import "../../styles/Navbar.css";
import "../../MainResp.css";
import { FiAlignJustify } from "react-icons/fi";
import { Context } from "../../../Contexts/Context";
import { IoIosLogOut } from "react-icons/io";
import { GoHomeFill } from "react-icons/go";
import { MdWidgets } from "react-icons/md";
import { FaWpexplorer } from "react-icons/fa";
import { CiBoxList } from "react-icons/ci";

function Navbar() {
  const { Ahost, Rhost,Language } = useContext(Context);
  const [showMenu, setShowMenu] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const history = useNavigate();
  const [SearchSubMenuProps, setSearchSubMenuProps] = useState({
    ubication: -1,
    status: false,
  });
  const divUseRef = useRef(null);
  const cornerMenu = useRef(null);
  const updateLang = (language) => {
    const date = new Date();
    date.setTime(date.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 año
    document.cookie = `lang=${language}; expires=${date.toUTCString()}; path=/; domain=${
      window.location.hostname
    }`;
  };

  function ClickOutside(e) {
    if (divUseRef.current && !divUseRef.current.contains(e.target)) {
      setSearchSubMenuProps({ ubication: -1, status: false });
    }
    if (cornerMenu.current && !cornerMenu.current.contains(e.target)) {
      setShowMenu(false);
    }
  }
  useEffect(() => {
    document.addEventListener("mousedown", ClickOutside);
    const cookies = document.cookie.split(";");
    const langCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("lang=")
    );

    if (!langCookie) {
      updateLang("en");
    }
    return () => {
      document.removeEventListener("mousedown", ClickOutside);
    };
  }, []);

  const handleLangChange = (language) => {
    updateLang(language);
    window.location.href = `/Hero`;
    setShowLanguage(false);
  };
  const buttonStyle = {
    height: "80px",
    width: "80px",
    backgroundColor: "transparent",
    border: "none",
    fontSize: "25px",
    color: "skyblue",
    cursor: "pointer",
  };

  const languageOptionsStyle = {
    color: "skyblue",
    margin: "8px",
    cursor: "pointer",
  };

const LogoutHandler = async () => {
  try {
    // 1. Petición al Backend (La parte importante)
    // Al usar 'api', se envían automáticamente las cookies HttpOnly (access_token, refresh_token).
    // El backend responderá con instrucciones 'Set-Cookie' para expirarlas (borrarlas).
    await api.post("/logout");

    // 2. Limpieza Legacy (Opcional)
    // Si tu frontend antiguo todavía revisa la cookie "e" para algo visual, la borramos.
    // Si ya no la usas, puedes borrar esta línea sin problemas.
    //document.cookie = "e=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;

    // 3. Limpieza de estado local (Si guardas datos de usuario en localStorage)
    //localStorage.removeItem("user_data"); 
   // localStorage.removeItem("videosYT"); // Opcional: si quieres limpiar caché de videos al salir

    // 4. Redirección
    // Usamos window.location.href para forzar una recarga y limpiar estados de memoria de React
    console.log("Sesión cerrada correctamente");
    window.location.href = `${Rhost}/Hero`; 

  } catch (error) {
    console.error("Error al intentar cerrar sesión:", error);
    // Fallback: Si el backend falla, redirigimos al usuario al inicio de todas formas
    // para que no se sienta "atrapado" en la pantalla de perfil.
    window.location.href = `${Rhost}/Hero`;
  }
};
  const SelectMenu = (ubication) => {
    if (SearchSubMenuProps.ubication == ubication) {
      setSearchSubMenuProps({ ubication: -1, status: false });
    } else {
      setSearchSubMenuProps({ ubication: ubication, status: true });
    }
  };
  return (
    <nav>
      <div className="navContainer">
        <div style={{ position: "absolute", right: "10px" }} ref={cornerMenu}>
          {!showMenu ? (
            <button onClick={() => setShowMenu(true)} style={buttonStyle}>
              <FiAlignJustify />
            </button>
          ) : (
            <div className="menuStyle">
              <p
                className="mainHMenuNav"
                onClick={() => setShowLanguage(!showLanguage)}
              >
                Language
              </p>
              {showLanguage && (
                <div style={languageOptionsStyle}>
                  <p
                    style={{ fontWeight: Language == "en" && "bolder" }}
                    onClick={() => handleLangChange("en")}
                  >
                    English
                  </p>
                  <p
                    style={{ fontWeight: Language == "it" && "bolder" }}
                    onClick={() => handleLangChange("it")}
                  >
                    Italiano
                  </p>
                  <p
                    style={{ fontWeight: Language == "es" && "bolder" }}
                    onClick={() => handleLangChange("es")}
                  >
                    Spanish
                  </p>
                </div>
              )}
              <p className="mainHMenuNav">Settings</p>
              <p className="mainHMenuNav">Follow us</p>

              <button className="logoutButton" onClick={() => LogoutHandler}>
                <IoIosLogOut />
              </button>
            </div>
          )}
        </div>
        <img
          src="https://i.postimg.cc/NGDPGmJS/drillex.png"
          onClick={() => (window.location.href = "https://dibylocal.com:5173")}
          alt="Logo"
        />
        <p className="logo">Drillex</p>
        <div className="NavMenusCont">
          <div className="SingleSubMenu">
            <p onClick={() => history("/Hero")}>
              <GoHomeFill />
            </p>
          </div>

          <div className="SingleSubMenu">
            <p onClick={() => SelectMenu(0)}>
              <MdWidgets />
            </p>
            {SearchSubMenuProps.ubication == 0 &&
              SearchSubMenuProps.status == true && (
                <div className="SubMenuSearch" ref={divUseRef}>
                  <p onClick={() => history("/Random")}>Random Repeticion</p>
                  <p onClick={() => history("/Hand")}>Hanged</p>
                  <p onClick={() => history("/ImageGame")}>image</p>
                  <p onClick={() => history("/SynAntGame")}>SyA</p>
                  <p onClick={() => history("/AllVoiceGame")}>All Voice</p>
                </div>
              )}
          </div>
          <div className="SingleSubMenu">
            <p onClick={() => SelectMenu(1)}>
              <FaWpexplorer />
            </p>
            {SearchSubMenuProps.ubication == 1 &&
              SearchSubMenuProps.status == true && (
                <div className="SubMenuSearch" ref={divUseRef}>
                  <p onClick={() => history("/songs")}>Songs</p>
                  <p onClick={() => history("/YoutubeVideo")}>Youtube</p>
                  <p onClick={() => history("/Spotify")}>Spotify</p>

                  <p onClick={() => history("/PhrData")}>Phrasal Verbs</p>
                </div>
              )}
          </div>
          <div className="SingleSubMenu">
            <p onClick={() => SelectMenu(2)}>
              <CiBoxList />
            </p>
            {SearchSubMenuProps.ubication == 2 &&
              SearchSubMenuProps.status == true && (
                <div className="SubMenuSearch" ref={divUseRef}>
                  <p onClick={() => history("/AllLists")}>See/Create Lists</p>
                  <p onClick={() => history("/createWords/create")}>
                    Create Word
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
