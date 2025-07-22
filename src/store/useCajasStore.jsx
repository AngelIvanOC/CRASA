import { create } from "zustand";
import {
  ObtenerCajasPorProducto,
  InsertarCaja,
  EditarCaja,
} from "../supabase/crudCajas";
import { supabase } from "../supabase/supabase.config";

export const useCajasStore = create((set) => ({
  dataCajas: [],
  cajaProductoSelect: null,

  setDataCajas: (data) => set({ dataCajas: data }),

  obtenerCajasPorProducto: async (producto_id) => {
    const cajas = await ObtenerCajasPorProducto(producto_id);
    set({ dataCajas: cajas });
    return cajas;
  },

  insertarCaja: async (caja) => {
    const nuevaCaja = await InsertarCaja(caja);
    return nuevaCaja;
  },

  editarCaja: async (caja) => {
    const cajaActualizada = await EditarCaja(caja);
    return cajaActualizada;
  },

  guardarCaja: async ({ dataForm, accion, productoId, dataSelect }) => {
    const caja = {
      producto_id: dataSelect?.producto_id || parseInt(productoId),
      cantidad: dataForm.cantidad ? parseInt(dataForm.cantidad) : null,
      fecha_caducidad: dataForm.fecha_caducidad || null,
      rack_id: dataForm.rack_id ? parseInt(dataForm.rack_id) : null,
      codigo_barras: dataForm.codigo_barras || null,
    };

    // Marcar rack como ocupado si se seleccionó uno
    if (dataForm.rack_id) {
      await supabase
        .from("racks")
        .update({ ocupado: true })
        .eq("id", dataForm.rack_id);

      // También actualizar el producto si es nuevo
      if (accion !== "Editar") {
        await supabase
          .from("productos")
          .update({ rack_id: parseInt(dataForm.rack_id) })
          .eq("id", caja.producto_id);
      }
    }

    if (accion === "Editar") {
      caja.id = dataSelect.id;
      return await useCajasStore.getState().editarCaja(caja);
    } else {
      return await useCajasStore.getState().insertarCaja(caja);
    }
  },
}));
