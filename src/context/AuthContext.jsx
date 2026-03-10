import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../config/axios";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔍 AuthProvider - useEffect ejecutándose");
    const token = localStorage.getItem("token");
    console.log("🔑 Token encontrado:", token ? "Sí" : "No");

    if (token) {
      api
        .get("/auth/profile")
        .then(({ data }) => {
          console.log("✅ Perfil cargado:", data);
          setUser(data);
        })
        .catch((error) => {
          console.error("❌ Error al cargar perfil:", error);
          localStorage.removeItem("token");
        })
        .finally(() => {
          console.log("🏁 Finalizando carga");
          setLoading(false);
        });
    } else {
      console.log("🏁 No hay token, finalizando carga");
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    console.log("🔑 Intentando login con:", email);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      console.log("✅ Login exitoso, data recibida:", data);

      localStorage.setItem("token", data.token);
      setUser(data);

      // Redirigir según rol
      const rutas = {
        cliente: "/cliente/dashboard",
        auxiliar: "/auxiliar/dashboard",
        notario: "/notario/dashboard",
        admin: "/admin/dashboard",
      };

      const rutaDestino = rutas[data.rol];
      console.log("🚀 Redirigiendo a:", rutaDestino);
      navigate(rutaDestino);
    } catch (error) {
      console.error("❌ Error en login:", error);
      throw error;
    }
  };

  const logout = () => {
    console.log("👋 Cerrando sesión");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  console.log("🔄 AuthProvider renderizando, loading:", loading, "user:", user);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
