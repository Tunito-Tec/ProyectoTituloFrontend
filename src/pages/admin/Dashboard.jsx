import { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CompleteIcon,
  PendingActions as PendingIcon,
} from "@mui/icons-material";
import api from "../../config/axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    usuarios: { total: 0, porRol: {} },
    tramites: { total: 0, porEstado: {}, completadosHoy: 0, pendientes: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await api.get("/admin/stats");
      setStats(data.data);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4">{value}</Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              borderRadius: "50%",
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Administrativo
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Usuarios"
            value={stats.usuarios.total}
            icon={<PeopleIcon sx={{ color: "primary.main" }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Trámites"
            value={stats.tramites.total}
            icon={<AssignmentIcon sx={{ color: "info.main" }} />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completados Hoy"
            value={stats.tramites.completadosHoy}
            icon={<CompleteIcon sx={{ color: "success.main" }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pendientes"
            value={stats.tramites.pendientes}
            icon={<PendingIcon sx={{ color: "warning.main" }} />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Usuarios por Rol
            </Typography>
            <List>
              {Object.entries(stats.usuarios.porRol).map(([rol, count]) => (
                <Box key={rol}>
                  <ListItem>
                    <ListItemText
                      primary={rol.charAt(0).toUpperCase() + rol.slice(1)}
                      secondary={`${count} usuarios`}
                    />
                    <Typography variant="body2" color="primary">
                      {count}
                    </Typography>
                  </ListItem>
                  <Divider />
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Trámites por Estado
            </Typography>
            <List>
              {Object.entries(stats.tramites.porEstado).map(
                ([estado, count]) => (
                  <Box key={estado}>
                    <ListItem>
                      <ListItemText
                        primary={estado.replace(/_/g, " ")}
                        secondary={`${count} trámites`}
                      />
                      <Typography variant="body2" color="primary">
                        {count}
                      </Typography>
                    </ListItem>
                    <Divider />
                  </Box>
                ),
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
