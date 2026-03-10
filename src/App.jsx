import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Layouts
import PublicLayout from "./layouts/PublicLayout";
import ClientLayout from "./layouts/ClientLayout";
import AuxiliarLayout from "./layouts/AuxiliarLayout";
import NotaryLayout from "./layouts/NotaryLayout";
import AdminLayout from "./layouts/AdminLayout";

// Páginas Públicas
import LandingPage from "./pages/public/LandingPage";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";

// Páginas Cliente
import ClientDashboard from "./pages/client/Dashboard";
import NewProceeding from "./pages/client/NewProceeding";
import ProceedingDetail from "./pages/client/ProceedingDetail";
import Profile from "./pages/client/Profile";

// Páginas Auxiliar
import AuxiliarDashboard from "./pages/auxiliary/Dashboard";
import ProceedingList from "./pages/auxiliary/ProceedingList";
import ProceedingReview from "./pages/auxiliary/ProceedingReview";

// Páginas Notario
import NotaryDashboard from "./pages/notary/Dashboard";
import PendingSignatures from "./pages/notary/PendingSignatures";
import SignDocument from "./pages/notary/SignDocument";

// Páginas Admin
import AdminDashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import TramiteTypeManagement from "./pages/admin/TramiteTypeManagement";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  console.log(
    "🛡️ ProtectedRoute - loading:",
    loading,
    "user:",
    user,
    "allowedRoles:",
    allowedRoles,
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    console.log("🚫 No hay usuario, redirigiendo a login");
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    console.log("🚫 Rol no autorizado:", user.rol, "requerido:", allowedRoles);
    return <Navigate to="/" />;
  }

  console.log("✅ Acceso permitido");
  return children;
};

function App() {
  console.log("🏠 App renderizando");

  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Rutas Cliente */}
      <Route
        path="/cliente"
        element={
          <ProtectedRoute allowedRoles={["cliente"]}>
            <ClientLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<ClientDashboard />} />
        <Route path="tramites/nuevo" element={<NewProceeding />} />
        <Route path="tramites/:id" element={<ProceedingDetail />} />
        <Route path="perfil" element={<Profile />} />
      </Route>

      {/* Rutas Auxiliar */}
      <Route
        path="/auxiliar"
        element={
          <ProtectedRoute allowedRoles={["auxiliar"]}>
            <AuxiliarLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AuxiliarDashboard />} />
        <Route path="tramites" element={<ProceedingList />} />
        <Route path="tramites/:id/revisar" element={<ProceedingReview />} />
      </Route>

      {/* Rutas Notario */}
      <Route
        path="/notario"
        element={
          <ProtectedRoute allowedRoles={["notario"]}>
            <NotaryLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<NotaryDashboard />} />
        <Route path="firmas-pendientes" element={<PendingSignatures />} />
        <Route path="tramites/:id/firmar" element={<SignDocument />} />
      </Route>

      {/* Rutas Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="usuarios" element={<UserManagement />} />
        <Route path="tipos-tramite" element={<TramiteTypeManagement />} />
      </Route>

      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
