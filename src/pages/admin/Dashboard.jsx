import { useState, useEffect } from "react";
import api from "../../config/axios";

const STAT_CONFIG = [
  {
    key: "usuarios.total",
    label: "Total usuarios",
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
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    accent: "#3B82F6",
    bg: "#EFF6FF",
  },
  {
    key: "tramites.total",
    label: "Total trámites",
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
    accent: "#8B5CF6",
    bg: "#F5F3FF",
  },
  {
    key: "tramites.completadosHoy",
    label: "Completados hoy",
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
    accent: "#10B981",
    bg: "#ECFDF5",
  },
  {
    key: "tramites.pendientes",
    label: "Pendientes",
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
    accent: "#F59E0B",
    bg: "#FFFBEB",
  },
];

const getVal = (obj, path) =>
  path.split(".").reduce((acc, k) => acc?.[k], obj) ?? 0;

const ROL_LABELS = {
  admin: "Administrador",
  cliente: "Cliente",
  auxiliar: "Auxiliar",
  notario: "Notario",
};

const ESTADO_LABELS = {
  borrador: "Borrador",
  pendiente_revision_auxiliar: "Pendiente revisión",
  en_revision: "En revisión",
  esperando_firma_cliente: "Espera firma cliente",
  esperando_firma_notario: "Espera firma notario",
  completado: "Completado",
  rechazado: "Rechazado",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    usuarios: { total: 0, porRol: {} },
    tramites: { total: 0, porEstado: {}, completadosHoy: 0, pendientes: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await api.get("/admin/stats");
      setStats(data.data);
    } catch (err) {
      console.error("Error loading stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const roleEntries = Object.entries(stats.usuarios.porRol);
  const estadoEntries = Object.entries(stats.tramites.porEstado);
  const totalRoles = roleEntries.reduce((s, [, v]) => s + v, 0);
  const totalEstados = estadoEntries.reduce((s, [, v]) => s + v, 0);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap"
        rel="stylesheet"
      />

      <div style={s.page}>
        {/* Page header */}
        <div style={s.pageHeader}>
          <div>
            <p style={s.pageLabel}>PANEL DE CONTROL</p>
            <h1 style={s.pageTitle}>Dashboard</h1>
          </div>
          <button style={s.refreshBtn} onClick={loadStats}>
            ↻ Actualizar
          </button>
        </div>

        {/* Stat cards */}
        {loading ? (
          <div style={s.loadingRow}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={s.skeleton} />
            ))}
          </div>
        ) : (
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
                  {getVal(stats, cfg.key).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Tables */}
        <div style={s.tableGrid}>
          {/* Usuarios por rol */}
          <div style={s.tableCard}>
            <h2 style={s.tableTitle}>Usuarios por rol</h2>
            {roleEntries.length === 0 ? (
              <p style={s.empty}>Sin datos.</p>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Rol</th>
                    <th style={{ ...s.th, textAlign: "right" }}>Usuarios</th>
                    <th style={{ ...s.th, textAlign: "right" }}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {roleEntries.map(([rol, count], i) => (
                    <tr
                      key={rol}
                      style={i % 2 === 0 ? {} : { background: "#F9FAFB" }}
                    >
                      <td style={s.td}>
                        <span style={s.rolPill}>{ROL_LABELS[rol] || rol}</span>
                      </td>
                      <td
                        style={{ ...s.td, textAlign: "right", fontWeight: 600 }}
                      >
                        {count}
                      </td>
                      <td style={{ ...s.td, textAlign: "right" }}>
                        <div style={s.barWrapper}>
                          <div
                            style={{
                              ...s.bar,
                              width: `${Math.round((count / totalRoles) * 100)}%`,
                            }}
                          />
                          <span style={s.barPct}>
                            {totalRoles
                              ? Math.round((count / totalRoles) * 100)
                              : 0}
                            %
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Trámites por estado */}
          <div style={s.tableCard}>
            <h2 style={s.tableTitle}>Trámites por estado</h2>
            {estadoEntries.length === 0 ? (
              <p style={s.empty}>Sin datos.</p>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Estado</th>
                    <th style={{ ...s.th, textAlign: "right" }}>Cantidad</th>
                    <th style={{ ...s.th, textAlign: "right" }}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {estadoEntries.map(([estado, count], i) => (
                    <tr
                      key={estado}
                      style={i % 2 === 0 ? {} : { background: "#F9FAFB" }}
                    >
                      <td style={s.td}>
                        {ESTADO_LABELS[estado] || estado.replace(/_/g, " ")}
                      </td>
                      <td
                        style={{ ...s.td, textAlign: "right", fontWeight: 600 }}
                      >
                        {count}
                      </td>
                      <td style={{ ...s.td, textAlign: "right" }}>
                        <div style={s.barWrapper}>
                          <div
                            style={{
                              ...s.bar,
                              width: `${Math.round((count / totalEstados) * 100)}%`,
                              background: "#8B5CF6",
                            }}
                          />
                          <span style={s.barPct}>
                            {totalEstados
                              ? Math.round((count / totalEstados) * 100)
                              : 0}
                            %
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const s = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    color: "#111827",
  },
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

  // Stat grid
  loadingRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    marginBottom: 24,
  },
  skeleton: {
    height: 100,
    background: "#F3F4F6",
    borderRadius: 14,
    animation: "pulse 1.5s ease-in-out infinite",
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
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
    lineHeight: 1.3,
    maxWidth: 100,
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
  statValue: {
    margin: 0,
    fontSize: 30,
    fontWeight: 600,
    lineHeight: 1,
  },

  // Table grid
  tableGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  },
  tableCard: {
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: 14,
    padding: "20px 24px",
    boxShadow: "0 1px 4px rgba(0,0,0,.04)",
  },
  tableTitle: {
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
    textAlign: "center",
    padding: "24px 0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
  },
  th: {
    padding: "0 8px 10px",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    color: "#9CA3AF",
    textTransform: "uppercase",
    textAlign: "left",
    borderBottom: "1px solid #F3F4F6",
  },
  td: {
    padding: "10px 8px",
    color: "#374151",
    fontSize: 13,
  },
  rolPill: {
    background: "#F3F4F6",
    color: "#374151",
    padding: "3px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 500,
  },
  barWrapper: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    justifyContent: "flex-end",
  },
  bar: {
    height: 4,
    borderRadius: 2,
    background: "#3B82F6",
    minWidth: 4,
    maxWidth: 80,
    transition: "width .4s ease",
  },
  barPct: {
    fontSize: 12,
    color: "#9CA3AF",
    minWidth: 32,
    textAlign: "right",
  },
};
