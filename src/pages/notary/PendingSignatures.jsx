import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../config/axios";
import { getStatusText, formatDate } from "../../utils/formatters";

const STATUS_STYLES = {
  esperando_firma_notario: { bg: "#EDE9FE", color: "#5B21B6" },
  esperando_firma_cliente: { bg: "#FEF3C7", color: "#92400E" },
  en_revision: { bg: "#DBEAFE", color: "#1E40AF" },
  completado: { bg: "#D1FAE5", color: "#065F46" },
};
const getStatusStyle = (e = "") =>
  STATUS_STYLES[e] || { bg: "#F3F4F6", color: "#374151" };

const getTipoNombre = (row) => {
  if (!row?.tipo) return row?.tipoId || "—";
  if (typeof row.tipo === "object")
    return row.tipo.nombre || row.tipo.tipoId || "—";
  return row.tipo;
};

export default function PendingSignatures() {
  const [proceedings, setProceedings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadPendingSignatures();
  }, []);

  const loadPendingSignatures = async () => {
    try {
      const { data } = await api.get("/notario/tramites/pendientes-firma");
      setProceedings(data.data.pendientesFirmaNotario || []);
    } catch (err) {
      console.error("Error loading pending signatures:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = proceedings.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.cliente?.nombre?.toLowerCase().includes(q) ||
      p._id?.toLowerCase().includes(q) ||
      getTipoNombre(p).toLowerCase().includes(q)
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
            <p style={s.pageLabel}>NOTARIO</p>
            <h1 style={s.pageTitle}>Firmas pendientes</h1>
          </div>
          <span style={s.totalBadge}>
            {loading
              ? "…"
              : `${filtered.length} pendiente${filtered.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <input
            style={s.searchInput}
            placeholder="Buscar por ID, tipo o cliente…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div style={s.card}>
          {loading ? (
            <div style={s.loadingWrap}>
              <div style={s.spinner} />
              <p style={s.loadingText}>Cargando firmas pendientes…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={s.emptyWrap}>
              {proceedings.length === 0 ? (
                <>
                  <div style={s.emptyIcon}>
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#D1D5DB"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <p style={s.emptyTitle}>Sin firmas pendientes</p>
                  <p style={s.emptyHint}>
                    No hay documentos esperando tu firma.
                  </p>
                </>
              ) : (
                <p style={s.emptyTitle}>Sin resultados para "{search}"</p>
              )}
            </div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>ID</th>
                  <th style={s.th}>Tipo</th>
                  <th style={s.th}>Cliente</th>
                  <th style={s.th}>Estado</th>
                  <th style={s.th}>Fecha</th>
                  <th style={{ ...s.th, textAlign: "right" }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const ss = getStatusStyle(p.estado);
                  return (
                    <tr
                      key={p._id}
                      style={i % 2 !== 0 ? { background: "#F9FAFB" } : {}}
                    >
                      <td
                        style={{
                          ...s.td,
                          fontFamily: "monospace",
                          fontSize: 12,
                          color: "#9CA3AF",
                        }}
                      >
                        #{p._id?.slice(-6).toUpperCase()}
                      </td>
                      <td
                        style={{ ...s.td, fontWeight: 500, color: "#111827" }}
                      >
                        {getTipoNombre(p)}
                      </td>
                      <td style={s.td}>
                        <div style={s.clientCell}>
                          <div
                            style={{
                              ...s.clientDot,
                              background: dotColor(p.cliente?.nombre),
                            }}
                          />
                          {p.cliente?.nombre || "—"}
                        </div>
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
                        {formatDate(p.createdAt)}
                      </td>
                      <td style={{ ...s.td, textAlign: "right" }}>
                        <button
                          style={s.signBtn}
                          onClick={() =>
                            navigate(`/notario/tramites/${p._id}/firmar`)
                          }
                        >
                          ✍ Firmar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {!loading && filtered.length > 0 && (
            <p style={s.rowCount}>
              {filtered.length} documento{filtered.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

const DOT_COLORS = [
  "#3B82F6",
  "#8B5CF6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
];
const dotColor = (str = "") =>
  DOT_COLORS[(str?.charCodeAt(0) || 0) % DOT_COLORS.length];

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
  },
  totalBadge: {
    background: "#FEF3C7",
    color: "#92400E",
    padding: "5px 14px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 500,
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
    padding: "11px 16px",
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
  clientCell: { display: "flex", alignItems: "center", gap: 8 },
  clientDot: { width: 7, height: 7, borderRadius: "50%", flexShrink: 0 },
  signBtn: {
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "7px 14px",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
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
  emptyWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "48px 0",
    gap: 8,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    background: "#F9FAFB",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: { margin: 0, fontSize: 15, fontWeight: 600, color: "#374151" },
  emptyHint: { margin: 0, fontSize: 13, color: "#9CA3AF" },
};
