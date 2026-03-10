import { Outlet } from "react-router-dom";
import { Box, CssBaseline } from "@mui/material";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";

const menuItems = [
  { text: "Dashboard", icon: "Dashboard", path: "/notario/dashboard" },
  {
    text: "Firmas Pendientes",
    icon: "Pending",
    path: "/notario/firmas-pendientes",
  },
  { text: "Reportes", icon: "Assessment", path: "/notario/reportes" },
];

export default function NotaryLayout() {
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
