import { useNavigate } from "react-router-dom";

const FEATURES = [
  {
    title: "Trámites digitales",
    desc: "Inicia y gestiona tus trámites notariales desde cualquier lugar, sin filas ni traslados.",
    icon: (
      <svg
        width="22"
        height="22"
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
    accent: "#3B82F6",
    bg: "#EFF6FF",
  },
  {
    title: "Firma digital",
    desc: "Documentos firmados con validez legal completa y cadena de integridad verificable.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    accent: "#10B981",
    bg: "#ECFDF5",
  },
  {
    title: "Rápido y eficiente",
    desc: "Reducción de tiempos de espera. Seguimiento en tiempo real del estado de tus trámites.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    accent: "#8B5CF6",
    bg: "#EDE9FE",
  },
];

const STEPS = [
  {
    n: "01",
    label: "Crea tu cuenta",
    desc: "Regístrate en minutos con tu RUT y correo.",
  },
  {
    n: "02",
    label: "Inicia un trámite",
    desc: "Selecciona el tipo y completa el formulario.",
  },
  {
    n: "03",
    label: "Revisión y firma",
    desc: "El equipo notarial revisa y firma digitalmente.",
  },
  {
    n: "04",
    label: "Recibe tu documento",
    desc: "Descarga tu copia con código de verificación.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap"
        rel="stylesheet"
      />

      <div style={s.page}>
        {/* ── Hero ── */}
        <section style={s.hero}>
          <div style={s.heroInner}>
            <div style={s.heroBadge}>Sistema Notarial Integrado</div>
            <h1 style={s.heroTitle}>
              Trámites notariales
              <br />
              <em style={s.heroAccent}>sin filas, sin esperas</em>
            </h1>
            <p style={s.heroSub}>
              Gestiona tus escrituras, certificaciones y poderes notariales
              desde cualquier dispositivo. Firma digital con validez legal
              plena.
            </p>
            <div style={s.heroCta}>
              <button
                style={s.ctaPrimary}
                onClick={() => navigate("/register")}
              >
                Crear cuenta gratis
              </button>
              <button style={s.ctaSecondary} onClick={() => navigate("/login")}>
                Iniciar sesión →
              </button>
            </div>
            <div style={s.heroTrust}>
              <TrustItem label="100% digital" />
              <span style={s.trustDivider} />
              <TrustItem label="Firma con validez legal" />
              <span style={s.trustDivider} />
              <TrustItem label="Trazabilidad completa" />
            </div>
          </div>

          {/* Decorative card mockup */}
          <div style={s.heroVisual}>
            <div style={s.mockCard}>
              <div style={s.mockHeader}>
                <div style={s.mockDot} />
                <span style={s.mockTitle}>Escritura pública</span>
                <span style={s.mockPill}>Completado</span>
              </div>
              <div style={s.mockRow}>
                <span style={s.mockKey}>Cliente</span>
                <span style={s.mockVal}>María González</span>
              </div>
              <div style={s.mockRow}>
                <span style={s.mockKey}>RUT</span>
                <span style={s.mockVal}>12.345.678-9</span>
              </div>
              <div style={s.mockRow}>
                <span style={s.mockKey}>Notario</span>
                <span style={s.mockVal}>Carlos Ruiz</span>
              </div>
              <div style={s.mockDivider} />
              <div style={s.mockHash}>
                <span style={s.mockHashLabel}>Hash SHA-256</span>
                <span style={s.mockHashVal}>a3f8c2…d91e</span>
              </div>
              <div style={s.mockCsv}>
                <span style={s.mockCsvLabel}>CSV</span>
                <span style={s.mockCsvVal}>NOT-2024-00847</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section style={s.section}>
          <p style={s.sectionLabel}>CARACTERÍSTICAS</p>
          <h2 style={s.sectionTitle}>
            Todo lo que necesitas para tus trámites
          </h2>
          <div style={s.featureGrid}>
            {FEATURES.map((f) => (
              <div key={f.title} style={s.featureCard}>
                <div
                  style={{
                    ...s.featureIcon,
                    background: f.bg,
                    color: f.accent,
                  }}
                >
                  {f.icon}
                </div>
                <h3 style={s.featureTitle}>{f.title}</h3>
                <p style={s.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section style={{ ...s.section, ...s.sectionAlt }}>
          <div style={s.sectionInner}>
            <p style={s.sectionLabel}>PROCESO</p>
            <h2 style={s.sectionTitle}>Cómo funciona</h2>
            <div style={s.stepsGrid}>
              {STEPS.map((step, i) => (
                <div key={step.n} style={s.stepCard}>
                  <span style={s.stepNum}>{step.n}</span>
                  <h4 style={s.stepTitle}>{step.label}</h4>
                  <p style={s.stepDesc}>{step.desc}</p>
                  {i < STEPS.length - 1 && <div style={s.stepArrow}>→</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA bottom ── */}
        <section style={s.ctaSection}>
          <h2 style={s.ctaTitle}>¿Listo para comenzar?</h2>
          <p style={s.ctaSub}>
            Crea tu cuenta y gestiona tu primer trámite en minutos.
          </p>
          <div style={s.heroCta}>
            <button style={s.ctaPrimary} onClick={() => navigate("/register")}>
              Registrarse ahora
            </button>
            <button style={s.ctaSecondary} onClick={() => navigate("/login")}>
              Ya tengo cuenta →
            </button>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={s.footer}>
          <div style={s.footerBrand}>
            <div style={s.footerLogo}>
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <rect width="18" height="18" rx="5" fill="#111827" />
                <path
                  d="M4 13 L9 5 L14 13"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.5 10 H11.5"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              <span style={s.footerName}>SINotarial</span>
            </div>
            <p style={s.footerCopy}>
              © 2024 SINotarial. Sistema Notarial Integrado.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

function TrustItem({ label }) {
  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 13,
        color: "#6B7280",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "#10B981",
          display: "inline-block",
        }}
      />
      {label}
    </span>
  );
}

const s = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    color: "#111827",
    background: "#fff",
  },

  // Hero
  hero: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 48,
    padding: "80px 64px 80px",
    maxWidth: 1200,
    margin: "0 auto",
    flexWrap: "wrap",
  },
  heroInner: { flex: "1 1 480px", maxWidth: 560 },
  heroBadge: {
    display: "inline-block",
    background: "#F3F4F6",
    color: "#374151",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    padding: "5px 12px",
    borderRadius: 999,
    marginBottom: 20,
  },
  heroTitle: {
    margin: "0 0 20px",
    fontFamily: "'DM Serif Display', serif",
    fontSize: 48,
    fontWeight: 400,
    lineHeight: 1.15,
    color: "#111827",
  },
  heroAccent: { fontStyle: "italic", color: "#3B82F6" },
  heroSub: {
    margin: "0 0 32px",
    fontSize: 17,
    color: "#6B7280",
    lineHeight: 1.7,
    maxWidth: 480,
  },
  heroCta: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 },
  ctaPrimary: {
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "12px 24px",
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  ctaSecondary: {
    background: "none",
    color: "#374151",
    border: "1px solid #E5E7EB",
    borderRadius: 10,
    padding: "12px 20px",
    fontSize: 15,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  heroTrust: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  trustDivider: { width: 1, height: 16, background: "#E5E7EB" },

  // Hero visual
  heroVisual: { flex: "0 0 auto" },
  mockCard: {
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: 16,
    padding: "20px 24px",
    width: 300,
    boxShadow: "0 8px 32px rgba(0,0,0,.08)",
  },
  mockHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    paddingBottom: 14,
    borderBottom: "1px solid #F3F4F6",
  },
  mockDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#10B981",
    flexShrink: 0,
  },
  mockTitle: { flex: 1, fontSize: 14, fontWeight: 600, color: "#111827" },
  mockPill: {
    background: "#D1FAE5",
    color: "#065F46",
    fontSize: 11,
    fontWeight: 600,
    padding: "3px 9px",
    borderRadius: 999,
  },
  mockRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8,
    fontSize: 13,
  },
  mockKey: { color: "#9CA3AF" },
  mockVal: { color: "#374151", fontWeight: 500 },
  mockDivider: { height: 1, background: "#F3F4F6", margin: "12px 0" },
  mockHash: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  mockHashLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: 600,
    letterSpacing: "0.04em",
  },
  mockHashVal: { fontSize: 11, fontFamily: "monospace", color: "#6B7280" },
  mockCsv: { display: "flex", justifyContent: "space-between" },
  mockCsvLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: 600,
    letterSpacing: "0.04em",
  },
  mockCsvVal: {
    fontSize: 11,
    fontFamily: "monospace",
    color: "#3B82F6",
    fontWeight: 700,
  },

  // Sections
  section: { padding: "72px 64px", maxWidth: 1200, margin: "0 auto" },
  sectionAlt: {
    background: "#F9FAFB",
    borderRadius: 24,
    maxWidth: "none",
    padding: "72px 0",
  },
  sectionInner: { maxWidth: 1200, margin: "0 auto", padding: "0 64px" },
  sectionLabel: {
    margin: "0 0 8px",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.1em",
    color: "#9CA3AF",
    textTransform: "uppercase",
  },
  sectionTitle: {
    margin: "0 0 40px",
    fontFamily: "'DM Serif Display', serif",
    fontSize: 32,
    fontWeight: 400,
    color: "#111827",
  },

  // Features
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 24,
  },
  featureCard: {
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: 16,
    padding: "28px 24px",
    boxShadow: "0 1px 4px rgba(0,0,0,.04)",
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  featureTitle: {
    margin: "0 0 8px",
    fontSize: 16,
    fontWeight: 600,
    color: "#111827",
  },
  featureDesc: { margin: 0, fontSize: 14, color: "#6B7280", lineHeight: 1.6 },

  // Steps
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 0,
    position: "relative",
  },
  stepCard: { position: "relative", padding: "0 16px" },
  stepNum: {
    display: "block",
    fontFamily: "'DM Serif Display', serif",
    fontSize: 36,
    color: "#E5E7EB",
    lineHeight: 1,
    marginBottom: 10,
  },
  stepTitle: {
    margin: "0 0 8px",
    fontSize: 15,
    fontWeight: 600,
    color: "#111827",
  },
  stepDesc: { margin: 0, fontSize: 13, color: "#6B7280", lineHeight: 1.6 },
  stepArrow: {
    position: "absolute",
    top: 8,
    right: -12,
    fontSize: 18,
    color: "#D1D5DB",
  },

  // CTA section
  ctaSection: {
    background: "#111827",
    borderRadius: 24,
    padding: "64px",
    margin: "0 64px 64px",
    textAlign: "center",
  },
  ctaTitle: {
    margin: "0 0 12px",
    fontFamily: "'DM Serif Display', serif",
    fontSize: 36,
    fontWeight: 400,
    color: "#fff",
  },
  ctaSub: { margin: "0 0 32px", fontSize: 16, color: "#9CA3AF" },

  // Footer
  footer: {
    borderTop: "1px solid #F3F4F6",
    padding: "28px 64px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  footerBrand: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  footerLogo: { display: "flex", alignItems: "center", gap: 8 },
  footerName: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 16,
    color: "#111827",
  },
  footerCopy: { margin: 0, fontSize: 12, color: "#9CA3AF" },
};
