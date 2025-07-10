import Swal from "sweetalert2";
import { supabase } from "../index";

export async function MostrarVentasPorMarca() {
  try {
    const { data, error } = await supabase
      .from("marcas")
      .select(
        `
        id,
        nombre,
        ventas(id)
      `
      )
      .order("nombre");
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error al cargar ventas",
        text: error.message,
      });
      return [];
    }
    // Procesar datos para obtener el conteo
    const ventasProcesadas = data.map((marca) => ({
      nombre: marca.nombre,
      cantidad: marca.ventas.length,
    }));
    return ventasProcesadas;
  } catch (error) {
    console.error("Error en MostrarVentasPorMarca:", error);
    return [];
  }
}

export async function MostrarRacksPorMarca() {
  try {
    const { data, error } = await supabase
      .from("marcas")
      .select(
        `
        id,
        nombre,
        racks(id)
      `
      )
      .order("nombre");
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error al cargar racks",
        text: error.message,
      });
      return [];
    }
    // Procesar datos para obtener el conteo
    const racksProcesados = data.map((marca) => ({
      nombre: marca.nombre,
      cantidad: marca.racks.length,
    }));
    return racksProcesados;
  } catch (error) {
    console.error("Error en MostrarRacksPorMarca:", error);
    return [];
  }
}

export async function MostrarComprasPorMarca() {
  try {
    const { data, error } = await supabase
      .from("marcas")
      .select(
        `
        id,
        nombre,
        compras(id)
      `
      )
      .order("nombre");
    if (error) {
      // Si no existe tabla compras, devolver array vacío sin error
      console.warn("Tabla compras no encontrada o sin datos");
      return [];
    }
    const comprasProcesadas = data.map((marca) => ({
      nombre: marca.nombre,
      cantidad: marca.compras.length,
    }));
    return comprasProcesadas;
  } catch (error) {
    console.error("Error en MostrarComprasPorMarca:", error);
    return [];
  }
}

export async function MostrarProductosPorMarca() {
  try {
    const { data, error } = await supabase
      .from("marcas")
      .select(
        `
        id,
        nombre,
        productos(id)
      `
      )
      .order("nombre");
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error al cargar productos",
        text: error.message,
      });
      return [];
    }
    const productosProcesados = data.map((marca) => ({
      nombre: marca.nombre,
      cantidad: marca.productos.length,
    }));
    return productosProcesados;
  } catch (error) {
    console.error("Error en MostrarProductosPorMarca:", error);
    return [];
  }
}

export async function MostrarProximosACaducar() {
  const { data, error } = await supabase
    .from("cajas")
    .select(
      `
    id,
    fecha_caducidad,
    productos (
      nombre,
      marcas (
        nombre
      )
    )
  `
    )
    .lte(
      "fecha_caducidad",
      new Date(new Date().setDate(new Date().getDate() + 15)).toISOString()
    )
    .order("fecha_caducidad", { ascending: true })
    .limit(3);

  if (error) {
    console.error("Error al cargar próximos a caducar:", error);
    return [];
  }

  // Procesar los datos para devolver lo necesario
  const hoy = new Date();
  const procesados = data.map((caja) => {
    const dias = Math.ceil(
      (new Date(caja.fecha_caducidad) - hoy) / (1000 * 60 * 60 * 24)
    );
    return {
      producto: caja.productos?.nombre || "Producto sin nombre",
      marca: caja.productos?.marcas?.nombre || "Sin marca",
      dias,
    };
  });

  return procesados;
}

export async function MostrarPedidosActivos() {
  const { data, error } = await supabase
    .from("ventas")
    .select(
      `
      id,
      codigo,
      estado,
      fecha,
      marcas (
        nombre
      )
    `
    )
    .not("estado", "eq", "completado")
    .order("fecha", { ascending: false })
    .limit(2);
  if (error) {
    console.error("Error al cargar pedidos activos:", error);
    return [];
  }

  // Formatear fecha al estilo "25 abr"
  const opcionesFecha = { day: "2-digit", month: "short" };
  const pedidos = data.map((venta) => {
    const fecha = venta.fecha
      ? new Date(venta.fecha).toLocaleDateString("es-MX", opcionesFecha)
      : null;

    return {
      codigo: venta.codigo || "Sin código",
      marca: venta.marcas?.nombre || "Sin marca",
      estado: venta.estado,
      fecha: fecha,
    };
  });

  return pedidos;
}
