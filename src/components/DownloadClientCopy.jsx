// components/DownloadClientCopy.jsx
import { Button } from "@mui/material";
import { Download as DownloadIcon } from "@mui/icons-material";
import api from "../config/axios";

export default function DownloadClientCopy({ proceedingId }) {
  const handleDownload = async () => {
    try {
      const response = await api.get(
        `/notario/tramites/${proceedingId}/copia-cliente`,
        {
          responseType: "blob",
        },
      );

      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `documento-${proceedingId.slice(-6)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar:", error);
    }
  };

  return (
    <Button
      variant="outlined"
      startIcon={<DownloadIcon />}
      onClick={handleDownload}
    >
      Descargar Copia para Cliente
    </Button>
  );
}
