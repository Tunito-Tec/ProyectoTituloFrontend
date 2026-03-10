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
  TextField,
  Alert,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Assignment as AssignIcon,
} from "@mui/icons-material";
import api from "../../config/axios";
import DocumentList from "../../components/documents/DocumentList";
import {
  getStatusColor,
  getStatusText,
  formatDate,
} from "../../utils/formatters";

export default function ProceedingReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proceeding, setProceeding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comments, setComments] = useState("");
  const [assignDialog, setAssignDialog] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

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

  const loadUsers = async (rol) => {
    try {
      const { data } = await api.get(`/admin/usuarios?rol=${rol}`);
      setUsers(data.data);
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };

  const handleApprove = async () => {
    try {
      await api.put(`/auxiliar/tramites/${id}/revisar`, {
        aprobado: true,
        comentarios: comments,
      });
      navigate("/auxiliar/tramites");
    } catch (err) {
      setError("Error al aprobar trámite");
    }
  };

  const handleReject = async () => {
    try {
      await api.post(`/auxiliar/tramites/${id}/solicitar-correcciones`, {
        correcciones: comments,
      });
      navigate("/auxiliar/tramites");
    } catch (err) {
      setError("Error al rechazar trámite");
    }
  };

  const handleAssign = async () => {
    try {
      await api.put(`/auxiliar/tramites/${id}/asignar`, {
        usuarioId: selectedUser,
        rol: "notario",
      });
      setAssignDialog(false);
      loadProceeding();
    } catch (err) {
      setError("Error al asignar trámite");
    }
  };

  const openAssignDialog = () => {
    loadUsers("notario");
    setAssignDialog(true);
  };

  if (loading) return <Typography>Cargando...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!proceeding)
    return <Alert severity="warning">Trámite no encontrado</Alert>;

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/auxiliar/tramites")}
        sx={{ mb: 2 }}
      >
        Volver a la lista
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
                  Revisión de Trámite #{proceeding._id.slice(-6)}
                </Typography>
                <Chip
                  label={getStatusText(proceeding.estado)}
                  color={getStatusColor(proceeding.estado)}
                />
              </Box>
              <Typography color="textSecondary">
                Cliente: {proceeding.cliente?.nombre} ({proceeding.cliente?.rut}
                )
              </Typography>
              <Typography variant="body2">
                Iniciado: {formatDate(proceeding.createdAt)}
              </Typography>
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
                  <Box key={key} sx={{ mb: 2 }}>
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
                Documentos Adjuntos
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <DocumentList
                documents={proceeding.documentos || []}
                onDownload={(doc) => window.open(doc.url, "_blank")}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Asignación */}
        {!proceeding.asignadoA && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Asignar Trámite
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Button
                  variant="contained"
                  startIcon={<AssignIcon />}
                  onClick={openAssignDialog}
                >
                  Asignar a Notario
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Comentarios y acciones */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revisión
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Comentarios"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Agrega observaciones sobre el trámite..."
                sx={{ mb: 3 }}
              />

              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<ApproveIcon />}
                  onClick={handleApprove}
                >
                  Aprobar
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<RejectIcon />}
                  onClick={handleReject}
                >
                  Solicitar Correcciones
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Diálogo de asignación */}
      <Dialog open={assignDialog} onClose={() => setAssignDialog(false)}>
        <DialogTitle>Asignar a Notario</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Seleccionar Notario"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            sx={{ mt: 2 }}
          >
            {users.map((user) => (
              <MenuItem key={user._id} value={user._id}>
                {user.nombre}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog(false)}>Cancelar</Button>
          <Button onClick={handleAssign} variant="contained">
            Asignar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
