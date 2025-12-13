import  { useEffect ,useContext} from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../../Contexts/Context.jsx"; // Importa el contexto del token
function Dash() {
  const { RHost } = useContext(Context); // Usa el token del contexto
  const history = useNavigate();

  const putCookie = () => {
    const currentPath = window.location;
    console.log(currentPath.href);
    try {
      const key = currentPath.href.split("?")[1];
      console.log(key);
      if (key === undefined) {
        window.location.href = `${RHost}/signin`;
      }
      const expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      // Formatea la fecha de expiración como se requiere para la cookie
      const expires = expirationDate.toUTCString();
      document.cookie = `${key} ; Expires=${expires}`;
      console.log('puesto')
      history("/Hero");
    } catch (error) {
      window.location.href = `${RHost}/signin`;
    }
  };

  useEffect(() => {
    const handlePath = () => {
      console.log("init");
      try {
        const cookies = document.cookie;
        const cookiesArray = cookies.split(";");
        console.log(cookiesArray);
        var isE = false;
        cookiesArray.forEach(async (cookie) => {
          const [name, value] = cookie.trim().split("=");
          if (name === "e") {
            console.log('hay token')
            history("/Hero");
            isE = true;
          }
        });
        if (!isE) {
          console.log('no hay token')
          putCookie();
        }
      } catch (error) {
        putCookie();
      }
    };
    handlePath();
  }, []);

  return <div>Dash</div>;
}

export default Dash;
