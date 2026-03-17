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
  {
    text: "Documentos Entregables",
    icon: "Description", // o "Assignment" si prefieres
    path: "/notario/documentos-entregables",
  },
];

export default function NotaryLayout() {
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Navbar />
      <Sidebar menuItems={menuItems} />
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, mt: 8 }}
        style={{
          marginLeft: 220,
          marginTop: 56,
          minHeight: "calc(100vh - 56px)",
          background: "#F9FAFB",
          padding: "28px 32px",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
