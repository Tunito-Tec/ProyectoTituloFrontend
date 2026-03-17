import { Outlet, useLocation, useNavigate } from "react-router-dom";

export default function PublicLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = location.pathname === "/";

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap"
        rel="stylesheet"
      />

      {/* Navbar */}
      <header style={s.bar}>
        <div style={s.inner}>
          {/* Brand */}
          <div
            style={s.brand}
            onClick={() => navigate("/")}
            role="button"
            tabIndex={0}
          >
            <div style={s.brandMark}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
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
            </div>
            <span style={s.brandName}>SINotarial</span>
          </div>

          {/* Nav links */}
          <nav style={s.nav}>
            <button
              style={{
                ...s.navLink,
                ...(location.pathname === "/login" ? s.navLinkActive : {}),
              }}
              onClick={() => navigate("/login")}
            >
              Iniciar sesión
            </button>
            <button
              style={{
                ...s.navCta,
                ...(location.pathname === "/register" ? s.navCtaActive : {}),
              }}
              onClick={() => navigate("/register")}
            >
              Registrarse
            </button>
          </nav>
        </div>
      </header>

      {/* Page content — no padding on landing, normal padding on auth pages */}
      <main style={isLanding ? s.mainLanding : s.mainAuth}>
        <Outlet />
      </main>
    </>
  );
}

const s = {
  bar: {
    position: "sticky",
    top: 0,
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderBottom: "1px solid #E5E7EB",
    zIndex: 100,
    fontFamily: "'DM Sans', sans-serif",
  },
  inner: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 40px",
    height: 56,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    userSelect: "none",
  },
  brandMark: { display: "flex", alignItems: "center" },
  brandName: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 18,
    color: "#111827",
    letterSpacing: "-0.01em",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  navLink: {
    background: "none",
    border: "none",
    borderRadius: 9,
    padding: "7px 14px",
    fontSize: 14,
    color: "#6B7280",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "color .15s, background .15s",
  },
  navLinkActive: {
    color: "#111827",
    background: "#F3F4F6",
  },
  navCta: {
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: 9,
    padding: "7px 16px",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "opacity .15s",
  },
  navCtaActive: {
    opacity: 0.85,
  },
  mainLanding: {
    fontFamily: "'DM Sans', sans-serif",
  },
  mainAuth: {
    fontFamily: "'DM Sans', sans-serif",
    minHeight: "calc(100vh - 56px)",
    background: "#F9FAFB",
  },
};
