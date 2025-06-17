import { create } from "zustand";
import { supabase, MostrarUsuarios } from "../index";
import Swal from "sweetalert2";

export const useAuthStore = create((set) => ({
  loading: false,

  loginGoogle: async () => {
    try {
      set({ loading: true });
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });

      if (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message,
        });
      }
      // La redirección la maneja AuthContext automáticamente
    } catch (error) {
      console.error("Error en login Google:", error);
    } finally {
      set({ loading: false });
    }
  },

  loginDirecto: async (email, password) => {
    try {
      set({ loading: true });

      // Validar que los campos no estén vacíos
      if (!email || !password) {
        Swal.fire({
          icon: "warning",
          title: "Campos requeridos",
          text: "Por favor ingresa email y contraseña",
        });
        return false;
      }

      // Intentar login con Supabase Auth
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

      // Si el login es exitoso, verificar si el usuario existe en la tabla usuarios
      if (data.user) {
        const usuario = await MostrarUsuarios({ id_auth: data.user.id });

        if (!usuario) {
          // Si no existe en la tabla usuarios, puedes crear un registro o mostrar error
          Swal.fire({
            icon: "warning",
            title: "Usuario no encontrado",
            text: "El usuario no está registrado en el sistema",
          });
          await supabase.auth.signOut(); // Cerrar sesión si no está en la tabla
          return false;
        }

        Swal.fire({
          icon: "success",
          title: "¡Bienvenido!",
          text: "Has iniciado sesión correctamente",
          timer: 1500,
          showConfirmButton: false,
        });

        // La redirección la maneja AuthContext automáticamente
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

  cerrarSesion: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error al cerrar sesión:", error);
      }
      // La redirección al login la maneja AuthContext automáticamente
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  },
}));
