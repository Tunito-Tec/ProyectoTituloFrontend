import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../config/axios";
import { getStatusText, formatDate } from "../../utils/formatters";

const STATUS_OPTIONS = [
  { value: "all", label: "Todos los estados" },
  { value: "pendiente_revision_auxiliar", label: "Pendientes" },
  { value: "en_revision", label: "En revisión" },
  { value: "esperando_firma_cliente", label: "Espera firma cliente" },
  { value: "esperando_firma_notario", label: "Espera firma notario" },
  { value: "completado", label: "Completados" },
];

const STATUS_STYLES = {
  pendiente_revision_auxiliar: { bg: "#FEF3C7", color: "#92400E" },
  en_revision: { bg: "#E0E7FF", color: "#3730A3" },
  esperando_firma_cliente: { bg: "#FEF3C7", color: "#92400E" },
  esperando_firma_notario: { bg: "#EDE9FE", color: "#5B21B6" },
  completado: { bg: "#D1FAE5", color: "#065F46" },
  rechazado: { bg: "#FEE2E2", color: "#991B1B" },
};
const getStatusStyle = (estado = "") =>
  STATUS_STYLES[estado] || { bg: "#F3F4F6", color: "#374151" };

const PAGE_SIZE = 10;

export default function ProceedingList() {
  const [proceedings, setProceedings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tiposTramite, setTiposTramite] = useState([]);
  const [filters, setFilters] = useState({
    estado: "all",
    tipo: "all",
    search: "",
  });
  const [page, setPage] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadTiposTramite();
  }, []);
  useEffect(() => {
    loadProceedings();
    setPage(0);
  }, [filters.estado, filters.tipo]);

  const loadProceedings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.estado !== "all") params.append("estado", filters.estado);
      if (filters.tipo !== "all") params.append("tipo", filters.tipo);
      const { data } = await api.get(`/auxiliar/tramites/pendientes?${params}`);
      setProceedings(data.data);
    } catch (err) {
      console.error("Error loading proceedings:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadTiposTramite = async () => {
    try {
      const { data } = await api.get("/tramite-types/activos");
      setTiposTramite(data.data);
    } catch (err) {
      console.error("Error loading tipos:", err);
    }
  };

  const setFilter = (key) => (e) =>
    setFilters((f) => ({ ...f, [key]: e.target.value }));

  // Client-side search filter
  const filtered = proceedings.filter((p) => {
    if (!filters.search) return true;
    const q = filters.search.toLowerCase();
    return (
      p.cliente?.nombre?.toLowerCase().includes(q) ||
      p._id?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const clearFilters = () => {
    setFilters({ estado: "all", tipo: "all", search: "" });
    setPage(0);
  };
  const hasFilters =
    filters.estado !== "all" || filters.tipo !== "all" || filters.search !== "";

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
            <p style={s.pageLabel}>AUXILIAR</p>
            <h1 style={s.pageTitle}>Gestión de trámites</h1>
          </div>
          <span style={s.totalBadge}>
            {filtered.length} trámite{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Filters */}
        <div style={s.filtersBar}>
          <input
            style={s.searchInput}
            placeholder="Buscar por ID o nombre del cliente…"
            value={filters.search}
            onChange={setFilter("search")}
          />
          <select
            style={s.select}
            value={filters.estado}
            onChange={setFilter("estado")}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            style={s.select}
            value={filters.tipo}
            onChange={setFilter("tipo")}
          >
            <option value="all">Todos los tipos</option>
            {tiposTramite.map((t) => (
              <option key={t._id} value={t.tipoId}>
                {t.nombre}
              </option>
            ))}
          </select>
          {hasFilters && (
            <button style={s.clearBtn} onClick={clearFilters}>
              ✕ Limpiar
            </button>
          )}
        </div>

        {/* Table card */}
        <div style={s.card}>
          {loading ? (
            <div style={s.loadingWrap}>
              <div style={s.spinner} />
              <p style={s.loadingText}>Cargando trámites…</p>
            </div>
          ) : paginated.length === 0 ? (
            <div style={s.emptyWrap}>
              <p style={s.emptyTitle}>No se encontraron trámites</p>
              <p style={s.emptyHint}>
                Intenta ajustar los filtros de búsqueda.
              </p>
              {hasFilters && (
                <button style={s.clearBtn} onClick={clearFilters}>
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>ID</th>
                    <th style={s.th}>Tipo</th>
                    <th style={s.th}>Cliente</th>
                    <th style={s.th}>Estado</th>
                    <th style={s.th}>Fecha</th>
                    <th style={s.th}>Asignado a</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((p, i) => {
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
                        <td
                          style={{ ...s.td, fontWeight: 500, color: "#111827" }}
                        >
                          {p.tipo?.nombre || p.tipo || "—"}
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
                        <td style={s.td}>
                          {p.asignadoA?.nombre ? (
                            <span style={s.assignedPill}>
                              {p.asignadoA.nombre}
                            </span>
                          ) : (
                            <span style={s.unassigned}>Sin asignar</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={s.pagination}>
                  <span style={s.pageInfo}>
                    Pág. {page + 1} de {totalPages}
                  </span>
                  <div style={s.pageButtons}>
                    <button
                      style={s.pageBtn}
                      onClick={() => setPage(0)}
                      disabled={page === 0}
                    >
                      «
                    </button>
                    <button
                      style={s.pageBtn}
                      onClick={() => setPage((p) => p - 1)}
                      disabled={page === 0}
                    >
                      ‹
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pg =
                        Math.max(0, Math.min(totalPages - 5, page - 2)) + i;
                      return (
                        <button
                          key={pg}
                          style={{
                            ...s.pageBtn,
                            ...(pg === page ? s.pageBtnActive : {}),
                          }}
                          onClick={() => setPage(pg)}
                        >
                          {pg + 1}
                        </button>
                      );
                    })}
                    <button
                      style={s.pageBtn}
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= totalPages - 1}
                    >
                      ›
                    </button>
                    <button
                      style={s.pageBtn}
                      onClick={() => setPage(totalPages - 1)}
                      disabled={page >= totalPages - 1}
                    >
                      »
                    </button>
                  </div>
                  <span style={s.pageInfo}>{filtered.length} resultados</span>
                </div>
              )}
            </>
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
    color: "#111827",
  },
  totalBadge: {
    background: "#F3F4F6",
    color: "#374151",
    padding: "5px 14px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 500,
  },

  filtersBar: {
    display: "flex",
    gap: 10,
    marginBottom: 16,
    flexWrap: "wrap",
    alignItems: "center",
  },
  searchInput: {
    flex: "2 1 240px",
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
    whiteSpace: "nowrap",
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
  assignedPill: {
    background: "#F3F4F6",
    color: "#374151",
    padding: "3px 10px",
    borderRadius: 999,
    fontSize: 12,
  },
  unassigned: { color: "#D1D5DB", fontSize: 12, fontStyle: "italic" },

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
  emptyHint: { margin: 0, fontSize: 13, color: "#9CA3AF" },

  pagination: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderTop: "1px solid #F3F4F6",
    flexWrap: "wrap",
    gap: 8,
  },
  pageInfo: { fontSize: 12, color: "#9CA3AF" },
  pageButtons: { display: "flex", gap: 4 },
  pageBtn: {
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: 7,
    width: 32,
    height: 32,
    fontSize: 13,
    color: "#374151",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pageBtnActive: {
    background: "#111827",
    color: "#fff",
    borderColor: "#111827",
  },
};
