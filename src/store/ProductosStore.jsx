import { create } from "zustand";
import {
  BuscarProductos,
  EditarProductos,
  EliminarProductos,
  InsertarProductos,
  MostrarProductos,
} from "../index";

export const useProductosStore = create((set, get) => ({
  buscador: "",
  setBuscador: (p) => {
    set({ buscador: p });
  },
  dataProductos: [],
  productoItemSelect: [],

  mostrarProductos: async () => {
    const response = await MostrarProductos();
    set({ dataProductos: response });
    set({ productoItemSelect: response[0] });
    return response;
  },

  selectProducto: (p) => {
    set({ productoItemSelect: p });
  },

  insertarProductos: async (p) => {
    await InsertarProductos(p);
    const { mostrarProductos } = get();
    await mostrarProductos();
  },

  eliminarProducto: async (p) => {
    await EliminarProductos(p);
    const { mostrarProductos } = get();
    await mostrarProductos();
  },

  editarProducto: async (p) => {
    await EditarProductos(p);
    const { mostrarProductos } = get();
    await mostrarProductos();
  },

  buscarProductos: async (p) => {
    const response = await BuscarProductos(p);
    set({ dataProductos: response });
    return response;
  },
}));
