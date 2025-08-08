import { create } from "zustand";
import {
  MostrarVentasPorMarca,
  MostrarRacksPorMarca,
  MostrarComprasPorMarca,
  MostrarProductosPorMarca,
  MostrarProximosACaducar,
  MostrarPedidosActivos,
  MostrarMovimientosRecientes,
  MostrarPedidosPorFecha,
  MostrarEntradasPorSemana,
} from "../supabase/crudDashboard";

export const useDashboardStore = create((set, get) => ({
  dataVentas: [],
  dataRacks: [],
  dataCompras: [],
  dataProductos: [],
  dataCaducar: [],
  dataPedidosActivos: [],
  dataMovimientos: [],
  dataPedidosFecha: [],
  dataEntradas: [],

  loadingVentas: false,
  loadingRacks: false,
  loadingCompras: false,
  loadingProductos: false,
  loadingCaducar: false,
  loadingPedidosActivos: false,
  loadingMovimientos: false,
  loadingPedidosFecha: false,
  loadingEntradas: false,
  loading: false,

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

  mostrarProximosCaducar: async () => {
    set({ loadingCaducar: true });
    try {
      const data = await MostrarProximosACaducar();
      set({ dataCaducar: data });
    } catch (error) {
      console.error("Error al cargar próximos a caducar:", error);
      set({ dataCaducar: [] });
    } finally {
      set({ loadingCaducar: false });
    }
  },

  mostrarPedidosActivos: async () => {
    set({ loadingPedidosActivos: true });
    try {
      const data = await MostrarPedidosActivos();
      set({ dataPedidosActivos: data });
    } catch (error) {
      console.error("Error al mostrar pedidos activos:", error);
      set({ dataPedidosActivos: [] });
    } finally {
      set({ loadingPedidosActivos: false });
    }
  },

  mostrarMovimientosRecientes: async () => {
    set({ loadingMovimientos: true });
    try {
      const data = await MostrarMovimientosRecientes();
      set({ dataMovimientos: data });
    } catch (error) {
      console.error("Error al cargar movimientos recientes:", error);
      set({ dataMovimientos: [] });
    } finally {
      set({ loadingMovimientos: false });
    }
  },

  mostrarPedidosPorFecha: async () => {
    set({ loadingPedidosFecha: true });
    try {
      const response = await MostrarPedidosPorFecha();
      set({ dataPedidosFecha: response });
      return response;
    } catch (error) {
      console.error("Error al mostrar pedidos por fecha:", error);
      set({ dataPedidosFecha: [] });
      return [];
    } finally {
      set({ loadingPedidosFecha: false });
    }
  },

  mostrarEntradasPorSemana: async () => {
    set({ loadingEntradas: true });
    try {
      const response = await MostrarEntradasPorSemana();
      set({ dataEntradas: response });
      return response;
    } catch (error) {
      console.error("Error al mostrar entradas por semana:", error);
      set({ dataEntradas: { data: [], total: 0 } });
      return { data: [], total: 0 };
    } finally {
      set({ loadingEntradas: false });
    }
  },

  cargarDatosDashboard: async () => {
    set({ loading: true });
    const {
      mostrarVentasPorMarca,
      mostrarRacksPorMarca,
      mostrarComprasPorMarca,
      mostrarProductosPorMarca,
      mostrarProximosCaducar,
      mostrarPedidosActivos,
      mostrarMovimientosRecientes,
      mostrarPedidosPorFecha,
      mostrarEntradasPorSemana,
    } = get();

    try {
      await Promise.all([
        mostrarVentasPorMarca(),
        mostrarRacksPorMarca(),
        mostrarComprasPorMarca(),
        mostrarProductosPorMarca(),
        mostrarProximosCaducar(),
        mostrarPedidosActivos(),
        mostrarMovimientosRecientes(),
        mostrarPedidosPorFecha(),
        mostrarEntradasPorSemana(),
      ]);
    } catch (error) {
      console.error("Error al cargar datos del dashboard:", error);
    } finally {
      set({ loading: false });
    }
  },

  refrescarDatos: async () => {
    const { cargarDatosDashboard } = get();
    await cargarDatosDashboard();
  },
}));
