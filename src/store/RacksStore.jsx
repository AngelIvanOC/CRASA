import { create } from "zustand";
import {
  BuscarRacks,
  EditarRack,
  EliminarRack,
  InsertarRack,
  MostrarRacks,
} from "../index";

export const useRacksStore = create((set, get) => ({
  buscador: "",
  setBuscador: (p) => {
    set({ buscador: p });
  },
  dataRacks: [],
  productoItemSelect: [],

  mostrarRacks: async () => {
    const response = await MostrarRacks();
    set({ dataRacks: response });
    set({ productoItemSelect: response[0] });
    return response;
  },

  selectRack: (p) => {
    set({ productoItemSelect: p });
  },

  insertarRack: async (p) => {
    await InsertarRack(p);
    const { mostrarRacks } = get();
    await mostrarRacks();
  },

  eliminarRack: async (p) => {
    await EliminarRack(p);
    const { mostrarRacks } = get();
    await mostrarRacks();
  },

  editarRack: async (p) => {
    await EditarRack(p);
    const { mostrarRacks } = get();
    await mostrarRacks();
  },

  buscarProductos: async (p) => {
    const response = await BuscarRacks(p);
    set({ dataRacks: response });
    return response;
  },
}));
