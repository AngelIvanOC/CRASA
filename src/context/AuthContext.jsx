import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase, MostrarUsuarios } from "../index";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session == null) {
        setUser(null);
        // Si no hay sesión y no estamos en login, redirigir
        if (location.pathname !== "/login") {
          navigate("/login");
        }
      } else {
        setUser(session?.user);
        console.log("session", session.user.id);
        await insertarDatos(session?.user.id, session?.user.email);

        // AQUÍ ESTÁ LA CLAVE: Redirigir después de login exitoso
        // Solo redirigir si estamos en la página de login
        if (location.pathname === "/login") {
          navigate("/dashboard"); // o la ruta principal que quieras
          // Puedes cambiar "/" por "/dashboard" o la ruta que prefieras
        }
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  const insertarDatos = async (id_auth, correo) => {
    try {
      const response = await MostrarUsuarios({ id_auth: id_auth });
      if (response) {
        return;
      } else {
        /*const responseEmpresa = await InsertarEmpresa({
          id_auth: id_auth,
        });
        const responseTipoDoc = await MostrarTipoDocumentos({
          id_empresa: responseEmpresa?.id,
        });
        console.log(responseTipoDoc);
        const responseRol = await MostrarRolesXnombre({ nombre: "superadmin" });
        const pUser = {
          id_tipodocumento: responseTipoDoc[0]?.id,
          id_rol: responseRol?.id,
          correo: correo,
          fecharegistro: new Date(),
          id_auth: id_auth,
        };
        await InsertarAdmin(pUser);*/
      }
    } catch (error) {
      console.error("Error al insertar datos:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};
