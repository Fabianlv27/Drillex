import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./main.css";
import "./MainResp.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId="56550990006-uggglo18m6f30lijldhbbveuofs9cevk.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);
