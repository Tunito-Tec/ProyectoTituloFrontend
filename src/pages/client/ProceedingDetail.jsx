import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Box,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Paper,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Verified as VerifiedIcon,
} from "@mui/icons-material";
import api from "../../config/axios";
import DocumentList from "../../components/documents/DocumentList";
import {
  getStatusColor,
  getStatusText,
  formatDate,
} from "../../utils/formatters";

const steps = [
  "Iniciado",
  "En Revisión",
  "Firma Cliente",
  "Firma Notario",
  "Completado",
];

const getStepFromStatus = (status) => {
  const map = {
    borrador: 0,
    pendiente_revision_auxiliar: 1,
    en_revision: 1,
    esperando_firma_cliente: 2,
    esperando_firma_notario: 3,
    completado: 4,
  };
  return map[status] || 0;
};

export default function ProceedingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proceeding, setProceeding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProceeding();
  }, [id]);

  const loadProceeding = async () => {
    try {
      const { data } = await api.get(`/client/tramites/${id}`);
      setProceeding(data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error al cargar trámite");
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    try {
      await api.post(`/notario/tramites/${id}/firmar`);
      loadProceeding();
    } catch (err) {
      setError("Error al firmar documento");
    }
  };

  const handleDownload = (doc) => {
    window.open(doc.url, "_blank");
  };

  if (loading) return <Typography>Cargando...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!proceeding)
    return <Alert severity="warning">Trámite no encontrado</Alert>;

  const currentStep = getStepFromStatus(proceeding.estado);

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/cliente/dashboard")}
        sx={{ mb: 2 }}
      >
        Volver
      </Button>

      <Grid container spacing={3}>
        {/* Encabezado */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h5">
                  Trámite #{proceeding._id.slice(-6)}
                </Typography>
                <Chip
                  label={getStatusText(proceeding.estado)}
                  color={getStatusColor(proceeding.estado)}
                />
              </Box>
              <Typography color="textSecondary" gutterBottom>
                Tipo: {proceeding.tipo}
              </Typography>
              <Typography variant="body2">
                Iniciado: {formatDate(proceeding.createdAt)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Stepper de progreso */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Stepper activeStep={currentStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        </Grid>

        {/* Datos del formulario */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Datos del Trámite
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {Object.entries(proceeding.datosFormulario || {}).map(
                ([key, value]) => (
                  <Box key={key} sx={{ mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      {key}:
                    </Typography>
                    <Typography variant="body1">{value}</Typography>
                  </Box>
                ),
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Documentos */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Documentos
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <DocumentList
                documents={proceeding.documentos || []}
                onDownload={handleDownload}
              />

              {proceeding.estado === "esperando_firma_cliente" && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<VerifiedIcon />}
                  onClick={handleSign}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Firmar Documento
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Historial */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Historial de Acciones
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {proceeding.historial?.map((item, index) => (
                <Paper key={index} sx={{ p: 2, mb: 1, bgcolor: "grey.50" }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2" color="textSecondary">
                        {formatDate(item.fecha)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Chip
                        label={item.accion}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={7}>
                      <Typography variant="body2">{item.detalles}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Por: {item.usuario?.nombre || "Sistema"}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Hash de integridad si existe */}
        {proceeding.hashDocumentoFinal && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="textSecondary">
                  Hash de integridad (SHA-256):
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                  }}
                >
                  {proceeding.hashDocumentoFinal}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
