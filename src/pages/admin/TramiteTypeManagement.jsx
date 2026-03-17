import { useState, useEffect } from "react";
import api from "../../config/axios";

const FIELD_TYPES = [
  { value: "text", label: "Texto" },
  { value: "number", label: "Número" },
  { value: "date", label: "Fecha" },
  { value: "email", label: "Email" },
  { value: "rut", label: "RUT" },
  { value: "select", label: "Selección" },
  { value: "textarea", label: "Área de texto" },
];

const EMPTY_FORM = {
  nombre: "",
  tipoId: "",
  descripcion: "",
  activo: true,
  campos: [],
};
const EMPTY_CAMPO = {
  nombre: "",
  etiqueta: "",
  tipo: "text",
  requerido: false,
  opciones: "",
};

export default function TramiteTypeManagement() {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [campoDialog, setCampoDialog] = useState(false);
  const [editingCampo, setEditingCampo] = useState(null);
  const [campoForm, setCampoForm] = useState(EMPTY_CAMPO);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadTipos();
  }, []);

  const loadTipos = async () => {
    try {
      const { data } = await api.get("/tramite-types/activos");
      setTipos(data.data);
    } catch (err) {
      console.error("Error loading tipos:", err);
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (tipo = null) => {
    setEditingTipo(tipo);
    setFormData(
      tipo
        ? {
            nombre: tipo.nombre,
            tipoId: tipo.tipoId,
            descripcion: tipo.descripcion || "",
            activo: tipo.activo !== false,
            campos: tipo.campos || [],
          }
        : EMPTY_FORM,
    );
    setError("");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingTipo(null);
    setError("");
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (editingTipo) {
        await api.put(`/admin/tipos-tramite/${editingTipo.tipoId}`, formData);
        setSuccess("Tipo de trámite actualizado");
      } else {
        await api.post("/admin/tipos-tramite", formData);
        setSuccess("Tipo de trámite creado");
      }
      loadTipos();
      closeDialog();
    } catch (err) {
      setError(err.response?.data?.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este tipo de trámite?")) return;
    try {
      await api.delete(`/admin/tipos-tramite/${id}`);
      setSuccess("Tipo de trámite eliminado");
      loadTipos();
    } catch {
      setError("Error al eliminar");
    }
  };

  const handleToggle = async (tipo) => {
    try {
      await api.put(`/admin/tipos-tramite/${tipo.tipoId}`, {
        ...tipo,
        activo: !tipo.activo,
      });
      loadTipos();
    } catch {
      setError("Error al cambiar estado");
    }
  };

  // Campo handlers
  const openCampoDialog = (campo = null) => {
    setEditingCampo(campo);
    setCampoForm(
      campo
        ? {
            nombre: campo.nombre,
            etiqueta: campo.etiqueta,
            tipo: campo.tipo,
            requerido: campo.requerido || false,
            opciones: campo.opciones?.join(", ") || "",
          }
        : EMPTY_CAMPO,
    );
    setCampoDialog(true);
  };

  const saveCampo = () => {
    const nuevo = {
      ...campoForm,
      opciones:
        campoForm.tipo === "select"
          ? campoForm.opciones
              .split(",")
              .map((o) => o.trim())
              .filter(Boolean)
          : undefined,
    };
    if (editingCampo) {
      const idx = formData.campos.findIndex(
        (c) => c.nombre === editingCampo.nombre,
      );
      if (idx !== -1) {
        const next = [...formData.campos];
        next[idx] = nuevo;
        setFormData((f) => ({ ...f, campos: next }));
      }
    } else {
      setFormData((f) => ({ ...f, campos: [...f.campos, nuevo] }));
    }
    setCampoDialog(false);
  };

  const removeCampo = (nombre) =>
    setFormData((f) => ({
      ...f,
      campos: f.campos.filter((c) => c.nombre !== nombre),
    }));

  const setF = (key) => (e) =>
    setFormData((f) => ({
      ...f,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const setC = (key) => (e) =>
    setCampoForm((f) => ({
      ...f,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const filtered = tipos.filter((t) => {
    const q = search.toLowerCase();
    return (
      !q ||
      t.nombre?.toLowerCase().includes(q) ||
      t.tipoId?.toLowerCase().includes(q)
    );
  });

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
            <p style={s.pageLabel}>ADMINISTRACIÓN</p>
            <h1 style={s.pageTitle}>Tipos de trámite</h1>
          </div>
          <button style={s.primaryBtn} onClick={() => openDialog()}>
            + Nuevo tipo
          </button>
        </div>

        {/* Toast */}
        {success && (
          <div style={s.toast}>
            <span>✓ {success}</span>
            <button style={s.toastClose} onClick={() => setSuccess("")}>
              ✕
            </button>
          </div>
        )}

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <input
            style={s.searchInput}
            placeholder="Buscar por nombre o ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div style={s.card}>
          {loading ? (
            <div style={s.loadingWrap}>
              <div style={s.spinner} />
              <p style={s.loadingText}>Cargando tipos de trámite…</p>
            </div>
          ) : filtered.length === 0 ? (
            <p style={s.empty}>No se encontraron tipos de trámite.</p>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Nombre</th>
                  <th style={s.th}>ID</th>
                  <th style={s.th}>Descripción</th>
                  <th style={s.th}>Campos</th>
                  <th style={s.th}>Estado</th>
                  <th style={{ ...s.th, textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tipo, i) => (
                  <tr
                    key={tipo.tipoId}
                    style={i % 2 !== 0 ? { background: "#F9FAFB" } : {}}
                  >
                    <td style={{ ...s.td, fontWeight: 600, color: "#111827" }}>
                      {tipo.nombre}
                    </td>
                    <td
                      style={{
                        ...s.td,
                        fontFamily: "monospace",
                        fontSize: 12,
                        color: "#6B7280",
                      }}
                    >
                      {tipo.tipoId}
                    </td>
                    <td style={{ ...s.td, color: "#6B7280", maxWidth: 220 }}>
                      <span style={s.truncate}>{tipo.descripcion || "—"}</span>
                    </td>
                    <td style={s.td}>
                      <span style={s.countPill}>
                        {tipo.campos?.length || 0} campos
                      </span>
                    </td>
                    <td style={s.td}>
                      <button
                        style={{
                          ...s.toggleBtn,
                          ...(tipo.activo ? s.toggleOn : s.toggleOff),
                        }}
                        onClick={() => handleToggle(tipo)}
                      >
                        <span
                          style={{
                            ...s.toggleDot,
                            ...(tipo.activo ? s.toggleDotOn : {}),
                          }}
                        />
                        {tipo.activo ? "Activo" : "Inactivo"}
                      </button>
                    </td>
                    <td style={{ ...s.td, textAlign: "right" }}>
                      <div style={s.rowActions}>
                        <button
                          style={s.rowBtn}
                          onClick={() => openDialog(tipo)}
                        >
                          Editar
                        </button>
                        <button
                          style={{ ...s.rowBtn, ...s.rowBtnDanger }}
                          onClick={() => handleDelete(tipo.tipoId)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && (
            <p style={s.rowCount}>
              {filtered.length} tipo{filtered.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {/* ── Main dialog ── */}
      {dialogOpen && (
        <div style={s.overlay} onClick={closeDialog}>
          <div
            style={{ ...s.modal, maxWidth: 660 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>
                {editingTipo
                  ? "Editar tipo de trámite"
                  : "Nuevo tipo de trámite"}
              </h2>
              <button style={s.modalClose} onClick={closeDialog}>
                ✕
              </button>
            </div>

            {error && <div style={s.errorBox}>⚠ {error}</div>}

            <div style={s.modalBody}>
              {/* Basic info */}
              <div style={s.formGrid}>
                <Field label="Nombre *">
                  <input
                    style={s.input}
                    value={formData.nombre}
                    onChange={setF("nombre")}
                    placeholder="Ej: Escritura pública"
                  />
                </Field>
                <Field label="ID único *">
                  <input
                    style={{
                      ...s.input,
                      ...(editingTipo ? s.inputDisabled : {}),
                    }}
                    value={formData.tipoId}
                    onChange={setF("tipoId")}
                    disabled={!!editingTipo}
                    placeholder="Ej: escritura_publica"
                  />
                </Field>
              </div>
              <Field label="Descripción">
                <textarea
                  style={{ ...s.input, resize: "vertical", minHeight: 64 }}
                  value={formData.descripcion}
                  onChange={setF("descripcion")}
                  placeholder="Descripción del tipo de trámite…"
                />
              </Field>

              {/* Toggle activo */}
              <div style={s.switchRow}>
                <span style={s.switchLabel}>Estado del tipo</span>
                <label style={s.switch}>
                  <input
                    type="checkbox"
                    style={{ display: "none" }}
                    checked={formData.activo}
                    onChange={setF("activo")}
                  />
                  <div
                    style={{
                      ...s.switchTrack,
                      ...(formData.activo ? s.switchTrackOn : {}),
                    }}
                  >
                    <div
                      style={{
                        ...s.switchThumb,
                        ...(formData.activo ? s.switchThumbOn : {}),
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 14,
                      color: formData.activo ? "#059669" : "#9CA3AF",
                    }}
                  >
                    {formData.activo ? "Activo" : "Inactivo"}
                  </span>
                </label>
              </div>

              {/* Campos */}
              <div>
                <div style={s.camposHeader}>
                  <h3 style={s.camposTitle}>Campos del formulario</h3>
                  <button
                    style={s.outlineBtn}
                    onClick={() => openCampoDialog()}
                  >
                    + Agregar campo
                  </button>
                </div>

                {formData.campos.length === 0 ? (
                  <p style={{ ...s.empty, padding: "16px 0" }}>
                    Sin campos definidos.
                  </p>
                ) : (
                  <div style={s.camposList}>
                    {formData.campos.map((campo, idx) => (
                      <div key={idx} style={s.campoRow}>
                        <div style={s.campoInfo}>
                          <span style={s.campoEtiqueta}>{campo.etiqueta}</span>
                          <span style={s.campoMeta}>
                            {campo.nombre} · {campo.tipo}
                            {campo.requerido && (
                              <span style={s.required}> *requerido</span>
                            )}
                          </span>
                        </div>
                        <div style={s.rowActions}>
                          <button
                            style={s.rowBtn}
                            onClick={() => openCampoDialog(campo)}
                          >
                            Editar
                          </button>
                          <button
                            style={{ ...s.rowBtn, ...s.rowBtnDanger }}
                            onClick={() => removeCampo(campo.nombre)}
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={s.modalFooter}>
              <button style={s.ghostBtn} onClick={closeDialog}>
                Cancelar
              </button>
              <button
                style={s.primaryBtn}
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving
                  ? "Guardando…"
                  : editingTipo
                    ? "Actualizar"
                    : "Crear tipo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Campo dialog ── */}
      {campoDialog && (
        <div
          style={{ ...s.overlay, zIndex: 2100 }}
          onClick={() => setCampoDialog(false)}
        >
          <div
            style={{ ...s.modal, maxWidth: 440 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>
                {editingCampo ? "Editar campo" : "Nuevo campo"}
              </h2>
              <button
                style={s.modalClose}
                onClick={() => setCampoDialog(false)}
              >
                ✕
              </button>
            </div>
            <div style={s.modalBody}>
              <Field label="Nombre del campo *">
                <input
                  style={s.input}
                  value={campoForm.nombre}
                  onChange={setC("nombre")}
                  placeholder="Ej: nombre_cliente"
                />
                <p style={s.hint}>Identificador único, sin espacios</p>
              </Field>
              <Field label="Etiqueta visible *">
                <input
                  style={s.input}
                  value={campoForm.etiqueta}
                  onChange={setC("etiqueta")}
                  placeholder="Ej: Nombre del cliente"
                />
              </Field>
              <Field label="Tipo de campo">
                <select
                  style={s.select}
                  value={campoForm.tipo}
                  onChange={setC("tipo")}
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>
              {campoForm.tipo === "select" && (
                <Field label="Opciones (separar con comas)">
                  <input
                    style={s.input}
                    value={campoForm.opciones}
                    onChange={setC("opciones")}
                    placeholder="Opción 1, Opción 2, Opción 3"
                  />
                </Field>
              )}
              <div style={s.switchRow}>
                <span style={s.switchLabel}>Campo requerido</span>
                <label style={s.switch}>
                  <input
                    type="checkbox"
                    style={{ display: "none" }}
                    checked={campoForm.requerido}
                    onChange={setC("requerido")}
                  />
                  <div
                    style={{
                      ...s.switchTrack,
                      ...(campoForm.requerido ? s.switchTrackOn : {}),
                    }}
                  >
                    <div
                      style={{
                        ...s.switchThumb,
                        ...(campoForm.requerido ? s.switchThumbOn : {}),
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 14,
                      color: campoForm.requerido ? "#059669" : "#9CA3AF",
                    }}
                  >
                    {campoForm.requerido ? "Sí" : "No"}
                  </span>
                </label>
              </div>
            </div>
            <div style={s.modalFooter}>
              <button style={s.ghostBtn} onClick={() => setCampoDialog(false)}>
                Cancelar
              </button>
              <button style={s.primaryBtn} onClick={saveCampo}>
                {editingCampo ? "Actualizar campo" : "Agregar campo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#6B7280",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const s = {
  page: { fontFamily: "'DM Sans', sans-serif", color: "#111827" },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 20,
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
    color: "#111827",
  },

  toast: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#ECFDF5",
    border: "1px solid #A7F3D0",
    borderRadius: 10,
    padding: "10px 16px",
    marginBottom: 16,
    fontSize: 14,
    color: "#065F46",
  },
  toastClose: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#065F46",
    fontSize: 14,
  },

  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "9px 14px",
    fontSize: 14,
    border: "1px solid #E5E7EB",
    borderRadius: 10,
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    background: "#fff",
    color: "#111827",
  },

  card: {
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: 14,
    boxShadow: "0 1px 4px rgba(0,0,0,.04)",
    overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    padding: "12px 16px",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    color: "#9CA3AF",
    textTransform: "uppercase",
    textAlign: "left",
    borderBottom: "1px solid #E5E7EB",
    background: "#FAFAFA",
  },
  td: { padding: "12px 16px", color: "#374151", verticalAlign: "middle" },

  truncate: {
    display: "block",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: 200,
  },
  countPill: {
    background: "#F3F4F6",
    color: "#374151",
    padding: "3px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 500,
  },

  toggleBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 12px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
  },
  toggleOn: { background: "#D1FAE5", color: "#065F46" },
  toggleOff: { background: "#F3F4F6", color: "#6B7280" },
  toggleDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#9CA3AF",
  },
  toggleDotOn: { background: "#10B981" },

  rowActions: { display: "flex", gap: 6, justifyContent: "flex-end" },
  rowBtn: {
    background: "none",
    border: "1px solid #E5E7EB",
    borderRadius: 7,
    padding: "5px 12px",
    fontSize: 12,
    color: "#374151",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  rowBtnDanger: { color: "#B91C1C", borderColor: "#FECACA" },
  rowCount: {
    margin: 0,
    padding: "10px 16px",
    fontSize: 12,
    color: "#9CA3AF",
    borderTop: "1px solid #F3F4F6",
  },

  loadingWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "48px 0",
    gap: 12,
  },
  spinner: {
    width: 28,
    height: 28,
    border: "3px solid #E5E7EB",
    borderTopColor: "#111827",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  loadingText: { margin: 0, fontSize: 14, color: "#9CA3AF" },
  empty: { textAlign: "center", color: "#9CA3AF", margin: 0 },

  // Modal
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    padding: 16,
  },
  modal: {
    background: "#fff",
    borderRadius: 16,
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'DM Sans', sans-serif",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px 16px",
    borderBottom: "1px solid #F3F4F6",
  },
  modalTitle: {
    margin: 0,
    fontFamily: "'DM Serif Display', serif",
    fontSize: 20,
    fontWeight: 400,
  },
  modalClose: {
    background: "none",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    color: "#9CA3AF",
  },
  modalBody: {
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    padding: "16px 24px",
    borderTop: "1px solid #F3F4F6",
  },

  errorBox: {
    margin: "12px 24px 0",
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    color: "#991B1B",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "9px 12px",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    border: "1px solid #E5E7EB",
    borderRadius: 9,
    outline: "none",
    color: "#111827",
    background: "#fff",
  },
  inputDisabled: {
    background: "#F9FAFB",
    color: "#9CA3AF",
    cursor: "not-allowed",
  },
  select: {
    width: "100%",
    boxSizing: "border-box",
    padding: "9px 12px",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    border: "1px solid #E5E7EB",
    borderRadius: 9,
    outline: "none",
    color: "#111827",
    background: "#fff",
  },
  hint: { margin: "2px 0 0", fontSize: 11, color: "#9CA3AF" },

  // Campos section
  camposHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  camposTitle: { margin: 0, fontSize: 14, fontWeight: 600, color: "#111827" },
  camposList: { display: "flex", flexDirection: "column", gap: 8 },
  campoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 14px",
    background: "#F9FAFB",
    border: "1px solid #E5E7EB",
    borderRadius: 10,
  },
  campoInfo: { display: "flex", flexDirection: "column", gap: 2 },
  campoEtiqueta: { fontSize: 14, fontWeight: 600, color: "#111827" },
  campoMeta: { fontSize: 12, color: "#9CA3AF" },
  required: { color: "#EF4444" },

  // Switch
  switchRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchLabel: { fontSize: 14, color: "#374151" },
  switch: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer" },
  switchTrack: {
    width: 36,
    height: 20,
    borderRadius: 999,
    background: "#E5E7EB",
    position: "relative",
    transition: "background .2s",
  },
  switchTrackOn: { background: "#D1FAE5" },
  switchThumb: {
    position: "absolute",
    top: 2,
    left: 2,
    width: 16,
    height: 16,
    borderRadius: "50%",
    background: "#9CA3AF",
    transition: "left .2s, background .2s",
  },
  switchThumbOn: { left: 18, background: "#10B981" },

  primaryBtn: {
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: 9,
    padding: "9px 20px",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  ghostBtn: {
    background: "#F9FAFB",
    color: "#374151",
    border: "1px solid #E5E7EB",
    borderRadius: 9,
    padding: "9px 20px",
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  outlineBtn: {
    background: "none",
    border: "1px solid #E5E7EB",
    borderRadius: 8,
    padding: "6px 14px",
    fontSize: 13,
    color: "#374151",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
};
