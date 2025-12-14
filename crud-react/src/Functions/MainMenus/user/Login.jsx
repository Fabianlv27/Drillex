import { useContext, useState } from "react";
import { Context } from "../../../../Contexts/Context";
import { useNavigate } from "react-router-dom";
import Response from "../../secondary menus/Menu/Response";
import "./Signin.css";
import GoogleLoginMenu from "./GoogleLoginMenu";
import api from "../../../../api/axiosClient"; // <--- Importa tu cliente Axios

function Login() {
  const { setIsLogged } = useContext(Context); // Traemos setIsLogged para actualizar estado global
  const [Data, setData] = useState({ username: "", password: "" });
  const [ErrorData, setErrorData] = useState("");
  const [isSuccesful, setisSuccesful] = useState(0); // 0: neutro, 1: error
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    
    // Mantenemos FormData si tu backend espera form-urlencoded
    const formData = new URLSearchParams();
    formData.append("username", Data.username);
    formData.append("password", Data.password);

    try {
      // Usamos api.post. Las cookies se gestionan solas.
      await api.post("/users/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });

      // Si Axios no lanza error, es que fue exitoso (Status 200-299)
      setIsLogged(true); // Actualizamos el contexto
      navigate("/Hero"); // Redirigimos internamente (más rápido)

    } catch (error) {
      console.error("Error en el login:", error);
      // Axios guarda la respuesta del servidor en error.response.data
      const msg = error.response?.data?.detail || "Error connecting to server";
      setErrorData(msg);
      setisSuccesful(1);
    }
  };

  return (
    <>
      {isSuccesful !== 0 && (
        <Response
          H3Message={"Ooops!"}
          PMessage={ErrorData}
          ButtonMessage={"Try again"}
          close={setisSuccesful}
        />
      )}
      
      <div className="container" style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "10%" }}>
        <h1 className="title">Login</h1>
        <GoogleLoginMenu />
        
        <form className="form" onSubmit={handleLogin}>
          <label htmlFor="text">User</label>
          <input
            type="text"
            id="text"
            onChange={(e) => setData({ ...Data, username: e.target.value })}
            required
          />
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            onChange={(e) => setData({ ...Data, password: e.target.value })}
            required
          />
          <button className="button" type="submit">Login</button>
        </form>
        
        <p className="textLink">I do not have an account yet</p>
        <button className="buttonSecondary" onClick={() => navigate("/signin")}>
          Sign in
        </button>
      </div>
    </>
  );
}

export default Login;