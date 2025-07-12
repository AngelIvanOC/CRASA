import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase, MostrarUsuarios } from "../index";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
      setLoadingSession(false); // <- ya está lista la sesión
    };

    checkSession();
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

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
    <AuthContext.Provider value={{ user, loadingSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};
