import { useContext } from "react";
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { Context } from "./Contexts/Context"; // Ajusta la ruta a tu Context

const ProtectedRoute = ({ children }) => {
  const { IsLogged, isLoading } = useContext(Context);

  // 1. Si estamos verificando la sesión, mostramos un loader o nada (para no redirigir mal)
  if (isLoading) {
    return <div>Loading...</div>; 
  }

  // 2. Si ya terminó de cargar y no está logueado, adiós.
  if (!IsLogged) {
    return <Navigate to="/signin" replace />; // O '/login' según tu ruta
  }

  // 3. Si está logueado, renderiza el componente hijo
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;