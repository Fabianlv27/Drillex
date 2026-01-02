import { GoogleLogin } from "@react-oauth/google";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../../../Contexts/Context";
import api from "../../../../api/axiosClient";
import Response from "../../secondary menus/Menu/Response";
import "./Signin.css";

function GoogleLoginMenu() {
  const { setIsLogged } = useContext(Context);
  const [isSuccesful, setisSuccesful] = useState(1);
  const [ErrorData, setErrorData] = useState("");
  const navigate = useNavigate();

  const onSuccess = async (response) => {
    // Google te da el 'credential' (id_token)
    const id_token = response.credential;

    try {
      // 1. Enviamos el token al backend
      // IMPORTANTE: El backend espera "id_token: str = Body(...)".
      // Axios envía JSON por defecto, así que enviamos un objeto {id_token} o string directo.
      // Dado tu backend: async def google_login(id_token: str = Body(...))
      // Debemos enviar el string crudo con el Content-Type correcto o ajustar el envío.
      // La forma más compatible con tu backend actual (que espera body raw string) es:
      const res = await api.post("/google_login", id_token, {
        headers: { "Content-Type": "text/plain" }, // O "application/json" si ajustas el backend
      });

      // 2. CAMBIO CLAVE: Capturar el token de la respuesta del backend
      const { access_token } = res.data;

      if (access_token) {
        // 3. GUARDAR EL TOKEN (Lógica Híbrida Web/Extensión)
        if (
          typeof chrome !== "undefined" &&
          chrome.storage &&
          chrome.storage.local
        ) {
          // Si estamos en la Extensión
          await chrome.storage.local.set({ access_token });
        } else {
          // Si estamos probando en Web normal (localhost)
          localStorage.setItem("access_token", access_token);
        }
        window.postMessage({ type: "DRILLEXA_LOGIN_SUCCESS" }, "*");

        setIsLogged(true);

        // Pequeño delay opcional para asegurar que el mensaje se procese antes de cambiar de página
        setTimeout(() => {
          document.location.href = "/Hero";
        }, 100);
      } else {
        throw new Error("No token received from server");
      }
    } catch (error) {
      console.error("Error en el login:", error);
      const msg =
        error.response?.data?.detail || "An error occurred during login.";
      setErrorData(msg);
      setisSuccesful(0);
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
          close={() => setisSuccesful(1)}
        />
      )}
    </div>
  );
}

export default GoogleLoginMenu;
