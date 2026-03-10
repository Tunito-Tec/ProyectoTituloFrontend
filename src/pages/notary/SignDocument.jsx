import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Box,
  Alert,
  Divider,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Chip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Verified as VerifiedIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import api from "../../config/axios";
import DocumentList from "../../components/documents/DocumentList";
import { formatDate } from "../../utils/formatters";

const steps = [
  "Revisar Documento",
  "Verificar Integridad",
  "Aplicar Firma",
  "Confirmar",
];

export default function SignDocument() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proceeding, setProceeding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [hashVerified, setHashVerified] = useState(false);
  const [signature, setSignature] = useState(null);

  useEffect(() => {
    loadProceeding();
  }, [id]);

  const loadProceeding = async () => {
    try {
      const { data } = await api.get(`/client/tramites/${id}`);
      setProceeding(data.data);
    } catch (err) {
      setError("Error al cargar trámite");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyIntegrity = async () => {
    try {
      const { data } = await api.post(
        `/notario/tramites/${id}/verificar-firma`,
      );
      setHashVerified(data.data.isIntegro);
      if (data.data.isIntegro) {
        setActiveStep(2);
      } else {
        setError("El documento ha sido modificado. No se puede firmar.");
      }
    } catch (err) {
      setError("Error al verificar integridad");
    }
  };

  const handleSign = async () => {
    setSigning(true);
    try {
      const { data } = await api.post(`/notario/tramites/${id}/firmar`);
      setSignature(data.data.firma);
      setSuccess("Documento firmado exitosamente");
      setActiveStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Error al firmar documento");
    } finally {
      setSigning(false);
    }
  };

  if (loading) return <Typography>Cargando...</Typography>;
  if (!proceeding)
    return <Alert severity="warning">Trámite no encontrado</Alert>;

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/notario/firmas-pendientes")}
        sx={{ mb: 2 }}
      >
        Volver
      </Button>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Firma Digital de Documento
              </Typography>
              <Typography color="textSecondary">
                Trámite #{proceeding._id.slice(-6)} - {proceeding.tipo}
              </Typography>

              <Stepper activeStep={activeStep} sx={{ mt: 3, mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}

              {/* Paso 1: Revisar Documento */}
              {activeStep === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Revise el documento antes de firmar
                  </Typography>

                  <DocumentList
                    documents={proceeding.documentos || []}
                    onDownload={(doc) => window.open(doc.url, "_blank")}
                    showActions={false}
                  />

                  <Box
                    sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}
                  >
                    <Button
                      variant="contained"
                      onClick={() => setActiveStep(1)}
                    >
                      Continuar a Verificación
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Paso 2: Verificar Integridad */}
              {activeStep === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Verificar Integridad del Documento
                  </Typography>

                  <Paper sx={{ p: 3, bgcolor: "grey.50", mb: 3 }}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      Hash actual del documento:
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: "monospace",
                        wordBreak: "break-all",
                        display: "block",
                        mb: 2,
                      }}
                    >
                      {proceeding.hashDocumentoFinal}
                    </Typography>

                    <Button
                      variant="contained"
                      startIcon={<SecurityIcon />}
                      onClick={handleVerifyIntegrity}
                    >
                      Verificar Integridad
                    </Button>
                  </Paper>
                </Box>
              )}

              {/* Paso 3: Aplicar Firma */}
              {activeStep === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Aplicar Firma Digital
                  </Typography>

                  <Alert severity="info" sx={{ mb: 3 }}>
                    Se utilizará el certificado digital del notario para firmar
                    el documento.
                  </Alert>

                  <Paper sx={{ p: 3, bgcolor: "grey.50", mb: 3 }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Certificado:</strong> Notario Ejemplo
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Emisor:</strong> Autoridad Certificadora Notarial
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Válido hasta:</strong> 31/12/2025
                    </Typography>
                  </Paper>

                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<VerifiedIcon />}
                      onClick={handleSign}
                      disabled={signing}
                    >
                      {signing ? "Firmando..." : "Firmar Documento"}
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Paso 4: Confirmación */}
              {activeStep === 3 && signature && (
                <Box>
                  <Alert severity="success" sx={{ mb: 3 }}>
                    <Typography variant="subtitle1">
                      ¡Documento firmado exitosamente!
                    </Typography>
                  </Alert>

                  <Paper sx={{ p: 3, bgcolor: "grey.50" }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Detalles de la firma:
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Fecha: {new Date(signature.timestamp).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Hash firmado: {signature.hashFirmado?.substring(0, 20)}...
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Certificado: {signature.certificado?.serialNumber}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography
                      variant="caption"
                      sx={{ fontFamily: "monospace", wordBreak: "break-all" }}
                    >
                      Firma: {signature.signature?.substring(0, 50)}...
                    </Typography>
                  </Paper>

                  <Box
                    sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}
                  >
                    <Button
                      variant="contained"
                      onClick={() => navigate("/notario/firmas-pendientes")}
                    >
                      Volver a Firmas Pendientes
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
