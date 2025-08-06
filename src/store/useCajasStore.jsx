// useCajasStore.js - Store actualizado

import { create } from "zustand";
import {
  ObtenerCajasPorProducto,
  InsertarCaja,
  InsertarSuelto,
  InsertarPiso,
  EditarCaja,
  EditarSuelto,
  EditarPiso,
} from "../supabase/crudCajas";
import { supabase } from "../supabase/supabase.config";

export const useCajasStore = create((set) => ({
  dataCajas: [],
  cajaProductoSelect: null,

  setDataCajas: (data) => set({ dataCajas: data }),

  obtenerCajasPorProducto: async (producto_id) => {
    const registros = await ObtenerCajasPorProducto(producto_id);
    set({ dataCajas: registros });
    return registros;
  },

  insertarCaja: async (caja) => {
    const nuevaCaja = await InsertarCaja(caja);
    return nuevaCaja;
  },

  insertarSuelto: async (suelto) => {
    const nuevoSuelto = await InsertarSuelto(suelto);
    return nuevoSuelto;
  },

  insertarPiso: async (piso) => {
    const nuevoPiso = await InsertarPiso(piso);
    return nuevoPiso;
  },

  editarCaja: async (caja) => {
    const cajaActualizada = await EditarCaja(caja);
    return cajaActualizada;
  },

  editarSuelto: async (suelto) => {
    const sueltoActualizado = await EditarSuelto(suelto);
    return sueltoActualizado;
  },

  editarPiso: async (piso) => {
    const pisoActualizado = await EditarPiso(piso);
    return pisoActualizado;
  },

  guardarRegistro: async ({
    dataForm,
    accion,
    productoId,
    dataSelect,
    tipoRegistro,
  }) => {
    const registro = {
      producto_id: dataSelect?.producto_id || parseInt(productoId),
      cantidad: dataForm.cantidad ? parseInt(dataForm.cantidad) : null,
      fecha_caducidad: dataForm.fecha_caducidad || null,
      codigo_barras: dataForm.codigo_barras || null,
    };

    // Solo para cajas agregamos rack_id
    if (tipoRegistro === "caja") {
      registro.rack_id = dataForm.rack_id ? parseInt(dataForm.rack_id) : null;

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
            .eq("id", registro.producto_id);
        }
      }
    }

    if (accion === "Editar") {
      registro.id = dataSelect.id;

      // Determinar qué función usar según el tipo de registro
      switch (dataSelect.tipo || tipoRegistro) {
        case "caja":
          return await useCajasStore.getState().editarCaja(registro);
        case "suelto":
          return await useCajasStore.getState().editarSuelto(registro);
        case "piso":
          return await useCajasStore.getState().editarPiso(registro);
        default:
          throw new Error("Tipo de registro no válido");
      }
    } else {
      // Insertar nuevo registro según el tipo
      switch (tipoRegistro) {
        case "caja":
          return await useCajasStore.getState().insertarCaja(registro);
        case "suelto":
          return await useCajasStore.getState().insertarSuelto(registro);
        case "piso":
          return await useCajasStore.getState().insertarPiso(registro);
        default:
          throw new Error("Tipo de registro no válido");
      }
    }
  },
}));
