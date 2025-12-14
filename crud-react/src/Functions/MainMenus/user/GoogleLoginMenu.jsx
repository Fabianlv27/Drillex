import { GoogleLogin } from "@react-oauth/google";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../../../Contexts/Context"; // Asegúrate de que la ruta sea correcta
import api from "../../../../api/axiosClient"; // Importa tu cliente Axios
import Response from "../../secondary menus/Menu/Response";
import "./Signin.css";

function GoogleLoginMenu() {
  const { setIsLogged } = useContext(Context); // Traemos la función del contexto
  const [isSuccesful, setisSuccesful] = useState(1); // 1: Mostrar Login, 0: Mostrar Error
  const [ErrorData, setErrorData] = useState("");
  const navigate = useNavigate();

  const onSuccess = async (response) => {
    const token = response.credential;
    
    try {
      // Usamos axios (api) en lugar de fetch.
      // Enviamos el token. Nota: Dependiendo de tu backend, 
      // si recibes "id_token: str = Body(...)", enviarlo así está bien.
      await api.post("/google_login", token);

      // Si llegamos aquí, el backend respondió 200 OK y puso las cookies HttpOnly.
      // 1. Actualizamos el estado global de la app
      setIsLogged(true);
      
      // 2. Redirigimos al usuario a la pantalla principal
      navigate("/Hero");

    } catch (error) {
      console.error("Error en el login:", error);
      
      // Extraemos el mensaje de error que envía FastAPI (detail)
      const msg = error.response?.data?.detail || "An error occurred during login.";
      setErrorData(msg);
      setisSuccesful(0); // Cambiamos a estado de error
    }
  };

  const onFailure = (error) => {
    console.log(error);
    setErrorData("Google Login Failed");
    setisSuccesful(0);
  };

  return (
    <div className="login-container">
      {isSuccesful === 1 ? (
        <div className="gs-container">
          <div className="gs-login">
            <h3 className="gs-title">Login with Google</h3>
            <GoogleLogin onSuccess={onSuccess} onError={onFailure} />
            
            <p className="gs-textLink">I do not have an account yet</p>
            <button
              className="gs-buttonSecondary"
              onClick={() => navigate("/signin")}
            >
              Sign In
            </button>
          </div>
        </div>
      ) : (
        <Response
          H3Message="Oops!"
          PMessage={ErrorData}
          ButtonMessage="Try Again"
          // Al cerrar el error, volvemos a mostrar el formulario (estado 1)
          close={() => setisSuccesful(1)} 
        />
      )}
    </div>
  );
}

export default GoogleLoginMenu;