import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Response from "../../secondary menus/Menu/Response";
import "./Signin.css";

function GoogleSigninMenu() {
  const [status, setStatus] = useState(0);
  const [errorData, setErrorData] = useState("");
  const [data, setData] = useState({ username: "", age: 0, userToken: "" });
  const navigate = useNavigate();

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
      const res = await fetch("https://dibylocal.com:8000/google_signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_token: data.userToken,
          username: data.username,
          age: data.age,
        }),
      });
      const result = await res.json();
      console.log(result);
      if (!result.status ||! res.ok) {
        setErrorData(result.detail || "An error occurred during sign-in.");
        setStatus(2);
        return;
      }
        setStatus(3);

    } catch (err) {
      setErrorData(err.toString());
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
            <label htmlFor="username" className="gs-label">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="gs-input"
              value={data.username}
              onChange={(e) =>
                setData((prev) => ({ ...prev, username: e.target.value }))
              }
              required
            />

            <label htmlFor="age" className="gs-label">
              Age
            </label>
            <select
              id="age"
              className="gs-select"
              value={data.age || ""}
              onChange={(e) =>
                setData((prev) => ({ ...prev, age: parseInt(e.target.value) }))
              }
              required
            >
              <option value="" disabled>
                Select your age
              </option>
              {Array.from({ length: 100 }, (_, i) => i + 1).map((age) => (
                <option key={age} value={age}>
                  {age}
                </option>
              ))}
            </select>

            <button type="submit" className="gs-button">
              Complete Sign-in
            </button>
          </form>
        )}

        {(status === 2 || status === 3) && (
          <Response
            H3Message={status === 2 ? "Oops!" : "Welcome!"}
            PMessage={
              status === 2
                ? errorData
                : "You have been registered successfully."
            }
            ButtonMessage={status === 2 ? "Try Again" : "Log In"}
            close={setStatus}
          />
        )}

        <p className="gs-textLink">Already have an account?</p>
        <button
          className="gs-buttonSecondary"
          onClick={() => navigate("/login")}
        >
          Log In
        </button>
      </div>
    </div>
  );
}

export default GoogleSigninMenu;
