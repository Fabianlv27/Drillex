import { useNavigate } from "react-router-dom";
import "../../MainMenus/user/Signin.css";

function Response({ H3Message, PMessage, ButtonMessage, close }) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: "1",
        top: "0",
        left: "0",
      }}
    >
      <div
        style={{
          display: "flex",
          minHeight:" 200px",
          minWidth: "300px",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-around",
          top: "40%",
          left: "50%",
          backgroundColor: "white",
          borderRadius: "10px",
          padding: "10px",
          boxShadow: "0px 0px 10px 0px black",
        }}
      >
        <h3 style={{ color: "black" }}>{H3Message}</h3>
        <p style={{ color: "black" }}>{PMessage? PMessage:"Something went wrong, try again"}</p>
        <button
          onClick={() => {
            navigate("/login"), close(0);
          }}
className="gs-button"
        >
          { ButtonMessage}
        </button>
      </div>
    </div>
  );
}

export default Response;
