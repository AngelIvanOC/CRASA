import { create } from "zustand";
import {
  MostrarCompras,
  InsertarCompra,
  MostrarDetalleCompra,
  EliminarCompra,
  EditarCompra,
  InsertarProductosCompra,
} from "../index";

export const useComprasStore = create((set, get) => ({
  dataCompras: [],
  detalleCompra: [],

  mostrarCompras: async () => {
    const response = await MostrarCompras();
    set({ dataCompras: response });
    return response;
  },

  insertarCompra: async (p) => {
    // Solo inserta la compra básica, sin productos
    const compra = await InsertarCompra(p);
    if (!compra) return null; // fallo al insertar compra

    const { mostrarCompras } = get();
    await mostrarCompras();

    return compra; // Devuelve el ID de la compra insertada
  },

  insertarProductosCompra: async (compra_id, productos) => {
    if (!productos || productos.length === 0) return true;

    let success = true;
    for (const producto of productos) {
      const result = await InsertarProductosCompra({
        compra_id,
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

  editarCompra: async (p) => {
    await EditarCompra(p);
    const { mostrarCompras } = get();
    await mostrarCompras();
  },

  mostrarDetalleCompra: async (compra_id) => {
    const response = await MostrarDetalleCompra(compra_id);
    set({ detalleCompra: response });
    return response;
  },

  eliminarCompra: async (p) => {
    await EliminarCompra(p);
    const { mostrarCompras } = get();
    await mostrarCompras();
  },
}));
