import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Box,
  Grid,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { Verified as VerifiedIcon } from "@mui/icons-material";
import api from "../../config/axios";
import {
  getStatusColor,
  getStatusText,
  formatDate,
} from "../../utils/formatters";

export default function PendingSignatures() {
  const [proceedings, setProceedings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadPendingSignatures();
  }, []);

  const loadPendingSignatures = async () => {
    try {
      const { data } = await api.get("/notario/tramites/pendientes-firma");
      setProceedings(data.data.pendientesFirmaNotario);
    } catch (error) {
      console.error("Error loading pending signatures:", error);
    } finally {
      setLoading(false);
    }
  };

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
      field: "actions",
      headerName: "Acciones",
      width: 150,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          startIcon={<VerifiedIcon />}
          onClick={() => navigate(`/notario/tramites/${params.id}/firmar`)}
        >
          Firmar
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Firmas Pendientes
        </Typography>

        <div style={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={proceedings}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            loading={loading}
            getRowId={(row) => row._id}
          />
        </div>
      </CardContent>
    </Card>
  );
}
