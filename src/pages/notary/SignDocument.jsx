import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../config/axios";
import DocumentList from "../../components/documents/DocumentList";
import { formatDate } from "../../utils/formatters";

const STEPS = [
  { label: "Revisar", hint: "Revisa el documento" },
  { label: "Integridad", hint: "Verifica el hash" },
  { label: "Firmar", hint: "Aplica la firma" },
  { label: "Confirmación", hint: "Proceso completo" },
];

export default function SignDocument() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proceeding, setProceeding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [hashVerified, setHashVerified] = useState(false);
  const [signature, setSignature] = useState(null);
  const [csv, setCsv] = useState("");

  useEffect(() => {
    loadProceeding();
  }, [id]);

  const loadProceeding = async () => {
    try {
      const { data } = await api.get(`/notario/tramites/${id}`);
      setProceeding(data.data);
      setCsv(data.data.csv || "");
    } catch (err) {
      setError(err.response?.data?.message || "Error al cargar trámite");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyIntegrity = async () => {
    if (!proceeding?.hashDocumentoFinal) {
      setError("Este trámite no tiene hash de integridad generado");
      return;
    }
    setVerifying(true);
    setError("");
    try {
      const { data } = await api.post(
        `/notario/tramites/${id}/verificar-integridad`,
        {},
      );
      setHashVerified(data.data.isIntegro);
      if (data.data.isIntegro) {
        setActiveStep(2);
      } else {
        setError("El documento ha sido modificado. No se puede firmar.");
      }
    } catch (err) {
      setError(
        err.response?.status === 400
          ? err.response?.data?.message || "Error al verificar integridad"
          : "Error al conectar con el servidor",
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleSign = async () => {
    setSigning(true);
    setError("");
    try {
      const { data } = await api.post(`/notario/tramites/${id}/firmar`);
      setSignature(data.data.firma);
      setSuccess("Documento firmado exitosamente");
      setActiveStep(3);
      const refreshed = await api.get(`/notario/tramites/${id}`);
      setCsv(refreshed.data.data.csv || "");
    } catch (err) {
      setError(err.response?.data?.message || "Error al firmar documento");
    } finally {
      setSigning(false);
    }
  };

  const handleDownloadCopy = async () => {
    setDownloading(true);
    try {
      const response = await api.get(`/notario/tramites/${id}/copia-cliente`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", `documento-${id.slice(-6)}.pdf`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Error al descargar la copia del documento");
    } finally {
      setDownloading(false);
    }
  };

  if (loading)
    return (
      <div style={s.centered}>
        <div style={s.spinner} />
        <p
          style={{
            color: "#6B7280",
            fontFamily: "'DM Sans', sans-serif",
            marginTop: 16,
          }}
        >
          Cargando trámite…
        </p>
      </div>
    );

  if (!proceeding)
    return (
      <div style={{ ...s.alertBox, ...s.alertWarning }}>
        Trámite no encontrado.
      </div>
    );

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap"
        rel="stylesheet"
      />

      <div style={s.page}>
        {/* Top bar */}
        <div style={s.topBar}>
          <button
            style={s.backBtn}
            onClick={() => navigate("/notario/firmas-pendientes")}
          >
            ← Volver a pendientes
          </button>
          <div style={s.proceedingMeta}>
            <span style={s.metaId}>
              #{proceeding._id?.slice(-6).toUpperCase()}
            </span>
            <span style={s.metaDot}>·</span>
            <span style={s.metaType}>
              {proceeding.tipo?.nombre || proceeding.tipo}
            </span>
          </div>
        </div>

        {/* Page title */}
        <div style={{ marginBottom: 28 }}>
          <p style={s.pageLabel}>NOTARIO</p>
          <h1 style={s.pageTitle}>Firma digital de documento</h1>
        </div>

        {/* Stepper */}
        <div style={s.stepper}>
          {STEPS.map((step, i) => {
            const done = i < activeStep,
              active = i === activeStep;
            return (
              <div key={step.label} style={s.stepWrapper}>
                {i > 0 && (
                  <div
                    style={{
                      ...s.connector,
                      background: done ? "#111827" : "#E5E7EB",
                    }}
                  />
                )}
                <div style={s.stepCol}>
                  <div
                    style={{
                      ...s.stepCircle,
                      background: done
                        ? "#111827"
                        : active
                          ? "#fff"
                          : "#F9FAFB",
                      border:
                        active || done
                          ? "2px solid #111827"
                          : "2px solid #E5E7EB",
                      color: done ? "#fff" : active ? "#111827" : "#9CA3AF",
                    }}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                  <span
                    style={{
                      ...s.stepLabel,
                      color: active ? "#111827" : done ? "#374151" : "#9CA3AF",
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Alerts */}
        {error && (
          <div style={{ ...s.alertBox, ...s.alertError, marginBottom: 16 }}>
            ⚠ {error}
          </div>
        )}
        {success && (
          <div style={{ ...s.alertBox, ...s.alertSuccess, marginBottom: 16 }}>
            ✓ {success}
          </div>
        )}

        {/* Step content */}
        <div style={s.card}>
          {/* Step 0: Review */}
          {activeStep === 0 && (
            <div>
              <h2 style={s.cardTitle}>Revisa el documento</h2>
              <p style={s.cardHint}>
                Verifica que el contenido sea correcto antes de continuar.
              </p>
              <DocumentList
                documents={proceeding.documentos || []}
                onDownload={(doc) => doc?.url && window.open(doc.url, "_blank")}
              />
              {(!proceeding.documentos ||
                proceeding.documentos.length === 0) && (
                <p style={s.empty}>Sin documentos adjuntos.</p>
              )}
              <div style={s.stepFooter}>
                <button style={s.primaryBtn} onClick={() => setActiveStep(1)}>
                  Continuar a verificación →
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Verify integrity */}
          {activeStep === 1 && (
            <div>
              <h2 style={s.cardTitle}>Verificar integridad</h2>
              <p style={s.cardHint}>
                Comprueba que el documento no ha sido modificado desde su
                creación.
              </p>
              <div style={s.hashBox}>
                <p style={s.hashLabel}>Hash SHA-256 del documento</p>
                <p style={s.hashValue}>
                  {proceeding.hashDocumentoFinal || "No disponible"}
                </p>
              </div>
              {hashVerified && (
                <div
                  style={{ ...s.alertBox, ...s.alertSuccess, marginBottom: 16 }}
                >
                  ✓ Integridad verificada — el documento no ha sido alterado
                </div>
              )}
              <div style={s.stepFooter}>
                <button
                  style={s.primaryBtn}
                  onClick={handleVerifyIntegrity}
                  disabled={verifying}
                >
                  {verifying ? "Verificando…" : "Verificar integridad"}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Apply signature */}
          {activeStep === 2 && (
            <div>
              <h2 style={s.cardTitle}>Aplicar firma digital</h2>
              <p style={s.cardHint}>
                Se utilizará el certificado digital del notario para firmar.
              </p>

              <div style={s.certCard}>
                <div style={s.certIcon}>
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                </div>
                <div>
                  <p style={s.certTitle}>Certificado notarial</p>
                  <div style={s.certMeta}>
                    <span>Emisor: Autoridad Certificadora Notarial</span>
                    <span>Válido hasta: 31/12/2025</span>
                  </div>
                </div>
              </div>

              <div style={s.stepFooter}>
                <button
                  style={{ ...s.primaryBtn, opacity: signing ? 0.7 : 1 }}
                  onClick={handleSign}
                  disabled={signing}
                >
                  {signing ? "Firmando…" : "✍ Firmar documento"}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {activeStep === 3 && signature && (
            <div>
              <h2 style={s.cardTitle}>Documento firmado</h2>

              {/* CSV */}
              {csv && (
                <div style={s.csvCard}>
                  <p style={s.csvLabel}>Código de verificación (CSV)</p>
                  <p style={s.csvValue}>{csv}</p>
                  <p style={s.csvHint}>
                    Guarda este código para verificar la autenticidad del
                    documento.
                  </p>
                </div>
              )}

              {/* Signature details */}
              <div style={s.sigDetails}>
                <p style={s.sigDetailsTitle}>Detalles de la firma</p>
                <div style={s.sigGrid}>
                  <SigItem
                    label="Fecha"
                    value={new Date(signature.timestamp).toLocaleString(
                      "es-CL",
                    )}
                  />
                  <SigItem
                    label="Certificado"
                    value={signature.certificado?.serialNumber || "—"}
                  />
                  <SigItem
                    label="Hash firmado"
                    value={`${signature.hashFirmado?.substring(0, 24)}…`}
                    mono
                  />
                  <SigItem
                    label="Firma"
                    value={`${signature.signature?.substring(0, 24)}…`}
                    mono
                  />
                </div>
              </div>

              {/* Actions */}
              <div style={s.finalActions}>
                <button
                  style={{ ...s.outlineBtn, opacity: downloading ? 0.7 : 1 }}
                  onClick={handleDownloadCopy}
                  disabled={downloading}
                >
                  {downloading
                    ? "Descargando…"
                    : "↓ Descargar copia para cliente"}
                </button>
                <button
                  style={s.primaryBtn}
                  onClick={() => navigate("/notario/documentos-entregables")}
                >
                  Ver documentos entregables →
                </button>
                <button
                  style={s.ghostBtn}
                  onClick={() => navigate("/notario/firmas-pendientes")}
                >
                  Volver a pendientes
                </button>
              </div>

              <div style={{ ...s.alertBox, ...s.alertInfo, marginTop: 16 }}>
                El documento ha sido añadido a "Documentos entregables" y puede
                descargarse en cualquier momento.
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function SigItem({ label, value, mono }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#9CA3AF",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          color: "#374151",
          fontFamily: mono ? "monospace" : undefined,
        }}
      >
        {value}
      </span>
    </div>
  );
}

const s = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    color: "#111827",
    maxWidth: 760,
    margin: "0 auto",
  },
  centered: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
  },
  spinner: {
    width: 28,
    height: 28,
    border: "3px solid #E5E7EB",
    borderTopColor: "#111827",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backBtn: {
    background: "none",
    border: "1px solid #E5E7EB",
    borderRadius: 8,
    padding: "7px 14px",
    fontSize: 13,
    color: "#374151",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  proceedingMeta: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    color: "#6B7280",
  },
  metaId: { fontFamily: "monospace", fontWeight: 600, color: "#111827" },
  metaDot: { color: "#D1D5DB" },
  metaType: {},

  pageLabel: {
    margin: "0 0 4px",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.1em",
    color: "#9CA3AF",
  },
  pageTitle: {
    margin: 0,
    fontFamily: "'DM Serif Display', serif",
    fontSize: 28,
    fontWeight: 400,
  },

  stepper: { display: "flex", alignItems: "center", marginBottom: 28 },
  stepWrapper: { display: "flex", alignItems: "center", flex: 1 },
  connector: { height: 2, flex: 1, minWidth: 12, transition: "background .3s" },
  stepCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 600,
    transition: "all .2s",
  },
  stepLabel: {
    fontSize: 11,
    textAlign: "center",
    maxWidth: 72,
    lineHeight: 1.3,
  },

  card: {
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: 16,
    padding: "28px",
    boxShadow: "0 1px 4px rgba(0,0,0,.04)",
  },
  cardTitle: {
    margin: "0 0 6px",
    fontFamily: "'DM Serif Display', serif",
    fontSize: 20,
    fontWeight: 400,
  },
  cardHint: { margin: "0 0 20px", fontSize: 14, color: "#6B7280" },
  stepFooter: { marginTop: 24, display: "flex", justifyContent: "flex-end" },
  empty: {
    color: "#9CA3AF",
    fontSize: 14,
    textAlign: "center",
    padding: "24px 0",
  },

  hashBox: {
    background: "#111827",
    borderRadius: 10,
    padding: "14px 18px",
    marginBottom: 16,
  },
  hashLabel: {
    margin: "0 0 6px",
    fontSize: 11,
    fontWeight: 600,
    color: "#6B7280",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  hashValue: {
    margin: 0,
    fontFamily: "monospace",
    fontSize: 12,
    color: "#34D399",
    wordBreak: "break-all",
    lineHeight: 1.7,
  },

  certCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
    background: "#ECFDF5",
    border: "1px solid #A7F3D0",
    borderRadius: 12,
    padding: "16px 18px",
    marginBottom: 16,
  },
  certIcon: {
    width: 40,
    height: 40,
    background: "#D1FAE5",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  certTitle: {
    margin: "0 0 4px",
    fontSize: 14,
    fontWeight: 600,
    color: "#111827",
  },
  certMeta: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    fontSize: 12,
    color: "#065F46",
  },

  csvCard: {
    background: "#EFF6FF",
    border: "1px solid #BFDBFE",
    borderRadius: 12,
    padding: "16px 20px",
    marginBottom: 20,
  },
  csvLabel: {
    margin: "0 0 8px",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    color: "#1D4ED8",
    textTransform: "uppercase",
  },
  csvValue: {
    margin: "0 0 6px",
    fontFamily: "monospace",
    fontSize: 20,
    fontWeight: 700,
    color: "#1E40AF",
    letterSpacing: "0.06em",
  },
  csvHint: { margin: 0, fontSize: 12, color: "#3B82F6" },

  sigDetails: {
    background: "#F9FAFB",
    border: "1px solid #E5E7EB",
    borderRadius: 12,
    padding: "16px 20px",
    marginBottom: 20,
  },
  sigDetailsTitle: {
    margin: "0 0 14px",
    fontSize: 13,
    fontWeight: 600,
    color: "#111827",
  },
  sigGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px 20px",
  },

  finalActions: { display: "flex", gap: 10, flexWrap: "wrap" },
  primaryBtn: {
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: 9,
    padding: "10px 20px",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  outlineBtn: {
    background: "#fff",
    color: "#111827",
    border: "1px solid #E5E7EB",
    borderRadius: 9,
    padding: "10px 20px",
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  ghostBtn: {
    background: "#F9FAFB",
    color: "#6B7280",
    border: "1px solid #E5E7EB",
    borderRadius: 9,
    padding: "10px 20px",
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },

  alertBox: { borderRadius: 9, padding: "10px 14px", fontSize: 13 },
  alertError: {
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    color: "#991B1B",
  },
  alertSuccess: {
    background: "#ECFDF5",
    border: "1px solid #A7F3D0",
    color: "#065F46",
  },
  alertInfo: {
    background: "#EFF6FF",
    border: "1px solid #BFDBFE",
    color: "#1E40AF",
  },
  alertWarning: {
    background: "#FFFBEB",
    border: "1px solid #FDE68A",
    color: "#92400E",
  },
};
