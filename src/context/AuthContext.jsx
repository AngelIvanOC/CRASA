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
      setLoadingSession(false);
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
