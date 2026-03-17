import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../config/axios";

const ESTADO_TEXT = {
  borrador: "Borrador",
  pendiente_revision_auxiliar: "Pendiente revisión",
  en_revision: "En revisión",
  esperando_firma_cliente: "Espera firma cliente",
  esperando_firma_notario: "Espera firma notario",
  completado: "Completado",
  rechazado: "Rechazado",
};

const STAT_CONFIG = [
  {
    key: "tramitesHoy",
    label: "Trámites hoy",
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
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    key: "pendientesFirma",
    label: "Pendientes de firma",
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
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    key: "documentosEntregables",
    label: "Doc. entregables",
    accent: "#8B5CF6",
    bg: "#EDE9FE",
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
    key: "tiempoPromedioHoras",
    label: "Tiempo promedio",
    accent: "#10B981",
    bg: "#ECFDF5",
    suffix: "h",
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
];

// Pie chart colors
const PIE_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#EC4899",
];

export default function NotaryDashboard() {
  const [stats, setStats] = useState({
    tramitesHoy: 0,
    pendientesFirma: 0,
    documentosEntregables: 0,
    tiempoPromedioHoras: 0,
    distribucionEstados: {},
    distribucionTipos: {},
    totalTramites: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await api.get("/notario/dashboard/stats");
      setStats(data.data);
    } catch (err) {
      console.error("Error loading stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const estadoEntries = Object.entries(stats.distribucionEstados || {});
  const tipoEntries = Object.entries(stats.distribucionTipos || {});
  const totalEstados = estadoEntries.reduce((s, [, v]) => s + v, 0);
  const maxTipo = Math.max(...tipoEntries.map(([, v]) => v), 1);

  // Mini SVG donut
  const donutSize = 140;
  const cx = donutSize / 2,
    cy = donutSize / 2,
    r = 52,
    stroke = 20;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const donutSlices = estadoEntries.map(([key, val], i) => {
    const pct = totalEstados > 0 ? val / totalEstados : 0;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const slice = {
      key,
      val,
      pct,
      dash,
      gap,
      offset,
      color: PIE_COLORS[i % PIE_COLORS.length],
    };
    offset += dash;
    return slice;
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
            <h1 style={s.pageTitle}>Dashboard notarial</h1>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={s.refreshBtn} onClick={loadStats}>
              ↻ Actualizar
            </button>
            <button
              style={s.primaryBtn}
              onClick={() => navigate("/notario/firmas-pendientes")}
            >
              Ver firmas pendientes →
            </button>
          </div>
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
                {loading ? "—" : `${stats[cfg.key]}${cfg.suffix || ""}`}
              </p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={s.chartsGrid}>
          {/* Donut: estados */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>Distribución por estado</h2>
            {estadoEntries.length === 0 ? (
              <p style={s.empty}>Sin datos.</p>
            ) : (
              <div style={s.donutWrap}>
                <svg
                  width={donutSize}
                  height={donutSize}
                  style={{ flexShrink: 0 }}
                >
                  {/* Track */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="none"
                    stroke="#F3F4F6"
                    strokeWidth={stroke}
                  />
                  {/* Slices */}
                  {donutSlices.map((sl) => (
                    <circle
                      key={sl.key}
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill="none"
                      stroke={sl.color}
                      strokeWidth={stroke}
                      strokeDasharray={`${sl.dash} ${sl.gap}`}
                      strokeDashoffset={-sl.offset}
                      style={{
                        transform: "rotate(-90deg)",
                        transformOrigin: "50% 50%",
                      }}
                    />
                  ))}
                  {/* Center */}
                  <text
                    x={cx}
                    y={cy - 6}
                    textAnchor="middle"
                    fontSize="20"
                    fontWeight="600"
                    fill="#111827"
                    fontFamily="DM Sans, sans-serif"
                  >
                    {totalEstados}
                  </text>
                  <text
                    x={cx}
                    y={cy + 12}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#9CA3AF"
                    fontFamily="DM Sans, sans-serif"
                  >
                    total
                  </text>
                </svg>
                <div style={s.donutLegend}>
                  {donutSlices.map((sl) => (
                    <div key={sl.key} style={s.legendRow}>
                      <span style={{ ...s.legendDot, background: sl.color }} />
                      <span style={s.legendLabel}>
                        {ESTADO_TEXT[sl.key] || sl.key}
                      </span>
                      <span style={s.legendVal}>{sl.val}</span>
                      <span style={s.legendPct}>
                        {Math.round(sl.pct * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bar: tipos */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>Trámites por tipo</h2>
            {tipoEntries.length === 0 ? (
              <p style={s.empty}>Sin datos.</p>
            ) : (
              <div style={s.barChart}>
                {tipoEntries.map(([tipo, count], i) => (
                  <div key={tipo} style={s.barRow}>
                    <span style={s.barLabel}>{tipo.replace(/_/g, " ")}</span>
                    <div style={s.barTrack}>
                      <div
                        style={{
                          ...s.barFill,
                          width: `${Math.round((count / maxTipo) * 100)}%`,
                          background: PIE_COLORS[i % PIE_COLORS.length],
                          animationDelay: `${i * 80}ms`,
                        }}
                      />
                    </div>
                    <span style={s.barCount}>{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
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
  primaryBtn: {
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: 9,
    padding: "9px 18px",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
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
    maxWidth: 110,
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

  chartsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
  card: {
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: 14,
    padding: "20px 24px",
    boxShadow: "0 1px 4px rgba(0,0,0,.04)",
  },
  cardTitle: {
    margin: "0 0 20px",
    fontSize: 15,
    fontWeight: 600,
    color: "#111827",
    paddingBottom: 12,
    borderBottom: "1px solid #F3F4F6",
  },
  empty: {
    color: "#9CA3AF",
    fontSize: 14,
    textAlign: "center",
    padding: "24px 0",
    margin: 0,
  },

  donutWrap: { display: "flex", alignItems: "center", gap: 24 },
  donutLegend: { flex: 1, display: "flex", flexDirection: "column", gap: 8 },
  legendRow: { display: "flex", alignItems: "center", gap: 8, fontSize: 13 },
  legendDot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  legendLabel: { flex: 1, color: "#374151", fontSize: 12 },
  legendVal: {
    fontWeight: 600,
    color: "#111827",
    minWidth: 24,
    textAlign: "right",
  },
  legendPct: {
    color: "#9CA3AF",
    fontSize: 11,
    minWidth: 32,
    textAlign: "right",
  },

  barChart: { display: "flex", flexDirection: "column", gap: 14 },
  barRow: { display: "flex", alignItems: "center", gap: 10 },
  barLabel: {
    fontSize: 12,
    color: "#6B7280",
    minWidth: 120,
    maxWidth: 120,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    textTransform: "capitalize",
  },
  barTrack: {
    flex: 1,
    height: 8,
    background: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 4, transition: "width .6s ease" },
  barCount: {
    fontSize: 13,
    fontWeight: 600,
    color: "#111827",
    minWidth: 28,
    textAlign: "right",
  },
};
