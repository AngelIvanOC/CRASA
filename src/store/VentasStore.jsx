import { create } from "zustand";
import {
  MostrarVentas,
  InsertarVenta,
  MostrarDetalleVenta,
  EliminarVenta,
  EditarVenta,
  InsertarProductosVenta,
} from "../index";

export const useVentasStore = create((set, get) => ({
  dataVentas: [],
  detalleVenta: [],

  mostrarVentas: async () => {
    const response = await MostrarVentas();
    set({ dataVentas: response });
    return response;
  },

  insertarVenta: async (p) => {
    // Solo inserta la compra básica, sin productos
    const venta = await InsertarVenta(p);
    if (!venta) return null; // fallo al insertar compra

    const { mostrarVentas } = get();
    await mostrarVentas();

    return venta; // Devuelve el ID de la compra insertada
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
    await EliminarVenta(p);
    const { mostrarVentas } = get();
    await mostrarVentas();
  },
}));
