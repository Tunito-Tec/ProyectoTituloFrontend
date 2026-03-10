import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Box,
  Alert,
  IconButton,
  Chip,
  FormControlLabel,
  Switch,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ToggleOn as ToggleIcon,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import api from "../../config/axios";

const fieldTypes = [
  { value: "text", label: "Texto" },
  { value: "number", label: "Número" },
  { value: "date", label: "Fecha" },
  { value: "email", label: "Email" },
  { value: "rut", label: "RUT" },
  { value: "select", label: "Selección" },
  { value: "textarea", label: "Área de texto" },
];

export default function TramiteTypeManagement() {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    tipoId: "",
    descripcion: "",
    activo: true,
    campos: [],
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [campoDialogOpen, setCampoDialogOpen] = useState(false);
  const [editingCampo, setEditingCampo] = useState(null);
  const [campoForm, setCampoForm] = useState({
    nombre: "",
    etiqueta: "",
    tipo: "text",
    requerido: false,
    opciones: "",
  });

  useEffect(() => {
    loadTipos();
  }, []);

  const loadTipos = async () => {
    try {
      const { data } = await api.get("/tramite-types/activos");
      setTipos(data.data);
    } catch (error) {
      console.error("Error loading tipos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (tipo = null) => {
    if (tipo) {
      setEditingTipo(tipo);
      setFormData({
        nombre: tipo.nombre,
        tipoId: tipo.tipoId,
        descripcion: tipo.descripcion || "",
        activo: tipo.activo !== false,
        campos: tipo.campos || [],
      });
    } else {
      setEditingTipo(null);
      setFormData({
        nombre: "",
        tipoId: "",
        descripcion: "",
        activo: true,
        campos: [],
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTipo(null);
    setError("");
  };

  const handleSubmit = async () => {
    try {
      if (editingTipo) {
        await api.put(`/admin/tipos-tramite/${editingTipo.tipoId}`, formData);
        setSuccess("Tipo de trámite actualizado");
      } else {
        await api.post("/admin/tipos-tramite", formData);
        setSuccess("Tipo de trámite creado");
      }
      loadTipos();
      handleCloseDialog();
    } catch (err) {
      setError(err.response?.data?.message || "Error al guardar");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este tipo de trámite?")) {
      try {
        await api.delete(`/admin/tipos-tramite/${id}`);
        setSuccess("Tipo de trámite eliminado");
        loadTipos();
      } catch (err) {
        setError("Error al eliminar");
      }
    }
  };

  const handleToggleActive = async (tipo) => {
    try {
      await api.put(`/admin/tipos-tramite/${tipo.tipoId}`, {
        ...tipo,
        activo: !tipo.activo,
      });
      loadTipos();
    } catch (err) {
      setError("Error al cambiar estado");
    }
  };

  const handleOpenCampoDialog = (campo = null) => {
    if (campo) {
      setEditingCampo(campo);
      setCampoForm({
        nombre: campo.nombre,
        etiqueta: campo.etiqueta,
        tipo: campo.tipo,
        requerido: campo.requerido || false,
        opciones: campo.opciones?.join(", ") || "",
      });
    } else {
      setEditingCampo(null);
      setCampoForm({
        nombre: "",
        etiqueta: "",
        tipo: "text",
        requerido: false,
        opciones: "",
      });
    }
    setCampoDialogOpen(true);
  };

  const handleSaveCampo = () => {
    const nuevoCampo = {
      ...campoForm,
      opciones:
        campoForm.tipo === "select"
          ? campoForm.opciones.split(",").map((o) => o.trim())
          : undefined,
    };

    if (editingCampo) {
      const index = formData.campos.findIndex(
        (c) => c.nombre === editingCampo.nombre,
      );
      if (index !== -1) {
        const nuevosCampos = [...formData.campos];
        nuevosCampos[index] = nuevoCampo;
        setFormData({ ...formData, campos: nuevosCampos });
      }
    } else {
      setFormData({
        ...formData,
        campos: [...formData.campos, nuevoCampo],
      });
    }
    setCampoDialogOpen(false);
  };

  const handleRemoveCampo = (nombre) => {
    setFormData({
      ...formData,
      campos: formData.campos.filter((c) => c.nombre !== nombre),
    });
  };

  const columns = [
    { field: "nombre", headerName: "Nombre", width: 200 },
    { field: "tipoId", headerName: "ID", width: 150 },
    { field: "descripcion", headerName: "Descripción", width: 250 },
    {
      field: "activo",
      headerName: "Estado",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Activo" : "Inactivo"}
          color={params.value ? "success" : "default"}
          size="small"
        />
      ),
    },
    {
      field: "campos",
      headerName: "Campos",
      width: 100,
      valueGetter: (params) => params.value?.length || 0,
    },
    {
      field: "actions",
      headerName: "Acciones",
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleOpenDialog(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleToggleActive(params.row)}>
            <ToggleIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row.tipoId)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h5">Tipos de Trámite</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Nuevo Tipo
          </Button>
        </Box>

        {success && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setSuccess("")}
          >
            {success}
          </Alert>
        )}

        <div style={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={tipos}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            loading={loading}
            getRowId={(row) => row.tipoId}
          />
        </div>

        {/* Dialog principal */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingTipo ? "Editar Tipo de Trámite" : "Nuevo Tipo de Trámite"}
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="ID único"
                  value={formData.tipoId}
                  onChange={(e) =>
                    setFormData({ ...formData, tipoId: e.target.value })
                  }
                  required
                  disabled={!!editingTipo}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción"
                  multiline
                  rows={2}
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.activo}
                      onChange={(e) =>
                        setFormData({ ...formData, activo: e.target.checked })
                      }
                    />
                  }
                  label="Activo"
                />
              </Grid>

              {/* Campos del formulario */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Campos del Formulario
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleOpenCampoDialog()}
                  sx={{ mb: 2 }}
                >
                  Agregar Campo
                </Button>

                {formData.campos.map((campo, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      mb: 1,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2">
                        {campo.etiqueta}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {campo.nombre} - {campo.tipo}
                        {campo.requerido && " *"}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenCampoDialog(campo)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveCampo(campo.nombre)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingTipo ? "Actualizar" : "Crear"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog para campos */}
        <Dialog
          open={campoDialogOpen}
          onClose={() => setCampoDialogOpen(false)}
        >
          <DialogTitle>
            {editingCampo ? "Editar Campo" : "Nuevo Campo"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1, width: 400 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre del campo"
                  value={campoForm.nombre}
                  onChange={(e) =>
                    setCampoForm({ ...campoForm, nombre: e.target.value })
                  }
                  helperText="Identificador único (ej: nombre_cliente)"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Etiqueta"
                  value={campoForm.etiqueta}
                  onChange={(e) =>
                    setCampoForm({ ...campoForm, etiqueta: e.target.value })
                  }
                  helperText="Texto visible para el usuario"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Tipo"
                  value={campoForm.tipo}
                  onChange={(e) =>
                    setCampoForm({ ...campoForm, tipo: e.target.value })
                  }
                >
                  {fieldTypes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              {campoForm.tipo === "select" && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Opciones"
                    value={campoForm.opciones}
                    onChange={(e) =>
                      setCampoForm({ ...campoForm, opciones: e.target.value })
                    }
                    helperText="Separar con comas"
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={campoForm.requerido}
                      onChange={(e) =>
                        setCampoForm({
                          ...campoForm,
                          requerido: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Campo requerido"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCampoDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveCampo} variant="contained">
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}
