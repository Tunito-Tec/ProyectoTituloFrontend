import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Button,
  Box,
} from "@mui/material";
import RUTInput from "./RUTInput";

export default function DynamicForm({
  fields,
  onSubmit,
  initialData = {},
  submitLabel = "Guardar",
}) {
  // Construir esquema de validación dinámico
  const validationSchema = yup.object().shape(
    fields.reduce((schema, field) => {
      let validator = yup.string();

      if (field.requerido) {
        validator = validator.required(`${field.etiqueta} es requerido`);
      }

      if (field.tipo === "email") {
        validator = validator.email("Email no válido");
      }

      if (field.tipo === "number") {
        validator = yup.number().typeError("Debe ser un número");
      }

      if (field.tipo === "rut") {
        validator = validator.test("rut", "RUT no válido", (value) => {
          if (!value) return !field.requerido;
          // Aquí iría la validación de RUT
          return value.length >= 8;
        });
      }

      return { ...schema, [field.nombre]: validator };
    }, {}),
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: initialData,
  });

  const renderField = (field) => {
    const commonProps = {
      ...register(field.nombre),
      label: field.etiqueta,
      error: !!errors[field.nombre],
      helperText: errors[field.nombre]?.message,
      fullWidth: true,
      margin: "normal",
      required: field.requerido,
    };

    switch (field.tipo) {
      case "select":
        return (
          <FormControl fullWidth margin="normal" error={!!errors[field.nombre]}>
            <InputLabel>{field.etiqueta}</InputLabel>
            <Select {...register(field.nombre)} label={field.etiqueta}>
              {field.opciones?.map((opcion) => (
                <MenuItem key={opcion} value={opcion}>
                  {opcion}
                </MenuItem>
              ))}
            </Select>
            {errors[field.nombre] && (
              <FormHelperText>{errors[field.nombre].message}</FormHelperText>
            )}
          </FormControl>
        );

      case "textarea":
        return <TextField {...commonProps} multiline rows={4} />;

      case "rut":
        return (
          <RUTInput
            {...commonProps}
            onChange={(e) => register(field.nombre).onChange(e)}
          />
        );

      default:
        return (
          <TextField
            {...commonProps}
            type={field.tipo === "number" ? "number" : "text"}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        {fields.map((field) => (
          <Grid
            item
            xs={12}
            md={field.tipo === "textarea" ? 12 : 6}
            key={field.nombre}
          >
            {renderField(field)}
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button type="submit" variant="contained" color="primary">
          {submitLabel}
        </Button>
      </Box>
    </form>
  );
}
