import { useContext, useState } from "react";
import { Context } from "../../../../Contexts/Context";
import { useNavigate } from "react-router-dom";
import Response from "../../secondary menus/Menu/Response";
import "./Signin.css";
import GoogleSigninMenu from "./GoogleSigninMenu";

function Signin() {
  const { Ahost } = useContext(Context);
  const [Data, setData] = useState({ username: "", password: "" });
  const [isSuccesful, setisSuccesful] = useState(0);
  const [ErrorData, setErrorData] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("newusername", Data.username);
    formData.append("newpassword", Data.password);

    try {
      const response = await fetch(`${Ahost}/users/signin`, {
        method: "POST",
        body: formData,
        credentials: "include", // Para manejar cookies (tokens)
      });
      if (!response.ok) {
        setErrorData(response.detail || "An error occurred");
        setisSuccesful(2);
        return;
      }

      const data = await response.json();
      if (data.status) {
        setisSuccesful(1);
      } else {
        setErrorData(data.detail || "An error occurred");
        setisSuccesful(2);
      }
    } catch (error) {
      console.error("Error en el login:", error);
    }
  };

  return (
    <>
      {isSuccesful !== 0 && (
        <Response
          H3Message={isSuccesful === 1 ? "Welcome!" : "Ooops!"}
          PMessage={
            isSuccesful === 1
              ? "You have been registered successfully"
              : ErrorData
          }
          ButtonMessage={isSuccesful === 1 ? "Log in" : "Try again"}
          close={setisSuccesful}
        />
      )}
      <div className="container">
        <h1 className="title">Sign in</h1>
        <GoogleSigninMenu />

        <p className="textLink">I already have an account</p>
        <button className="buttonSecondary" onClick={() => navigate("/login")}>
          Log in
        </button>
      </div>
    </>
  );
}

export default Signin;
