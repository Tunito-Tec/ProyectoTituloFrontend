import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMsg = location.state?.success;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || "Credenciales incorrectas");
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

      <div style={s.outer}>
        <div style={s.card}>
          {/* Brand */}
          <div style={s.brand}>
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

          <h1 style={s.title}>Bienvenido de vuelta</h1>
          <p style={s.subtitle}>Ingresa con tu correo y contraseña</p>

          {/* Success from register */}
          {successMsg && (
            <div style={{ ...s.alertBox, ...s.alertSuccess }}>{successMsg}</div>
          )}

          {/* Error */}
          {error && (
            <div style={{ ...s.alertBox, ...s.alertError }}>⚠ {error}</div>
          )}

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Correo electrónico</label>
              <input
                style={s.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                required
                autoComplete="email"
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Contraseña</label>
              <input
                style={s.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading ? "Ingresando…" : "Ingresar"}
            </button>
          </form>

          <p style={s.footer}>
            ¿No tienes cuenta?{" "}
            <button style={s.link} onClick={() => navigate("/register")}>
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </>
  );
}

const s = {
  outer: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#F9FAFB",
    padding: 24,
    fontFamily: "'DM Sans', sans-serif",
  },
  card: {
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: 20,
    padding: "40px 40px",
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 4px 24px rgba(0,0,0,.06)",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 28,
  },
  brandMark: { display: "flex", alignItems: "center" },
  brandName: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 18,
    color: "#111827",
  },
  title: {
    margin: "0 0 6px",
    fontFamily: "'DM Serif Display', serif",
    fontSize: 26,
    fontWeight: 400,
    color: "#111827",
  },
  subtitle: {
    margin: "0 0 24px",
    fontSize: 14,
    color: "#9CA3AF",
  },
  alertBox: {
    borderRadius: 9,
    padding: "10px 14px",
    fontSize: 13,
    marginBottom: 16,
  },
  alertError: {
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    color: "#991B1B",
  },
  alertSuccess: {
    background: "#ECFDF5",
    border: "1px solid #A7F3D0",
    color: "#065F46",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: "#374151",
  },
  input: {
    padding: "10px 14px",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    border: "1px solid #E5E7EB",
    borderRadius: 10,
    outline: "none",
    color: "#111827",
    background: "#fff",
    transition: "border-color .15s",
  },
  submitBtn: {
    marginTop: 8,
    padding: "12px",
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "opacity .15s",
  },
  footer: {
    marginTop: 24,
    textAlign: "center",
    fontSize: 14,
    color: "#6B7280",
  },
  link: {
    background: "none",
    border: "none",
    color: "#3B82F6",
    cursor: "pointer",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    padding: 0,
    textDecoration: "underline",
  },
};
