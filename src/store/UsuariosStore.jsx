import { create } from "zustand";
import {
  EditarUsuario,
  MostrarUsuarios,
  MostrarTodosUsuarios,
  InsertarUsuario,
  EliminarUsuario,
  ObtenerIdAuthSupabase,
  CrearUsuarioCompleto
} from "../index";

export const useUsuariosStore = create((set, get) => ({
  dataUsuarios: [],
  dataTodosUsuarios: [],
  loading: false,

  // Mostrar usuario actual (perfil)
  mostrarusuarios: async () => {
    const idauth = await ObtenerIdAuthSupabase();
    const response = await MostrarUsuarios({ id_auth: idauth });
    set({ dataUsuarios: response });
    return response;
  },

  // Mostrar todos los usuarios (para la tabla)
  mostrarTodosUsuarios: async () => {
    const currentState = get();

    // Si ya hay datos y no han pasado 5 minutos, no volver a cargar
    if (currentState.dataTodosUsuarios?.length > 0) {
      return currentState.dataTodosUsuarios;
    }

    set({ loading: true });
    try {
      const response = await MostrarTodosUsuarios();
      set({ dataTodosUsuarios: response || [], loading: false });
      return response;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  crearUsuarioCompleto: async (p) => {
    const usuario = await CrearUsuarioCompleto(p);
    if (!usuario) return null;

    // Refetch para obtener datos completos
    setTimeout(() => {
      get().forceRefresh();
    }, 100);

    return usuario;
  },

  insertarUsuario: async (p) => {
    const usuario = await InsertarUsuario(p);
    if (!usuario) return null;

    // Actualizar datos optimistamente
    const { dataTodosUsuarios } = get();
    const usuarioCompleto = { ...p, id: usuario };
    set({
      dataTodosUsuarios: [usuarioCompleto, ...dataTodosUsuarios],
    });

    // Refetch para obtener datos completos del servidor
    setTimeout(() => {
      get().mostrarTodosUsuarios();
    }, 100);

    return usuario;
  },

  editarUsuario: async (p) => {
    await EditarUsuario(p);

    // Actualizar datos optimistamente
    await get().forceRefresh();

    if (p.id_auth) {
      await get().mostrarusuarios();
    }

    return true;
  },

  eliminarUsuario: async (p) => {
    await EliminarUsuario(p);

    // Remover optimistamente
    const { dataTodosUsuarios } = get();
    const filteredData = dataTodosUsuarios.filter((user) => user.id !== p.id);
    set({ dataTodosUsuarios: filteredData });
  },

  // Función para forzar actualización si es necesario
  forceRefresh: async () => {
    set({ dataTodosUsuarios: [], loading: true });
    try {
      const response = await MostrarTodosUsuarios();
      set({ dataTodosUsuarios: response || [], loading: false });
      return response;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // En useUsuariosStore, agregar:
  enviarInvitacion: async (id) => {
    const { dataTodosUsuarios } = get();
    const usuario = dataTodosUsuarios.find((u) => u.id === id);

    if (usuario && usuario.correo) {
      return await EnviarInvitacion(usuario);
    }
    return false;
  },
}));
