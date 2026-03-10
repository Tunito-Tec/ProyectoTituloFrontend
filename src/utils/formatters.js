export const formatRUT = (rut) => {
  if (!rut) return "";
  const clean = rut.replace(/[^0-9kK]/g, "");
  if (clean.length < 2) return clean;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${dv}`;
};

export const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(amount);
};

export const getStatusColor = (status) => {
  const colors = {
    borrador: "default",
    pendiente_revision_auxiliar: "warning",
    en_revision: "info",
    esperando_firma_cliente: "primary",
    esperando_firma_notario: "secondary",
    completado: "success",
    rechazado: "error",
  };
  return colors[status] || "default";
};

export const getStatusText = (status) => {
  const texts = {
    borrador: "Borrador",
    pendiente_revision_auxiliar: "Pendiente de Revisión",
    en_revision: "En Revisión",
    esperando_firma_cliente: "Esperando tu Firma",
    esperando_firma_notario: "Esperando Firma del Notario",
    completado: "Completado",
    rechazado: "Rechazado",
  };
  return texts[status] || status;
};
