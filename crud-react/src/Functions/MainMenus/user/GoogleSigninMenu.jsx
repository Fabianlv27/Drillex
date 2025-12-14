import { GoogleLogin } from "@react-oauth/google";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../../../Contexts/Context"; // Importa Context
import api from "../../../../api/axiosClient"; // Importa Axios

import Response from "../../secondary menus/Menu/Response";
import "./Signin.css";

function GoogleSigninMenu() {
  const [status, setStatus] = useState(0);
  const [errorData, setErrorData] = useState("");
  const [data, setData] = useState({ username: "", age: 0, userToken: "" });
  
  const navigate = useNavigate();
  const { setIsLogged } = useContext(Context);

  const onSuccess = (response) => {
    const token = response.credential;
    setData((prev) => ({ ...prev, userToken: token }));
    setStatus(1);
  };

  const onFailure = (error) => {
    setErrorData(error.toString());
    setStatus(2);
  };

  const handleExtraData = async (e) => {
    e.preventDefault();
    try {
      // Usamos api.post
      await api.post("/google_signin", {
        id_token: data.userToken,
        username: data.username,
        age: data.age,
      });

      // Si pasa aquí, es éxito (200 OK)
      // Asumimos que google_signin TAMBIÉN loguea al usuario y pone cookies.
      // Si google_signin solo REGISTRA, entonces redirige a /login.
      // Si google_signin REGISTRA Y LOGUEA (devuelve cookies), haz esto:
      
      setIsLogged(true);
      setStatus(3); 
      // Opcional: Redirigir automáticamente después de unos segundos
      setTimeout(() => navigate("/Hero"), 1500);

    } catch (err) {
      const msg = err.response?.data?.detail || "Error during sign-in";
      setErrorData(msg);
      setStatus(2);
    }
  };

  return (
    <div className="login-container">
      <div className="gs-container">
        {status === 0 && (
          <div className="gs-login">
            <h3 className="gs-title">Create an account</h3>
            <GoogleLogin onSuccess={onSuccess} onError={onFailure} />
          </div>
        )}

        {status === 1 && (
          <form className="gs-form" onSubmit={handleExtraData}>
             {/* ... (Tus inputs de Username y Age se quedan igual) ... */}
             {/* Solo pongo el resumen para ahorrar espacio */}
             <label className="gs-label">Username</label>
             <input className="gs-input" type="text" required
                onChange={(e) => setData({ ...data, username: e.target.value })} 
             />
             
             <label className="gs-label">Age</label>
             <select className="gs-select" required
                onChange={(e) => setData({ ...data, age: parseInt(e.target.value) })}>
                <option value="" disabled>Select your age</option>
                {Array.from({ length: 100 }, (_, i) => i + 1).map((age) => (
                  <option key={age} value={age}>{age}</option>
                ))}
             </select>

            <button type="submit" className="gs-button">Complete Sign-in</button>
          </form>
        )}

        {(status === 2 || status === 3) && (
          <Response
            H3Message={status === 2 ? "Oops!" : "Welcome!"}
            PMessage={status === 2 ? errorData : "You have been registered successfully. Redirecting..."}
            ButtonMessage={status === 2 ? "Try Again" : "Go to App"}
            close={() => {
                if(status === 3) navigate("/Hero");
                setStatus(status === 2 ? 1 : 3); 
            }}
          />
        )}

        <p className="gs-textLink">Already have an account?</p>
        <button className="gs-buttonSecondary" onClick={() => navigate("/login")}>
          Log In
        </button>
      </div>
    </div>
  );
}

export default GoogleSigninMenu;