import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Alert,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../../config/axios";
import DynamicForm from "../../components/forms/DynamicForm";

const steps = [
  "Seleccionar Trámite",
  "Completar Datos",
  "Adjuntar Documentos",
  "Revisar",
];

export default function NewProceeding() {
  const [activeStep, setActiveStep] = useState(0);
  const [tramiteTypes, setTramiteTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({});
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/tramite-types/activos")
      .then(({ data }) => setTramiteTypes(data.data))
      .catch((err) => setError("Error al cargar tipos de trámite"));
  }, []);

  const handleTypeSelect = (tipo) => {
    setSelectedType(tipo);
    setActiveStep(1);
  };

  const handleFormSubmit = (data) => {
    setFormData(data);
    setActiveStep(2);
  };

  const handleDocumentsSubmit = async (files) => {
    setDocuments(files);
    setActiveStep(3);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const response = await api.post("/client/tramites", {
        tipo: selectedType.tipoId,
        datosFormulario: formData,
      });

      // Subir documentos si hay
      if (documents.length > 0) {
        const tramiteId = response.data.data._id;
        for (const doc of documents) {
          await api.post(`/client/tramites/${tramiteId}/documentos`, doc);
        }
      }

      navigate("/cliente/dashboard", {
        state: { message: "Trámite creado exitosamente" },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Error al crear trámite");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Selecciona el tipo de trámite
            </Typography>
            {tramiteTypes.map((tipo) => (
              <Card
                key={tipo._id}
                sx={{
                  mb: 2,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "action.hover" },
                }}
                onClick={() => handleTypeSelect(tipo)}
              >
                <CardContent>
                  <Typography variant="h6">{tipo.nombre}</Typography>
                  <Typography color="textSecondary">
                    {tipo.descripcion}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Completa los datos del trámite
            </Typography>
            <DynamicForm
              fields={selectedType?.campos || []}
              onSubmit={handleFormSubmit}
              submitLabel="Continuar"
            />
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Adjunta los documentos requeridos
            </Typography>
            {/* Aquí iría un componente de carga de archivos */}
            <Button
              variant="contained"
              onClick={() => handleDocumentsSubmit([])}
              sx={{ mt: 2 }}
            >
              Saltar (demo)
            </Button>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Revisa la información
            </Typography>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography>
                  <strong>Trámite:</strong> {selectedType?.nombre}
                </Typography>
                <Typography>
                  <strong>Datos:</strong>
                </Typography>
                <pre>{JSON.stringify(formData, null, 2)}</pre>
              </CardContent>
            </Card>
            <Button
              variant="contained"
              onClick={handleFinalSubmit}
              disabled={loading}
              fullWidth
            >
              {loading ? "Creando..." : "Crear Trámite"}
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Nuevo Trámite
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

        {renderStepContent()}

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          <Button
            onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
            disabled={activeStep === 0}
          >
            Atrás
          </Button>
          <Button
            onClick={() => navigate("/cliente/dashboard")}
            color="inherit"
          >
            Cancelar
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
