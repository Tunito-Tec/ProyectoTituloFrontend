import { Outlet } from "react-router-dom";
import { Box, CssBaseline } from "@mui/material";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";

const menuItems = [
  { text: "Dashboard", icon: "Dashboard", path: "/cliente/dashboard" },
  { text: "Nuevo Trámite", icon: "NoteAdd", path: "/cliente/tramites/nuevo" },
  { text: "Mi Perfil", icon: "Person", path: "/cliente/perfil" },
];

export default function ClientLayout() {
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
