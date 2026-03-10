import { TextField } from "@mui/material";
import { useState } from "react";

const formatRUT = (value) => {
  if (!value) return "";

  // Limpiar el RUT
  let rut = value.replace(/[^0-9kK]/g, "");

  if (rut.length <= 1) return rut;

  // Separar cuerpo y dígito verificador
  const cuerpo = rut.slice(0, -1);
  const dv = rut.slice(-1).toUpperCase();

  // Formatear cuerpo con puntos
  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${cuerpoFormateado}-${dv}`;
};

export default function RUTInput({
  value,
  onChange,
  error,
  helperText,
  ...props
}) {
  const [displayValue, setDisplayValue] = useState(formatRUT(value));

  const handleChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9kK]/g, "");
    const formatted = formatRUT(rawValue);
    setDisplayValue(formatted);

    // Pasar el valor sin formato al padre
    onChange({
      target: {
        name: e.target.name,
        value: rawValue,
      },
    });
  };

  return (
    <TextField
      {...props}
      value={displayValue}
      onChange={handleChange}
      error={error}
      helperText={helperText}
      inputProps={{ maxLength: 12 }}
    />
  );
}
