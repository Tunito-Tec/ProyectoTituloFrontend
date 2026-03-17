import { useState, useEffect } from "react";
import api from "../../config/axios";
import RUTInput from "../../components/forms/RUTInput";

const ROLES = [
  { value: "cliente", label: "Cliente" },
  { value: "auxiliar", label: "Auxiliar" },
  { value: "notario", label: "Notario" },
  { value: "admin", label: "Administrador" },
];

const ROL_STYLE = {
  admin: { bg: "#FEE2E2", color: "#991B1B" },
  notario: { bg: "#EDE9FE", color: "#5B21B6" },
  auxiliar: { bg: "#DBEAFE", color: "#1E40AF" },
  cliente: { bg: "#F3F4F6", color: "#374151" },
};

const initials = (nombre = "") =>
  nombre
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const AVATAR_COLORS = [
  "#3B82F6",
  "#8B5CF6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
];
const avatarColor = (str = "") =>
  AVATAR_COLORS[str.charCodeAt(0) % AVATAR_COLORS.length];

const EMPTY_FORM = {
  nombre: "",
  email: "",
  rut: "",
  password: "",
  rol: "cliente",
  telefono: "",
  direccion: "",
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [filterRol, setFilterRol] = useState("todos");
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data } = await api.get("/admin/usuarios");
      setUsers(data.data);
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (user = null) => {
    setEditingUser(user);
    setFormData(
      user
        ? {
            nombre: user.nombre,
            email: user.email,
            rut: user.rut,
            password: "",
            rol: user.rol,
            telefono: user.telefono || "",
            direccion: user.direccion || "",
          }
        : EMPTY_FORM,
    );
    setError("");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
    setError("");
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (editingUser) {
        await api.put(`/admin/usuarios/${editingUser._id}`, formData);
        setSuccess("Usuario actualizado exitosamente");
      } else {
        await api.post("/admin/usuarios", formData);
        setSuccess("Usuario creado exitosamente");
      }
      loadUsers();
      closeDialog();
    } catch (err) {
      setError(err.response?.data?.message || "Error al guardar usuario");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await api.delete(`/admin/usuarios/${id}`);
      setSuccess("Usuario eliminado");
      loadUsers();
    } catch {
      setError("Error al eliminar usuario");
    } finally {
      setDeleting(null);
    }
  };

  const set = (key) => (e) =>
    setFormData((f) => ({ ...f, [key]: e.target.value }));

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      u.nombre?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.rut?.toLowerCase().includes(q);
    const matchRol = filterRol === "todos" || u.rol === filterRol;
    return matchSearch && matchRol;
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
            <p style={s.pageLabel}>ADMINISTRACIÓN</p>
            <h1 style={s.pageTitle}>Usuarios</h1>
          </div>
          <button style={s.primaryBtn} onClick={() => openDialog()}>
            + Nuevo usuario
          </button>
        </div>

        {/* Toast */}
        {success && (
          <div style={s.toast}>
            <span>✓ {success}</span>
            <button style={s.toastClose} onClick={() => setSuccess("")}>
              ✕
            </button>
          </div>
        )}

        {/* Filters */}
        <div style={s.filters}>
          <input
            style={s.searchInput}
            placeholder="Buscar por nombre, email o RUT…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={s.rolFilters}>
            {["todos", "cliente", "auxiliar", "notario", "admin"].map((r) => (
              <button
                key={r}
                style={{
                  ...s.filterBtn,
                  ...(filterRol === r ? s.filterBtnActive : {}),
                }}
                onClick={() => setFilterRol(r)}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table card */}
        <div style={s.card}>
          {loading ? (
            <div style={s.loadingWrap}>
              <div style={s.spinner} />
              <p style={s.loadingText}>Cargando usuarios…</p>
            </div>
          ) : filtered.length === 0 ? (
            <p style={s.empty}>No se encontraron usuarios.</p>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Usuario</th>
                  <th style={s.th}>RUT</th>
                  <th style={s.th}>Rol</th>
                  <th style={s.th}>Teléfono</th>
                  <th style={{ ...s.th, textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => {
                  const rs = ROL_STYLE[user.rol] || ROL_STYLE.cliente;
                  return (
                    <tr
                      key={user._id}
                      style={i % 2 !== 0 ? { background: "#F9FAFB" } : {}}
                    >
                      <td style={s.td}>
                        <div style={s.userCell}>
                          <div
                            style={{
                              ...s.avatar,
                              background: avatarColor(user.nombre),
                            }}
                          >
                            {initials(user.nombre)}
                          </div>
                          <div>
                            <p style={s.userName}>{user.nombre}</p>
                            <p style={s.userEmail}>{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td
                        style={{
                          ...s.td,
                          fontFamily: "monospace",
                          fontSize: 13,
                        }}
                      >
                        {user.rut}
                      </td>
                      <td style={s.td}>
                        <span
                          style={{
                            ...s.pill,
                            background: rs.bg,
                            color: rs.color,
                          }}
                        >
                          {user.rol}
                        </span>
                      </td>
                      <td style={{ ...s.td, color: "#6B7280" }}>
                        {user.telefono || "—"}
                      </td>
                      <td style={{ ...s.td, textAlign: "right" }}>
                        <div style={s.rowActions}>
                          <button
                            style={s.rowBtn}
                            onClick={() => openDialog(user)}
                          >
                            Editar
                          </button>
                          <button
                            style={{ ...s.rowBtn, ...s.rowBtnDanger }}
                            onClick={() => handleDelete(user._id)}
                            disabled={deleting === user._id}
                          >
                            {deleting === user._id ? "…" : "Eliminar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Row count */}
          {!loading && (
            <p style={s.rowCount}>
              {filtered.length} de {users.length} usuario
              {users.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {/* Modal */}
      {dialogOpen && (
        <div style={s.overlay} onClick={closeDialog}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>
                {editingUser ? "Editar usuario" : "Nuevo usuario"}
              </h2>
              <button style={s.modalClose} onClick={closeDialog}>
                ✕
              </button>
            </div>

            {error && (
              <div style={s.errorBox}>
                <span>⚠ {error}</span>
              </div>
            )}

            <div style={s.modalBody}>
              <div style={s.formGrid}>
                <Field label="Nombre *">
                  <input
                    style={s.input}
                    value={formData.nombre}
                    onChange={set("nombre")}
                    placeholder="Nombre completo"
                  />
                </Field>
                <Field label="Email *">
                  <input
                    style={s.input}
                    type="email"
                    value={formData.email}
                    onChange={set("email")}
                    placeholder="correo@ejemplo.com"
                  />
                </Field>
                <Field label="RUT *">
                  <RUTInput
                    style={s.input}
                    value={formData.rut}
                    onChange={set("rut")}
                    disabled={!!editingUser}
                    placeholder="12.345.678-9"
                  />
                </Field>
                {!editingUser && (
                  <Field label="Contraseña *">
                    <input
                      style={s.input}
                      type="password"
                      value={formData.password}
                      onChange={set("password")}
                      placeholder="••••••••"
                    />
                  </Field>
                )}
                <Field label="Rol *">
                  <select
                    style={s.select}
                    value={formData.rol}
                    onChange={set("rol")}
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Teléfono">
                  <input
                    style={s.input}
                    value={formData.telefono}
                    onChange={set("telefono")}
                    placeholder="+56 9 1234 5678"
                  />
                </Field>
              </div>
              <Field label="Dirección">
                <textarea
                  style={{ ...s.input, resize: "vertical", minHeight: 64 }}
                  value={formData.direccion}
                  onChange={set("direccion")}
                  placeholder="Dirección completa"
                />
              </Field>
            </div>

            <div style={s.modalFooter}>
              <button style={s.ghostBtn} onClick={closeDialog}>
                Cancelar
              </button>
              <button
                style={s.primaryBtn}
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving
                  ? "Guardando…"
                  : editingUser
                    ? "Actualizar"
                    : "Crear usuario"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
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

  toast: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#ECFDF5",
    border: "1px solid #A7F3D0",
    borderRadius: 10,
    padding: "10px 16px",
    marginBottom: 16,
    fontSize: 14,
    color: "#065F46",
  },
  toastClose: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#065F46",
    fontSize: 14,
  },

  filters: {
    display: "flex",
    gap: 12,
    marginBottom: 16,
    flexWrap: "wrap",
    alignItems: "center",
  },
  searchInput: {
    flex: "1 1 240px",
    padding: "9px 14px",
    fontSize: 14,
    border: "1px solid #E5E7EB",
    borderRadius: 10,
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    background: "#fff",
    color: "#111827",
  },
  rolFilters: { display: "flex", gap: 6, flexWrap: "wrap" },
  filterBtn: {
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: 8,
    padding: "7px 14px",
    fontSize: 13,
    color: "#6B7280",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all .15s",
  },
  filterBtnActive: {
    background: "#111827",
    color: "#fff",
    borderColor: "#111827",
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
    padding: "12px 16px",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    color: "#9CA3AF",
    textTransform: "uppercase",
    textAlign: "left",
    borderBottom: "1px solid #E5E7EB",
    background: "#FAFAFA",
  },
  td: { padding: "12px 16px", color: "#374151", verticalAlign: "middle" },

  userCell: { display: "flex", alignItems: "center", gap: 10 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    color: "#fff",
    fontSize: 12,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  userName: { margin: 0, fontSize: 13, fontWeight: 600, color: "#111827" },
  userEmail: { margin: 0, fontSize: 12, color: "#9CA3AF" },

  pill: {
    padding: "3px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 500,
  },

  rowActions: { display: "flex", gap: 6, justifyContent: "flex-end" },
  rowBtn: {
    background: "none",
    border: "1px solid #E5E7EB",
    borderRadius: 7,
    padding: "5px 12px",
    fontSize: 12,
    color: "#374151",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all .15s",
  },
  rowBtnDanger: { color: "#B91C1C", borderColor: "#FECACA" },

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
  empty: {
    textAlign: "center",
    padding: "48px 0",
    color: "#9CA3AF",
    margin: 0,
  },

  // Modal
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    padding: 16,
  },
  modal: {
    background: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 580,
    maxHeight: "90vh",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'DM Sans', sans-serif",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px 16px",
    borderBottom: "1px solid #F3F4F6",
  },
  modalTitle: {
    margin: 0,
    fontFamily: "'DM Serif Display', serif",
    fontSize: 20,
    fontWeight: 400,
  },
  modalClose: {
    background: "none",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    color: "#9CA3AF",
    lineHeight: 1,
  },
  modalBody: {
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    padding: "16px 24px",
    borderTop: "1px solid #F3F4F6",
  },

  errorBox: {
    margin: "12px 24px 0",
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    color: "#991B1B",
  },

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
  select: {
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
    transition: "opacity .15s",
  },
  ghostBtn: {
    background: "#F9FAFB",
    color: "#374151",
    border: "1px solid #E5E7EB",
    borderRadius: 9,
    padding: "9px 20px",
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
};
