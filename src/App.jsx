import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Layouts
import PublicLayout from "./layouts/PublicLayout";
import ClientLayout from "./layouts/ClientLayout";
import AuxiliarLayout from "./layouts/AuxiliarLayout";
import NotaryLayout from "./layouts/NotaryLayout";
import AdminLayout from "./layouts/AdminLayout";

// Páginas públicas
import LandingPage from "./pages/public/LandingPage";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";

// Páginas cliente
import ClientDashboard from "./pages/client/Dashboard";
import NewProceeding from "./pages/client/NewProceeding";
import ProceedingDetail from "./pages/client/ProceedingDetail";
import Profile from "./pages/client/Profile";

// Páginas auxiliar
import AuxiliarDashboard from "./pages/auxiliary/Dashboard";
import ProceedingList from "./pages/auxiliary/ProceedingList";
import ProceedingReview from "./pages/auxiliary/ProceedingReview";

// Páginas notario
import NotaryDashboard from "./pages/notary/Dashboard";
import PendingSignatures from "./pages/notary/PendingSignatures";
import SignDocument from "./pages/notary/SignDocument";
import DeliverableDocuments from "./pages/notary/DeliverableDocuments";

// Páginas admin
import AdminDashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import TramiteTypeManagement from "./pages/admin/TramiteTypeManagement";

// ── Protected route ────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// ── App ────────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      {/* ── Público ── */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* ── Cliente ── */}
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

      {/* ── Auxiliar ── */}
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

      {/* ── Notario ── */}
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
        <Route
          path="documentos-entregables"
          element={<DeliverableDocuments />}
        />
      </Route>

      {/* ── Admin ── */}
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

      {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
