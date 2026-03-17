import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";

const menuItems = [
  { text: "Dashboard", icon: "Dashboard", path: "/cliente/dashboard" },
  { text: "Nuevo Trámite", icon: "NoteAdd", path: "/cliente/tramites/nuevo" },
  { text: "Mi Perfil", icon: "Person", path: "/cliente/perfil" },
];

export default function ClientLayout() {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <Sidebar menuItems={menuItems} />
      <main
        style={{
          marginLeft: 220,
          marginTop: 56,
          minHeight: "calc(100vh - 56px)",
          background: "#F9FAFB",
          padding: "28px 32px",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
