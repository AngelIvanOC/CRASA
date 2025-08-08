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
    console.log("setBuscador llamado con:", p);
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

  insertarProductosMasivo: async (productos) => {
    try {
      const codigosExistentes = await VerificarCodigosExistentes(productos);

      const productosNuevos = productos.filter(
        (p) => !codigosExistentes.includes(`${p.codigo}-${p.marca_id}`)
      );

      if (productosNuevos.length === 0) {
        return {
          exitosos: 0,
          fallidos: productos.length,
          mensaje: "Todos los códigos ya existen",
        };
      }

      const result = await InsertarProductosMasivo(productosNuevos);

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

  calcularTarimas: (producto) => {
    const cajasConCantidad = Array.isArray(producto.cajas)
      ? producto.cajas.filter((caja) => caja.cantidad > 0).length
      : 0;

    const registrosSuelto = Array.isArray(producto.suelto)
      ? producto.suelto.length
      : 0;

    return cajasConCantidad + registrosSuelto;
  },

  mostrarProductosConFiltros: async () => {
    const { filtros, calcularTarimas } = get();
    console.log("mostrarProductosConFiltros con filtros:", filtros);

    let query = supabase.from("productos").select(`
        id,
        codigo,
        nombre,
        cajas,
        cantidad,
        racks(id, codigo_rack),
        marcas(id, nombre),
        piso(cantidad),
        cajas(id, cantidad),
        suelto(id, cantidad)
      `);

    if (filtros.marca && filtros.marca !== "") {
      console.log("Aplicando filtro de marca:", filtros.marca);
      query = query.eq("marca_id", filtros.marca);
    }

    const { data, error } = await query.order("id", { ascending: false });

    if (error) {
      console.error("Error en mostrarProductosConFiltros:", error);
      return [];
    }

    const productosConCalculos =
      data?.map((producto) => {
        const cantidad_piso =
          producto.piso?.reduce(
            (total, item) => total + (item.cantidad || 0),
            0
          ) || 0;

        const cantidad_suelto =
          producto.suelto?.reduce(
            (total, item) => total + (item.cantidad || 0),
            0
          ) || 0;

        const cajasConCantidad = Array.isArray(producto.cajas)
          ? producto.cajas.filter((caja) => caja.cantidad > 0).length
          : 0;

        const registrosSuelto = Array.isArray(producto.suelto)
          ? producto.suelto.length
          : 0;

        const totalTarimas = cajasConCantidad + registrosSuelto;

        return {
          ...producto,
          cantidad_piso,
          cantidad_suelto,
          tarimas: totalTarimas,
          total: cantidad_piso + cantidad_suelto + producto.cantidad,
        };
      }) || [];

    console.log("Productos filtrados:", productosConCalculos);
    set({ dataProductos: productosConCalculos });
    set({ productoItemSelect: productosConCalculos[0] });
    return productosConCalculos;
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
    piso(cantidad),
      cajas(id, cantidad),
      suelto(id,cantidad)
  `);

    if (esNumero) {
      query = query.or(
        `codigo.eq.${p.buscador},codigo::text.like.${p.buscador}%`
      );
    } else {
      query = query.ilike("nombre", `%${p.buscador}%`);
    }

    if (filtros.marca && filtros.marca !== "") {
      query = query.eq("marca_id", filtros.marca);
    }

    const { data, error } = await query.order("id", { ascending: false });

    if (error) {
      console.error("Error en buscarProductosConFiltros:", error);
      return [];
    }

    const productosConPiso =
      data?.map((producto) => {
        const cantidad_piso =
          producto.piso?.reduce(
            (total, item) => total + (item.cantidad || 0),
            0
          ) || 0;

        const cantidad_suelto =
          producto.suelto?.reduce(
            (total, item) => total + (item.cantidad || 0),
            0
          ) || 0;

        const cajasConCantidad = Array.isArray(producto.cajas)
          ? producto.cajas.filter((caja) => caja.cantidad > 0).length
          : 0;

        const registrosSuelto = Array.isArray(producto.suelto)
          ? producto.suelto.length
          : 0;

        const totalTarimas = cajasConCantidad + registrosSuelto;

        return {
          ...producto,
          cantidad_piso,
          cantidad_suelto,
          tarimas: totalTarimas,
          total: cantidad_piso + cantidad_suelto + producto.cantidad,
        };
      }) || [];

    set({ dataProductos: productosConPiso });
    return productosConPiso;
  },
}));
