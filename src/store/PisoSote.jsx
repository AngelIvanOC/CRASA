import { create } from "zustand";
import {
  ObtenerPisoPorProducto,
  InsertarPiso,
  EditarPiso,
  EliminarPiso,
} from "../supabase/crudPiso";

export const usePisoStore = create((set) => ({
  dataPiso: [],
  pisoProductoSelect: null,

  setDataPiso: (data) => set({ dataPiso: data }),

  obtenerPisoPorProducto: async (producto_id) => {
    const piso = await ObtenerPisoPorProducto(producto_id);
    set({ dataPiso: piso });
    return piso;
  },

  insertarPiso: async (piso) => {
    const nuevoPiso = await InsertarPiso(piso);
    return nuevoPiso;
  },

  editarPiso: async (piso) => {
    const pisoActualizado = await EditarPiso(piso);
    return pisoActualizado;
  },

  eliminarPiso: async (id) => {
    const resultado = await EliminarPiso(id);
    if (resultado) {
      // Actualizar la lista local eliminando el elemento
      set((state) => ({
        dataPiso: state.dataPiso.filter((item) => item.id !== id),
      }));
    }
    return resultado;
  },

  guardarPiso: async ({ dataForm, accion, productoId, dataSelect }) => {
    const piso = {
      producto_id: dataSelect?.producto_id || parseInt(productoId),
      cantidad: dataForm.cantidad ? parseInt(dataForm.cantidad) : null,
      fecha_caducidad: dataForm.fecha_caducidad || null,
      codigo_barras: dataForm.codigo_barras || null,
    };

    if (accion === "Editar") {
      piso.id = dataSelect.id;
      return await usePisoStore.getState().editarPiso(piso);
    } else {
      return await usePisoStore.getState().insertarPiso(piso);
    }
  },
}));
