import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../config/axios";
import { getStatusText, formatDate } from "../../utils/formatters";

const STATUS_STYLES = {
  pendiente_revision_auxiliar: { bg: "#FEF3C7", color: "#92400E" },
  en_revision: { bg: "#E0E7FF", color: "#3730A3" },
  esperando_firma_cliente: { bg: "#FEF3C7", color: "#92400E" },
  esperando_firma_notario: { bg: "#EDE9FE", color: "#5B21B6" },
  completado: { bg: "#D1FAE5", color: "#065F46" },
  rechazado: { bg: "#FEE2E2", color: "#991B1B" },
};
const getStatusStyle = (estado = "") =>
  STATUS_STYLES[estado.toLowerCase()] || { bg: "#F3F4F6", color: "#374151" };

const STAT_CONFIG = [
  {
    label: "Pendientes de revisión",
    key: "pendientes",
    accent: "#F59E0B",
    bg: "#FFFBEB",
    icon: (
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
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    label: "En revisión",
    key: "enRevision",
    accent: "#3B82F6",
    bg: "#EFF6FF",
    icon: (
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
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    label: "Completados hoy",
    key: "completadosHoy",
    accent: "#10B981",
    bg: "#ECFDF5",
    icon: (
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
        <circle cx="12" cy="12" r="10" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
];

const formatRowDate = (value) => {
  if (!value) return "—";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

export default function AuxiliaryDashboard() {
  const [stats, setStats] = useState({
    pendientes: 0,
    enRevision: 0,
    completadosHoy: 0,
  });
  const [recentProceedings, setRecentProceedings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pendientesRes, asignadosRes] = await Promise.all([
        api.get("/auxiliar/tramites/pendientes"),
        api.get("/auxiliar/tramites/asignados"),
      ]);
      setStats({
        pendientes: pendientesRes.data.count || 0,
        enRevision: asignadosRes.data.count || 0,
        completadosHoy: 5,
      });
      setRecentProceedings(pendientesRes.data.data.slice(0, 6));
    } catch (err) {
      console.error("Error loading dashboard:", err);
    } finally {
      setLoading(false);
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
            <p style={s.pageLabel}>PANEL DE CONTROL</p>
            <h1 style={s.pageTitle}>Dashboard auxiliar</h1>
          </div>
          <button style={s.refreshBtn} onClick={loadData}>
            ↻ Actualizar
          </button>
        </div>

        {/* Stat cards */}
        <div style={s.statGrid}>
          {STAT_CONFIG.map((cfg) => (
            <div key={cfg.key} style={s.statCard}>
              <div style={s.statTop}>
                <span style={s.statLabel}>{cfg.label}</span>
                <div
                  style={{
                    ...s.statIcon,
                    background: cfg.bg,
                    color: cfg.accent,
                  }}
                >
                  {cfg.icon}
                </div>
              </div>
              <p style={{ ...s.statValue, color: cfg.accent }}>
                {loading ? "—" : stats[cfg.key]}
              </p>
            </div>
          ))}
        </div>

        {/* Recent proceedings */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <h2 style={s.cardTitle}>Trámites pendientes recientes</h2>
            <button
              style={s.linkBtn}
              onClick={() => navigate("/auxiliar/tramites")}
            >
              Ver todos →
            </button>
          </div>

          {loading ? (
            <div style={s.loadingWrap}>
              <div style={s.spinner} />
              <p style={s.loadingText}>Cargando trámites…</p>
            </div>
          ) : recentProceedings.length === 0 ? (
            <p style={s.empty}>No hay trámites pendientes.</p>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>ID</th>
                  <th style={s.th}>Tipo</th>
                  <th style={s.th}>Cliente</th>
                  <th style={s.th}>Estado</th>
                  <th style={s.th}>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentProceedings.map((p, i) => {
                  const ss = getStatusStyle(p.estado);
                  return (
                    <tr
                      key={p._id}
                      style={{
                        ...(i % 2 !== 0 ? { background: "#F9FAFB" } : {}),
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        navigate(`/auxiliar/tramites/${p._id}/revisar`)
                      }
                    >
                      <td
                        style={{
                          ...s.td,
                          fontFamily: "monospace",
                          fontSize: 12,
                          color: "#6B7280",
                        }}
                      >
                        #{p._id?.slice(-6).toUpperCase()}
                      </td>
                      <td style={{ ...s.td, fontWeight: 500 }}>
                        {p.tipoNombre || p.tipo || "—"}
                      </td>
                      <td style={s.td}>
                        {p.clienteNombre || p.cliente?.nombre || "—"}
                      </td>
                      <td style={s.td}>
                        <span
                          style={{
                            ...s.pill,
                            background: ss.bg,
                            color: ss.color,
                          }}
                        >
                          {getStatusText(p.estado)}
                        </span>
                      </td>
                      <td style={{ ...s.td, color: "#9CA3AF", fontSize: 12 }}>
                        {formatRowDate(p.createdAt || p.fecha)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

const s = {
  page: { fontFamily: "'DM Sans', sans-serif", color: "#111827" },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 24,
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
  refreshBtn: {
    background: "none",
    border: "1px solid #E5E7EB",
    borderRadius: 8,
    padding: "7px 14px",
    fontSize: 13,
    color: "#6B7280",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },

  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: 14,
    padding: "18px 20px",
    boxShadow: "0 1px 4px rgba(0,0,0,.04)",
  },
  statTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: 500,
    maxWidth: 120,
    lineHeight: 1.3,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statValue: { margin: 0, fontSize: 30, fontWeight: 600, lineHeight: 1 },

  card: {
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: 14,
    boxShadow: "0 1px 4px rgba(0,0,0,.04)",
    overflow: "hidden",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 20px 12px",
    borderBottom: "1px solid #F3F4F6",
  },
  cardTitle: { margin: 0, fontSize: 15, fontWeight: 600, color: "#111827" },
  linkBtn: {
    background: "none",
    border: "none",
    fontSize: 13,
    color: "#3B82F6",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },

  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    padding: "10px 16px",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    color: "#9CA3AF",
    textTransform: "uppercase",
    textAlign: "left",
    background: "#FAFAFA",
    borderBottom: "1px solid #E5E7EB",
  },
  td: { padding: "12px 16px", color: "#374151", verticalAlign: "middle" },
  pill: {
    padding: "3px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 500,
  },

  loadingWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 0",
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
  empty: {
    textAlign: "center",
    padding: "40px 0",
    color: "#9CA3AF",
    margin: 0,
  },
};
