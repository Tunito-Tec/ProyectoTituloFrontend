import { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import api from "../../config/axios";

export default function ClientDashboard() {
  const [proceedings, setProceedings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/client/tramites")
      .then(({ data }) => setProceedings(data.data))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { field: "tipo", headerName: "Tipo", width: 150 },
    {
      field: "estado",
      headerName: "Estado",
      width: 200,
      renderCell: (params) => {
        const colors = {
          borrador: "default",
          pendiente_revision_auxiliar: "warning",
          en_revision: "info",
          esperando_firma_cliente: "primary",
          esperando_firma_notario: "secondary",
          completado: "success",
        };
        return (
          <Chip
            label={params.value}
            color={colors[params.value] || "default"}
            size="small"
          />
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Fecha",
      width: 150,
      valueFormatter: (params) =>
        new Date(params.value).toLocaleDateString("es-CL"),
    },
    {
      field: "actions",
      headerName: "Acciones",
      width: 150,
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => navigate(`/cliente/tramites/${params.id}`)}
        >
          Ver Detalle
        </Button>
      ),
    },
  ];

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Mis Trámites
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate("/cliente/tramites/nuevo")}
                sx={{ mb: 2 }}
              >
                Nuevo Trámite
              </Button>
              <div style={{ height: 400, width: "100%" }}>
                <DataGrid
                  rows={proceedings}
                  columns={columns}
                  pageSize={5}
                  rowsPerPageOptions={[5]}
                  loading={loading}
                  disableSelectionOnClick
                />
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
