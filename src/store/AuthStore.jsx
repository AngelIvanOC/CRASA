import { create } from "zustand";
import { supabase, MostrarUsuarios, MostrarUsuarioConRol } from "../index";
import Swal from "sweetalert2";

export const useAuthStore = create((set, get) => ({
  loading: false,
  dataCuenta: null,

  loginDirecto: async (email, password) => {
    try {
      set({ loading: true });

      if (!email || !password) {
        Swal.fire({
          icon: "warning",
          title: "Campos requeridos",
          text: "Por favor ingresa email y contraseña",
        });
        return false;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        Swal.fire({
          icon: "error",
          title: "Error de autenticación",
          text: "Email o contraseña incorrectos",
        });
        return false;
      }

      if (data.user) {
        const usuario = await MostrarUsuarios({ id_auth: data.user.id });

        if (!usuario) {
          Swal.fire({
            icon: "warning",
            title: "Usuario no encontrado",
            text: "El usuario no está registrado en el sistema",
          });
          await supabase.auth.signOut();
          return false;
        }

        set({ dataCuenta: usuario });
        return true;
      }
    } catch (error) {
      console.error("Error en login directo:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error inesperado",
      });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  obtenerDatosCuenta: async () => {
    try {
      set({ loading: true });
      console.log("🔍 Obteniendo datos de cuenta...");

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      console.log("👤 Usuario de Auth:", user);
      console.log("❌ Error de Auth:", error);

      if (error || !user) {
        console.error("Error al obtener usuario:", error);
        return;
      }

      console.log("🔎 Buscando usuario con id_auth:", user.id);
      const usuario = await MostrarUsuarios({ id_auth: user.id });
      console.log("📋 Datos del usuario encontrado:", usuario);

      if (usuario) {
        set({ dataCuenta: usuario });
        console.log("✅ dataCuenta actualizado en el store");
      } else {
        console.log("❌ No se encontró usuario en la tabla");
      }
    } catch (error) {
      console.error("Error al obtener datos de cuenta:", error);
    } finally {
      set({ loading: false });
    }
  },

  cerrarSesion: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error al cerrar sesión:", error);
      }
      set({ dataCuenta: null });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  },
}));
