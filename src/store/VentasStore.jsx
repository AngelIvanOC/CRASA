import { create } from "zustand";
import {
  MostrarVentas,
  InsertarVenta,
  MostrarDetalleVenta,
  EliminarVenta,
  EditarVenta,
  InsertarProductosVenta,
  MostrarAyudantesVenta,
  InsertarAyudantesVenta,
  EliminarAyudantesVenta,
} from "../index";
import { supabase } from "../index";

export const useVentasStore = create((set, get) => ({
  dataVentas: [],
  detalleVenta: [],

  mostrarVentas: async () => {
    const response = await MostrarVentas();
    set({ dataVentas: response });
    return response;
  },

  insertarVenta: async (p) => {
    const venta = await InsertarVenta(p);
    if (!venta) return null;

    const { mostrarVentas } = get();

    await mostrarVentas();

    return venta;
  },

  insertarProductosVenta: async (venta_id, productos) => {
    if (!productos || productos.length === 0) return true;

    let success = true;
    for (const producto of productos) {
      const result = await InsertarProductosVenta({
        venta_id,
        producto_id: producto.producto_id,
        cantidad: producto.cantidad,
        fecha_caducidad: producto.fecha_caducidad,
        ubicacion: producto.ubicacion,
      });

      if (!result) {
        console.error("Error insertando producto:", producto);
        success = false;
      }
    }

    return success;
  },

  editarVenta: async (p) => {
    await EditarVenta(p);
    const { mostrarVentas } = get();
    await mostrarVentas();
  },

  mostrarDetalleVenta: async (venta_id) => {
    const response = await MostrarDetalleVenta(venta_id);
    set({ detalleVenta: response });
    return response;
  },

  eliminarVenta: async (p) => {
    try {
      await EliminarAyudantesVenta(p.id);
      await EliminarVenta(p);
      const { mostrarVentas } = get();
      await mostrarVentas();
      return true;
    } catch (error) {
      console.error("Error eliminando venta:", error);
      Swal.fire({
        icon: "error",
        title: "Error al eliminar",
        text: "Hubo un problema al eliminar la venta o sus archivos asociados",
      });
      return false;
    }
  },

  eliminarProductoVenta: async (id) => {
    const { data, error } = await supabase
      .from("detalle_ventas")
      .delete()
      .eq("id", id);

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error al eliminar",
        text: error.message,
      });
      return false;
    }

    const { mostrarDetalleVenta } = get();
    await mostrarDetalleVenta(data[0].venta_id);
    return true;
  },
  mostrarAyudantesVenta: async (venta_id) => {
    const response = await MostrarAyudantesVenta(venta_id);
    set({ ayudantesVenta: response });
    return response;
  },

  asignarEquipoVenta: async (venta_id, responsable_id, ayudantes_ids = []) => {
    try {
      await EditarVenta({
        id: venta_id,
        usuario: responsable_id,
      });

      await EliminarAyudantesVenta(venta_id);

      if (ayudantes_ids.length > 0) {
        await InsertarAyudantesVenta(venta_id, ayudantes_ids);
      }

      const { mostrarVentas, mostrarAyudantesVenta } = get();
      await mostrarVentas();
      await mostrarAyudantesVenta(venta_id);

      return true;
    } catch (error) {
      console.error("Error asignando equipo:", error);
      Swal.fire({
        icon: "error",
        title: "Error al asignar equipo",
        text: error.message,
      });
      return false;
    }
  },
}));
