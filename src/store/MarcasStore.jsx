import { create } from "zustand";
import { MostrarMarcas } from "../supabase/crudMarcas";

export const useMarcasStore = create((set, get) => ({
  dataMarcas: [],
  marcaItemSelect: [],

  mostrarMarcas: async () => {
    const response = await MostrarMarcas();
    set({ dataMarcas: response });
    set({ marcaItemSelect: response[0] });
    return response;
  },
}));
