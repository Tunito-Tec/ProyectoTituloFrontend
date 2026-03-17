import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../config/axios";

const STATUS_STYLES = {
  borrador: { bg: "#F3F4F6", color: "#374151" },
  pendiente_revision_auxiliar: { bg: "#FEF3C7", color: "#92400E" },
  en_revision: { bg: "#DBEAFE", color: "#1E40AF" },
  esperando_firma_cliente: { bg: "#FEF3C7", color: "#92400E" },
  esperando_firma_notario: { bg: "#EDE9FE", color: "#5B21B6" },
  completado: { bg: "#D1FAE5", color: "#065F46" },
  rechazado: { bg: "#FEE2E2", color: "#991B1B" },
};
const STATUS_TEXT = {
  borrador: "Borrador",
  pendiente_revision_auxiliar: "Pendiente revisión",
  en_revision: "En revisión",
  esperando_firma_cliente: "Espera tu firma",
  esperando_firma_notario: "Espera firma notario",
  completado: "Completado",
  rechazado: "Rechazado",
};
const getStatusStyle = (e = "") => STATUS_STYLES[e] || STATUS_STYLES.borrador;
const getStatusText = (e = "") => STATUS_TEXT[e] || e;

const formatDate = (value) => {
  if (!value) return "—";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

// Counts per status group for the summary bar
const STATUS_GROUPS = [
  { label: "Borradores", keys: ["borrador"], accent: "#9CA3AF", bg: "#F3F4F6" },
  {
    label: "En proceso",
    keys: [
      "pendiente_revision_auxiliar",
      "en_revision",
      "esperando_firma_cliente",
      "esperando_firma_notario",
    ],
    accent: "#F59E0B",
    bg: "#FFFBEB",
  },
  {
    label: "Completados",
    keys: ["completado"],
    accent: "#10B981",
    bg: "#ECFDF5",
  },
  {
    label: "Rechazados",
    keys: ["rechazado"],
    accent: "#EF4444",
    bg: "#FEF2F2",
  },
];

export default function ClientDashboard() {
  const [proceedings, setProceedings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();
  const location = useLocation();
  const successMsg = location.state?.message;

  useEffect(() => {
    loadProceedings();
  }, []);

  const loadProceedings = async () => {
    try {
      const { data } = await api.get("/client/tramites");
      const transformed = data.data.map((item) => ({
        _id: item._id,
        tipoNombre: item.tipo?.nombre || item.tipoId || "Sin tipo",
        estado: item.estado || "borrador",
        fecha: item.createdAt,
      }));
      setProceedings(transformed);
    } catch (err) {
      console.error("Error al cargar trámites:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = proceedings.filter((p) => {
    const matchStatus = filterStatus === "all" || p.estado === filterStatus;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.tipoNombre?.toLowerCase().includes(q) ||
      p._id?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  // Summary counts
  const groupCounts = STATUS_GROUPS.map((g) => ({
    ...g,
    count: proceedings.filter((p) => g.keys.includes(p.estado)).length,
  }));

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
            <h1 style={s.pageTitle}>Mis trámites</h1>
          </div>
          <button
            style={s.primaryBtn}
            onClick={() => navigate("/cliente/tramites/nuevo")}
          >
            + Nuevo trámite
          </button>
        </div>

        {/* Success toast */}
        {successMsg && (
          <div style={s.toast}>
            <span>✓ {successMsg}</span>
          </div>
        )}

        {/* Summary row */}
        {!loading && proceedings.length > 0 && (
          <div style={s.summaryRow}>
            {groupCounts.map((g) => (
              <div
                key={g.label}
                style={{
                  ...s.summaryCard,
                  background: g.count > 0 ? g.bg : "#F9FAFB",
                  cursor: "pointer",
                }}
                onClick={() =>
                  setFilterStatus(
                    g.keys[0] === filterStatus ? "all" : g.keys[0],
                  )
                }
              >
                <span
                  style={{
                    ...s.summaryCount,
                    color: g.count > 0 ? g.accent : "#D1D5DB",
                  }}
                >
                  {g.count}
                </span>
                <span style={s.summaryLabel}>{g.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div style={s.filtersBar}>
          <input
            style={s.searchInput}
            placeholder="Buscar por tipo o ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            style={s.select}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            {Object.entries(STATUS_TEXT).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          {(search || filterStatus !== "all") && (
            <button
              style={s.clearBtn}
              onClick={() => {
                setSearch("");
                setFilterStatus("all");
              }}
            >
              ✕ Limpiar
            </button>
          )}
        </div>

        {/* Table */}
        <div style={s.card}>
          {loading ? (
            <div style={s.loadingWrap}>
              <div style={s.spinner} />
              <p style={s.loadingText}>Cargando trámites…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={s.emptyWrap}>
              {proceedings.length === 0 ? (
                <>
                  <p style={s.emptyTitle}>Aún no tienes trámites</p>
                  <p style={s.emptyHint}>
                    Crea tu primer trámite para comenzar.
                  </p>
                  <button
                    style={s.primaryBtn}
                    onClick={() => navigate("/cliente/tramites/nuevo")}
                  >
                    + Nuevo trámite
                  </button>
                </>
              ) : (
                <>
                  <p style={s.emptyTitle}>Sin resultados</p>
                  <p style={s.emptyHint}>Intenta ajustar los filtros.</p>
                </>
              )}
            </div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>ID</th>
                  <th style={s.th}>Tipo de trámite</th>
                  <th style={s.th}>Estado</th>
                  <th style={s.th}>Fecha</th>
                  <th style={{ ...s.th, textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const ss = getStatusStyle(p.estado);
                  return (
                    <tr
                      key={p._id}
                      style={{
                        ...(i % 2 !== 0 ? { background: "#F9FAFB" } : {}),
                        cursor: "pointer",
                      }}
                      onClick={() => navigate(`/cliente/tramites/${p._id}`)}
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
                        {p.tipoNombre}
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
                        {formatDate(p.fecha)}
                      </td>
                      <td style={{ ...s.td, textAlign: "right" }}>
                        <button
                          style={s.rowBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/cliente/tramites/${p._id}`);
                          }}
                        >
                          Ver detalle →
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
              {filtered.length} trámite{filtered.length !== 1 ? "s" : ""}
            </p>
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

  toast: {
    display: "flex",
    alignItems: "center",
    background: "#ECFDF5",
    border: "1px solid #A7F3D0",
    borderRadius: 10,
    padding: "10px 16px",
    marginBottom: 16,
    fontSize: 14,
    color: "#065F46",
  },

  summaryRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    borderRadius: 12,
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    border: "1px solid transparent",
    transition: "border .15s",
    cursor: "pointer",
  },
  summaryCount: { fontSize: 24, fontWeight: 600, lineHeight: 1 },
  summaryLabel: { fontSize: 12, color: "#6B7280" },

  filtersBar: {
    display: "flex",
    gap: 10,
    marginBottom: 16,
    flexWrap: "wrap",
    alignItems: "center",
  },
  searchInput: {
    flex: "2 1 200px",
    padding: "9px 14px",
    fontSize: 14,
    border: "1px solid #E5E7EB",
    borderRadius: 10,
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    background: "#fff",
    color: "#111827",
  },
  select: {
    flex: "1 1 160px",
    padding: "9px 12px",
    fontSize: 14,
    border: "1px solid #E5E7EB",
    borderRadius: 10,
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    background: "#fff",
    color: "#111827",
  },
  clearBtn: {
    background: "none",
    border: "1px solid #E5E7EB",
    borderRadius: 8,
    padding: "7px 14px",
    fontSize: 13,
    color: "#6B7280",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
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
  emptyTitle: { margin: 0, fontSize: 15, fontWeight: 600, color: "#374151" },
  emptyHint: { margin: "0 0 12px", fontSize: 13, color: "#9CA3AF" },

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
};
