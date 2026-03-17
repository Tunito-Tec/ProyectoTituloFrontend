import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../config/axios";
import DocumentList from "../../components/documents/DocumentList";
import { getStatusText, formatDate } from "../../utils/formatters";

// ── Constants ──────────────────────────────────────────────
const STEPS = [
  { label: "Iniciado", key: "borrador" },
  { label: "En revisión", key: "en_revision" },
  { label: "Firma cliente", key: "esperando_firma_cliente" },
  { label: "Firma notario", key: "esperando_firma_notario" },
  { label: "Completado", key: "completado" },
];

const STATUS_STEP_MAP = {
  borrador: 0,
  pendiente_revision_auxiliar: 1,
  en_revision: 1,
  esperando_firma_cliente: 2,
  esperando_firma_notario: 3,
  completado: 4,
};

const STATUS_STYLES = {
  pendiente: { bg: "#FEF3C7", color: "#92400E", dot: "#F59E0B" },
  aprobado: { bg: "#D1FAE5", color: "#065F46", dot: "#10B981" },
  rechazado: { bg: "#FEE2E2", color: "#991B1B", dot: "#EF4444" },
  completado: { bg: "#D1FAE5", color: "#065F46", dot: "#10B981" },
  en_revision: { bg: "#E0E7FF", color: "#3730A3", dot: "#6366F1" },
  esperando_firma_cliente: { bg: "#FEF3C7", color: "#92400E", dot: "#F59E0B" },
  esperando_firma_notario: { bg: "#EDE9FE", color: "#5B21B6", dot: "#8B5CF6" },
  borrador: { bg: "#F3F4F6", color: "#374151", dot: "#9CA3AF" },
};

const getStatusStyle = (estado = "") => {
  const key = estado.toLowerCase();
  return (
    STATUS_STYLES[key] || { bg: "#F3F4F6", color: "#374151", dot: "#9CA3AF" }
  );
};

