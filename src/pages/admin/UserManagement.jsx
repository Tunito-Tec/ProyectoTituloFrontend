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
  MenuItem,
  Grid,
  Chip,
  Box,
  Alert,
  IconButton,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import api from "../../config/axios";
import RUTInput from "../../components/forms/RUTInput";

const roles = [
  { value: "cliente", label: "Cliente" },
  { value: "auxiliar", label: "Auxiliar" },
  { value: "notario", label: "Notario" },
  { value: "admin", label: "Administrador" },
];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    rut: "",
    password: "",
    rol: "cliente",
    telefono: "",
    direccion: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data } = await api.get("/admin/usuarios");
      setUsers(data.data);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        nombre: user.nombre,
        email: user.email,
        rut: user.rut,
        password: "",
        rol: user.rol,
        telefono: user.telefono || "",
        direccion: user.direccion || "",
      });
    } else {
      setEditingUser(null);
      setFormData({
        nombre: "",
        email: "",
        rut: "",
        password: "",
        rol: "cliente",
        telefono: "",
        direccion: "",
      });
    }
    setDialogOpen(true);
    setError("");
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
    setError("");
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        await api.put(`/admin/usuarios/${editingUser._id}`, formData);
        setSuccess("Usuario actualizado exitosamente");
      } else {
        await api.post("/admin/usuarios", formData);
        setSuccess("Usuario creado exitosamente");
      }
      loadUsers();
      handleCloseDialog();
    } catch (err) {
      setError(err.response?.data?.message || "Error al guardar usuario");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
      try {
        await api.delete(`/admin/usuarios/${id}`);
        setSuccess("Usuario eliminado exitosamente");
        loadUsers();
      } catch (err) {
        setError("Error al eliminar usuario");
      }
    }
  };

  const columns = [
    { field: "nombre", headerName: "Nombre", width: 200 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "rut", headerName: "RUT", width: 120 },
    {
      field: "rol",
      headerName: "Rol",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === "admin" ? "error" : "primary"}
          size="small"
        />
      ),
    },
    { field: "telefono", headerName: "Teléfono", width: 120 },
    {
      field: "actions",
      headerName: "Acciones",
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleOpenDialog(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row._id)}>
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
          <Typography variant="h5">Gestión de Usuarios</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Nuevo Usuario
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
            rows={users}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            loading={loading}
            getRowId={(row) => row._id}
          />
        </div>

        {/* Dialog de creación/edición */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
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
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <RUTInput
                  fullWidth
                  label="RUT"
                  value={formData.rut}
                  onChange={(e) =>
                    setFormData({ ...formData, rut: e.target.value })
                  }
                  required
                  disabled={!!editingUser}
                />
              </Grid>
              {!editingUser && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Contraseña"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Rol"
                  value={formData.rol}
                  onChange={(e) =>
                    setFormData({ ...formData, rol: e.target.value })
                  }
                >
                  {roles.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={formData.telefono}
                  onChange={(e) =>
                    setFormData({ ...formData, telefono: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Dirección"
                  multiline
                  rows={2}
                  value={formData.direccion}
                  onChange={(e) =>
                    setFormData({ ...formData, direccion: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingUser ? "Actualizar" : "Crear"}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}
