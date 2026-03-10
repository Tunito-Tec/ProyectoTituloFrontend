import { useState, useEffect } from "react";
import { Grid, Card, CardContent, Typography, Box, Paper } from "@mui/material";
import {
  PendingActions as PendingIcon,
  CheckCircle as CompleteIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import api from "../../config/axios";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function NotaryDashboard() {
  const [stats, setStats] = useState({
    tramitesHoy: 0,
    pendientesFirma: 0,
    tiempoPromedioHoras: 0,
    distribucionEstados: {},
    distribucionTipos: {},
    totalTramites: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await api.get("/notario/dashboard/stats");
      setStats(data.data);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const preparePieData = () => {
    return Object.entries(stats.distribucionEstados || {}).map(
      ([name, value]) => ({
        name,
        value,
      }),
    );
  };

  const prepareBarData = () => {
    return Object.entries(stats.distribucionTipos || {}).map(
      ([name, value]) => ({
        name: name.replace("_", " "),
        cantidad: value,
      }),
    );
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
        Dashboard Notarial
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Trámites Hoy"
            value={stats.tramitesHoy}
            icon={<TimelineIcon sx={{ color: "primary.main" }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Pendientes de Firma"
            value={stats.pendientesFirma}
            icon={<PendingIcon sx={{ color: "warning.main" }} />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Tiempo Promedio"
            value={`${stats.tiempoPromedioHoras}h`}
            icon={<CompleteIcon sx={{ color: "success.main" }} />}
            color="success"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Distribución por Estado
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={preparePieData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {preparePieData().map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Trámites por Tipo
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={prepareBarData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cantidad" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