// ── Main component ─────────────────────────────────────────
export default function ProceedingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proceeding, setProceeding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    loadProceeding();
  }, [id]);

  const loadProceeding = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/client/tramites/${id}`);
      setProceeding(data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error al cargar el trámite");
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    setSigning(true);
    try {
      // Cambiar de /notario/tramites/:id/firmar a /client/tramites/:id/firmar
      await api.post(`/client/tramites/${id}/firmar`);
      loadProceeding();
    } catch {
      setError("Error al firmar el documento");
    } finally {
      setSigning(false);
    }
  };

  // ── Loading ──
  if (loading)
    return (
      <div style={s.centered}>
        <div style={s.spinner} />
        <p
          style={{
            color: "#6B7280",
            marginTop: 16,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Cargando trámite…
        </p>
      </div>
    );

  // ── Error ──
  if (error)
    return (
      <div style={s.centered}>
        <div style={s.errorBox}>
          <span>⚠️</span>
          <p
            style={{
              margin: 0,
              color: "#991B1B",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {error}
          </p>
          <button
            style={s.ghostBtn}
            onClick={() => navigate("/cliente/dashboard")}
          >
            Volver
          </button>
        </div>
      </div>
    );

  if (!proceeding)
    return (
      <div style={s.centered}>
        <p style={{ color: "#6B7280", fontFamily: "'DM Sans', sans-serif" }}>
          No se encontró el trámite solicitado.
        </p>
      </div>
    );

  const currentStep = STATUS_STEP_MAP[proceeding.estado] ?? 0;
  const statusStyle = getStatusStyle(proceeding.estado);
  const formEntries = Object.entries(proceeding.datosFormulario || {});
  const canSign = proceeding.estado === "esperando_firma_cliente";

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
            onClick={() => navigate("/cliente/dashboard")}
          >
            ← Volver al dashboard
          </button>
          <div
            style={{
              ...s.statusBadge,
              background: statusStyle.bg,
              color: statusStyle.color,
            }}
          >
            <span style={{ ...s.statusDot, background: statusStyle.dot }} />
            {getStatusText(proceeding.estado)}
          </div>
        </div>

        {/* Header card */}
        <div style={s.headerCard}>
          <div>
            <p style={s.headerLabel}>TRÁMITE</p>
            <h1 style={s.headerTitle}>
              #{proceeding._id?.slice(-6).toUpperCase()}
            </h1>
            <p style={s.headerSub}>
              {proceeding.tipo?.nombre ||
                proceeding.tipo ||
                "Tipo no especificado"}
            </p>
          </div>
          <div style={s.headerMeta}>
            <MetaItem
              label="Iniciado"
              value={formatDate(proceeding.createdAt)}
            />
            {proceeding.asignadoA && (
              <MetaItem label="Notario" value={proceeding.asignadoA.nombre} />
            )}
          </div>
        </div>

        {/* Progress stepper */}
        <div style={s.card}>
          <h2 style={s.sectionTitle}>Progreso del trámite</h2>
          <div style={s.stepper}>
            {STEPS.map((step, i) => {
              const done = i < currentStep;
              const active = i === currentStep;
              return (
                <div key={step.key} style={s.stepWrapper}>
                  {/* connector line before */}
                  {i > 0 && (
                    <div
                      style={{
                        ...s.connector,
                        background: done || active ? "#111827" : "#E5E7EB",
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
                        border: active
                          ? "2px solid #111827"
                          : done
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
                        color: active
                          ? "#111827"
                          : done
                            ? "#374151"
                            : "#9CA3AF",
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
        </div>

        {/* Body grid */}
        <div style={s.grid}>
          {/* Datos del formulario */}
          <Section title="Datos ingresados">
            {formEntries.length === 0 ? (
              <p style={s.empty}>No hay datos ingresados.</p>
            ) : (
              <div style={s.dataGrid}>
                {formEntries.map(([key, value]) => (
                  <div key={key} style={s.dataItem}>
                    <span style={s.dataKey}>{key.replace(/_/g, " ")}</span>
                    <span style={s.dataVal}>{value || "No especificado"}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Documentos */}
          <Section title="Documentos adjuntos">
            <DocumentList
              documents={proceeding.documentos || []}
              onDownload={(doc) => doc?.url && window.open(doc.url, "_blank")}
            />
            {(!proceeding.documentos || proceeding.documentos.length === 0) && (
              <p style={s.empty}>Sin documentos adjuntos.</p>
            )}
            {canSign && (
              <button
                style={{ ...s.signBtn, opacity: signing ? 0.7 : 1 }}
                onClick={handleSign}
                disabled={signing}
              >
                {signing ? "Firmando…" : "✍ Firmar documento"}
              </button>
            )}
          </Section>
        </div>

        {/* Hash de integridad */}
        {proceeding.hashDocumentoFinal && (
          <div style={s.card}>
            <h2 style={s.sectionTitle}>Hash de integridad (SHA-256)</h2>
            <div style={s.hashBox}>{proceeding.hashDocumentoFinal}</div>
          </div>
        )}

        {/* ===== INFORMACIÓN DE ENTREGA DEL DOCUMENTO ===== */}
        {proceeding.estado === "completado" && (
          <div style={s.card}>
            <h2 style={s.sectionTitle}>📍 ¿Dónde obtener mi documento?</h2>

            <div style={s.deliveryInfo}>
              <div style={s.deliveryOption}>
                <div style={s.deliveryIcon}>🏛️</div>
                <div style={s.deliveryContent}>
                  <h3 style={s.deliveryTitle}>En la notaría (Recomendado)</h3>
                  <p style={s.deliveryText}>
                    <strong>Dirección:</strong> Av. Principal 123, Oficina 405,
                    Santiago
                    <br />
                    <strong>Horario:</strong> Lunes a Viernes, 9:00 - 18:00 hrs
                    <br />
                    <strong>Presentar:</strong> Cédula de identidad vigente
                  </p>
                  <div style={s.deliveryNote}>
                    ⚠️ El documento original queda en la notaría. Se entrega
                    copia oficial impresa.
                  </div>
                </div>
              </div>

              <div style={s.deliveryOption}>
                <div style={s.deliveryIcon}>📱</div>
                <div style={s.deliveryContent}>
                  <h3 style={s.deliveryTitle}>Copia digital (Para consulta)</h3>
                  <p style={s.deliveryText}>
                    Puede solicitar una copia digital enviando un email a:
                    <br />
                    <strong>documentos@notaria.cl</strong> indicando el ID del
                    trámite #{proceeding._id?.slice(-6).toUpperCase()}
                  </p>
                  <div style={s.deliveryNote}>
                    📄 La copia digital incluirá código de verificación (CSV)
                  </div>
                </div>
              </div>

              {proceeding.csv && (
                <div style={s.deliveryOption}>
                  <div style={s.deliveryIcon}>✅</div>
                  <div style={s.deliveryContent}>
                    <h3 style={s.deliveryTitle}>Código de verificación</h3>
                    <p style={s.deliveryText}>
                      <strong>CSV:</strong>{" "}
                      <span style={s.csvCode}>{proceeding.csv}</span>
                    </p>
                    <p style={s.deliveryNote}>
                      Guarde este código para verificar la autenticidad del
                      documento en
                      <strong> www.notaria.cl/verificar</strong>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Historial */}
        <div style={s.card}>
          <h2 style={s.sectionTitle}>Historial de acciones</h2>
          {proceeding.historial?.length > 0 ? (
            <div style={s.timeline}>
              {proceeding.historial.map((item, i) => (
                <div key={i} style={s.timelineItem}>
                  <div style={s.timelineDotCol}>
                    <div style={s.timelineDot} />
                    {i < proceeding.historial.length - 1 && (
                      <div style={s.timelineLine} />
                    )}
                  </div>
                  <div style={s.timelineContent}>
                    <div style={s.timelineHeader}>
                      <span style={s.timelineAction}>{item.accion}</span>
                      <span style={s.timelineDate}>
                        {formatDate(item.fecha)}
                      </span>
                    </div>
                    {item.detalles && (
                      <p style={s.timelineDetails}>{item.detalles}</p>
                    )}
                    <p style={s.timelineUser}>
                      Por: {item.usuario?.nombre || "Sistema"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={s.empty}>No hay historial disponible.</p>
          )}
        </div>
      </div>
    </>
  );
}

// ── Sub-components ──────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={s.card}>
      <h2 style={s.sectionTitle}>{title}</h2>
      {children}
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          color: "#9CA3AF",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>
        {value}
      </span>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────
const s = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    maxWidth: 1100,
    margin: "0 auto",
    padding: "24px 24px 48px",
    color: "#111827",
  },

  centered: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
  },
  spinner: {
    width: 32,
    height: 32,
    border: "3px solid #E5E7EB",
    borderTopColor: "#111827",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    borderRadius: 12,
    padding: "14px 20px",
  },

  // Top bar
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
    padding: "8px 16px",
    fontSize: 14,
    color: "#374151",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 14px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "0.02em",
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    display: "inline-block",
  },

  // Header card
  headerCard: {
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: 16,
    padding: "24px 28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 20,
    boxShadow: "0 1px 4px rgba(0,0,0,.04)",
  },
  headerLabel: {
    margin: "0 0 4px",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.1em",
    color: "#9CA3AF",
  },
  headerTitle: {
    margin: "0 0 6px",
    fontFamily: "'DM Serif Display', serif",
    fontSize: 32,
    fontWeight: 400,
    color: "#111827",
  },
  headerSub: {
    margin: 0,
    fontSize: 15,
    color: "#6B7280",
  },
  headerMeta: {
    display: "flex",
    gap: 24,
    flexWrap: "wrap",
  },

  // Generic card
  card: {
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: 16,
    padding: "20px 24px",
    boxShadow: "0 1px 4px rgba(0,0,0,.04)",
    marginBottom: 20,
  },
  sectionTitle: {
    margin: "0 0 16px",
    fontSize: 15,
    fontWeight: 600,
    color: "#111827",
    paddingBottom: 12,
    borderBottom: "1px solid #F3F4F6",
  },
  empty: {
    color: "#9CA3AF",
    fontSize: 14,
    margin: 0,
  },

  // Stepper
  stepper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    gap: 0,
  },
  stepWrapper: {
    display: "flex",
    alignItems: "center",
    flex: 1,
  },
  connector: {
    height: 2,
    flex: 1,
    minWidth: 16,
    transition: "background .3s",
  },
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
    transition: "all .3s",
  },
  stepLabel: {
    fontSize: 11,
    textAlign: "center",
    maxWidth: 72,
    lineHeight: 1.3,
    transition: "color .3s",
  },

  // Grid
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    marginBottom: 20,
  },

  // Form data
  dataGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px 16px",
  },
  dataItem: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  dataKey: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    color: "#9CA3AF",
    textTransform: "uppercase",
  },
  dataVal: {
    fontSize: 14,
    color: "#374151",
    fontWeight: 500,
  },

  // Sign button
  signBtn: {
    marginTop: 16,
    width: "100%",
    padding: "12px",
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "opacity .15s",
  },

  // Hash
  hashBox: {
    background: "#111827",
    color: "#34D399",
    fontFamily: "monospace",
    fontSize: 12,
    padding: "12px 16px",
    borderRadius: 10,
    wordBreak: "break-all",
    lineHeight: 1.7,
  },

  // Timeline
  timeline: {
    display: "flex",
    flexDirection: "column",
  },
  timelineItem: {
    display: "flex",
    gap: 16,
  },
  timelineDotCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flexShrink: 0,
    width: 16,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#111827",
    marginTop: 4,
    flexShrink: 0,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    background: "#E5E7EB",
    margin: "4px 0",
    minHeight: 24,
  },
  timelineContent: {
    paddingBottom: 20,
    flex: 1,
  },
  timelineHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 4,
  },
  timelineAction: {
    fontSize: 13,
    fontWeight: 600,
    background: "#F3F4F6",
    color: "#374151",
    padding: "3px 10px",
    borderRadius: 999,
  },
  timelineDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  timelineDetails: {
    margin: "4px 0",
    fontSize: 14,
    color: "#374151",
    lineHeight: 1.5,
  },
  timelineUser: {
    margin: 0,
    fontSize: 12,
    color: "#9CA3AF",
  },

  // Misc
  ghostBtn: {
    background: "#F9FAFB",
    border: "1px solid #E5E7EB",
    borderRadius: 8,
    padding: "7px 14px",
    fontSize: 13,
    color: "#374151",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },

  // Agregar al objeto s
  deliveryInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  deliveryOption: {
    display: "flex",
    gap: 16,
    padding: "16px",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    border: "1px solid #E5E7EB",
  },
  deliveryIcon: {
    fontSize: 32,
    minWidth: 48,
    textAlign: "center",
  },
  deliveryContent: {
    flex: 1,
  },
  deliveryTitle: {
    margin: "0 0 8px",
    fontSize: 16,
    fontWeight: 600,
    color: "#111827",
  },
  deliveryText: {
    margin: "0 0 8px",
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 1.6,
  },
  deliveryNote: {
    fontSize: 13,
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px dashed #D1D5DB",
  },
  csvCode: {
    fontFamily: "monospace",
    backgroundColor: "#1e3c72",
    color: "white",
    padding: "4px 8px",
    borderRadius: 4,
    letterSpacing: 1,
  },
};
