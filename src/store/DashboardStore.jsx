import { create } from "zustand";
import {
  MostrarVentasPorMarca,
  MostrarRacksPorMarca,
  MostrarComprasPorMarca,
  MostrarProductosPorMarca,
} from "../supabase/crudDashboard";

export const useDashboardStore = create((set, get) => ({
  // Estados para cada tipo de dato
  dataVentas: [],
  dataRacks: [],
  dataCompras: [],
  dataProductos: [],

  // Estados de carga
  loadingVentas: false,
  loadingRacks: false,
  loadingCompras: false,
  loadingProductos: false,

  // Estado general de carga
  loading: false,

  // Función para mostrar ventas por marca
  mostrarVentasPorMarca: async () => {
    set({ loadingVentas: true });
    try {
      const response = await MostrarVentasPorMarca();
      set({ dataVentas: response });
      return response;
    } catch (error) {
      console.error("Error al mostrar ventas:", error);
      set({ dataVentas: [] });
      return [];
    } finally {
      set({ loadingVentas: false });
    }
  },

  // Función para mostrar racks por marca
  mostrarRacksPorMarca: async () => {
    set({ loadingRacks: true });
    try {
      const response = await MostrarRacksPorMarca();
      set({ dataRacks: response });
      return response;
    } catch (error) {
      console.error("Error al mostrar racks:", error);
      set({ dataRacks: [] });
      return [];
    } finally {
      set({ loadingRacks: false });
    }
  },

  // Función para mostrar compras por marca
  mostrarComprasPorMarca: async () => {
    set({ loadingCompras: true });
    try {
      const response = await MostrarComprasPorMarca();
      set({ dataCompras: response });
      return response;
    } catch (error) {
      console.error("Error al mostrar compras:", error);
      set({ dataCompras: [] });
      return [];
    } finally {
      set({ loadingCompras: false });
    }
  },

  // Función para mostrar productos por marca
  mostrarProductosPorMarca: async () => {
    set({ loadingProductos: true });
    try {
      const response = await MostrarProductosPorMarca();
      set({ dataProductos: response });
      return response;
    } catch (error) {
      console.error("Error al mostrar productos:", error);
      set({ dataProductos: [] });
      return [];
    } finally {
      set({ loadingProductos: false });
    }
  },

  // Función para cargar todos los datos del dashboard
  cargarDatosDashboard: async () => {
    set({ loading: true });
    const {
      mostrarVentasPorMarca,
      mostrarRacksPorMarca,
      mostrarComprasPorMarca,
      mostrarProductosPorMarca,
    } = get();

    try {
      await Promise.all([
        mostrarVentasPorMarca(),
        mostrarRacksPorMarca(),
        mostrarComprasPorMarca(),
        mostrarProductosPorMarca(),
      ]);
    } catch (error) {
      console.error("Error al cargar datos del dashboard:", error);
    } finally {
      set({ loading: false });
    }
  },

  // Función para refrescar datos
  refrescarDatos: async () => {
    const { cargarDatosDashboard } = get();
    await cargarDatosDashboard();
  },
}));
