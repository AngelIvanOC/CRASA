import { create } from "zustand";
import {
  EditarUsuario,
  MostrarUsuarios,
  ObtenerIdAuthSupabase,
} from "../index";

export const useUsuariosStore = create((set, get) => ({
  dataUsuarios: [],
  mostrarusuarios: async () => {
    const idauth = await ObtenerIdAuthSupabase();
    const response = await MostrarUsuarios({ id_auth: idauth });
    set({ dataUsuarios: response });
    return response;
  },
  editarUsuario: async (p) => {
    await EditarUsuario(p);
    const { mostrarusuarios } = get();
    await mostrarusuarios();
  },
}));
