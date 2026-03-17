import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ROLE_LABELS = {
  admin: "Administrador",
  cliente: "Cliente",
  auxiliar: "Auxiliar",
  notario: "Notario",
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.nombre
    ? user.nombre
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap"
        rel="stylesheet"
      />
      <header style={s.bar}>
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

        {/* Right side */}
        <div style={s.right}>
          {/* Notifications */}
          <button style={s.iconBtn} title="Notificaciones">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>

          {/* Divider */}
          <div style={s.divider} />

          {/* User */}
          <div style={s.userArea}>
            <div style={s.userInfo}>
              <span style={s.userName}>{user?.nombre || "Usuario"}</span>
              <span style={s.userRole}>
                {ROLE_LABELS[user?.rol] || user?.rol}
              </span>
            </div>
            <div style={s.avatar}>{initials}</div>
          </div>

          {/* Divider */}
          <div style={s.divider} />

          {/* Logout */}
          <button style={s.logoutBtn} onClick={logout} title="Cerrar sesión">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Salir</span>
          </button>
        </div>
      </header>
    </>
  );
}

const s = {
  bar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    background: "#fff",
    borderBottom: "1px solid #E5E7EB",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    zIndex: 1200,
    fontFamily: "'DM Sans', sans-serif",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    userSelect: "none",
  },
  brandMark: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 18,
    color: "#111827",
    letterSpacing: "-0.01em",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#6B7280",
    padding: "6px 8px",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background .15s, color .15s",
  },
  divider: {
    width: 1,
    height: 24,
    background: "#E5E7EB",
    margin: "0 4px",
  },
  userArea: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "4px 8px",
    borderRadius: 10,
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: 600,
    color: "#111827",
    lineHeight: 1,
  },
  userRole: {
    fontSize: 11,
    color: "#9CA3AF",
    lineHeight: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "#111827",
    color: "#fff",
    fontSize: 12,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logoutBtn: {
    background: "none",
    border: "1px solid #E5E7EB",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 13,
    color: "#6B7280",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontFamily: "'DM Sans', sans-serif",
    transition: "background .15s, color .15s, border-color .15s",
  },
};
