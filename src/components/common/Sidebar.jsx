import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import * as Icons from "@mui/icons-material";

const drawerWidth = 240;

export default function Sidebar({ menuItems }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Función para obtener el icono de manera segura
  const getIcon = (iconName) => {
    // Verificar si el icono existe en MUI
    if (Icons[iconName]) {
      return Icons[iconName];
    }
    // Si no existe, mostrar un mensaje de error y usar Dashboard como fallback
    console.error(`Icono "${iconName}" no encontrado en Material-UI`);
    return Icons.Dashboard;
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: "auto" }}>
        <List>
          {menuItems.map((item) => {
            const IconComponent = getIcon(item.icon);
            return (
              <ListItem
                component="div"
                key={item.text}
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "primary.light",
                    "&:hover": {
                      backgroundColor: "primary.light",
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <IconComponent />
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
}
