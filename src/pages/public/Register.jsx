import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../config/axios";

const cleanRUT = (rut) => {
  if (!rut) return "";
  return rut.replace(/\./g, "").toUpperCase();
};

const formatRUT = (value) => {
  if (!value) return "";
  let rut = value.replace(/[^0-9kK]/g, "");
  if (rut.length <= 1) return rut;
  const cuerpo = rut.slice(0, -1);
  const dv = rut.slice(-1).toUpperCase();
  const fmt = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${fmt}-${dv}`;
};

const EMPTY = {
  nombre: "",
  email: "",
  rut: "",
  password: "",
  confirmPassword: "",
};

export default function Register() {
  const [formData, setFormData] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (key) => (e) =>
    setFormData((f) => ({ ...f, [key]: e.target.value }));

  const handleRUTChange = (e) => {
    setFormData((f) => ({ ...f, rut: formatRUT(e.target.value) }));
  };

  const validateForm = () => {
    const e = {};
    if (!formData.nombre.trim()) e.nombre = "El nombre es obligatorio";
    if (!formData.email) e.email = "El email es obligatorio";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Email no válido";
    if (!formData.rut) e.rut = "El RUT es obligatorio";
    else if (!/^[0-9]{7,8}-[0-9kK]{1}$/.test(cleanRUT(formData.rut)))
      e.rut = "Formato inválido (ej: 20.407.752-5)";
    if (!formData.password) e.password = "La contraseña es obligatoria";
    else if (formData.password.length < 6) e.password = "Mínimo 6 caracteres";
    if (formData.password !== formData.confirmPassword)
      e.confirmPassword = "Las contraseñas no coinciden";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setApiError("");
    try {
      await api.post("/auth/register", {
        nombre: formData.nombre.trim(),
        email: formData.email.toLowerCase().trim(),
        rut: cleanRUT(formData.rut),
        password: formData.password,
      });
      navigate("/login", {
        state: { success: "Registro exitoso. Por favor inicia sesión." },
      });
    } catch (err) {
      setApiError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Error al registrarse. Intenta nuevamente.",
      );
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

          <h1 style={s.title}>Crea tu cuenta</h1>
          <p style={s.subtitle}>
            Completa los datos para registrarte como cliente
          </p>

          {apiError && (
            <div style={{ ...s.alertBox, ...s.alertError }}>⚠ {apiError}</div>
          )}

          <form onSubmit={handleSubmit} style={s.form}>
            <Field label="Nombre completo *" error={errors.nombre}>
              <input
                style={{ ...s.input, ...(errors.nombre ? s.inputError : {}) }}
                value={formData.nombre}
                onChange={set("nombre")}
                placeholder="Tu nombre completo"
              />
            </Field>

            <Field label="Correo electrónico *" error={errors.email}>
              <input
                style={{ ...s.input, ...(errors.email ? s.inputError : {}) }}
                type="email"
                value={formData.email}
                onChange={set("email")}
                placeholder="correo@ejemplo.com"
              />
            </Field>

            <Field label="RUT *" error={errors.rut} hint="Ej: 20.407.752-5">
              <input
                style={{ ...s.input, ...(errors.rut ? s.inputError : {}) }}
                value={formData.rut}
                onChange={handleRUTChange}
                placeholder="20.407.752-5"
              />
            </Field>

            <div style={s.twoCol}>
              <Field label="Contraseña *" error={errors.password}>
                <input
                  style={{
                    ...s.input,
                    ...(errors.password ? s.inputError : {}),
                  }}
                  type="password"
                  value={formData.password}
                  onChange={set("password")}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </Field>
              <Field
                label="Confirmar contraseña *"
                error={errors.confirmPassword}
              >
                <input
                  style={{
                    ...s.input,
                    ...(errors.confirmPassword ? s.inputError : {}),
                  }}
                  type="password"
                  value={formData.confirmPassword}
                  onChange={set("confirmPassword")}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </Field>
            </div>

            {/* Password strength */}
            {formData.password && (
              <PasswordStrength password={formData.password} />
            )}

            <button
              type="submit"
              style={{
                ...s.submitBtn,
                opacity: loading ? 0.7 : 1,
                marginTop: 4,
              }}
              disabled={loading}
            >
              {loading ? "Creando cuenta…" : "Crear cuenta"}
            </button>
          </form>

          <p style={s.footer}>
            ¿Ya tienes cuenta?{" "}
            <button style={s.link} onClick={() => navigate("/login")}>
              Inicia sesión
            </button>
          </p>
        </div>
      </div>
    </>
  );
}

function Field({ label, children, error, hint }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={s.label}>{label}</label>
      {children}
      {error && <span style={s.errorText}>{error}</span>}
      {!error && hint && <span style={s.hintText}>{hint}</span>}
    </div>
  );
}

function PasswordStrength({ password }) {
  const checks = [
    password.length >= 6,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const colors = ["#EF4444", "#F59E0B", "#3B82F6", "#10B981"];
  const labels = ["Muy débil", "Débil", "Buena", "Fuerte"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "flex", gap: 4 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: i < score ? colors[score - 1] : "#E5E7EB",
              transition: "background .3s",
            }}
          />
        ))}
      </div>
      {score > 0 && (
        <span style={{ fontSize: 11, color: colors[score - 1] }}>
          {labels[score - 1]}
        </span>
      )}
    </div>
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
    maxWidth: 480,
    boxShadow: "0 4px 24px rgba(0,0,0,.06)",
  },
  brand: { display: "flex", alignItems: "center", gap: 10, marginBottom: 28 },
  brandMark: { display: "flex" },
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
  subtitle: { margin: "0 0 24px", fontSize: 14, color: "#9CA3AF" },

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

  form: { display: "flex", flexDirection: "column", gap: 14 },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  label: { fontSize: 13, fontWeight: 500, color: "#374151" },
  input: {
    padding: "10px 14px",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    border: "1px solid #E5E7EB",
    borderRadius: 10,
    outline: "none",
    color: "#111827",
    background: "#fff",
    width: "100%",
    boxSizing: "border-box",
  },
  inputError: { borderColor: "#FECACA" },
  errorText: { fontSize: 12, color: "#EF4444" },
  hintText: { fontSize: 12, color: "#9CA3AF" },

  submitBtn: {
    padding: "12px",
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
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
