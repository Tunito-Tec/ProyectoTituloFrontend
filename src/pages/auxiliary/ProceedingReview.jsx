import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from "@mui/material";
import api from "../../config/axios";
import DocumentList from "../../components/documents/DocumentList";
import {
  getStatusColor,
  getStatusText,
  formatDate,
} from "../../utils/formatters";

const STATUS_STYLES = {
  pendiente: { bg: "#FEF3C7", color: "#92400E", dot: "#F59E0B" },
  aprobado: { bg: "#D1FAE5", color: "#065F46", dot: "#10B981" },
  rechazado: { bg: "#FEE2E2", color: "#991B1B", dot: "#EF4444" },
  revision: { bg: "#E0E7FF", color: "#3730A3", dot: "#6366F1" },
};

const getStatusStyle = (estado = "") => {
  const key = estado.toLowerCase();
  return (
    STATUS_STYLES[key] || { bg: "#F3F4F6", color: "#374151", dot: "#9CA3AF" }
  );
};

export default function ProceedingReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proceeding, setProceeding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comments, setComments] = useState("");
  const [assignDialog, setAssignDialog] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadProceeding();
  }, [id]);

  const loadProceeding = async () => {
    try {
      const { data } = await api.get(`/auxiliar/tramites/${id}`);
      setProceeding(data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error al cargar trámite");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async (rol) => {
    try {
      const { data } = await api.get(`/admin/usuarios?rol=${rol}`);
      setUsers(data.data);
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };

  const handleApprove = async () => {
    setActionLoading("approve");
    try {
      await api.put(`/auxiliar/tramites/${id}/revisar`, {
        aprobado: true,
        comentarios: comments,
      });
      navigate("/auxiliar/tramites");
    } catch {
      setError("Error al aprobar trámite");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    setActionLoading("reject");
    try {
      await api.post(`/auxiliar/tramites/${id}/solicitar-correcciones`, {
        correcciones: comments,
      });
      navigate("/auxiliar/tramites");
    } catch {
      setError("Error al solicitar correcciones");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssign = async () => {
    try {
      await api.put(`/auxiliar/tramites/${id}/asignar`, {
        usuarioId: selectedUser,
        rol: "notario",
      });
      setAssignDialog(false);
      loadProceeding();
    } catch {
      setError("Error al asignar trámite");
    }
  };

  const openAssignDialog = () => {
    loadUsers("notario");
    setAssignDialog(true);
  };

  /* ───── Loading / Error states ───── */
  if (loading)
    return (
      <div style={styles.centered}>
        <div style={styles.spinner} />
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

  if (error)
    return (
      <div style={styles.centered}>
        <div style={styles.errorBox}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <p
            style={{
              margin: 0,
              color: "#991B1B",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {error}
          </p>
        </div>
      </div>
    );

  if (!proceeding)
    return (
      <div style={styles.centered}>
        <p style={{ color: "#6B7280", fontFamily: "'DM Sans', sans-serif" }}>
          Trámite no encontrado.
        </p>
      </div>
    );

  const statusStyle = getStatusStyle(proceeding.estado);
  const formEntries = Object.entries(proceeding.datosFormulario || {});

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap"
        rel="stylesheet"
      />

      <div style={styles.page}>
        {/* Top bar */}
        <div style={styles.topBar}>
          <button
            style={styles.backBtn}
            onClick={() => navigate("/auxiliar/tramites")}
          >
            ← Volver a trámites
          </button>
          <div
            style={{
              ...styles.statusBadge,
              background: statusStyle.bg,
              color: statusStyle.color,
            }}
          >
            <span
              style={{ ...styles.statusDot, background: statusStyle.dot }}
            />
            {getStatusText(proceeding.estado)}
          </div>
        </div>

        {/* Header card */}
        <div style={styles.headerCard}>
          <div>
            <p style={styles.headerLabel}>TRÁMITE</p>
            <h1 style={styles.headerTitle}>
              #{proceeding._id?.slice(-6).toUpperCase()}
            </h1>
            <p style={styles.headerSub}>
              <strong>{proceeding.cliente?.nombre}</strong>
              {proceeding.cliente?.rut && (
                <span style={styles.rut}> · {proceeding.cliente.rut}</span>
              )}
            </p>
          </div>
          <div style={styles.headerMeta}>
            <MetaItem
              label="Iniciado"
              value={formatDate(proceeding.createdAt)}
            />
            {proceeding.asignadoA && (
              <MetaItem
                label="Asignado a"
                value={proceeding.asignadoA.nombre}
              />
            )}
          </div>
        </div>

        {/* Body grid */}
        <div style={styles.grid}>
          {/* Left column */}
          <div style={styles.col}>
            {/* Datos del trámite */}
            <Section title="Datos del trámite">
              {formEntries.length === 0 ? (
                <p style={styles.empty}>Sin datos registrados.</p>
              ) : (
                <div style={styles.dataGrid}>
                  {formEntries.map(([key, value]) => (
                    <div key={key} style={styles.dataItem}>
                      <span style={styles.dataKey}>{key}</span>
                      <span style={styles.dataVal}>{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Asignación */}
            {!proceeding.asignadoA && (
              <Section title="Asignación">
                <p style={styles.assignNote}>
                  Este trámite aún no ha sido asignado a un notario.
                </p>
                <button style={styles.assignBtn} onClick={openAssignDialog}>
                  Asignar a notario →
                </button>
              </Section>
            )}
          </div>

          {/* Right column */}
          <div style={styles.col}>
            {/* Documentos */}
            <Section title="Documentos adjuntos">
              <DocumentList
                documents={proceeding.documentos || []}
                onDownload={(doc) => window.open(doc.url, "_blank")}
              />
              {(!proceeding.documentos ||
                proceeding.documentos.length === 0) && (
                <p style={styles.empty}>Sin documentos adjuntos.</p>
              )}
            </Section>
          </div>
        </div>

        {/* Review panel */}
        <div style={styles.reviewPanel}>
          <h2 style={styles.reviewTitle}>Revisión del trámite</h2>
          <p style={styles.reviewHint}>
            Agrega observaciones antes de tomar una acción.
          </p>

          <textarea
            style={styles.textarea}
            rows={4}
            placeholder="Escribe tus comentarios u observaciones aquí…"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />

          <div style={styles.actions}>
            <button
              style={{ ...styles.actionBtn, ...styles.approveBtn }}
              onClick={handleApprove}
              disabled={actionLoading === "approve"}
            >
              {actionLoading === "approve" ? "Aprobando…" : "✓ Aprobar trámite"}
            </button>
            <button
              style={{ ...styles.actionBtn, ...styles.rejectBtn }}
              onClick={handleReject}
              disabled={actionLoading === "reject"}
            >
              {actionLoading === "reject"
                ? "Enviando…"
                : "↩ Solicitar correcciones"}
            </button>
          </div>
        </div>
      </div>

      {/* Assign dialog (keep MUI for simplicity) */}
      <Dialog
        open={assignDialog}
        onClose={() => setAssignDialog(false)}
        PaperProps={{
          style: {
            borderRadius: 16,
            padding: 8,
            fontFamily: "'DM Sans', sans-serif",
          },
        }}
      >
        <DialogTitle
          sx={{ fontFamily: "'DM Serif Display', serif", fontSize: 20 }}
        >
          Asignar a notario
        </DialogTitle>
        <DialogContent>
          <select
            style={styles.select}
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">— Seleccionar notario —</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.nombre}
              </option>
            ))}
          </select>
        </DialogContent>
        <DialogActions sx={{ padding: "8px 24px 20px" }}>
          <button
            style={{ ...styles.actionBtn, ...styles.ghostBtn }}
            onClick={() => setAssignDialog(false)}
          >
            Cancelar
          </button>
          <button
            style={{ ...styles.actionBtn, ...styles.approveBtn }}
            onClick={handleAssign}
            disabled={!selectedUser}
          >
            Confirmar asignación
          </button>
        </DialogActions>
      </Dialog>
    </>
  );
}

/* ── Reusable sub-components ── */

function Section({ title, children }) {
  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      {children}
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div style={styles.metaItem}>
      <span style={styles.metaLabel}>{label}</span>
      <span style={styles.metaValue}>{value}</span>
    </div>
  );
}

/* ── Styles ── */

const styles = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    maxWidth: 1100,
    margin: "0 auto",
    padding: "24px 24px 48px",
    color: "#111827",
  },

  /* Top bar */
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
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
    transition: "background .15s",
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

  /* Header card */
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
    marginBottom: 24,
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
    margin: "0 0 8px",
    fontFamily: "'DM Serif Display', serif",
    fontSize: 32,
    fontWeight: 400,
    color: "#111827",
  },
  headerSub: {
    margin: 0,
    fontSize: 15,
    color: "#374151",
  },
  rut: {
    color: "#9CA3AF",
    fontWeight: 400,
  },
  headerMeta: {
    display: "flex",
    gap: 24,
    flexWrap: "wrap",
  },
  metaItem: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.08em",
    color: "#9CA3AF",
    textTransform: "uppercase",
  },
  metaValue: {
    fontSize: 14,
    color: "#374151",
    fontWeight: 500,
  },

  /* Grid */
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    marginBottom: 20,
  },
  col: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },

  /* Section card */
  section: {
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: 16,
    padding: "20px 24px",
    boxShadow: "0 1px 4px rgba(0,0,0,.04)",
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

  /* Form data grid */
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

  /* Assign note */
  assignNote: {
    fontSize: 14,
    color: "#6B7280",
    margin: "0 0 14px",
  },
  assignBtn: {
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "10px 20px",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "opacity .15s",
  },

  /* Review panel */
  reviewPanel: {
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: 16,
    padding: "24px 28px",
    boxShadow: "0 1px 4px rgba(0,0,0,.04)",
  },
  reviewTitle: {
    margin: "0 0 4px",
    fontFamily: "'DM Serif Display', serif",
    fontSize: 22,
    fontWeight: 400,
    color: "#111827",
  },
  reviewHint: {
    margin: "0 0 16px",
    fontSize: 14,
    color: "#6B7280",
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    color: "#111827",
    border: "1px solid #E5E7EB",
    borderRadius: 10,
    resize: "vertical",
    outline: "none",
    lineHeight: 1.6,
    marginBottom: 20,
    background: "#FAFAFA",
    transition: "border-color .15s",
  },
  actions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },

  /* Buttons */
  actionBtn: {
    padding: "10px 22px",
    fontSize: 14,
    fontWeight: 500,
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "opacity .15s, transform .1s",
  },
  approveBtn: {
    background: "#059669",
    color: "#fff",
  },
  rejectBtn: {
    background: "#fff",
    color: "#B91C1C",
    border: "1px solid #FECACA",
  },
  ghostBtn: {
    background: "#F9FAFB",
    color: "#374151",
    border: "1px solid #E5E7EB",
  },

  /* Select */
  select: {
    width: "100%",
    padding: "10px 12px",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    border: "1px solid #E5E7EB",
    borderRadius: 10,
    outline: "none",
    background: "#fff",
    color: "#111827",
    marginTop: 8,
  },

  /* Loading / Error */
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
    gap: 10,
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    borderRadius: 12,
    padding: "14px 20px",
  },
};
