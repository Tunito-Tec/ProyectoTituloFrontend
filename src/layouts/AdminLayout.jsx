import { Outlet } from "react-router-dom";
import { Box, CssBaseline } from "@mui/material";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";

const menuItems = [
  { text: "Dashboard", icon: "Dashboard", path: "/admin/dashboard" },
  { text: "Usuarios", icon: "People", path: "/admin/usuarios" },
  { text: "Tipos de Trámite", icon: "Category", path: "/admin/tipos-tramite" },
  { text: "Auditoría", icon: "History", path: "/admin/auditoria" },
];

export default function AdminLayout() {
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Navbar />
      <Sidebar menuItems={menuItems} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
