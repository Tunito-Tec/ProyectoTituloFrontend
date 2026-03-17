import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../config/axios";
import { formatDate } from "../../utils/formatters";

const getTipoNombre = (row) => {
  if (!row?.tipo) return row?.tipoId || "—";
  if (typeof row.tipo === "object")
    return row.tipo.nombre || row.tipo.tipoId || "—";
  return row.tipo;
};

export default function DeliverableDocuments() {
  const [proceedings, setProceedings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [downloading, setDownloading] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDeliverableDocuments();
  }, []);

  const loadDeliverableDocuments = async () => {
    try {
      const { data } = await api.get("/notario/tramites/completados");
      setProceedings(data.data || []);
    } catch (err) {
      setError("Error al cargar los documentos entregables");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadBlob = async (id, filename) => {
    const response = await api.get(`/notario/tramites/${id}/copia-cliente`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", filename);
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleDownload = async (id) => {
    setDownloading(id);
    try {
      await downloadBlob(id, `documento-${id.slice(-6)}.pdf`);
    } catch (err) {
      console.error("Error al descargar:", err);
    } finally {
      setDownloading(null);
    }
  };

  const handlePrint = async (id) => {
    try {
      const response = await api.get(`/notario/tramites/${id}/copia-cliente`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const w = window.open(url);
      if (w) w.onload = () => w.print();
    } catch (err) {
      console.error("Error al imprimir:", err);
    }
  };

  const filtered = proceedings.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.cliente?.nombre?.toLowerCase().includes(q) ||
      p._id?.toLowerCase().includes(q) ||
      getTipoNombre(p).toLowerCase().includes(q) ||
      p.csv?.toLowerCase().includes(q)
    );
  });

  if (error)
    return (
      <div
        style={{
          ...s.card,
          padding: "24px",
          color: "#991B1B",
          background: "#FEF2F2",
          border: "1px solid #FECACA",
        }}
      >
        ⚠ {error}
      </div>
    );

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
            <h1 style={s.pageTitle}>Documentos entregables</h1>
            <p style={s.pageHint}>
              Documentos firmados digitalmente listos para entregar al cliente.
            </p>
          </div>
          <span style={s.totalBadge}>
            {loading
              ? "…"
              : `${filtered.length} doc${filtered.length !== 1 ? "s" : ""}.`}
          </span>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <input
            style={s.searchInput}
            placeholder="Buscar por ID, tipo, cliente o CSV…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div style={s.card}>
          {loading ? (
            <div style={s.loadingWrap}>
              <div style={s.spinner} />
              <p style={s.loadingText}>Cargando documentos…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={s.emptyWrap}>
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
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <p style={s.emptyTitle}>
                {proceedings.length === 0
                  ? "Sin documentos"
                  : `Sin resultados para "${search}"`}
              </p>
              <p style={s.emptyHint}>
                Los documentos firmados aparecerán aquí.
              </p>
            </div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>ID</th>
                  <th style={s.th}>Tipo</th>
                  <th style={s.th}>Cliente</th>
                  <th style={s.th}>RUT</th>
                  <th style={s.th}>Fecha firma</th>
                  <th style={s.th}>CSV</th>
                  <th style={{ ...s.th, textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
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
                    <td style={{ ...s.td, fontWeight: 500, color: "#111827" }}>
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
                    <td
                      style={{ ...s.td, fontFamily: "monospace", fontSize: 12 }}
                    >
                      {p.cliente?.rut || "—"}
                    </td>
                    <td style={{ ...s.td, color: "#9CA3AF", fontSize: 12 }}>
                      {formatDate(p.fechaFirmaNotario) || "—"}
                    </td>
                    <td style={s.td}>
                      {p.csv ? (
                        <span style={s.csvPill}>{p.csv}</span>
                      ) : (
                        <span style={s.csvEmpty}>Sin CSV</span>
                      )}
                    </td>
                    <td style={{ ...s.td, textAlign: "right" }}>
                      <div style={s.rowActions}>
                        <button
                          style={s.iconBtn}
                          title="Ver documento"
                          onClick={() => navigate(`/notario/tramites/${p._id}`)}
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        <button
                          style={s.iconBtn}
                          title="Descargar copia"
                          disabled={downloading === p._id}
                          onClick={() => handleDownload(p._id)}
                        >
                          {downloading === p._id ? (
                            <span style={{ fontSize: 12 }}>…</span>
                          ) : (
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                          )}
                        </button>
                        <button
                          style={s.iconBtn}
                          title="Imprimir"
                          onClick={() => handlePrint(p._id)}
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="6 9 6 2 18 2 18 9" />
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                            <rect x="6" y="14" width="12" height="8" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
    alignItems: "flex-start",
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
    margin: "0 0 4px",
    fontFamily: "'DM Serif Display', serif",
    fontSize: 28,
    fontWeight: 400,
  },
  pageHint: { margin: 0, fontSize: 13, color: "#9CA3AF" },
  totalBadge: {
    background: "#D1FAE5",
    color: "#065F46",
    padding: "5px 14px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 500,
    flexShrink: 0,
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

  clientCell: { display: "flex", alignItems: "center", gap: 8 },
  clientDot: { width: 7, height: 7, borderRadius: "50%", flexShrink: 0 },
  csvPill: {
    background: "#EFF6FF",
    color: "#1D4ED8",
    padding: "3px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontFamily: "monospace",
    fontWeight: 600,
    letterSpacing: "0.04em",
  },
  csvEmpty: { color: "#D1D5DB", fontSize: 12, fontStyle: "italic" },

  rowActions: { display: "flex", gap: 6, justifyContent: "flex-end" },
  iconBtn: {
    background: "#F9FAFB",
    border: "1px solid #E5E7EB",
    borderRadius: 7,
    width: 30,
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#6B7280",
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
