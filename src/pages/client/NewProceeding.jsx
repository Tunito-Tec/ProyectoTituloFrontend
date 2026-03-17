import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../config/axios";
import DynamicForm from "../../components/forms/DynamicForm";

const STEPS = [
  { label: "Tipo", hint: "Selecciona el trámite" },
  { label: "Datos", hint: "Completa el formulario" },
  { label: "Documentos", hint: "Adjunta archivos" },
  { label: "Revisión", hint: "Confirma y envía" },
];

const formatFieldValue = (key, value) => {
  if (!value && value !== 0) return "No especificado";
  if (key.includes("fecha") || key.includes("date")) {
    try {
      return new Date(value).toLocaleDateString("es-CL");
    } catch {
      return value;
    }
  }
  if (typeof value === "boolean") return value ? "Sí" : "No";
  return value;
};

export default function NewProceeding() {
  const [activeStep, setActiveStep] = useState(0);
  const [tramiteTypes, setTramiteTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({});
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typesLoading, setTypesLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/tramite-types/activos")
      .then(({ data }) => setTramiteTypes(data.data))
      .catch(() => setError("Error al cargar tipos de trámite"))
      .finally(() => setTypesLoading(false));
  }, []);

  const handleTypeSelect = (tipo) => {
    setSelectedType(tipo);
    setActiveStep(1);
  };
  const handleFormSubmit = (data) => {
    setFormData(data);
    setActiveStep(2);
  };
  const handleDocsSubmit = () => {
    setDocuments([]);
    setActiveStep(3);
  };

  const getFieldLabel = (fieldName) => {
    const campo = selectedType?.campos?.find((c) => c.nombre === fieldName);
    return campo?.etiqueta || fieldName.replace(/_/g, " ");
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/client/tramites", {
        tipo: selectedType._id,
        datosFormulario: formData,
      });
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

  // ── Step content ──────────────────────────────────────────

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <div>
            <p style={s.stepHint}>
              Selecciona el tipo de trámite que deseas iniciar.
            </p>
            {typesLoading ? (
              <div style={s.loadingWrap}>
                <div style={s.spinner} />
              </div>
            ) : tramiteTypes.length === 0 ? (
              <p style={s.empty}>No hay tipos de trámite disponibles.</p>
            ) : (
              <div style={s.typeGrid}>
                {tramiteTypes.map((tipo) => (
                  <div
                    key={tipo._id}
                    style={{
                      ...s.typeCard,
                      ...(selectedType?._id === tipo._id
                        ? s.typeCardSelected
                        : {}),
                    }}
                    onClick={() => handleTypeSelect(tipo)}
                  >
                    <div style={s.typeIcon}>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div style={s.typeInfo}>
                      <p style={s.typeName}>{tipo.nombre}</p>
                      {tipo.descripcion && (
                        <p style={s.typeDesc}>{tipo.descripcion}</p>
                      )}
                    </div>
                    <span style={s.typeCount}>
                      {tipo.campos?.length || 0} campos
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 1:
        return (
          <div>
            <p style={s.stepHint}>
              Completa los datos requeridos para{" "}
              <strong>{selectedType?.nombre}</strong>.
            </p>
            <DynamicForm
              fields={selectedType?.campos || []}
              onSubmit={handleFormSubmit}
              submitLabel="Continuar"
            />
          </div>
        );

      case 2:
        return (
          <div>
            <p style={s.stepHint}>
              Adjunta los documentos necesarios para tu trámite.
            </p>
            <div style={s.docPlaceholder}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#D1D5DB"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p style={s.docPlaceholderText}>
                Carga de archivos disponible en entorno de producción.
              </p>
            </div>
            <button style={s.primaryBtn} onClick={handleDocsSubmit}>
              Continuar sin documentos
            </button>
          </div>
        );

      case 3:
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={s.stepHint}>Revisa la información antes de confirmar.</p>

            {/* Tipo */}
            <div style={s.reviewCard}>
              <p style={s.reviewCardLabel}>Tipo de trámite</p>
              <p style={s.reviewCardValue}>{selectedType?.nombre}</p>
              {selectedType?.descripcion && (
                <p style={s.reviewCardSub}>{selectedType.descripcion}</p>
              )}
            </div>

            {/* Datos */}
            {Object.keys(formData).length > 0 && (
              <div style={s.reviewCard}>
                <p style={s.reviewCardLabel}>Datos ingresados</p>
                <div style={s.reviewDataGrid}>
                  {Object.entries(formData).map(([key, value]) => (
                    <div key={key} style={s.reviewDataItem}>
                      <span style={s.reviewDataKey}>{getFieldLabel(key)}</span>
                      <span style={s.reviewDataVal}>
                        {formatFieldValue(key, value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Docs */}
            {documents.length > 0 && (
              <div style={s.reviewCard}>
                <p style={s.reviewCardLabel}>Documentos adjuntos</p>
                {documents.map((doc, i) => (
                  <p
                    key={i}
                    style={{ margin: "4px 0", fontSize: 14, color: "#374151" }}
                  >
                    · {doc.nombre || `Documento ${i + 1}`}
                  </p>
                ))}
              </div>
            )}

            <button
              style={{
                ...s.primaryBtn,
                width: "100%",
                padding: "13px",
                fontSize: 15,
                opacity: loading ? 0.7 : 1,
              }}
              onClick={handleFinalSubmit}
              disabled={loading}
            >
              {loading ? "Creando trámite…" : "Confirmar y crear trámite"}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap"
        rel="stylesheet"
      />

      <div style={s.page}>
        {/* Header */}
        <div style={s.pageHeader}>
          <div>
            <p style={s.pageLabel}>CLIENTE</p>
            <h1 style={s.pageTitle}>Nuevo trámite</h1>
          </div>
          <button
            style={s.cancelBtn}
            onClick={() => navigate("/cliente/dashboard")}
          >
            ✕ Cancelar
          </button>
        </div>

        {/* Stepper */}
        <div style={s.stepper}>
          {STEPS.map((step, i) => {
            const done = i < activeStep;
            const active = i === activeStep;
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

        {/* Content card */}
        <div style={s.card}>
          {error && <div style={s.errorBox}>⚠ {error}</div>}
          {renderStep()}
        </div>

        {/* Back nav */}
        {activeStep > 0 && activeStep < 3 && (
          <button style={s.backBtn} onClick={() => setActiveStep((p) => p - 1)}>
            ← Volver
          </button>
        )}
      </div>
    </>
  );
}

const s = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    color: "#111827",
    maxWidth: 720,
    margin: "0 auto",
  },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 28,
  },
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
  cancelBtn: {
    background: "none",
    border: "1px solid #E5E7EB",
    borderRadius: 8,
    padding: "7px 14px",
    fontSize: 13,
    color: "#6B7280",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
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
    padding: "28px 28px",
    boxShadow: "0 1px 4px rgba(0,0,0,.04)",
    marginBottom: 16,
  },
  stepHint: { margin: "0 0 20px", fontSize: 14, color: "#6B7280" },
  errorBox: {
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    color: "#991B1B",
    marginBottom: 16,
  },

  // Type selection
  typeGrid: { display: "flex", flexDirection: "column", gap: 10 },
  typeCard: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "14px 16px",
    border: "1px solid #E5E7EB",
    borderRadius: 12,
    cursor: "pointer",
    transition: "border-color .15s, background .15s",
  },
  typeCardSelected: { borderColor: "#111827", background: "#F9FAFB" },
  typeIcon: {
    width: 40,
    height: 40,
    background: "#F3F4F6",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: "#6B7280",
  },
  typeInfo: { flex: 1 },
  typeName: {
    margin: "0 0 2px",
    fontSize: 14,
    fontWeight: 600,
    color: "#111827",
  },
  typeDesc: { margin: 0, fontSize: 13, color: "#9CA3AF" },
  typeCount: {
    fontSize: 12,
    color: "#9CA3AF",
    background: "#F3F4F6",
    padding: "3px 10px",
    borderRadius: 999,
    whiteSpace: "nowrap",
  },

  // Docs placeholder
  docPlaceholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    padding: "32px 0",
    background: "#FAFAFA",
    border: "2px dashed #E5E7EB",
    borderRadius: 12,
    marginBottom: 16,
  },
  docPlaceholderText: { margin: 0, fontSize: 13, color: "#9CA3AF" },

  // Review
  reviewCard: {
    background: "#F9FAFB",
    border: "1px solid #E5E7EB",
    borderRadius: 12,
    padding: "16px 20px",
  },
  reviewCardLabel: {
    margin: "0 0 8px",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    color: "#9CA3AF",
    textTransform: "uppercase",
  },
  reviewCardValue: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
    color: "#111827",
  },
  reviewCardSub: { margin: "4px 0 0", fontSize: 13, color: "#6B7280" },
  reviewDataGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px 16px",
  },
  reviewDataItem: { display: "flex", flexDirection: "column", gap: 2 },
  reviewDataKey: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.04em",
    color: "#9CA3AF",
    textTransform: "uppercase",
  },
  reviewDataVal: { fontSize: 14, fontWeight: 500, color: "#374151" },

  loadingWrap: { display: "flex", justifyContent: "center", padding: "32px 0" },
  spinner: {
    width: 28,
    height: 28,
    border: "3px solid #E5E7EB",
    borderTopColor: "#111827",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  empty: {
    textAlign: "center",
    color: "#9CA3AF",
    padding: "24px 0",
    margin: 0,
  },

  primaryBtn: {
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: 9,
    padding: "10px 22px",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  backBtn: {
    background: "none",
    border: "none",
    fontSize: 14,
    color: "#6B7280",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    padding: "4px 0",
  },
};
