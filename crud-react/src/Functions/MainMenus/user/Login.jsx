import { useContext, useState } from "react";
import { Context } from "../../../../Contexts/Context";
import { useNavigate } from "react-router-dom";
import Response  from "../../secondary menus/Menu/Response";
import  "./Signin.css";
import GoogleLoginMenu from "./GoogleLoginMenu";
function Login() {
  const { Ahost } = useContext(Context);
  const [Data, setData] = useState({ username: "", password: "" });
  const [ErrorData, setErrorData] = useState("");
  const [isSuccesful, setisSuccesful] = useState(0);
  const navigate = useNavigate();
console.log(Ahost)
  const handleLogin = async (event) => {
    event.preventDefault();
    const formData = new URLSearchParams();
    formData.append("username", Data.username);
    formData.append("password", Data.password);
    try {
      const response = await fetch(`${Ahost}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
        credentials: "include", // Asegúrate de incluir esto para manejar cookies
      });

      console.log(response);

      if (response.ok ) {
        const data = await response.json();
        if (data.redirect_url) {
                setisSuccesful(0);
        window.location.href = data.redirect_url; // Asegúrate de que esta URL sea correcta
        }else{
        setErrorData(data.detail);
        setisSuccesful(1);
        }
  
      } else {
        setisSuccesful(1);

      }
    } catch (error) {
      console.error("Error en el login:", error);
    }
  };

  return (
    <>
      {!isSuccesful==0 ? (
        <Response
          H3Message={"Ooops!"}
          PMessage={ErrorData}
          ButtonMessage={"Try again"}
          close={setisSuccesful}
        ></Response>
      ) : null}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "10%",
        }}
        className="container"
      >
        <h1 className="title">Login</h1>
        <GoogleLoginMenu />
        <form className="form" onSubmit={handleLogin}>
          <label  htmlFor="text">User</label>
          <input
            type="text"
            name="text"
            id="text"
            onChange={(e) => setData({ ...Data, username: e.target.value })}
          />
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            onChange={(e) => setData({ ...Data, password: e.target.value })}
          />
          <button className="button" type="submit">Login</button>
        </form>
        <p className="textLink" >I do not have an account yet</p>
        <button className="buttonSecondary" onClick={() => navigate("/signin")}>Sign in</button>
      </div>
    </>
  );
}

export default Login;
