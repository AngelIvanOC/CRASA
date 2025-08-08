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

    if (tipoRegistro === "caja") {
      registro.rack_id = dataForm.rack_id ? parseInt(dataForm.rack_id) : null;

      if (dataForm.rack_id) {
        await supabase
          .from("racks")
          .update({ ocupado: true })
          .eq("id", dataForm.rack_id);

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
