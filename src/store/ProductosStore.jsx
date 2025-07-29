import { create } from "zustand";
import {
  BuscarProductos,
  EditarProductos,
  EliminarProductos,
  InsertarProductos,
  MostrarProductos,
  InsertarProductosMasivo,
  VerificarCodigosExistentes,
} from "../index";
import { supabase } from "../index";

export const useProductosStore = create((set, get) => ({
  buscador: "",
  setBuscador: (p) => {
    console.log("setBuscador llamado con:", p); // Debug
    set({ buscador: p });
  },

  filtros: {
    marca: "",
  },
  setFiltros: (filtros) => {
    set({ filtros });
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

  // Nueva función para inserción masiva desde Excel
  insertarProductosMasivo: async (productos) => {
    try {
      // Verificar códigos existentes
      const codigos = productos.map((p) => p.codigo);
      const codigosExistentes = await VerificarCodigosExistentes(codigos);

      // Filtrar productos que no existan
      const productosNuevos = productos.filter(
        (p) => !codigosExistentes.includes(p.codigo)
      );

      if (productosNuevos.length === 0) {
        return {
          exitosos: 0,
          fallidos: productos.length,
          mensaje: "Todos los códigos ya existen",
        };
      }

      // Insertar productos nuevos
      const result = await InsertarProductosMasivo(productosNuevos);

      // Refrescar la lista
      const { mostrarProductos } = get();
      await mostrarProductos();

      return {
        exitosos: result.length,
        fallidos: productos.length - result.length,
        mensaje: "Importación completada",
      };
    } catch (error) {
      console.error("Error en inserción masiva:", error);
      throw error;
    }
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

  mostrarProductosConFiltros: async () => {
    const { filtros } = get();
    console.log("mostrarProductosConFiltros con filtros:", filtros);

    let query = supabase.from("productos").select(`
        id,
        codigo,
        nombre,
        cajas,
        cantidad,
        racks(id, codigo_rack),
        marcas(id, nombre),
        piso(cantidad)
      `);

    // Aplicar filtro de marca si existe
    if (filtros.marca && filtros.marca !== "") {
      console.log("Aplicando filtro de marca:", filtros.marca);
      query = query.eq("marca_id", filtros.marca);
    }

    const { data, error } = await query.order("id", { ascending: false });

    if (error) {
      console.error("Error en mostrarProductosConFiltros:", error);
      return [];
    }

    const productosConPiso =
      data?.map((producto) => ({
        ...producto,
        cantidad_piso:
          producto.piso?.reduce(
            (total, item) => total + (item.cantidad || 0),
            0
          ) || 0,
      })) || [];

    console.log("Productos filtrados:", productosConPiso);
    set({ dataProductos: productosConPiso });
    set({ productoItemSelect: productosConPiso[0] });
    return productosConPiso;
  },

  buscarProductosConFiltros: async (p) => {
    const { filtros } = get();
    const esNumero = !isNaN(p.buscador) && p.buscador.trim() !== "";

    let query = supabase.from("productos").select(`
    id,
    codigo,
    nombre,
    cajas,
    cantidad,
    racks(id, codigo_rack),
    marcas(id, nombre),
    piso(cantidad)
  `);

    // Aplicar búsqueda
    if (esNumero) {
      query = query.or(
        `codigo.eq.${p.buscador},codigo::text.like.${p.buscador}%`
      );
    } else {
      query = query.ilike("nombre", `%${p.buscador}%`);
    }

    // Aplicar filtro de marca si existe
    if (filtros.marca && filtros.marca !== "") {
      query = query.eq("marca_id", filtros.marca);
    }

    const { data, error } = await query.order("id", { ascending: false });

    if (error) {
      console.error("Error en buscarProductosConFiltros:", error);
      return [];
    }

    const productosConPiso =
      data?.map((producto) => ({
        ...producto,
        cantidad_piso:
          producto.piso?.reduce(
            (total, item) => total + (item.cantidad || 0),
            0
          ) || 0,
      })) || [];

    set({ dataProductos: productosConPiso });
    return productosConPiso;
  },
}));
