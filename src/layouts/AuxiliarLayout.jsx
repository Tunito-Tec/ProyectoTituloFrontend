import { Outlet } from "react-router-dom";
import { Box, CssBaseline } from "@mui/material";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";

const menuItems = [
  { text: "Dashboard", icon: "Dashboard", path: "/auxiliar/dashboard" },
  {
    text: "Todos los Trámites",
    icon: "Assignment",
    path: "/auxiliar/tramites",
  },
  {
    text: "Pendientes",
    icon: "PendingActions",
    path: "/auxiliar/tramites?estado=pendiente",
  },
];

export default function AuxiliarLayout() {
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
