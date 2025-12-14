import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../../Contexts/Context.jsx";
import api from "../../../api/axiosClient.js"; // Importa tu nuevo cliente

function Dash() {
  const history = useNavigate();
  const { RHost, setIsLogged } = useContext(Context);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Hacemos una petición de prueba para ver si la cookie funciona
        // Necesitas un endpoint en el back tipo /users/me que devuelva 200 si estás logueado
        await api.get("/users/me/check"); 
        
        setIsLogged(true);
        history("/Hero");
      } catch (error) {
        // Si falla, es que no hay cookie o es inválida
        console.log("No hay sesión válida");
        window.location.href = `${RHost}/signin`;
      }
    };

    checkSession();
  }, [history, RHost, setIsLogged]);

  return <div>Loading session...</div>;
}

export default Dash;