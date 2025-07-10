import { create } from "zustand";
import { ObtenerCajasPorProducto } from "../supabase/crudCajas";

export const useCajasStore = create((set) => ({
  dataCajas: [],
  cajaProductoSelect: null,

  setDataCajas: (data) => set({ dataCajas: data }),

  obtenerCajasPorProducto: async (producto_id) => {
    const cajas = await ObtenerCajasPorProducto(producto_id);
    set({ dataCajas: cajas });
    return cajas;
  },
}));
