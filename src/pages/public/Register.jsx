import { useState } from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../../config/axios";

// Función para limpiar el RUT (eliminar puntos y convertir a formato estándar)
const cleanRUT = (rut) => {
  if (!rut) return "";
  // Eliminar puntos y convertir a mayúsculas
  return rut.replace(/\./g, "").toUpperCase();
};

export default function Register() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    rut: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    }

    if (!formData.email) {
      newErrors.email = "El email es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email no válido";
    }

    if (!formData.rut) {
      newErrors.rut = "El RUT es obligatorio";
    } else {
      // Validar RUT sin puntos
      const rutLimpio = cleanRUT(formData.rut);
      if (!/^[0-9]{7,8}-[0-9kK]{1}$/.test(rutLimpio)) {
        newErrors.rut = "Formato de RUT no válido (ej: 20407752-5)";
      }
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setApiError("");

    try {
      // Limpiar RUT antes de enviar
      const rutLimpio = cleanRUT(formData.rut);

      await api.post("/auth/register", {
        nombre: formData.nombre.trim(),
        email: formData.email.toLowerCase().trim(),
        rut: rutLimpio,
        password: formData.password,
      });

      navigate("/login", {
        state: {
          success: "Registro exitoso. Por favor inicia sesión.",
        },
      });
    } catch (err) {
      console.error("Error en registro:", err);
      setApiError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Error al registrarse. Intenta nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Función para formatear RUT mientras el usuario escribe
  const formatRUT = (value) => {
    if (!value) return "";

    // Eliminar todo excepto números y K
    let rut = value.replace(/[^0-9kK]/g, "");

    if (rut.length <= 1) return rut;

    // Separar cuerpo y dígito verificador
    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1).toUpperCase();

    // Formatear cuerpo con puntos
    const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return `${cuerpoFormateado}-${dv}`;
  };

  const handleRUTChange = (e) => {
    const formatted = formatRUT(e.target.value);
    setFormData({ ...formData, rut: formatted });
  };

  return (
    <Card sx={{ maxWidth: 500, mx: "auto", mt: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Registro de Cliente
        </Typography>

        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nombre Completo"
            margin="normal"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            error={!!errors.nombre}
            helperText={errors.nombre}
            required
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            error={!!errors.email}
            helperText={errors.email}
            required
          />
          <TextField
            fullWidth
            label="RUT"
            margin="normal"
            value={formData.rut}
            onChange={handleRUTChange}
            error={!!errors.rut}
            helperText={errors.rut || "Ej: 20.407.752-5"}
            placeholder="20.407.752-5"
            required
          />
          <TextField
            fullWidth
            label="Contraseña"
            type="password"
            margin="normal"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            error={!!errors.password}
            helperText={errors.password}
            required
          />
          <TextField
            fullWidth
            label="Confirmar Contraseña"
            type="password"
            margin="normal"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            required
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? "Registrando..." : "Registrarse"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
