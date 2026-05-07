import { Outlet } from "react-router-dom";

// Sistema totalmente público — sem checagem de sessão.
const ProtectedRoute = () => <Outlet />;

export default ProtectedRoute;
