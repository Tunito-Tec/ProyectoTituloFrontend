import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Chip,
  Box,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import api from "../../config/axios";
import {
  getStatusColor,
  getStatusText,
  formatDate,
} from "../../utils/formatters";

const statusFilterOptions = [
  { value: "all", label: "Todos" },
  { value: "pendiente_revision_auxiliar", label: "Pendientes" },
  { value: "en_revision", label: "En Revisión" },
  { value: "esperando_firma_cliente", label: "Esperando Firma Cliente" },
  { value: "esperando_firma_notario", label: "Esperando Firma Notario" },
  { value: "completado", label: "Completados" },
];

export default function ProceedingList() {
  const [proceedings, setProceedings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    estado: "all",
    tipo: "all",
    search: "",
  });
  const [tiposTramite, setTiposTramite] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadProceedings();
    loadTiposTramite();
  }, [filters]);

  const loadProceedings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.estado !== "all") params.append("estado", filters.estado);
      if (filters.tipo !== "all") params.append("tipo", filters.tipo);

      const { data } = await api.get(`/auxiliar/tramites/pendientes?${params}`);
      setProceedings(data.data);
    } catch (error) {
      console.error("Error loading proceedings:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTiposTramite = async () => {
    try {
      const { data } = await api.get("/tramite-types/activos");
      setTiposTramite(data.data);
    } catch (error) {
      console.error("Error loading tipos:", error);
    }
  };

  const filteredProceedings = proceedings.filter((p) => {
    if (!filters.search) return true;
    const search = filters.search.toLowerCase();
    return (
      p.cliente?.nombre?.toLowerCase().includes(search) ||
      p._id.toLowerCase().includes(search)
    );
  });

  const columns = [
    {
      field: "_id",
      headerName: "ID",
      width: 200,
      valueFormatter: (params) => params.value.slice(-6),
    },
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
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      field: "asignadoA",
      headerName: "Asignado",
      width: 150,
      valueGetter: (params) => params.row.asignadoA?.nombre || "Sin asignar",
    },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Gestión de Trámites
        </Typography>

        {/* Filtros */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Buscar"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              placeholder="ID o nombre del cliente"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Estado"
              value={filters.estado}
              onChange={(e) =>
                setFilters({ ...filters, estado: e.target.value })
              }
            >
              {statusFilterOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Tipo de Trámite"
              value={filters.tipo}
              onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
            >
              <MenuItem value="all">Todos</MenuItem>
              {tiposTramite.map((tipo) => (
                <MenuItem key={tipo._id} value={tipo.tipoId}>
                  {tipo.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        {/* Tabla */}
        <div style={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={filteredProceedings}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            loading={loading}
            onRowClick={(params) =>
              navigate(`/auxiliar/tramites/${params.id}/revisar`)
            }
            sx={{ cursor: "pointer" }}
            getRowId={(row) => row._id}
          />
        </div>
      </CardContent>
    </Card>
  );
}
