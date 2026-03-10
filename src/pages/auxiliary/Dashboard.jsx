import { useState, useEffect } from "react";
import { Grid, Card, CardContent, Typography, Box } from "@mui/material";
import {
  PendingActions as PendingIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CompleteIcon,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import api from "../../config/axios";
import { getStatusColor, getStatusText } from "../../utils/formatters";

export default function AuxiliaryDashboard() {
  const [stats, setStats] = useState({
    pendientes: 0,
    enRevision: 0,
    completadosHoy: 0,
  });
  const [recentProceedings, setRecentProceedings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pendientesRes, asignadosRes] = await Promise.all([
        api.get("/auxiliar/tramites/pendientes"),
        api.get("/auxiliar/tramites/asignados"),
      ]);

      setStats({
        pendientes: pendientesRes.data.count,
        enRevision: asignadosRes.data.count,
        completadosHoy: 5, // Simulado
      });

      setRecentProceedings(pendientesRes.data.data.slice(0, 5));
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "tipo", headerName: "Tipo", width: 150 },
    {
      field: "cliente",
      headerName: "Cliente",
      width: 200,
      valueGetter: (params) => params.row.cliente?.nombre || "N/A",
    },
    {
      field: "estado",
      headerName: "Estado",
      width: 200,
      renderCell: (params) => (
        <Chip
          label={getStatusText(params.value)}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: "createdAt",
      headerName: "Fecha",
      width: 150,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
    },
  ];

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
        Dashboard Auxiliar
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Pendientes de Revisión"
            value={stats.pendientes}
            icon={<PendingIcon sx={{ color: "warning.main" }} />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="En Revisión"
            value={stats.enRevision}
            icon={<AssignmentIcon sx={{ color: "info.main" }} />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Completados Hoy"
            value={stats.completadosHoy}
            icon={<CompleteIcon sx={{ color: "success.main" }} />}
            color="success"
          />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Trámites Pendientes Recientes
          </Typography>
          <div style={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={recentProceedings}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              loading={loading}
              onRowClick={(params) =>
                navigate(`/auxiliar/tramites/${params.id}/revisar`)
              }
              sx={{ cursor: "pointer" }}
            />
          </div>
        </CardContent>
      </Card>
    </Box>
  );
}
