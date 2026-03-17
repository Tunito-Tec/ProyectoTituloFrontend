import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../config/axios";
import RUTInput from "../../components/forms/RUTInput";

const ROL_LABELS = {
  admin: "Administrador",
  cliente: "Cliente",
  auxiliar: "Auxiliar",
  notario: "Notario",
};

const AVATAR_COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"];
const avatarColor = (str = "") =>
  AVATAR_COLORS[(str?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const initials = (nombre = "") =>
  nombre
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function Profile() {
  const { user, login } = useAuth();

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    rut: "",
    telefono: "",
    direccion: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null); // { type: 'success'|'error', text }
  const [passwordMsg, setPasswordMsg] = useState(null);

  useEffect(() => {
    if (user)
      setFormData({
        nombre: user.nombre || "",
        email: user.email || "",
        rut: user.rut || "",
        telefono: user.telefono || "",
        direccion: user.direccion || "",
      });
  }, [user]);

  const setF = (key) => (e) =>
    setFormData((f) => ({ ...f, [key]: e.target.value }));
  const setP = (key) => (e) =>
    setPasswordData((f) => ({ ...f, [key]: e.target.value }));

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const { data } = await api.put(`/admin/usuarios/${user._id}`, formData);
      setProfileMsg({
        type: "success",
        text: "Perfil actualizado exitosamente",
      });
      login(data.data.email, "");
    } catch (err) {
      setProfileMsg({
        type: "error",
        text: err.response?.data?.message || "Error al actualizar perfil",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMsg({ type: "error", text: "Las contraseñas no coinciden" });
      return;
    }
    setPasswordLoading(true);
    setPasswordMsg(null);
    try {
      await api.put("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordMsg({
        type: "success",
        text: "Contraseña actualizada exitosamente",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setPasswordMsg({
        type: "error",
        text: err.response?.data?.message || "Error al actualizar contraseña",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const color = avatarColor(user?.nombre);

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
            <p style={s.pageLabel}>CUENTA</p>
            <h1 style={s.pageTitle}>Mi perfil</h1>
          </div>
        </div>

        {/* Identity card */}
        <div style={s.identityCard}>
          <div style={{ ...s.avatarLg, background: color }}>
            {initials(user?.nombre)}
          </div>
          <div>
            <p style={s.identityName}>{user?.nombre}</p>
            <p style={s.identityEmail}>{user?.email}</p>
          </div>
          <span style={s.rolBadge}>{ROL_LABELS[user?.rol] || user?.rol}</span>
        </div>

        {/* Two-column layout */}
        <div style={s.grid}>
          {/* Profile form */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>Información personal</h2>

            <Msg msg={profileMsg} />

            <form onSubmit={handleProfileUpdate} style={s.form}>
              <Field label="Nombre completo *">
                <input
                  style={s.input}
                  value={formData.nombre}
                  onChange={setF("nombre")}
                  placeholder="Tu nombre"
                  required
                />
              </Field>
              <Field label="Email *">
                <input
                  style={s.input}
                  type="email"
                  value={formData.email}
                  onChange={setF("email")}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </Field>
              <Field label="RUT">
                <RUTInput
                  style={{ ...s.input, ...s.inputDisabled }}
                  value={formData.rut}
                  onChange={setF("rut")}
                  disabled
                />
              </Field>
              <Field label="Teléfono">
                <input
                  style={s.input}
                  value={formData.telefono}
                  onChange={setF("telefono")}
                  placeholder="+56 9 1234 5678"
                />
              </Field>
              <Field label="Dirección" fullWidth>
                <textarea
                  style={{ ...s.input, resize: "vertical", minHeight: 72 }}
                  value={formData.direccion}
                  onChange={setF("direccion")}
                  placeholder="Dirección completa"
                />
              </Field>
              <div
                style={{
                  gridColumn: "1 / -1",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="submit"
                  style={{ ...s.primaryBtn, opacity: profileLoading ? 0.7 : 1 }}
                  disabled={profileLoading}
                >
                  {profileLoading ? "Guardando…" : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>

          {/* Password form */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>Cambiar contraseña</h2>
            <p style={s.cardHint}>
              Usa una contraseña segura de al menos 8 caracteres.
            </p>

            <Msg msg={passwordMsg} />

            <form
              onSubmit={handlePasswordUpdate}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <Field label="Contraseña actual *">
                <input
                  style={s.input}
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={setP("currentPassword")}
                  placeholder="••••••••"
                  required
                />
              </Field>
              <Field label="Nueva contraseña *">
                <input
                  style={s.input}
                  type="password"
                  value={passwordData.newPassword}
                  onChange={setP("newPassword")}
                  placeholder="••••••••"
                  required
                />
              </Field>
              <Field label="Confirmar nueva contraseña *">
                <input
                  style={s.input}
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={setP("confirmPassword")}
                  placeholder="••••••••"
                  required
                />
              </Field>

              {/* Password strength hint */}
              {passwordData.newPassword && (
                <PasswordStrength password={passwordData.newPassword} />
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 4,
                }}
              >
                <button
                  type="submit"
                  style={{
                    ...s.primaryBtn,
                    opacity: passwordLoading ? 0.7 : 1,
                  }}
                  disabled={passwordLoading}
                >
                  {passwordLoading ? "Actualizando…" : "Cambiar contraseña"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Sub-components ──────────────────────────────────────────

function Field({ label, children, fullWidth }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 5,
        gridColumn: fullWidth ? "1 / -1" : undefined,
      }}
    >
      <label
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#6B7280",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function Msg({ msg }) {
  if (!msg) return null;
  const isSuccess = msg.type === "success";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: isSuccess ? "#ECFDF5" : "#FEF2F2",
        border: `1px solid ${isSuccess ? "#A7F3D0" : "#FECACA"}`,
        color: isSuccess ? "#065F46" : "#991B1B",
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 13,
        marginBottom: 16,
      }}
    >
      {isSuccess ? "✓" : "⚠"} {msg.text}
    </div>
  );
}

function PasswordStrength({ password }) {
  const strength = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = strength.filter(Boolean).length;
  const colors = ["#EF4444", "#F59E0B", "#3B82F6", "#10B981"];
  const labels = ["Muy débil", "Débil", "Buena", "Fuerte"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
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
      <span
        style={{
          fontSize: 11,
          color: score > 0 ? colors[score - 1] : "#9CA3AF",
        }}
      >
        {score > 0 ? labels[score - 1] : ""}
      </span>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────
const s = {
  page: { fontFamily: "'DM Sans', sans-serif", color: "#111827" },
  pageHeader: { marginBottom: 20 },
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

  identityCard: {
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: 14,
    padding: "20px 24px",
    marginBottom: 24,
    display: "flex",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
    boxShadow: "0 1px 4px rgba(0,0,0,.04)",
  },
  avatarLg: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    color: "#fff",
    fontSize: 18,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  identityName: {
    margin: "0 0 3px",
    fontSize: 16,
    fontWeight: 600,
    color: "#111827",
  },
  identityEmail: { margin: 0, fontSize: 13, color: "#9CA3AF" },
  rolBadge: {
    marginLeft: "auto",
    background: "#F3F4F6",
    color: "#374151",
    padding: "5px 14px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 500,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    alignItems: "start",
  },

  card: {
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: 14,
    padding: "24px",
    boxShadow: "0 1px 4px rgba(0,0,0,.04)",
  },
  cardTitle: {
    margin: "0 0 4px",
    fontSize: 15,
    fontWeight: 600,
    color: "#111827",
    paddingBottom: 12,
    borderBottom: "1px solid #F3F4F6",
    marginBottom: 16,
  },
  cardHint: { margin: "-8px 0 16px", fontSize: 13, color: "#9CA3AF" },

  form: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "9px 12px",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    border: "1px solid #E5E7EB",
    borderRadius: 9,
    outline: "none",
    color: "#111827",
    background: "#fff",
  },
  inputDisabled: {
    background: "#F9FAFB",
    color: "#9CA3AF",
    cursor: "not-allowed",
  },

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
