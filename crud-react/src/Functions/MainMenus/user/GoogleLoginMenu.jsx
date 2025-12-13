import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import Response from "../../secondary menus/Menu/Response";
import { useNavigate } from "react-router-dom";
import "./Signin.css";

function GoogleLoginMenu() {
  const [isSuccesful, setisSuccesful] = useState(1);
  const [ErrorData, setErrorData] = useState("");
  const navigate = useNavigate();
  const onSuccess = (response) => {
    const token = response.credential;
    try {
      fetch("https://dibylocal.com:8000/google_login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(token),
      })
        .then(
          (res) =>
            res.ok
              ? res.json()
          
              : (setErrorData(res.details || "An error occurred during login."),setisSuccesful(false)),
        )
        .then(
          (data) =>
            data.redirect_url
              ? (window.location.href = data.redirect_url)
              : (setErrorData(data.details || "An error ocurred during login"),
          setisSuccesful(false))
        ); // Asegúrate de que esta URL sea correcta
      console.log(response); // Puedes enviar este token a tu backend para validarlo
    } catch (error) {
      console.error("Error en el login:", error);
      setErrorData(error);
      setisSuccesful(0);
    }
  };

  const onFailure = (error) => {
    console.log(error);
    setErrorData(error);
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
          close={setisSuccesful}
        />
      )}
    </div>
  );
}

export default GoogleLoginMenu;
